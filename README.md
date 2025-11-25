# AI Mobile Bank 

This project is a AI-powered mobile banking demo application. It consists of a Python FastAPI backend connecting to DataStax Astra DB and a React frontend.

![Agentic Flow](visuals/agentic-flow.png)

## Prerequisites

*   **Node.js** (v18+)
*   **Python** (v3.11+)
*   **Astra DB Account**: You need two databases on Astra Cloud:
    1.  **Cassandra Database**: For banking transactions.
    2.  **Vector Database**: For AI/RAG features (if applicable).

## Setup Instructions

### 1. Database Setup (Astra DB)

1.  **Cassandra Database**:
    *   Create a standard Cassandra database.
    *   Download the **Secure Connect Bundle** (zip file).
    *   Create an **Application Token** with `Database Administrator` role (Client ID & Client Secret).

### 2. Backend Setup

The backend handles transaction data and connects to Astra DB.

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Configure Credentials**:
    *   Place your downloaded Secure Connect Bundle zip file in the `backend/` directory.
    *   Create or update `env_vars.yaml` with your Astra credentials:
        ```yaml
        ASTRA_CLIENT_ID: "your_client_id"
        ASTRA_CLIENT_SECRET: "your_client_secret"
        SECURE_CONNECT_BUNDLE: "secure-connect-your-db.zip"
        CUSTOMER_ID: "97074301-cb76-407c-b97c-fa1f7c43b286" # Default UUID, can be changed
        NUM_OF_TRANSACTIONS: "10"
        ```

3.  **Run the Setup Script**:
    This script will set up the virtual environment, install dependencies, update the schema, insert mock data, and start the server.
    ```bash
    ./setup.sh
    ```
    This will set up both the backend (venv, dependencies, database) and frontend (dependencies, env vars).

    After setup is complete, you will need two terminal windows:

    **Terminal 1 (Backend):**
    ```bash
    cd backend
    source venv/bin/activate
    python api.py
    ```

    **Terminal 2 (Frontend):**
    ```bash
    cd frontend
    npm run dev
    ```

    *Alternatively, you can run the steps manually:*

    1.  **Install Dependencies**:
        ```bash
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        pip install pyyaml
        ```

    2.  **Initialize Database Schema & Data**:
        ```bash
        python update_schema.py
        python insert_transactions.py
        ```

    3.  **Run the API Server**:
        ```bash
        python api.py
        ```

### 3. Frontend Setup

The frontend is a React application using Vite.

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2.  **Configure Environment Variables**:
    *   Copy the .env.local.example file to a `.env` file in the `frontend/` directory:
        ```env
        VITE_GEMINI_API_KEY=your_gemini_api_key
        VITE_CUSTOMER_ID=97074301-cb76-407c-b97c-fa1f7c43b286
        VITE_BANKING_API_URL=/api
        ```
    *   *Note: `VITE_BANKING_API_URL` is set to `/api` to use the Vite proxy configured in `vite.config.ts`.*

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Run the Application**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## Architecture

*   **Backend**: FastAPI (Python), `cassandra-driver` for Astra DB connection.
*   **Frontend**: React, Tailwind CSS, Recharts, Lucide React.
*   **Database**: DataStax Astra DB (Serverless Cassandra).

## Troubleshooting

*   **500 Internal Server Error on API**: Ensure `update_schema.py` has been run to add the `transaction_timestamp` column.
*   **Connection Failed**: Verify `SECURE_CONNECT_BUNDLE` path in `env_vars.yaml` matches the actual filename in `backend/`.
