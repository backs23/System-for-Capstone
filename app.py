from flask import Flask, render_template, jsonify, request, redirect, url_for, flash, session
from flask_wtf.csrf import CSRFProtect, CSRFError
from datetime import datetime, timedelta
import random
import re
import os
import json
from functools import wraps
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Configuration
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production-2024')
app.config['WTF_CSRF_ENABLED'] = False  # Temporarily disabled for testing
app.config['WTF_CSRF_TIME_LIMIT'] = 3600  # 1 hour
app.config['WTF_CSRF_SSL_STRICT'] = False  # Allow HTTP in development

# Initialize CSRF protection
csrf = CSRFProtect(app)

# CSRF error handler
@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    print(f"CSRF Error: {e.description}")
    flash('Security token expired or missing. Please try again.', 'error')
    return redirect(request.referrer or url_for('login'))

# General error handler for debugging
@app.errorhandler(400)
def handle_bad_request(e):
    print(f"Bad Request Error: {e.description}")
    if 'csrf' in str(e.description).lower():
        flash('Security token error. Please refresh the page and try again.', 'error')
        return redirect(request.referrer or url_for('login'))
    return str(e), 400

# Authentication helper functions
def login_required(f):
    """Decorator to require login for protected routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def validate_email(email):
    """Simple email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Password validation - at least 8 characters, 1 uppercase, 1 lowercase, 1 digit"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

# Fallback user management (when database is not available)
USERS_FILE = 'fallback_users.json'

def load_fallback_users():
    """Load users from fallback JSON file"""
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading fallback users: {e}")
    return {}

def save_fallback_users(users):
    """Save users to fallback JSON file"""
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving fallback users: {e}")
        return False

def create_fallback_user(email, password, full_name):
    """Create user in fallback storage"""
    users = load_fallback_users()
    
    # Check if user already exists
    if email.lower() in users:
        return {'success': False, 'error': 'User with this email already exists'}
    
    # Create user record
    user_data = {
        'email': email.lower(),
        'password_hash': generate_password_hash(password),
        'full_name': full_name,
        'created_at': datetime.now().isoformat(),
        'user_id': f"user_{len(users) + 1}"
    }
    
    users[email.lower()] = user_data
    
    if save_fallback_users(users):
        return {
            'success': True,
            'user_id': user_data['user_id'],
            'message': 'Account created successfully'
        }
    else:
        return {'success': False, 'error': 'Failed to save user data'}

def authenticate_fallback_user(email, password):
    """Authenticate user from fallback storage"""
    users = load_fallback_users()
    
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

# Fallback function for when database is not available
def generate_fallback_sensor_data():
    """Generate fallback sensor data when database is unavailable"""
    return {
        'temperature': round(random.uniform(20, 30), 1),
        'dissolved_oxygen': round(random.uniform(4, 12), 2),
        'ammonia': round(random.uniform(0, 5), 3),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

# Demo credentials (move to environment variables in production)
DEMO_EMAIL = os.getenv('DEMO_EMAIL', 'demo@aquatech.com')
DEMO_PASSWORD = os.getenv('DEMO_PASSWORD', 'Demo123!')

@app.route('/', methods=['GET', 'POST'])
def login():
    """Login page route"""
    # If user is already logged in, redirect to homepage
    if 'user_id' in session:
        return redirect(url_for('homepage'))
    
    if request.method == 'POST':
        print(f"Login attempt - Form data: {dict(request.form)}")
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        
        # Basic validation
        if not email or not password:
            flash('Please fill in all fields', 'error')
            return render_template('login.html')
        
        if not validate_email(email):
            flash('Please enter a valid email address', 'error')
            return render_template('login.html')
        
        # Try authentication with Firebase database, fallback if no database
        if db.is_connected:
            result = db.authenticate_user(email, password)
            if result['success']:
                # Store user info in session
                session['user_id'] = result['user']['user_id']
                session['user_email'] = result['user']['email']
                session['user_name'] = result['user']['full_name']
                session['user_role'] = result['user']['role']
                
                flash(f"Welcome back, {result['user']['full_name']}!", 'success')
                return redirect(url_for('homepage'))
            else:
                flash(result['error'], 'error')
        else:
            # Fallback: Try fallback user authentication first
            fallback_result = authenticate_fallback_user(email, password)
            if fallback_result['success']:
                # Store user info in session
                session['user_id'] = fallback_result['user']['user_id']
                session['user_email'] = fallback_result['user']['email']
                session['user_name'] = fallback_result['user']['full_name']
                session['user_role'] = fallback_result['user']['role']
                
                flash(f"Welcome back, {fallback_result['user']['full_name']}!", 'success')
                return redirect(url_for('homepage'))
            elif email == DEMO_EMAIL and password == DEMO_PASSWORD:
                # Demo login as last resort
                session['user_id'] = 'demo_user'
                session['user_email'] = DEMO_EMAIL
                session['user_name'] = 'Demo User'
                session['user_role'] = 'demo'
                
                flash('Welcome to AquaTech Demo!', 'success')
                return redirect(url_for('homepage'))
            else:
                flash('Invalid email or password. Or try demo login: demo@aquatech.com / Demo123!', 'error')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """Signup page route"""
    # If user is already logged in, redirect to homepage
    if 'user_id' in session:
        return redirect(url_for('homepage'))
    
    if request.method == 'POST':
        print(f"Signup attempt - Form data: {dict(request.form)}")
        full_name = request.form.get('full_name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Basic validation
        if not all([full_name, email, password, confirm_password]):
            flash('Please fill in all required fields', 'error')
            return render_template('signup.html')
        
        if not validate_email(email):
            flash('Please enter a valid email address', 'error')
            return render_template('signup.html')
        
        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return render_template('signup.html')
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            flash(message, 'error')
            return render_template('signup.html')
        
        # Try to create user account
        if db.is_connected:
            result = db.create_user(email, password, full_name)
            if result['success']:
                flash('Account created successfully! Please log in.', 'success')
                return redirect(url_for('login'))
            else:
                flash(result['error'], 'error')
        else:
            # Fallback: Create user in local storage
            print("Database not available, using fallback user creation")
            result = create_fallback_user(email, password, full_name)
            if result['success']:
                flash('Account created successfully! You can now log in.', 'success')
                return redirect(url_for('login'))
            else:
                flash(result['error'], 'error')
    
    return render_template('signup.html')

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Forgot password page route"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        
        if not email:
            flash('Please enter your email address', 'error')
            return render_template('forgot-password.html')
        
        if not validate_email(email):
            flash('Please enter a valid email address', 'error')
            return render_template('forgot-password.html')
        
        if db.is_connected:
            result = db.create_password_reset_token(email)
            if result['success']:
                # In a real app, you would send an email here
                # For demo purposes, we'll show the token in flash message
                flash(f'Password reset instructions sent to your email. Demo token: {result["token"]}', 'success')
                return redirect(url_for('reset_password_form', token=result['token']))
            else:
                if 'not found' in result['error'].lower():
                    # Don't reveal if email exists or not for security
                    flash('If this email exists, password reset instructions have been sent.', 'info')
                else:
                    flash('Unable to process request. Please try again.', 'error')
        else:
            flash('Database not available. Please try again later.', 'warning')
    
    return render_template('forgot-password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password_form(token):
    """Password reset form with token"""
    if request.method == 'POST':
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if not new_password or not confirm_password:
            flash('Please fill in all fields', 'error')
            return render_template('reset-password.html', token=token)
        
        if new_password != confirm_password:
            flash('Passwords do not match', 'error')
            return render_template('reset-password.html', token=token)
        
        # Validate password strength
        is_valid, message = validate_password(new_password)
        if not is_valid:
            flash(message, 'error')
            return render_template('reset-password.html', token=token)
        
        if db.is_connected:
            result = db.reset_password(token, new_password)
            if result['success']:
                flash('Password reset successfully! Please log in with your new password.', 'success')
                return redirect(url_for('login'))
            else:
                flash(result['error'], 'error')
        else:
            flash('Database not available. Please try again later.', 'warning')
    
    # Verify token is valid
    if db.is_connected:
        token_result = db.verify_reset_token(token)
        if not token_result['success']:
            flash('Invalid or expired reset link', 'error')
            return redirect(url_for('forgot_password'))
    
    return render_template('reset-password.html', token=token)

@app.route('/logout')
def logout():
    """Logout route"""
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('login'))

@app.route('/homepage')
@login_required
def homepage():
    """Homepage route"""
    features = [
        {
            'title': 'Real-time Monitoring',
            'description': '24/7 water quality tracking with instant alerts',
            'icon': 'zap'
        },
        {
            'title': 'Cloud Integration',
            'description': 'Monitor multiple farms from anywhere with ThingSpeak API',
            'icon': 'users'
        },
        {
            'title': 'Multi-Parameter Sensing',
            'description': 'Temperature, oxygen, and ammonia monitoring with advanced sensors',
            'icon': 'activity'
        },
        {
            'title': 'Data Analytics',
            'description': 'Historical trends and predictive insights for water quality',
            'icon': 'trending-up'
        }
    ]
    
    sensors = [
        {'name': 'Temperature', 'desc': 'Monitor water temperature', 'icon': 'thermometer'},
        {'name': 'Dissolved Oxygen', 'desc': 'Ensure adequate O2 levels', 'icon': 'activity'},
        {'name': 'Ammonia', 'desc': 'Detect harmful compounds', 'icon': 'flask-conical'}
    ]
    
    return render_template('homepage.html', features=features, sensors=sensors)

@app.route('/water_monitoring')
@login_required
def water_monitoring():
    """Water monitoring page route"""
    # Try to get data from Firebase, fallback to random if unavailable
    if db.is_connected:
        current_data = db.get_latest_sensor_data()
        if not current_data:
            current_data = generate_fallback_sensor_data()
        else:
            # Format timestamp for display
            current_data['timestamp'] = current_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        # Get historical data from database
        historical_data = db.get_historical_sensor_data(24)
        # Format for chart display
        for item in historical_data:
            item['time'] = item['timestamp'].strftime('%H:%M')
    else:
        # Fallback to generated data
        current_data = generate_fallback_sensor_data()
        historical_data = []
        for i in range(24):  # Last 24 hours
            timestamp = datetime.now() - timedelta(hours=i)
            historical_data.append({
                'time': timestamp.strftime('%H:%M'),
                'ammonia': round(random.uniform(0, 5), 2),
                'temperature': round(random.uniform(20, 30), 1),
                'dissolved_oxygen': round(random.uniform(4, 12), 2),
            })
        historical_data = list(reversed(historical_data))
    
    return render_template('water_monitoring.html', 
                         current_data=current_data, 
                         historical_data=historical_data)

@app.route('/dashboard')
@login_required
def dashboard():
    """Dashboard demo page route"""
    # Try to get data from Firebase
    if db.is_connected:
        current_data = db.get_latest_sensor_data()
        if not current_data:
            current_data = generate_fallback_sensor_data()
        else:
            current_data['timestamp'] = current_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        # Get recent sensor data for charts (last 12 hours)
        historical_data = db.get_historical_sensor_data(12)
        
        if historical_data:
            chart_data = {
                'labels': [item['timestamp'].strftime('%H:%M') for item in historical_data],
                'ammonia_data': [item['ammonia'] for item in historical_data],
                'temp_data': [item['temperature'] for item in historical_data],
                'do_data': [item['dissolved_oxygen'] for item in historical_data]
            }
        else:
            # Fallback chart data
            chart_data = {
                'labels': [(datetime.now() - timedelta(hours=i)).strftime('%H:%M') for i in range(11, -1, -1)],
                'ammonia_data': [round(random.uniform(0, 5), 2) for _ in range(12)],
                'temp_data': [round(random.uniform(20, 30), 1) for _ in range(12)],
                'do_data': [round(random.uniform(4, 12), 2) for _ in range(12)]
            }
        
        # Get recent alerts from database
        alerts_data = db.get_recent_alerts(3)
        alerts = []
        for alert in alerts_data:
            time_diff = datetime.now() - alert['timestamp']
            if time_diff.days > 0:
                time_str = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                time_str = f"{time_diff.seconds // 3600} hours ago"
            else:
                time_str = f"{time_diff.seconds // 60} min ago"
            
            alerts.append({
                'type': alert['type'],
                'message': alert['message'],
                'time': time_str
            })
    else:
        # Fallback data
        current_data = generate_fallback_sensor_data()
        chart_data = {
            'labels': [(datetime.now() - timedelta(hours=i)).strftime('%H:%M') for i in range(11, -1, -1)],
            'ammonia_data': [round(random.uniform(0, 5), 2) for _ in range(12)],
            'temp_data': [round(random.uniform(20, 30), 1) for _ in range(12)],
            'do_data': [round(random.uniform(4, 12), 2) for _ in range(12)]
        }
        alerts = [
            {'type': 'warning', 'message': 'Ammonia level approaching lower threshold', 'time': '10 min ago'},
            {'type': 'info', 'message': 'Temperature sensor calibration completed', 'time': '2 hours ago'},
            {'type': 'success', 'message': 'Water quality parameters optimal', 'time': '4 hours ago'}
        ]
    
    return render_template('dashboard.html', 
                         current_data=current_data, 
                         chart_data=chart_data, 
                         alerts=alerts)

@app.route('/support')
@login_required
def support():
    """Support page route"""
    return render_template('support.html')

@app.route('/contact')
@login_required
def contact():
    """Contact page route"""
    return render_template('contact.html')

@app.route('/api/sensor-data')
@login_required
def api_sensor_data():
    """API endpoint for real-time sensor data"""
    if db.is_connected:
        current_data = db.get_latest_sensor_data()
        if current_data:
            # Convert datetime to string for JSON serialization
            current_data['timestamp'] = current_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            return jsonify(current_data)
    
    # Fallback to generated data
    return jsonify(generate_fallback_sensor_data())

# Clean up database connection when Flask is shutting down
@app.teardown_appcontext
def close_db_connection(exception):
    if db.is_connected:
        db.close_connection()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
