from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

# 1. Define the Data for 10 Financial Products
products = [
    {
        "filename": "01_US_Treasury_Bond_Fund.pdf",
        "name": "Sovereign Shield US Treasury Fund",
        "type": "Fixed Income",
        "profile": "Conservative",
        "description": "A fund investing exclusively in short-term U.S. Treasury bills. This product focuses on capital preservation with minimal volatility.",
        "details": ["Yield: 4.2% APY", "Expense Ratio: 0.05%", "Min Investment: $1,000", "Liquidity: Daily"]
    },
    {
        "filename": "02_Global_Blue_Chip_Equity.pdf",
        "name": "Global Titans Blue Chip Equity",
        "type": "Equity",
        "profile": "Moderate",
        "description": "Invests in large-cap, established corporations across developed markets. Focuses on steady dividend growth and long-term appreciation.",
        "details": ["Hist. Return: 7-9%", "Expense Ratio: 0.45%", "Top Holdings: Tech, Healthcare", "Risk: Market Volatility"]
    },
    {
        "filename": "03_Emerging_Tech_Venture.pdf",
        "name": "Nova Horizon Emerging Tech",
        "type": "Venture Capital",
        "profile": "Risky (Aggressive)",
        "description": "High-risk, high-reward exposure to pre-IPO startups in AI and Quantum Computing. Significant volatility expected.",
        "details": ["Target IRR: 25%+", "Lock-up Period: 5 Years", "Min Investment: $50,000", "Risk: Loss of Capital"]
    },
    {
        "filename": "04_Muni_Bond_Tax_Free.pdf",
        "name": "CityBuilder Municipal Bond Trust",
        "type": "Fixed Income",
        "profile": "Conservative",
        "description": "Provides federal tax-exempt income by investing in municipal bonds issued by state and local governments for infrastructure projects.",
        "details": ["Yield: 3.5% (Tax-Adj)", "Credit Rating: AA+", "Duration: Intermediate", "Risk: Interest Rate Sensitivity"]
    },
    {
        "filename": "05_REIT_Commercial_Income.pdf",
        "name": "IronClad Commercial REIT",
        "type": "Real Estate",
        "profile": "Moderate",
        "description": "A Real Estate Investment Trust focused on Class-A office space and logistics centers in major metropolitan hubs.",
        "details": ["Dividend Yield: 5.8%", "Leverage: 35%", "Occupancy Rate: 92%", "Payout: Quarterly"]
    },
    {
        "filename": "06_Crypto_Altcoin_Index.pdf",
        "name": "AlphaChain Crypto Index",
        "type": "Digital Assets",
        "profile": "Risky (Aggressive)",
        "description": "A basket of top 20 alternative cryptocurrencies excluding Bitcoin and Ethereum. Highly volatile and speculative.",
        "details": ["Volatility: Extreme", "Mgmt Fee: 2.0%", "Custody: Cold Storage", "24h Liquidity: Yes"]
    },
    {
        "filename": "07_Balanced_60_40_Fund.pdf",
        "name": "SteadyHand 60/40 Allocation",
        "type": "Hybrid",
        "profile": "Moderate",
        "description": "The classic balanced portfolio: 60% global equities and 40% investment-grade bonds to balance growth and stability.",
        "details": ["Rebalancing: Quarterly", "Beta: 0.65", "Yield: 2.8%", "Focus: Retirement Planning"]
    },
    {
        "filename": "08_High_Yield_Corp_Bond.pdf",
        "name": "Phoenix High Yield Corporate",
        "type": "Fixed Income",
        "profile": "Moderate",
        "description": "Invests in corporate debt rated below investment grade (junk bonds). Offers higher income potential in exchange for higher default risk.",
        "details": ["Yield: 7.5%", "Default Rate: <2%", "Duration: Short-Term", "Sector: Energy/Industrial"]
    },
    {
        "filename": "09_Leveraged_Biotech_ETF.pdf",
        "name": "BioSurge 3x Leveraged ETF",
        "type": "Derivatives",
        "profile": "Risky (Aggressive)",
        "description": "Uses derivatives to seek returns that correspond to 300% of the daily performance of the biotech sector. For day trading only.",
        "details": ["Leverage: 3x", "Expense Ratio: 0.95%", "Decay Risk: High", "Suitability: Daily Trading"]
    },
    {
        "filename": "10_Gold_Precious_Metals.pdf",
        "name": "Aurum Physical Gold Trust",
        "type": "Commodities",
        "profile": "Conservative",
        "description": "Physically backed gold trust. Serves as a hedge against inflation and currency devaluation. Does not generate yield.",
        "details": ["Backing: 100% Allocated Bars", "Storage: Swiss Vaults", "Fee: 0.40%", "Correlation: Low to Equities"]
    }
]

def generate_pdfs():
    # Create a directory for the files
    output_dir = "financial_products_pdf"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"Generating 10 PDFs in folder: {output_dir}/...")

    for p in products:
        file_path = os.path.join(output_dir, p["filename"])
        c = canvas.Canvas(file_path, pagesize=letter)
        width, height = letter

        # --- Header Section ---
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, height - 50, p["name"])
        
        c.setLineWidth(1)
        c.line(50, height - 60, width - 50, height - 60)

        # --- Risk Profile Badge ---
        # Color coding based on profile
        if "Conservative" in p["profile"]:
            c.setFillColorRGB(0.2, 0.6, 0.2) # Green
        elif "Moderate" in p["profile"]:
            c.setFillColorRGB(0.9, 0.6, 0.1) # Orange
        else:
            c.setFillColorRGB(0.8, 0.2, 0.2) # Red
            
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 100, f"Investor Profile: {p['profile']}")
        
        # Reset color to black for text
        c.setFillColorRGB(0, 0, 0)

        # --- Product Type ---
        c.setFont("Helvetica-Oblique", 14)
        c.drawString(50, height - 125, f"Asset Class: {p['type']}")

        # --- Description Section ---
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 170, "Product Description:")
        
        c.setFont("Helvetica", 12)
        # Simple text wrapping (manual for this example, usually reportlab Platypus is used for complex text)
        text_y = height - 190
        words = p["description"].split()
        line = ""
        for word in words:
            if c.stringWidth(line + word, "Helvetica", 12) < 450:
                line += word + " "
            else:
                c.drawString(60, text_y, line)
                line = word + " "
                text_y -= 15
        c.drawString(60, text_y, line)

        # --- Key Financial Details ---
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, text_y - 40, "Key Financial Details:")
        
        c.setFont("Helvetica", 12)
        detail_y = text_y - 60
        for detail in p["details"]:
            c.drawString(70, detail_y, f"• {detail}")
            detail_y -= 20

        # --- Footer ---
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColorRGB(0.5, 0.5, 0.5)
        c.drawString(50, 50, "Generated for simulation purposes only. Not financial advice.")
        c.drawRightString(width - 50, 50, "Page 1 of 1")

        c.save()
        print(f"Created: {p['filename']}")

if __name__ == "__main__":
    generate_pdfs()