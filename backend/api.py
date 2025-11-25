from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID, uuid1
from datetime import datetime
from decimal import Decimal
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
import uvicorn

import os

# Configuration
# In Cloud Run, we will copy the bundle to the working directory
SECURE_CONNECT_BUNDLE = os.getenv('SECURE_CONNECT_BUNDLE', os.path.join(os.path.dirname(__file__), 'secure-connect-setools.zip'))
CLIENT_ID = os.getenv('ASTRA_CLIENT_ID', 'bbwbJuXJgYKFCyAgwxXUEFSq')
CLIENT_SECRET = os.getenv('ASTRA_CLIENT_SECRET', '-vgLr+L6nGPMJBudr8Ldf2dQUP.h,2zSwi691,Zdz-BlZg3,ssnIbffUjOuTMe2+48c2oUZ3CZtjyRuTxe_,a7AwBD7gwbLYGZG3XIZ8vd-SGPZdgNZubsySvXa4gZaJ')
KEYSPACE = os.getenv('ASTRA_KEYSPACE', 'default')

app = FastAPI(title="Bank Transactions API")

# Database Connection
cluster = None
session = None

def get_session():
    global cluster, session
    if session is None:
        cloud_config = {
            'secure_connect_bundle': SECURE_CONNECT_BUNDLE
        }
        auth_provider = PlainTextAuthProvider(CLIENT_ID, CLIENT_SECRET)
        cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
        session = cluster.connect()
        session.set_keyspace(KEYSPACE)
    return session

@app.on_event("startup")
async def startup_event():
    get_session()

@app.on_event("shutdown")
async def shutdown_event():
    global cluster
    if cluster:
        cluster.shutdown()

# Pydantic Models
class Transaction(BaseModel):
    customer_id: UUID
    transaction_id: UUID
    amount: Decimal
    currency: str
    transaction_type: str
    merchant_name: str
    description: str
    status: str
    balance_snapshot: Decimal
    transaction_timestamp: Optional[datetime] = None

    class Config:
        # Pydantic v2 config to allow arbitrary types if needed, 
        # but UUID and Decimal are supported out of the box.
        pass

class TransactionCreate(BaseModel):
    amount: Decimal
    currency: str
    transaction_type: str
    merchant_name: str
    description: str
    status: str

class BalanceResponse(BaseModel):
    customer_id: UUID
    balance: Decimal
    currency: str

# Endpoints
@app.get("/")
def read_root():
    return {"message": "Welcome to the Bank Transactions API"}

@app.get("/customers/{customer_id}/transactions", response_model=List[Transaction])
def get_customer_transactions(customer_id: UUID):
    session = get_session()
    query = """
    SELECT customer_id, transaction_id, amount, currency, transaction_type, 
           merchant_name, description, status, balance_snapshot, transaction_timestamp
    FROM bank_transactions
    WHERE customer_id = %s
    """
    rows = session.execute(query, (customer_id,))
    
    transactions = []
    for row in rows:
        transactions.append(Transaction(
            customer_id=row.customer_id,
            transaction_id=row.transaction_id,
            amount=row.amount,
            currency=row.currency,
            transaction_type=row.transaction_type,
            merchant_name=row.merchant_name,
            description=row.description,
            status=row.status,

            balance_snapshot=row.balance_snapshot,
            transaction_timestamp=row.transaction_timestamp
        ))
    
    return transactions

@app.get("/customers/{customer_id}/transactions/{transaction_id}", response_model=Transaction)
def get_transaction(customer_id: UUID, transaction_id: UUID):
    session = get_session()
    query = """
    SELECT customer_id, transaction_id, amount, currency, transaction_type, 
           merchant_name, description, status, balance_snapshot, transaction_timestamp
    FROM bank_transactions
    WHERE customer_id = %s AND transaction_id = %s
    """
    row = session.execute(query, (customer_id, transaction_id)).one()
    
    if row:
        return Transaction(
            customer_id=row.customer_id,
            transaction_id=row.transaction_id,
            amount=row.amount,
            currency=row.currency,
            transaction_type=row.transaction_type,
            merchant_name=row.merchant_name,
            description=row.description,
            status=row.status,
            balance_snapshot=row.balance_snapshot,
            transaction_timestamp=row.transaction_timestamp
        )
    else:
        raise HTTPException(status_code=404, detail="Transaction not found")

@app.get("/customers/{customer_id}/balance", response_model=BalanceResponse)
def get_customer_balance(customer_id: UUID):
    session = get_session()
    query = """
    SELECT amount, transaction_type, currency
    FROM bank_transactions
    WHERE customer_id = %s
    """
    rows = session.execute(query, (customer_id,))
    
    balance = Decimal(0)
    currency = "USD" 
    
    for row in rows:
        if row.currency:
            currency = row.currency
            
        t_type = row.transaction_type.upper() if row.transaction_type else 'CREDIT'
        if t_type == 'CREDIT':
            balance += row.amount
        elif t_type == 'DEBIT':
            balance -= row.amount
            
    return BalanceResponse(
        customer_id=customer_id,
        balance=balance,
        currency=currency
    )

@app.post("/customers/{customer_id}/transactions", response_model=Transaction)
def create_transaction(customer_id: UUID, transaction: TransactionCreate):
    session = get_session()
    
    # Calculate current balance to determine snapshot
    # We reuse the existing logic to get the current balance
    current_balance_response = get_customer_balance(customer_id)
    current_balance = current_balance_response.balance
    
    t_type = transaction.transaction_type.upper()
    if t_type == 'CREDIT':
        new_balance = current_balance + transaction.amount
    else:
        new_balance = current_balance - transaction.amount
        
    transaction_id = uuid1()
    timestamp = datetime.now()
    
    query = """
    INSERT INTO bank_transactions (
        customer_id, transaction_id, amount, currency, transaction_type, 
        merchant_name, description, status, balance_snapshot, transaction_timestamp
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    session.execute(query, (
        customer_id, transaction_id, transaction.amount, transaction.currency, 
        t_type, transaction.merchant_name, transaction.description, 
        transaction.status, new_balance, timestamp
    ))
    
    return Transaction(
        customer_id=customer_id,
        transaction_id=transaction_id,
        amount=transaction.amount,
        currency=transaction.currency,
        transaction_type=t_type,
        merchant_name=transaction.merchant_name,
        description=transaction.description,
        status=transaction.status,
        balance_snapshot=new_balance,
        transaction_timestamp=timestamp
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
