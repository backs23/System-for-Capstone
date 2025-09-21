"""
Firebase Configuration and Initialization
"""
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime
import requests

class FirebaseConfig:
    def __init__(self):
        self.app = None
        self.db = None
        self.auth = None
        self.is_initialized = False
        self.firebase_web_config = None
        
        # Try to initialize Firebase
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase with service account or environment variables"""
        try:
            # Check if already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
                self.db = firestore.client()
                self.auth = auth
                self.is_initialized = True
                print("✅ Firebase already initialized")
                self._load_web_config()
                return True
            
            # Method 1: Try service account key file
            service_account_path = os.path.join(os.path.dirname(__file__), 'firebase-service-account.json')
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                self.app = firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                self.auth = auth
                self.is_initialized = True
                print("✅ Firebase initialized with service account key")
                self._load_web_config()
                return True
            
            # Method 2: Try environment variables
            if os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'):
                service_account_info = json.loads(os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'))
                cred = credentials.Certificate(service_account_info)
                self.app = firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                self.auth = auth
                self.is_initialized = True
                print("✅ Firebase initialized with environment variables")
                self._load_web_config()
                return True
            
            # Method 3: Try Google Application Default Credentials (for local development)
            if os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
                cred = credentials.ApplicationDefault()
                self.app = firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                self.auth = auth
                self.is_initialized = True
                print("✅ Firebase initialized with Application Default Credentials")
                self._load_web_config()
                return True
            
            print("⚠️ Firebase not configured. Please set up Firebase credentials.")
            print("   1. Download service account key as 'firebase-service-account.json'")
            print("   2. Or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable")
            print("   3. Or see FIREBASE_SETUP.md for guided setup")
            return False
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            return False
            
    def _load_web_config(self):
        """Load Firebase web configuration from file or environment"""
        try:
            # Try to load from environment variable first
            if os.getenv('FIREBASE_WEB_CONFIG'):
                self.firebase_web_config = json.loads(os.getenv('FIREBASE_WEB_CONFIG'))
                print("✅ Firebase web config loaded from environment variables")
                return True
                
            # Try to load from file
            web_config_path = os.path.join(os.path.dirname(__file__), 'firebase-web-config.json')
            if os.path.exists(web_config_path):
                with open(web_config_path, 'r') as f:
                    self.firebase_web_config = json.load(f)
                print("✅ Firebase web config loaded from file")
                return True
                
            # If we got here, we couldn't load the web config
            print("⚠️ Firebase web config not found. Some features may not work correctly.")
            print("   Create a firebase-web-config.json file with your web app credentials")
            print("   A template file 'firebase-web-config.json.template' has been created to help you with this.")
            return False
            
        except Exception as e:
            print(f"❌ Failed to load Firebase web config: {e}")
            return False
            
    def get_web_config_dict(self):
        """Returns the web configuration as a dictionary"""
        return self.firebase_web_config
        
    def get_web_config_json(self):
        """Returns the web configuration as a properly formatted JSON string"""
        if self.firebase_web_config:
            # Ensure we return a proper JSON string with escaped quotes
            return json.dumps(self.firebase_web_config)
        return '{}'
    
    def is_available(self):
        """Check if Firebase is available and initialized"""
        return self.is_initialized and self.db is not None and self.auth is not None
    
    def get_firestore_client(self):
        """Get Firestore database client"""
        if self.is_available():
            return self.db
        return None
        
    def get_auth_client(self):
        """Get Firebase Auth client"""
        if self.is_available():
            return self.auth
        return None
        
    def get_web_config(self):
        """Get Firebase web configuration for frontend"""
        return self.firebase_web_config
        
    def create_user_with_email_and_password(self, email, password):
        """Create a new user with email and password"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            user = self.auth.create_user(
                email=email,
                password=password,
                email_verified=False
            )
            return {"success": True, "user_id": user.uid, "email": email}
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return {"success": False, "error": str(e)}
            
    def authenticate_with_email_and_password(self, email, password):
        """Authenticate a user with email and password (verify password)"""
        # Note: This method doesn't directly authenticate but can be used to verify passwords
        # For full authentication, we should use the Firebase Auth REST API or client SDK
        # This implementation will be enhanced in the database.py file
        return {"success": False, "error": "Direct authentication not supported in admin SDK"}
        
    def verify_id_token(self, id_token):
        """Verify a Firebase ID token (from frontend)"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            decoded_token = self.auth.verify_id_token(id_token)
            return {"success": True, "user_data": decoded_token}
        except Exception as e:
            print(f"❌ Error verifying ID token: {e}")
            return {"success": False, "error": str(e)}
            
    def create_custom_token(self, user_id, additional_claims=None):
        """Create a custom authentication token for a user"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            token = self.auth.create_custom_token(user_id, additional_claims)
            return {"success": True, "token": token.decode('utf-8')}
        except Exception as e:
            print(f"❌ Error creating custom token: {e}")
            return {"success": False, "error": str(e)}
            
    def get_user(self, user_id):
        """Get user information by user ID"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            user = self.auth.get_user(user_id)
            return {"success": True, "user": {
                "uid": user.uid,
                "email": user.email,
                "email_verified": user.email_verified,
                "display_name": user.display_name,
                "photo_url": user.photo_url
            }}
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return {"success": False, "error": str(e)}
            
    def get_user_by_email(self, email):
        """Get user information by email"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            user = self.auth.get_user_by_email(email)
            return {"success": True, "user": {
                "uid": user.uid,
                "email": user.email,
                "email_verified": user.email_verified,
                "display_name": user.display_name,
                "photo_url": user.photo_url
            }}
        except Exception as e:
            print(f"❌ Error getting user by email: {e}")
            return {"success": False, "error": str(e)}
            
    def update_user(self, user_id, **kwargs):
        """Update user information"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            user = self.auth.update_user(user_id, **kwargs)
            return {"success": True, "user": {
                "uid": user.uid,
                "email": user.email,
                "email_verified": user.email_verified,
                "display_name": user.display_name,
                "photo_url": user.photo_url
            }}
        except Exception as e:
            print(f"❌ Error updating user: {e}")
            return {"success": False, "error": str(e)}
            
    def delete_user(self, user_id):
        """Delete a user"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            self.auth.delete_user(user_id)
            return {"success": True, "message": "User deleted successfully"}
        except Exception as e:
            print(f"❌ Error deleting user: {e}")
            return {"success": False, "error": str(e)}
            
    def generate_password_reset_link(self, email):
        """Generate a password reset link for a user"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            # Get the API key from web config or environment
            api_key = None
            if self.firebase_web_config:
                api_key = self.firebase_web_config.get('apiKey')
            
            if not api_key:
                api_key = os.getenv('FIREBASE_API_KEY')
            
            if not api_key:
                return {"success": False, "error": "Firebase API key not available"}
            
            # Use Firebase Admin SDK to generate password reset link
            link = self.auth.generate_password_reset_link(email)
            return {"success": True, "reset_link": link}
            
        except Exception as e:
            print(f"❌ Error generating password reset link: {e}")
            return {"success": False, "error": str(e)}
            
    def verify_google_id_token(self, id_token):
        """Verify a Google ID token (for Google Sign-in)"""
        if not self.is_available():
            return {"success": False, "error": "Firebase not available"}
        
        try:
            # This will verify the Google ID token using Firebase Auth
            decoded_token = self.auth.verify_id_token(id_token)
            
            # Check if the provider is Google
            if 'firebase' in decoded_token and decoded_token['firebase'].get('sign_in_provider') == 'google.com':
                return {"success": True, "user_data": decoded_token}
            else:
                return {"success": False, "error": "Not a Google authentication token"}
                
        except Exception as e:
            print(f"❌ Error verifying Google ID token: {e}")
            return {"success": False, "error": str(e)}
    
    def create_sample_data(self):
        """Create sample data for testing"""
        if not self.is_available():
            print("❌ Firebase not available, cannot create sample data")
            return False
        
        try:
            # Create sample sensor data
            sensor_collection = self.db.collection('sensor_data')
            
            # Check if sample data already exists
            existing_data = sensor_collection.limit(1).get()
            if len(existing_data) > 0:
                print("📊 Sample data already exists")
                return True
            
            print("📊 Creating sample sensor data...")
            from datetime import timedelta, timezone
            import random
            
            # Generate sample data for the past 24 hours
            for hours_ago in range(24):
                timestamp = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
                
                sample_data = {
                    'timestamp': timestamp,
                    'temperature': round(random.uniform(20, 30), 1),
                    'dissolved_oxygen': round(random.uniform(4, 12), 2),
                    'ammonia': round(random.uniform(0, 5), 3),
                    'location': 'Tank A',
                    'sensor_id': 'SENSOR_001'
                }
                
                sensor_collection.add(sample_data)
            
            # Create sample alerts
            alerts_collection = self.db.collection('alerts')
            sample_alerts = [
                {
                    'timestamp': datetime.now(timezone.utc) - timedelta(minutes=10),
                    'type': 'warning',
                    'message': 'Ammonia level approaching lower threshold',
                    'sensor_id': 'SENSOR_001',
                    'value': 2.5,
                    'threshold': 5.0,
                    'acknowledged': False
                },
                {
                    'timestamp': datetime.now(timezone.utc) - timedelta(hours=2),
                    'type': 'info',
                    'message': 'Temperature sensor calibration completed',
                    'sensor_id': 'SENSOR_002',
                    'acknowledged': True
                },
                {
                    'timestamp': datetime.now(timezone.utc) - timedelta(hours=4),
                    'type': 'success',
                    'message': 'Water quality parameters optimal',
                    'sensor_id': 'SENSOR_001',
                    'acknowledged': True
                }
            ]
            
            for alert in sample_alerts:
                alerts_collection.add(alert)
            
            # Create system settings
            settings_collection = self.db.collection('system_settings')
            system_settings = {
                'tank_settings': {
                    'tank_a': {
                        'name': 'Tank A - Main Production',
                        'capacity_liters': 10000,
                        'fish_species': 'Atlantic Salmon',
                        'fish_count': 500,
                        'optimal_ammonia_range': [0, 1.0],
                        'optimal_temp_range': [18, 24],
                        'optimal_do_range': [6, 12]
                    }
                },
                'alert_thresholds': {
                    'ammonia_min': 0,
                    'ammonia_max': 1.0,
                    'temp_min': 18,
                    'temp_max': 30,
                    'do_min': 4,
                    'do_max': 12},
                'system_info': {
                    'installation_date': datetime(2024, 1, 15),
                    'last_maintenance': datetime.now(timezone.utc) - timedelta(days=3),
                    'next_maintenance': datetime.now(timezone.utc) + timedelta(days=27),
                    'firmware_version': 'v2.1.3'
                },
                'created_at': datetime.now(timezone.utc)
            }
            
            settings_collection.add(system_settings)
            
            print("✅ Sample data created successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error creating sample data: {e}")
            return False

# Global Firebase configuration instance
firebase_config = FirebaseConfig()
