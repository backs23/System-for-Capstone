"""
Firebase Database Implementation for AquaTech
Replaces MongoDB with Firebase Firestore
"""
from firebase_config import firebase_config
from datetime import datetime, timedelta
import random
import secrets
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash

class AquaTechFirebaseDB:
    def __init__(self):
        self.firebase_config = firebase_config
        self.db = firebase_config.get_firestore_client()
        self.auth = firebase_config.get_auth_client()
        self.is_connected = firebase_config.is_available()
        self.fallback_file = 'fallback_users.json'
        
        if self.is_connected:
            print("✅ Connected to Firebase Firestore")
            # Initialize sample data if database is empty
            self.initialize_sample_data()
        else:
            print("⚠️ Firebase not available - using fallback mode")
            
        # Firebase Web Config for frontend usage
        self.firebase_web_config = firebase_config.get_web_config()
    
    def initialize_sample_data(self):
        """Initialize the database with sample data if it's empty"""
        if not self.is_connected:
            return False
        
        try:
            # Check if we already have sensor data
            sensor_collection = self.db.collection('sensor_data')
            existing_data = sensor_collection.limit(1).get()
            
            if len(existing_data) == 0:
                print("📊 Initializing Firebase with sample data...")
                self.firebase_config.create_sample_data()
            else:
                print("📊 Firebase database already has data")
            
            return True
            
        except Exception as e:
            print(f"⚠️ Sample data initialization failed: {e}")
            return False
    
    # User Management Methods
    def create_user(self, email, password, full_name):
        """Create a new user account in Firebase"""
        if not self.is_connected:
            return self._create_fallback_user(email, password, full_name)
        
        try:
            # Check if user already exists
            users_collection = self.db.collection('users')
            existing_user = users_collection.where('email', '==', email.lower()).limit(1).get()
            
            if len(existing_user) > 0:
                return {"success": False, "error": "User with this email already exists"}
            
            # Create user document
            user_data = {
                "email": email.lower().strip(),
                "password_hash": generate_password_hash(password),
                "full_name": full_name.strip(),
                "created_at": datetime.now(),
                "last_login": None,
                "is_active": True,
                "email_verified": False,
                "profile": {
                    "role": "user",
                    "preferences": {
                        "notifications": True,
                        "theme": "light"
                    }
                }
            }
            
            # Add user to Firestore
            doc_ref = users_collection.add(user_data)
            user_id = doc_ref[1].id
            
            # Log user creation
            self._log_user_activity(user_id, "account_created", {
                "email": email,
                "full_name": full_name,
                "creation_time": datetime.now()
            })
            
            return {
                "success": True, 
                "user_id": user_id,
                "message": "Account created successfully"
            }
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return {"success": False, "error": "Failed to create account"}
    
    def authenticate_user(self, email, password):
        """Authenticate user login with email and password"""
        if not self.is_connected:
            return self._authenticate_fallback_user(email, password)
        
        try:
            # Find user by email
            users_collection = self.db.collection('users')
            user_docs = users_collection.where('email', '==', email.lower().strip()).limit(1).get()
            
            if len(user_docs) == 0:
                return {"success": False, "error": "Invalid email or password"}
            
            user_doc = user_docs[0]
            user_data = user_doc.to_dict()
            
            if not user_data.get("is_active", True):
                return {"success": False, "error": "Account is deactivated"}
            
            # Check the auth provider to determine how to authenticate
            auth_provider = user_data.get("auth_provider", "email")
            
            # If this is a Google account, redirect to Google Sign-in
            if auth_provider == "google":
                return {
                    "success": False, 
                    "error": "This account uses Google Sign-in. Please use the Google button to log in.",
                    "auth_provider": "google"
                }
            
            # For email/password authentication
            if "password_hash" in user_data and check_password_hash(user_data["password_hash"], password):
                # Update last login
                user_doc.reference.update({
                    "last_login": datetime.now()
                })
                
                # Log successful login
                self._log_user_activity(user_doc.id, "login_successful", {
                    "email": email,
                    "login_time": datetime.now(),
                    "auth_method": "password"
                })
                
                # Return user info (without password)
                user_info = {
                    "user_id": user_doc.id,
                    "email": user_data["email"],
                    "full_name": user_data["full_name"],
                    "role": user_data.get("profile", {}).get("role", "user")
                }
                
                return {"success": True, "user": user_info, "message": "Login successful"}
            else:
                # Log failed login attempt
                self._log_user_activity(user_doc.id, "login_failed", {
                    "email": email,
                    "reason": "invalid_password"
                })
                return {"success": False, "error": "Invalid email or password"}
                
        except Exception as e:
            print(f"❌ Error authenticating user: {e}")
            return {"success": False, "error": "Authentication failed"}
    
    def get_user_by_email(self, email):
        """Get user by email address"""
        if not self.is_connected:
            return None
        
        try:
            # First try Firebase Auth if available
            if self.auth:
                try:
                    result = self.firebase_config.get_user_by_email(email)
                    if result["success"]:
                        # Now get the user document from Firestore
                        user_id = result["user"]["uid"]
                        user_doc = self.db.collection('users').document(user_id).get()
                        if user_doc.exists:
                            user_data = user_doc.to_dict()
                            user_data['user_id'] = user_id
                            # Merge with Firebase Auth data
                            user_data.update({
                                "email_verified": result["user"]["email_verified"],
                                "auth_provider": user_data.get("auth_provider", "email")
                            })
                            return user_data
                except Exception as auth_error:
                    print(f"⚠️ Firebase Auth get_user_by_email failed: {auth_error}")
                    # Fall back to Firestore lookup
            
            # Fallback to direct Firestore query
            users_collection = self.db.collection('users')
            user_docs = users_collection.where('email', '==', email.lower().strip()).limit(1).get()
            
            if len(user_docs) > 0:
                user_doc = user_docs[0]
                user_data = user_doc.to_dict()
                user_data['user_id'] = user_doc.id
                return user_data
            return None
            
        except Exception as e:
            print(f"❌ Error fetching user: {e}")
            return None
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        if not self.is_connected:
            return None
        
        try:
            # First try Firebase Auth if available
            if self.auth:
                try:
                    result = self.firebase_config.get_user(user_id)
                    if result["success"]:
                        # Now get the user document from Firestore
                        user_doc = self.db.collection('users').document(user_id).get()
                        if user_doc.exists:
                            user_data = user_doc.to_dict()
                            user_data['user_id'] = user_id
                            # Merge with Firebase Auth data
                            user_data.update({
                                "email_verified": result["user"]["email_verified"],
                                "display_name": result["user"]["display_name"],
                                "auth_provider": user_data.get("auth_provider", "email")
                            })
                            return user_data
                except Exception as auth_error:
                    print(f"⚠️ Firebase Auth get_user failed: {auth_error}")
                    # Fall back to Firestore lookup
            
            # Fallback to direct Firestore query
            user_doc = self.db.collection('users').document(user_id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                user_data['user_id'] = user_doc.id
                return user_data
            return None
            
        except Exception as e:
            print(f"❌ Error fetching user by ID: {e}")
            return None
    
    # Password Reset Methods
    def create_password_reset_token(self, email):
        """Create a password reset token"""
        if not self.is_connected:
            return {"success": False, "error": "Database not available"}
        
        try:
            user = self.get_user_by_email(email)
            if not user:
                return {"success": False, "error": "User not found"}
            
            # Check auth provider
            auth_provider = user.get("auth_provider", "email")
            if auth_provider != "email":
                return {"success": False, "error": f"Cannot reset password for {auth_provider} accounts. Please use your {auth_provider} account settings."}
            
            # For Firebase Auth users, generate a password reset link
            if "password_hash" not in user:
                reset_link_result = self.firebase_config.generate_password_reset_link(email)
                if reset_link_result["success"]:
                    return {"success": True, "reset_link": reset_link_result["reset_link"], "is_firebase_link": True}
                else:
                    return {"success": False, "error": reset_link_result.get("error", "Failed to generate password reset link")}
            
            # Generate secure token
            token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(hours=1)  # Token expires in 1 hour
            
            # Store token in Firestore
            token_data = {
                "user_id": user['user_id'],
                "email": email.lower().strip(),
                "token": token,
                "created_at": datetime.now(),
                "expires_at": expires_at,
                "used": False
            }
            
            self.db.collection('password_reset_tokens').add(token_data)
            
            return {
                "success": True, 
                "token": token,
                "expires_at": expires_at,
                "message": "Password reset token created"
            }
            
        except Exception as e:
            print(f"❌ Error creating reset token: {e}")
            return {"success": False, "error": "Failed to create reset token"}
    
    def verify_reset_token(self, token):
        """Verify password reset token"""
        if not self.is_connected:
            return {"success": False, "error": "Database not available"}
        
        try:
            tokens_collection = self.db.collection('password_reset_tokens')
            token_docs = tokens_collection.where('token', '==', token).where('used', '==', False).limit(1).get()
            
            if len(token_docs) == 0:
                return {"success": False, "error": "Invalid or expired token"}
            
            token_doc = token_docs[0]
            token_data = token_doc.to_dict()
            
            # Check if token has expired
            if datetime.now() > token_data['expires_at']:
                return {"success": False, "error": "Token has expired"}
            
            return {
                "success": True,
                "email": token_data["email"],
                "user_id": token_data["user_id"]
            }
                
        except Exception as e:
            print(f"❌ Error verifying reset token: {e}")
            return {"success": False, "error": "Token verification failed"}
    
    def reset_password(self, token, new_password):
        """Reset user password with token"""
        if not self.is_connected:
            return {"success": False, "error": "Database not available"}
        
        try:
            # Verify token
            token_result = self.verify_reset_token(token)
            if not token_result["success"]:
                return token_result
            
            # Get user data to check if Firebase Auth or regular user
            user_id = token_result["user_id"]
            user_doc = self.db.collection('users').document(user_id).get()
            
            if not user_doc.exists:
                return {"success": False, "error": "User not found"}
                
            user_data = user_doc.to_dict()
            email = user_data.get("email")
            
            # Update password in Firebase Auth if applicable
            if email and "password_hash" not in user_data:
                try:
                    # For Firebase Auth users, use the Admin SDK to update password
                    result = self.firebase_config.update_user(user_id, password=new_password)
                    if not result["success"]:
                        return {"success": False, "error": f"Failed to update password in Firebase: {result.get('error', 'Unknown error')}"}
                except Exception as e:
                    print(f"❌ Error updating Firebase Auth password: {e}")
            else:
                # Update password hash in our Firestore database
                user_doc.reference.update({
                    "password_hash": generate_password_hash(new_password),
                    "updated_at": datetime.now()
                })
            
            # Mark token as used
            tokens_collection = self.db.collection('password_reset_tokens')
            token_docs = tokens_collection.where('token', '==', token).limit(1).get()
            if len(token_docs) > 0:
                token_docs[0].reference.update({
                    "used": True,
                    "used_at": datetime.now()
                })
            
            # Log password reset
            self._log_user_activity(token_result["user_id"], "password_reset", {
                "email": token_result["email"]
            })
            
            return {"success": True, "message": "Password reset successfully"}
                
        except Exception as e:
            print(f"❌ Error resetting password: {e}")
            return {"success": False, "error": "Password reset failed"}
    
    # Sensor Data Methods
    def get_latest_sensor_data(self):
        """Get the most recent sensor reading"""
        if not self.is_connected:
            return self._generate_fallback_sensor_data()
        
        try:
            sensor_collection = self.db.collection('sensor_data')
            latest_docs = sensor_collection.order_by('timestamp', direction='DESCENDING').limit(1).get()
            
            if len(latest_docs) > 0:
                latest_data = latest_docs[0].to_dict()
                return latest_data
            
            # If no data exists, generate and store some
            return self._generate_and_store_sensor_data()
            
        except Exception as e:
            print(f"❌ Error fetching latest sensor data: {e}")
            return self._generate_fallback_sensor_data()
    
    def get_historical_sensor_data(self, hours=24):
        """Get sensor data for the specified number of hours"""
        if not self.is_connected:
            return self._generate_fallback_historical_data(hours)
        
        try:
            start_time = datetime.now() - timedelta(hours=hours)
            
            sensor_collection = self.db.collection('sensor_data')
            docs = sensor_collection.where('timestamp', '>=', start_time).order_by('timestamp').get()
            
            data = []
            for doc in docs:
                record = doc.to_dict()
                data.append(record)
            
            return data if len(data) > 0 else self._generate_fallback_historical_data(hours)
            
        except Exception as e:
            print(f"❌ Error fetching historical data: {e}")
            return self._generate_fallback_historical_data(hours)
    
    def get_recent_alerts(self, limit=10):
        """Get recent system alerts"""
        if not self.is_connected:
            return self._generate_fallback_alerts()
        
        try:
            alerts_collection = self.db.collection('alerts')
            docs = alerts_collection.order_by('timestamp', direction='DESCENDING').limit(limit).get()
            
            alerts = []
            for doc in docs:
                alert = doc.to_dict()
                alerts.append(alert)
            
            return alerts if len(alerts) > 0 else self._generate_fallback_alerts()
            
        except Exception as e:
            print(f"❌ Error fetching alerts: {e}")
            return self._generate_fallback_alerts()
    
    def insert_sensor_reading(self, sensor_data):
        """Insert a new sensor reading"""
        if not self.is_connected:
            return None
        
        try:
            sensor_data['timestamp'] = datetime.now()
            doc_ref = self.db.collection('sensor_data').add(sensor_data)
            return doc_ref[1].id
            
        except Exception as e:
            print(f"❌ Error inserting sensor data: {e}")
            return None
    
    # User Activity Logging
    def _log_user_activity(self, user_id, activity_type, details=None):
        """Log user activity for audit purposes"""
        if not self.is_connected:
            return
        
        try:
            activity_log = {
                "user_id": user_id,
                "activity_type": activity_type,
                "timestamp": datetime.now(),
                "details": details or {},
                "ip_address": None  # Could be added from request context
            }
            
            self.db.collection('user_activity').add(activity_log)
            
        except Exception as e:
            print(f"⚠️ Error logging user activity: {e}")
            # Non-critical error, so we don't raise an exception
            
    def create_user_with_google(self, id_token):
        """Create or authenticate a user with Google authentication"""
        if not self.is_connected or not self.auth:
            return {"success": False, "error": "Firebase not available for Google authentication"}

        try:
            # Verify the Google ID token using Firebase
            verify_result = self.firebase_config.verify_google_id_token(id_token)
            
            if not verify_result["success"]:
                return {"success": False, "error": verify_result.get("error", "Invalid Google token")}
            
            user_data = verify_result["user_data"]
            email = user_data.get("email")
            full_name = user_data.get("name")
            user_id = user_data.get("uid")
            photo_url = user_data.get("picture")
            
            if not email or not user_id:
                return {"success": False, "error": "Invalid Google user data"}
            
            # Check if user already exists in our Firestore database
            users_collection = self.db.collection('users')
            existing_user = users_collection.document(user_id).get()
            
            if existing_user.exists:
                # Update last login time for existing user
                user_doc = existing_user.to_dict()
                users_collection.document(user_id).update({
                    "last_login": datetime.now()
                })
                
                # Log successful login
                self._log_user_activity(user_id, "login_successful", {
                    "email": email,
                    "login_time": datetime.now(),
                    "auth_provider": "google"
                })
                
                # Return user info
                user_info = {
                    "user_id": user_id,
                    "email": email,
                    "full_name": user_doc.get("full_name", full_name or email.split('@')[0]),
                    "role": user_doc.get("profile", {}).get("role", "user"),
                    "auth_provider": "google"
                }
                
                return {"success": True, "user": user_info, "message": "Login successful with Google", "is_new_user": False}
            else:
                # Create new user document in Firestore
                user_doc_data = {
                    "email": email,
                    "full_name": full_name or email.split('@')[0],
                    "created_at": datetime.now(),
                    "last_login": datetime.now(),
                    "is_active": True,
                    "email_verified": user_data.get("email_verified", False),
                    "auth_provider": "google",
                    "profile": {
                        "role": "user",
                        "preferences": {
                            "notifications": True,
                            "theme": "light"
                        },
                        "photo_url": photo_url
                    }
                }
                
                users_collection.document(user_id).set(user_doc_data)
                
                # Log user creation
                self._log_user_activity(user_id, "account_created", {
                    "email": email,
                    "full_name": full_name,
                    "auth_provider": "google",
                    "creation_time": datetime.now()
                })
                
                # Return user info
                user_info = {
                    "user_id": user_id,
                    "email": email,
                    "full_name": full_name or email.split('@')[0],
                    "role": "user",
                    "auth_provider": "google"
                }
                
                return {"success": True, "user": user_info, "message": "Account created successfully with Google", "is_new_user": True}
                
        except Exception as e:
            print(f"❌ Error with Google authentication: {e}")
            return {"success": False, "error": f"Google authentication failed: {str(e)}"}
    
    # Fallback Methods (when Firebase is not available)
    def _create_fallback_user(self, email, password, full_name, company=None):
        """Create user in fallback JSON storage"""
        import json
        import os
        
        users_file = 'fallback_users.json'
        users = {}
        
        if os.path.exists(users_file):
            try:
                with open(users_file, 'r') as f:
                    users = json.load(f)
            except:
                users = {}
        
        if email.lower() in users:
            return {'success': False, 'error': 'User with this email already exists'}
        
        user_data = {
            'email': email.lower(),
            'password_hash': generate_password_hash(password),
            'full_name': full_name,
            'created_at': datetime.now().isoformat(),
            'user_id': f"user_{len(users) + 1}"
        }
        
        users[email.lower()] = user_data
        
        try:
            with open(users_file, 'w') as f:
                json.dump(users, f, indent=2)
            return {
                'success': True,
                'user_id': user_data['user_id'],
                'message': 'Account created successfully'
            }
        except:
            return {'success': False, 'error': 'Failed to save user data'}
    
    def _authenticate_fallback_user(self, email, password):
        """Authenticate user from fallback storage"""
        import json
        import os
        
        users_file = 'fallback_users.json'
        if not os.path.exists(users_file):
            return {'success': False, 'error': 'Invalid email or password'}
        
        try:
            with open(users_file, 'r') as f:
                users = json.load(f)
        except:
            return {'success': False, 'error': 'Invalid email or password'}
        
        user_data = users.get(email.lower())
        if not user_data:
            return {'success': False, 'error': 'Invalid email or password'}
        
        if check_password_hash(user_data['password_hash'], password):
            return {
                'success': True,
                'user': {
                    'user_id': user_data['user_id'],
                    'email': user_data['email'],
                    'full_name': user_data['full_name'],
                    'role': 'user'
                },
                'message': 'Login successful'
            }
        else:
            return {'success': False, 'error': 'Invalid email or password'}
    
    def _generate_fallback_sensor_data(self):
        """Generate fallback sensor data when Firebase is unavailable"""
        return {
            'temperature': round(random.uniform(20, 30), 1),
            'dissolved_oxygen': round(random.uniform(4, 12), 2),
            'ammonia': round(random.uniform(0, 5), 3),
            'timestamp': datetime.now()
        }
    
    def _generate_fallback_historical_data(self, hours):
        """Generate fallback historical data"""
        data = []
        for i in range(hours):
            timestamp = datetime.now() - timedelta(hours=i)
            data.append({
                'timestamp': timestamp,
                'temperature': round(random.uniform(20, 30), 1),
                'dissolved_oxygen': round(random.uniform(4, 12), 2),
                'ammonia': round(random.uniform(0, 5), 3)
            })
        return list(reversed(data))
    
    def _generate_fallback_alerts(self):
        """Generate fallback alerts"""
        return [
            {
                'timestamp': datetime.now() - timedelta(minutes=10),
                'type': 'warning',
                'message': 'Ammonia level approaching lower threshold',
                'sensor_id': 'SENSOR_001'
            },
            {
                'timestamp': datetime.now() - timedelta(hours=2),
                'type': 'info',
                'message': 'Temperature sensor calibration completed',
                'sensor_id': 'SENSOR_002'
            },
            {
                'timestamp': datetime.now() - timedelta(hours=4),
                'type': 'success',
                'message': 'Water quality parameters optimal',
                'sensor_id': 'SENSOR_001'
            }
        ]
    
    def _generate_and_store_sensor_data(self):
        """Generate and store new sensor data"""
        try:
            new_data = self._generate_fallback_sensor_data()
            self.insert_sensor_reading(new_data)
            return new_data
        except:
            return self._generate_fallback_sensor_data()
    
    def close_connection(self):
        """Close Firebase connection (no-op for Firebase as it's managed automatically)"""
        print("🔒 Firebase connection will be managed automatically")

# Global database instance
db = AquaTechFirebaseDB()
