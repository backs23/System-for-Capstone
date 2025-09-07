#!/usr/bin/env python3
"""
MongoDB Setup Script for AquaTech Application

This script helps users set up MongoDB for the AquaTech Flask application.
It provides options to:
1. Check if MongoDB is installed and running
2. Install MongoDB Community Server (provides instructions)
3. Set up MongoDB Atlas cloud connection
4. Initialize the database with sample data
"""

import os
import subprocess
import sys
from database import AquaTechDB

def check_mongodb_local():
    """Check if MongoDB is installed and running locally"""
    print("🔍 Checking local MongoDB installation...")
    
    try:
        # Try to connect to local MongoDB
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        client.server_info()
        print("✅ MongoDB is running locally on port 27017")
        return True
    except Exception as e:
        print(f"❌ MongoDB is not running locally: {e}")
        return False

def install_mongodb_instructions():
    """Provide instructions for installing MongoDB locally"""
    print("\n📦 MongoDB Installation Instructions:")
    print("=" * 50)
    
    if os.name == 'nt':  # Windows
        print("Windows Installation:")
        print("1. Download MongoDB Community Server from:")
        print("   https://www.mongodb.com/try/download/community")
        print("2. Run the .msi installer")
        print("3. Choose 'Complete' setup")
        print("4. Install MongoDB as a Windows Service")
        print("5. Install MongoDB Compass (GUI tool)")
        print("\nAfter installation:")
        print("- MongoDB will run automatically as a Windows service")
        print("- Default connection: mongodb://localhost:27017")
        
    elif os.name == 'posix':  # macOS/Linux
        if sys.platform == 'darwin':  # macOS
            print("macOS Installation:")
            print("1. Using Homebrew (recommended):")
            print("   brew tap mongodb/brew")
            print("   brew install mongodb-community")
            print("   brew services start mongodb-community")
            print("\n2. Or download from:")
            print("   https://www.mongodb.com/try/download/community")
        else:  # Linux
            print("Linux Installation:")
            print("1. Ubuntu/Debian:")
            print("   sudo apt update")
            print("   sudo apt install -y mongodb")
            print("   sudo systemctl start mongodb")
            print("   sudo systemctl enable mongodb")
            print("\n2. Or follow official instructions:")
            print("   https://docs.mongodb.com/manual/installation/")

def setup_mongodb_atlas():
    """Provide instructions for MongoDB Atlas cloud setup"""
    print("\n☁️ MongoDB Atlas Cloud Setup:")
    print("=" * 50)
    print("MongoDB Atlas is a free cloud database service:")
    print("\n1. Go to: https://cloud.mongodb.com/")
    print("2. Create a free account")
    print("3. Create a new cluster (choose Free tier)")
    print("4. Create a database user")
    print("5. Configure network access (allow your IP)")
    print("6. Get your connection string")
    print("\n7. Set environment variable:")
    print("   Windows: set MONGODB_URI=your_connection_string")
    print("   Mac/Linux: export MONGODB_URI=your_connection_string")
    print("\n8. Or update database.py with your connection string")

def test_database_connection():
    """Test the database connection and initialize data"""
    print("\n🧪 Testing Database Connection:")
    print("=" * 40)
    
    try:
        # Try to initialize database
        db = AquaTechDB()
        
        if db.client is None:
            print("❌ Failed to connect to MongoDB")
            print("Please ensure MongoDB is running or configure MongoDB Atlas")
            return False
        
        print("✅ Successfully connected to MongoDB!")
        
        # Check collections
        collections = db.db.list_collection_names()
        print(f"📊 Collections in database: {collections}")
        
        # Check data counts
        sensor_count = db.sensor_data.count_documents({})
        feeding_count = db.feeding_schedules.count_documents({})
        alerts_count = db.alerts.count_documents({})
        
        print(f"📈 Sensor readings: {sensor_count}")
        print(f"🐟 Feeding schedules: {feeding_count}")
        print(f"🚨 System alerts: {alerts_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 AquaTech MongoDB Setup")
    print("=" * 30)
    
    print("\nChoose an option:")
    print("1. Check local MongoDB status")
    print("2. Get MongoDB installation instructions")
    print("3. Get MongoDB Atlas cloud setup instructions")
    print("4. Test database connection")
    print("5. Run all checks")
    
    try:
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            check_mongodb_local()
        elif choice == '2':
            install_mongodb_instructions()
        elif choice == '3':
            setup_mongodb_atlas()
        elif choice == '4':
            test_database_connection()
        elif choice == '5':
            print("\n🔍 Running all checks...")
            check_mongodb_local()
            install_mongodb_instructions()
            setup_mongodb_atlas()
            test_database_connection()
        else:
            print("❌ Invalid choice. Please enter 1-5.")
            
    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
