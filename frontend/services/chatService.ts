import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import mcpConfig from '../mcp-config.json';
import { CUSTOMER_ID, getAccountBalance } from './astraService';

// --- CONFIG PARSING ---

const parseMcpConfig = () => {
  try {
    const serverConfig = mcpConfig.mcpServers['lf-mobilebank'];
    if (!serverConfig || !serverConfig.args) {
      throw new Error('Invalid MCP Configuration');
    }

    // Find the argument that looks like a URL
    const urlArg = serverConfig.args.find(arg => arg.startsWith('http'));
    if (!urlArg) {
      throw new Error('No URL found in MCP arguments');
    }

    return urlArg;
  } catch (error) {
    console.error('Error parsing MCP Config:', error);
    return 'http://localhost:7860/api/v1/mcp/project/67240574-f02c-4eec-baee-e5ae822533d3/sse';
  }
};

const SSE_URL = parseMcpConfig();

// --- MCP CLIENT ---

let client: Client | null = null;

const getMcpClient = async () => {
  if (client) return client;

  console.log(`[MCP] Connecting to ${SSE_URL}...`);

  const transport = new SSEClientTransport(new URL(SSE_URL));
  client = new Client({
    name: "neobank-ai-client",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  console.log('[MCP] Connected');
  return client;
};

// --- HELPER FUNCTIONS ---

// Recursive helper to find the "text" or "message" field in a deeply nested JSON response
const findTextInObject = (obj: any): string | null => {
  if (!obj) return null;

  if (typeof obj === 'string') return obj;

  if (typeof obj === 'object') {
    // Prioritize specific fields
    if (obj.message && typeof obj.message === 'string') return obj.message;
    if (obj.text && typeof obj.text === 'string') return obj.text;

    // Check for specific Langflow artifacts
    if (obj.artifacts && obj.artifacts.message) return obj.artifacts.message;
    if (obj.results?.message?.data?.text) return obj.results.message.data.text;

    // Check for MCP tool result structure
    if (Array.isArray(obj.content)) {
      for (const item of obj.content) {
        if (item.type === 'text') {
          // Try to parse as JSON first, in case the tool returns a JSON string
          try {
            const parsed = JSON.parse(item.text);
            if (typeof parsed === 'object') {
              const found = findTextInObject(parsed);
              if (found) return found;
            }
          } catch (e) {
            // Not JSON, return as is
          }
          return item.text;
        }
      }
    }

    // Generic recursive search
    for (const key in obj) {
      const found = findTextInObject(obj[key]);
      if (found) return found;
    }
  }
  return null;
};

// --- MAIN CHAT SERVICE ---

export const sendMessageToBot = async (message: string, sessionId: string): Promise<string> => {
  try {
    const mcp = await getMcpClient();

    // List tools to find the one we need
    const toolsList = await mcp.listTools();
    console.log('[MCP] Available tools:', toolsList.tools.map(t => t.name));

    if (toolsList.tools.length === 0) {
      throw new Error('No tools available on MCP server');
    }

    // Smart tool selection
    let tool = toolsList.tools.find(t => t.name === 'run');
    if (!tool) {
      tool = toolsList.tools.find(t => t.name.includes('run') || t.name.includes('flow'));
    }
    if (!tool) {
      // Fallback: pick the first one that ISN'T 'unstructured' (which is usually a helper)
      tool = toolsList.tools.find(t => t.name !== 'unstructured');
    }
    if (!tool) {
      tool = toolsList.tools[0];
    }

    console.log(`[MCP] Selected tool: ${tool.name}`);

    // Get current balance to ensure bot has the latest truth
    const currentBalance = await getAccountBalance();

    // Construct arguments based on what Langflow likely expects
    // The previous implementation sent: input_value, session_id, tweaks
    const args = {
      input_value: `[System Note: The current account balance is $${currentBalance.toFixed(2)}] ${message}`,
      session_id: sessionId,
      customer_id: CUSTOMER_ID,
      tweaks: {
        "Customer ID": CUSTOMER_ID,
        "customer_id": CUSTOMER_ID,
        "CustomerId": CUSTOMER_ID,
        "user_id": CUSTOMER_ID,
        "balance": currentBalance,
        "current_balance": currentBalance
      }
    };

    console.log(`[MCP] Calling tool ${tool.name} with args:`, args);

    const result = await mcp.callTool({
      name: tool.name,
      arguments: args
    });

    console.log('[MCP] Tool Result:', JSON.stringify(result, null, 2));

    const botMessage = findTextInObject(result);

    if (botMessage) {
      return botMessage;
    }

    console.warn('[Chat] Could not find text in response structure:', JSON.stringify(result, null, 2));
    return "I processed your request, but the response format was unexpected. Check console for details.";

  } catch (error) {
    console.error('[Chat] MCP Error:', error);
    // Reset client on error to force reconnection next time
    client = null;
    return "I'm having trouble connecting to the service right now. Please try again later.";
  }
};
