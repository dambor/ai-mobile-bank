import os
import yaml
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
KEYSPACE = 'default'

def update_schema():
    cloud_config = {
        'secure_connect_bundle': SECURE_CONNECT_BUNDLE
    }
    auth_provider = PlainTextAuthProvider(CLIENT_ID, CLIENT_SECRET)
    cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
    session = cluster.connect()
    
    print(f"Connecting to keyspace '{KEYSPACE}'...")
    session.set_keyspace(KEYSPACE)
    
    try:
        print("Attempting to add transaction_timestamp column...")
        session.execute("ALTER TABLE bank_transactions ADD transaction_timestamp timestamp")
        print("Column added successfully.")
    except Exception as e:
        print(f"Error adding column (it might already exist): {e}")
        
    cluster.shutdown()

if __name__ == "__main__":
    update_schema()
