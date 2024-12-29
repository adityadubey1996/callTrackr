import os
from pymongo import MongoClient

def connectDB():
    """Connect to MongoDB using environment variables."""
    try:
        username = os.getenv("MONGO_USERNAME")
        password = os.getenv("MONGO_PASSWORD")
        cluster = os.getenv("MONGO_CLUSTER")
        options = os.getenv("MONGO_OPTIONS", "")

        if not username or not password or not cluster:
            raise ValueError("Missing required MongoDB environment variables.")

        # Construct MongoDB URI
        connection_string = f"mongodb+srv://{username}:{password}@{cluster}/?{options}"
        client = MongoClient(connection_string)
        print("MongoDB connected successfully.")
        return client
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise