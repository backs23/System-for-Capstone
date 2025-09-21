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
        self.firebase_web_config = firebase_config.get_web_config_dict()
    
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
    def create_user(self, email, password, full_name, company=None):
        """Create a new user using Firebase Authentication and store additional data in Firestore"""
        if not self.is_connected or not self.auth:
            return self._create_fallback_user(email, password, full_name)
        
        try:
            # Create user in Firebase Authentication
            firebase_result = self.firebase_config.create_user_with_email_and_password(email, password)
            
            if not firebase_result['success']:
                return {'success': False, 'error': firebase_result['error']}
            
            user_id = firebase_result['user_id']
            
            # Store additional user data in Firestore
            users_collection = self.db.collection('users')
            user_data = {
                'email': email.lower(),
                'full_name': full_name,
                'company': company,
                'created_at': datetime.now(),
                'last_login': None,
                'is_active': True,
                'email_verified': False,
                'auth_provider': 'email_password',
                'profile': {
                    'role': 'user',
                    'preferences': {
                        'notifications': True,
                        'theme': 'light'
                    }
                }
            }
            
            users_collection.document(user_id).set(user_data)
            
            # Log user creation
            self._log_user_activity(user_id, "account_created", {
                "email": email,
                "full_name": full_name,
                "auth_provider": "email_password",
                "creation_time": datetime.now()
            })
            
            return {
                'success': True,
                'user_id': user_id,
                'message': 'Account created successfully'
            }
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return {'success': False, 'error': f'Failed to create user: {str(e)}'}
    
    def authenticate_user(self, email, password, google_id_token=None):
        """Authenticate a user with email/password or Google ID token using Firebase Authentication"""
        if not self.is_connected or not self.auth:
            if google_id_token:
                # Handle mock Google authentication in fallback mode
                # This is for testing purposes only
                if google_id_token.startswith('mock-'):
                    # Create a mock user response
                    mock_user_id = google_id_token[5:]  # Remove 'mock-' prefix
                    return {
                        'success': True,
                        'user': {
                            'user_id': mock_user_id,
                            'email': f'mock{mock_user_id}@example.com',
                            'full_name': 'Mock Google User',
                            'role': 'user'
                        },
                        'message': 'Mock Google authentication successful'
                    }
            # Pass google_id_token to fallback method for consistent handling
            return self._authenticate_fallback_user(email, password, google_id_token)
            return self._authenticate_fallback_user(email, password)
        
        try:
            # Handle Google authentication
            if google_id_token:
                # Verify Google ID token
                result = self.firebase_config.verify_google_id_token(google_id_token)
                if not result['success']:
                    return {'success': False, 'error': result.get('error', 'Invalid Google token')}
                
                # Get user data from decoded token
                decoded_token = result['user_data']
                user_id = decoded_token['uid']
                email = decoded_token.get('email')
                
                # Find user in Firestore
                users_collection = self.db.collection('users')
                user_doc = users_collection.document(user_id).get()
                
                if not user_doc.exists:
                    return {'success': False, 'error': 'User data not found'}
                
                user_data = user_doc.to_dict()
                
                # Check if user is active
                if not user_data.get('is_active', True):
                    return {'success': False, 'error': 'Account is inactive'}
                
                # Update last login time
                users_collection.document(user_id).update({
                    'last_login': datetime.now()
                })
                
                # Log successful login
                self._log_user_activity(user_id, "login_successful", {
                    "email": email,
                    "login_time": datetime.now(),
                    "auth_provider": "google"
                })
                
                # Return user info
                user_info = {
                    'user_id': user_id,
                    'email': user_data.get('email', email.lower()),
                    'full_name': user_data.get('full_name', email.split('@')[0]),
                    'role': user_data.get('profile', {}).get('role', 'user')
                }
                
                return {
                    'success': True,
                    'user': user_info,
                    'message': 'Google login successful'
                }
            
            # Original email/password authentication
            # Get user by email from Firebase Authentication
            user_result = self.firebase_config.get_user_by_email(email)
            
            if not user_result['success']:
                return {'success': False, 'error': 'Invalid email or password'}
            
            # Find user in Firestore
            users_collection = self.db.collection('users')
            user_doc = users_collection.document(user_result['user']['uid']).get()
            
            if not user_doc.exists:
                return {'success': False, 'error': 'User data not found'}
            
            user_data = user_doc.to_dict()
            user_id = user_doc.id
            
            # Check if user is active
            if not user_data.get('is_active', True):
                return {'success': False, 'error': 'Account is inactive'}
            
            # Update last login time
            users_collection.document(user_id).update({
                'last_login': datetime.now()
            })
            
            # Log successful login
            self._log_user_activity(user_id, "login_successful", {
                "email": email,
                "login_time": datetime.now(),
                "auth_provider": "email_password"
            })
            
            # Return user info
            user_info = {
                'user_id': user_id,
                'email': user_data.get('email', email.lower()),
                'full_name': user_data.get('full_name', email.split('@')[0]),
                'role': user_data.get('profile', {}).get('role', 'user')
            }
            
            return {
                'success': True,
                'user': user_info,
                'message': 'Login successful'
            }
        except Exception as e:
            print(f"❌ Error authenticating user: {e}")
            return {'success': False, 'error': f'Authentication failed: {str(e)}'}
    
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
        """Generate a password reset link using Firebase Authentication"""
        if not self.is_connected:
            return {"success": False, "error": "Database not available"}
        
        try:
            # Get user by email from Firebase Authentication
            user_result = self.firebase_config.get_user_by_email(email)
            if not user_result['success']:
                # User not found in Firebase, check if it's in our Firestore (for backward compatibility)
                user = self.get_user_by_email(email)
                if not user:
                    return {"success": False, "error": "User not found"}
            
            # Check auth provider
            user_data = None
            auth_provider = "email"
            
            if user_result['success']:
                # User is in Firebase Auth
                user_data = user_result['user']
                # For Firebase users, we need to check the provider via user document in Firestore
                firestore_user = self.get_user_by_id(user_data['uid'])
                if firestore_user:
                    auth_provider = firestore_user.get("auth_provider", "email")
            else:
                # User is only in Firestore (legacy)
                user_data = user
                auth_provider = user_data.get("auth_provider", "email")
            
            # Verify auth provider
            if auth_provider != "email":
                return {"success": False, "error": f"Cannot reset password for {auth_provider} accounts. Please use your {auth_provider} account settings."}
            
            # Generate password reset link using Firebase Authentication
            reset_link_result = self.firebase_config.generate_password_reset_link(email)
            if reset_link_result["success"]:
                # Log password reset request
                self._log_user_activity(user_data.get('user_id', user_data.get('uid')), "password_reset_request", {"email": email})
                
                return {"success": True, "reset_link": reset_link_result["reset_link"], "is_firebase_link": True}
            else:
                return {"success": False, "error": reset_link_result.get("error", "Failed to generate password reset link")}
                
        except Exception as e:
            print(f"❌ Error creating password reset link: {e}")
            return {"success": False, "error": "Failed to create password reset link"}
    
    def verify_reset_token(self, token):
        """Verify password reset token (maintained for backward compatibility)"""
        if not self.is_connected:
            return {"success": False, "error": "Database not available"}
        
        try:
            # Note: For Firebase Authentication, the password reset process is handled entirely by Firebase
            # This method is maintained for backward compatibility with our legacy token system
            
            tokens_collection = self.db.collection('password_reset_tokens')
            token_docs = tokens_collection.where('token', '==', token).where('used', '==', False).limit(1).get()
            
            if len(token_docs) == 0:
                # If token not found in our system, it might be a Firebase token
                # which we can't verify directly (Firebase handles this on their side)
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
        """Reset user password - Maintained for backward compatibility but primary flow uses Firebase's built-in reset"""
        if not self.is_connected:
            return {"success": False, "error": "Database not available"}
        
        try:
            # Note: For Firebase Authentication, the primary password reset flow is handled entirely by Firebase
            # through their password reset email and UI. This method is maintained for backward compatibility.
            
            # Verify token (for legacy tokens)
            token_result = self.verify_reset_token(token)
            if not token_result["success"]:
                return token_result
            
            # Get user data
            user_id = token_result["user_id"]
            user_doc = self.db.collection('users').document(user_id).get()
            
            if not user_doc.exists:
                return {"success": False, "error": "User not found"}
                
            user_data = user_doc.to_dict()
            email = user_data.get("email")
            
            # Update password in Firebase Authentication
            if email:
                try:
                    # For Firebase Auth users, use the Admin SDK to update password
                    result = self.firebase_config.update_user(user_id, password=new_password)
                    if not result["success"]:
                        # If Firebase update fails, try to update our internal record for backward compatibility
                        user_doc.reference.update({
                            "password_hash": generate_password_hash(new_password),
                            "updated_at": datetime.now()
                        })
                    
                    # Mark token as used if it exists in our system
                    tokens_collection = self.db.collection('password_reset_tokens')
                    token_docs = tokens_collection.where('token', '==', token).limit(1).get()
                    if len(token_docs) > 0:
                        token_docs[0].reference.update({
                            "used": True,
                            "used_at": datetime.now()
                        })
                    
                    # Log password reset
                    self._log_user_activity(user_id, "password_reset", {
                        "email": email
                    })
                    
                    return {"success": True, "message": "Password reset successfully"}
                except Exception as e:
                    print(f"❌ Error updating Firebase Auth password: {e}")
                    return {"success": False, "error": f"Failed to reset password: {str(e)}"}
            
            return {"success": False, "error": "Email not found for user"}
                
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
        """Create or authenticate user with Google ID token using Firebase Authentication"""
        if not self.is_connected or not self.auth:
            return {"success": False, "error": "Firebase not available for Google authentication"}
        
        try:
            # Use Firebase Admin SDK to verify Google ID token and link to Firebase account
            result = self.firebase_config.verify_google_id_token(id_token)
            if not result['success']:
                return {"success": False, "error": result.get('error', 'Invalid Google token')}
            
            # Get Firebase user data
            decoded_token = result['user_data']
            user_id = decoded_token['uid']
            email = decoded_token.get('email')
            
            # Check if user document exists in Firestore
            users_collection = self.db.collection('users')
            user_doc = users_collection.document(user_id).get()
            
            # Extract profile information from the Firebase user or the Google provider data
            profile_info = None
            if 'providerData' in firebase_user:
                for provider in firebase_user['providerData']:
                    if provider['providerId'] == 'google.com':
                        profile_info = provider
                        break
            
            if user_doc.exists:
                # User exists, update last login and any profile changes
                update_data = {
                    "last_login": datetime.now(),
                    "updated_at": datetime.now()
                }
                
                # Update profile information if it's changed
                if profile_info:
                    update_data.update({
                        "display_name": profile_info.get("displayName", email),
                        "profile_picture": profile_info.get("photoURL", ""),
                        "email_verified": profile_info.get("emailVerified", False)
                    })
                
                user_doc.reference.update(update_data)
                
                user_data = user_doc.to_dict()
                user_data["user_id"] = user_id
                
                # Log login
                self._log_user_activity(user_id, "login_successful", {"method": "google", "email": email})
                
                return {"success": True, "user": user_data, "created": False, "message": "Login successful with Google"}
            
            # Create new user document in Firestore
            user_data = {
                "user_id": user_id,
                "email": email,
                "email_verified": decoded_token.get("email_verified", False),
                "first_name": profile_info.get("givenName", "") if profile_info else "",
                "last_name": profile_info.get("familyName", "") if profile_info else "",
                "display_name": profile_info.get("displayName", email) if profile_info else email,
                "profile_picture": profile_info.get("photoURL", "") if profile_info else "",
                "auth_provider": "google",
                "created_at": datetime.now(),
                "last_login": datetime.now(),
                "updated_at": datetime.now(),
                "is_active": True,
                "profile": {
                    "role": "user",
                    "preferences": {
                        "notifications": True,
                        "theme": "light"
                    }
                }
            }
            
            # Store user data in Firestore
            users_collection.document(user_id).set(user_data)
            
            # Log user creation
            self._log_user_activity(user_id, "account_created", {"method": "google", "email": email})
            
            return {"success": True, "user": user_data, "created": True, "message": "Account created successfully with Google"}
                
        except Exception as e:
            print(f"❌ Error authenticating with Google: {e}")
            return {"success": False, "error": "Failed to authenticate with Google"}
    
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
    
    def _authenticate_fallback_user(self, email, password, google_id_token=None):
        """Authenticate user from fallback storage"""
        import json
        import os
        
        # Handle mock Google authentication in fallback mode
        if google_id_token:
            if google_id_token.startswith('mock-'):
                # Create a mock user response
                mock_user_id = google_id_token[5:]  # Remove 'mock-' prefix
                return {
                    'success': True,
                    'user': {
                        'user_id': mock_user_id,
                        'email': f'mock{mock_user_id}@example.com',
                        'full_name': 'Mock Google User',
                        'role': 'user'
                    },
                    'message': 'Mock Google authentication successful'
                }
            return {'success': False, 'error': 'Google authentication not supported in fallback mode'}
        
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
