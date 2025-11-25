import uuid
import random
import time
import yaml
import os

from decimal import Decimal
from datetime import datetime, timedelta
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider

# Configuration
def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'env_vars.yaml')
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

config = load_config()
SECURE_CONNECT_BUNDLE = os.path.join(os.path.dirname(__file__), config.get('SECURE_CONNECT_BUNDLE', 'secure-connect-setools.zip'))
CLIENT_ID = config.get('ASTRA_CLIENT_ID')
CLIENT_SECRET = config.get('ASTRA_CLIENT_SECRET')
CUSTOMER_ID = config.get('CUSTOMER_ID')
NUM_OF_TRANSACTIONS = int(config.get('NUM_OF_TRANSACTIONS', 100))
KEYSPACE = 'default' 

def create_connection():
    cloud_config = {
        'secure_connect_bundle': SECURE_CONNECT_BUNDLE
    }
    auth_provider = PlainTextAuthProvider(CLIENT_ID, CLIENT_SECRET)
    cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
    session = cluster.connect()
    return cluster, session

def setup_schema(session):
    print(f"Creating table in keyspace '{KEYSPACE}'...")
    session.set_keyspace(KEYSPACE)
    
    create_table_query = """
    CREATE TABLE IF NOT EXISTS bank_transactions (
        customer_id UUID,
        transaction_id TIMEUUID,
        amount decimal,
        currency text,
        transaction_type text,
        merchant_name text,
        description text,
        status text,

        balance_snapshot decimal,
        transaction_timestamp timestamp,
        PRIMARY KEY ((customer_id), transaction_id)
    ) 
    WITH CLUSTERING ORDER BY (transaction_id DESC);
    """
    session.execute(create_table_query)
    print("Table created or already exists.")

def generate_data(customer_id_str=None, transactions_count=100):
    if customer_id_str:
        customers = [uuid.UUID(customer_id_str)]
        print(f"Using provided customer ID: {customer_id_str}")
    else:
        customers = [uuid.uuid4() for _ in range(10)]
        print(f"Generating random customers...")
        
    currencies = ['USD']
    merchants = ['Amazon', 'Uber', 'Starbucks', 'Walmart', 'Target', 'Netflix', 'Spotify']
    statuses = ['COMPLETED', 'PENDING', 'FAILED']
    
    print(f"Generating {transactions_count} transactions per customer...")
    
    total_inserted = 0
    
    for customer_id in customers:
        balance = Decimal(random.uniform(1000, 10000)).quantize(Decimal("0.01"))
        
        batch_credits = Decimal(0)
        batch_debits = Decimal(0)
        
        for i in range(transactions_count):
            transaction_id = uuid.uuid1() # TimeUUID
            # Logic to ensure total credits > total debits
            is_last = (i == transactions_count - 1)
            
            # Default random generation with bias towards Credit
            if random.random() > 0.4: # 60% chance of credit
                transaction_type = 'CREDIT'
                amount = Decimal(random.uniform(100, 1000)).quantize(Decimal("0.01"))
            else:
                transaction_type = 'DEBIT'
                amount = Decimal(random.uniform(10, 200)).quantize(Decimal("0.01"))

            # Force correction on last item if needed to ensure Credits > Debits
            current_credits = batch_credits + (amount if transaction_type == 'CREDIT' else 0)
            current_debits = batch_debits + (amount if transaction_type == 'DEBIT' else 0)
            
            if is_last and current_credits <= current_debits:
                transaction_type = 'CREDIT'
                # Add enough to exceed debits
                needed = (batch_debits - batch_credits) + Decimal(random.uniform(50, 150))
                amount = needed.quantize(Decimal("0.01"))

            if transaction_type == 'CREDIT':
                batch_credits += amount
                balance += amount
            else:
                batch_debits += amount
                balance -= amount

            currency = random.choice(currencies)
            merchant = random.choice(merchants)
            description = f"Transaction at {merchant}"
            status = random.choice(statuses)
            # Generate random timestamp within last 30 days
            days_ago = random.randint(0, 30)
            seconds_ago = random.randint(0, 86400)
            timestamp = datetime.now() - timedelta(days=days_ago, seconds=seconds_ago)
            
            query = """
            INSERT INTO bank_transactions (
                customer_id, transaction_id, amount, currency, transaction_type, 
                merchant_name, description, status, balance_snapshot, transaction_timestamp
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            session.execute(query, (
                customer_id, transaction_id, amount, currency, transaction_type,
                merchant, description, status, balance, timestamp
            ))
            total_inserted += 1
            
            if total_inserted % 100 == 0:
                print(f"Inserted {total_inserted} transactions...")

    print(f"Successfully inserted {total_inserted} transactions.")

if __name__ == "__main__":
    cluster = None
    try:
        cluster, session = create_connection()
        
        # Verify keyspace or list them if not sure
        # rows = session.execute("SELECT keyspace_name FROM system_schema.keyspaces")
        # print("Available keyspaces:", [row.keyspace_name for row in rows])
        
        setup_schema(session)
        generate_data(customer_id_str=CUSTOMER_ID, transactions_count=NUM_OF_TRANSACTIONS)
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if cluster:
            cluster.shutdown()
