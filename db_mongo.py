# db_mongo.py
"""
MongoDB Database Manager for HR-HQ System using PyMongo.
Connects to MongoDB (mongodb://localhost:27017/hr_db) with automated fallback.
"""

import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'database.json')

class MongoDBHelper:
    def __init__(self):
        self.use_mongo = False
        self.db = None
        
        try:
            from pymongo import MongoClient
            # Attempt short timeout connect to local MongoDB
            client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=1000)
            client.server_info() # Will raise exception if server is down
            self.db = client["hr_db"]
            self.use_mongo = True
            print(">> Connected to MongoDB at mongodb://localhost:27017/hr_db")
            self._seed_mongo_if_empty()
        except Exception as e:
            print(f">> Local MongoDB daemon offline ({e}). Using JSON persistent storage.")
            self.use_mongo = False

    def _seed_mongo_if_empty(self):
        if self.use_mongo and self.db is not None:
            if self.db["employees"].count_documents({}) == 0:
                data = self.read_json_fallback()
                for collection_name in ["employees", "leaves", "reviews", "onboarding", "attendance", "payrollRuns", "users"]:
                    items = data.get(collection_name, [])
                    if items:
                        self.db[collection_name].insert_many(items)
                print(">> MongoDB initialized with initial seed datasets.")

    def read_json_fallback(self):
        if not os.path.exists(DB_PATH):
            return {"employees": [], "leaves": [], "reviews": [], "onboarding": [], "attendance": [], "payrollRuns": [], "users": []}
        try:
            with open(DB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {"employees": [], "leaves": [], "reviews": [], "onboarding": [], "attendance": [], "payrollRuns": [], "users": []}

    def write_json_fallback(self, data):
        try:
            os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
            with open(DB_PATH, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error writing fallback JSON: {e}")
            return False

    def get_collection(self, collection_name):
        if self.use_mongo and self.db is not None:
            return list(self.db[collection_name].find({}, {"_id": 0}))
        else:
            data = self.read_json_fallback()
            return data.get(collection_name, [])

    def save_item(self, collection_name, item):
        if self.use_mongo and self.db is not None:
            self.db[collection_name].insert_one(dict(item))
        # Always sync fallback
        data = self.read_json_fallback()
        if collection_name not in data:
            data[collection_name] = []
        data[collection_name].append(item)
        self.write_json_fallback(data)

    def update_item(self, collection_name, query, updates):
        if self.use_mongo and self.db is not None:
            self.db[collection_name].update_one(query, {"$set": updates})
        data = self.read_json_fallback()
        key, val = list(query.items())[0]
        for idx, item in enumerate(data.get(collection_name, [])):
            if item.get(key) == val:
                item.update(updates)
                break
        self.write_json_fallback(data)

    def delete_item(self, collection_name, query):
        if self.use_mongo and self.db is not None:
            self.db[collection_name].delete_one(query)
        data = self.read_json_fallback()
        key, val = list(query.items())[0]
        data[collection_name] = [item for item in data.get(collection_name, []) if item.get(key) != val]
        self.write_json_fallback(data)

db_helper = MongoDBHelper()
