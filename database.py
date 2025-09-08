"""
MongoDB Database Configuration and Connection
"""
from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import os

class AquaTechDB:
    def __init__(self):
        # MongoDB connection string - using local MongoDB instance
        # For production, you would use a cloud service like MongoDB Atlas
        self.connection_string = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        self.database_name = 'aquatech_db'
        
        try:
            self.client = MongoClient(self.connection_string)
            self.db = self.client[self.database_name]
            
            # Test the connection
            self.client.server_info()
            print(f"✅ Connected to MongoDB: {self.database_name}")
            
            # Initialize collections
            self.sensor_data = self.db.sensor_data
            self.alerts = self.db.alerts
            self.system_settings = self.db.system_settings
            
            # Create indexes for better performance
            self.create_indexes()
            
            # Initialize with sample data if empty
            self.initialize_sample_data()
            
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            print("📝 Make sure MongoDB is running locally or update the connection string")
            self.client = None
            self.db = None
    
    def create_indexes(self):
        """Create database indexes for better query performance"""
        try:
            # Index on timestamp for sensor data (for time-based queries)
            self.sensor_data.create_index([("timestamp", -1)])
            
            # Index on alert timestamps
            self.alerts.create_index([("timestamp", -1)])
            
            print("✅ Database indexes created successfully")
        except Exception as e:
            print(f"⚠️ Index creation failed: {e}")
    
    def initialize_sample_data(self):
        """Initialize the database with sample data if it's empty"""
        try:
            # Check if we already have data
            if self.sensor_data.count_documents({}) == 0:
                print("📊 Initializing database with sample sensor data...")
                self.seed_sensor_data()
            
            if self.alerts.count_documents({}) == 0:
                print("🚨 Initializing system alerts...")
                self.seed_alerts_data()
                
            if self.system_settings.count_documents({}) == 0:
                print("⚙️ Initializing system settings...")
                self.seed_system_settings()
                
        except Exception as e:
            print(f"⚠️ Sample data initialization failed: {e}")
    
    def seed_sensor_data(self):
        """Generate initial sensor data for the past 7 days"""
        sensor_readings = []
        
        # Generate data for the past 7 days, every hour
        for days_ago in range(7):
            for hour in range(24):
                timestamp = datetime.now() - timedelta(days=days_ago, hours=hour)
                
                reading = {
                    "timestamp": timestamp,
                    "ph": round(random.uniform(6.5, 8.5), 2),
                    "temperature": round(random.uniform(20, 30), 1),
                    "dissolved_oxygen": round(random.uniform(4, 12), 2),
                    "turbidity": round(random.uniform(0, 50), 1),
                    "salinity": round(random.uniform(15, 35), 2),
                    "ammonia": round(random.uniform(0, 5), 3),
                    "location": "Tank A",
                    "sensor_id": "SENSOR_001"
                }
                sensor_readings.append(reading)
        
        # Insert all readings at once for better performance
        self.sensor_data.insert_many(sensor_readings)
        print(f"✅ Inserted {len(sensor_readings)} sensor readings")
    
    
    def seed_alerts_data(self):
        """Create sample system alerts"""
        alerts = [
            {
                "timestamp": datetime.now() - timedelta(minutes=10),
                "type": "warning",
                "message": "pH level approaching lower threshold",
                "sensor_id": "SENSOR_001",
                "value": 6.4,
                "threshold": 6.5,
                "acknowledged": False
            },
            {
                "timestamp": datetime.now() - timedelta(hours=2),
                "type": "info", 
                "message": "Temperature sensor calibration completed",
                "sensor_id": "SENSOR_002",
                "acknowledged": True
            },
            {
                "timestamp": datetime.now() - timedelta(hours=4),
                "type": "success",
                "message": "Water quality parameters optimal",
                "sensor_id": "SENSOR_001",
                "acknowledged": True
            }
        ]
        
        self.alerts.insert_many(alerts)
        print(f"✅ Created {len(alerts)} system alerts")
    
    def seed_system_settings(self):
        """Create system configuration settings"""
        settings = {
            "tank_settings": {
                "tank_a": {
                    "name": "Tank A - Main Production",
                    "capacity_liters": 10000,
                    "fish_species": "Atlantic Salmon",
                    "fish_count": 500,
                    "optimal_ph_range": [6.5, 8.5],
                    "optimal_temp_range": [18, 24],
                    "optimal_do_range": [6, 12]
                }
            },
            "alert_thresholds": {
                "ph_min": 6.5,
                "ph_max": 8.5,
                "temp_min": 18,
                "temp_max": 30,
                "do_min": 4,
                "turbidity_max": 40,
                "ammonia_max": 1.0
            },
            "system_info": {
                "installation_date": datetime(2024, 1, 15),
                "last_maintenance": datetime.now() - timedelta(days=3),
                "next_maintenance": datetime.now() + timedelta(days=27),
                "firmware_version": "v2.1.3"
            }
        }
        
        self.system_settings.insert_one(settings)
        print("✅ Created system settings")
    
    def get_latest_sensor_data(self):
        """Get the most recent sensor reading"""
        try:
            latest = self.sensor_data.find_one(
                sort=[("timestamp", -1)]
            )
            if latest:
                # Convert ObjectId to string for JSON serialization
                latest['_id'] = str(latest['_id'])
                return latest
            return None
        except Exception as e:
            print(f"❌ Error fetching latest sensor data: {e}")
            return None
    
    def get_historical_sensor_data(self, hours=24):
        """Get sensor data for the specified number of hours"""
        try:
            start_time = datetime.now() - timedelta(hours=hours)
            
            cursor = self.sensor_data.find(
                {"timestamp": {"$gte": start_time}},
                sort=[("timestamp", 1)]
            )
            
            data = []
            for record in cursor:
                record['_id'] = str(record['_id'])
                data.append(record)
            
            return data
        except Exception as e:
            print(f"❌ Error fetching historical data: {e}")
            return []
    
    
    def get_recent_alerts(self, limit=10):
        """Get recent system alerts"""
        try:
            cursor = self.alerts.find(
                sort=[("timestamp", -1)],
                limit=limit
            )
            
            alerts = []
            for alert in cursor:
                alert['_id'] = str(alert['_id'])
                alerts.append(alert)
            
            return alerts
        except Exception as e:
            print(f"❌ Error fetching alerts: {e}")
            return []
    
    def insert_sensor_reading(self, sensor_data):
        """Insert a new sensor reading"""
        try:
            sensor_data['timestamp'] = datetime.now()
            result = self.sensor_data.insert_one(sensor_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"❌ Error inserting sensor data: {e}")
            return None
    
    
    
    
    
    def close_connection(self):
        """Close the MongoDB connection"""
        if self.client:
            self.client.close()
            print("🔒 MongoDB connection closed")

# Global database instance
db = AquaTechDB()
