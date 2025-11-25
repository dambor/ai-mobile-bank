#!/bin/bash

# Exit on error
set -e

echo ">>> Starting Fullstack Setup..."

# --- Backend Setup ---
echo "--- Setting up Backend ---"
cd backend

# Check for env_vars.yaml
if [ ! -f "env_vars.yaml" ]; then
    echo "backend/env_vars.yaml not found."
    echo "Please provide your Astra DB credentials to generate it."
    
    read -p "Astra Client ID: " ASTRA_CLIENT_ID
    read -s -p "Astra Client Secret: " ASTRA_CLIENT_SECRET
    echo "" # Newline after hidden input
    read -p "Secure Connect Bundle Filename (must be in backend/ directory) [secure-connect-setools.zip]: " SECURE_CONNECT_BUNDLE
    SECURE_CONNECT_BUNDLE=${SECURE_CONNECT_BUNDLE:-secure-connect-setools.zip}
    
    read -p "Customer ID [97074301-cb76-407c-b97c-fa1f7c43b286]: " CUSTOMER_ID
    CUSTOMER_ID=${CUSTOMER_ID:-97074301-cb76-407c-b97c-fa1f7c43b286}
    
    read -p "Number of Transactions [10]: " NUM_OF_TRANSACTIONS
    NUM_OF_TRANSACTIONS=${NUM_OF_TRANSACTIONS:-10}

    echo "Generating env_vars.yaml..."
    cat <<EOF > env_vars.yaml
ASTRA_CLIENT_ID: "$ASTRA_CLIENT_ID"
ASTRA_CLIENT_SECRET: "$ASTRA_CLIENT_SECRET"
SECURE_CONNECT_BUNDLE: "$SECURE_CONNECT_BUNDLE"
CUSTOMER_ID: "$CUSTOMER_ID"
NUM_OF_TRANSACTIONS: "$NUM_OF_TRANSACTIONS"
EOF
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt
pip install pyyaml

# Update Schema
echo "Updating database schema..."
python update_schema.py

# Insert Transactions
echo "Inserting mock transactions..."
python insert_transactions.py

deactivate
cd ..

# --- Frontend Setup ---
echo "--- Setting up Frontend ---"
cd frontend

# Setup .env.local
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        echo "Creating .env.local from example..."
        cp .env.local.example .env.local
    else
        echo "Warning: .env.local.example not found. Skipping .env.local creation."
    fi
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install

cd ..

echo ">>> Setup Complete!"
echo ""
echo "To run the application:"
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && source venv/bin/activate && python api.py"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
