from flask import Flask, render_template, jsonify, request, redirect, url_for, flash, session
from flask_wtf.csrf import CSRFProtect, CSRFError
from datetime import datetime, timedelta
import random
import re
import os
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

def format_timestamp_for_display(timestamp):
    """Format timestamp for display, handling timezone-aware timestamps"""
    if hasattr(timestamp, 'tzinfo') and timestamp.tzinfo is not None:
        timestamp = timestamp.replace(tzinfo=None)
    return timestamp.strftime('%H:%M')


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
        remember = request.form.get('remember') == 'on'
        
        # Check if this is an AJAX request
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        
        # Basic validation
        if not email or not password:
            if is_ajax:
                return jsonify({'success': False, 'message': 'Please fill in all fields'})
            flash('Please fill in all fields', 'error')
            return render_template('login.html')
        
        if not validate_email(email):
            if is_ajax:
                return jsonify({'success': False, 'message': 'Please enter a valid email address'})
            flash('Please enter a valid email address', 'error')
            return render_template('login.html')
        
        # Check demo credentials first (for easy testing)
        if email == DEMO_EMAIL and password == DEMO_PASSWORD:
            session['user_id'] = 'demo_user'
            session['user_email'] = DEMO_EMAIL
            session['user_name'] = 'Demo User'
            session['user_role'] = 'demo'
            
            if is_ajax:
                return jsonify({
                    'success': True, 
                    'message': 'Welcome to AquaTech Demo!',
                    'redirect': url_for('homepage')
                })
            
            flash('Welcome to AquaTech Demo!', 'success')
            return redirect(url_for('homepage'))
        
        # Try authentication with Firebase database, fallback if no database
        if db.is_connected:
            result = db.authenticate_user(email, password)
            if result['success']:
                # Store user info in session
                session['user_id'] = result['user']['user_id']
                session['user_email'] = result['user']['email']
                session['user_name'] = result['user']['full_name']
                session['user_role'] = result['user']['role']
                
                # Set session to permanent if remember me is checked
                if remember:
                    session.permanent = True
                    app.permanent_session_lifetime = timedelta(days=30)
                
                if is_ajax:
                    return jsonify({
                        'success': True, 
                        'message': f"Welcome back, {result['user']['full_name']}!",
                        'redirect': url_for('homepage')
                    })
                
                flash(f"Welcome back, {result['user']['full_name']}!", 'success')
                return redirect(url_for('homepage'))
            else:
                if is_ajax:
                    return jsonify({'success': False, 'message': result['error']})
                flash(result['error'], 'error')
        else:
            # Database not available - show error
            if is_ajax:
                return jsonify({'success': False, 'message': 'Database not available. Please try demo login: demo@aquatech.com / Demo123!'})
            flash('Database not available. Please try demo login: demo@aquatech.com / Demo123!', 'error')
    
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
        terms = request.form.get('terms') == 'on'
        
        # Check if this is an AJAX request
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        # Basic validation
        if not all([full_name, email, password, confirm_password]):
            if is_ajax:
                return jsonify({'success': False, 'message': 'Please fill in all required fields'})
            flash('Please fill in all required fields', 'error')
            return render_template('signup.html')
        
        if not validate_email(email):
            if is_ajax:
                return jsonify({'success': False, 'message': 'Please enter a valid email address'})
            flash('Please enter a valid email address', 'error')
            return render_template('signup.html')
        
        if password != confirm_password:
            if is_ajax:
                return jsonify({'success': False, 'message': 'Passwords do not match'})
            flash('Passwords do not match', 'error')
            return render_template('signup.html')
        
        if not terms:
            if is_ajax:
                return jsonify({'success': False, 'message': 'You must agree to the terms and conditions'})
            flash('You must agree to the terms and conditions', 'error')
            return render_template('signup.html')
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            if is_ajax:
                return jsonify({'success': False, 'message': message})
            flash(message, 'error')
            return render_template('signup.html')
        
        # Try to create user account
        if db.is_connected:
            result = db.create_user(email, password, full_name)
            if result['success']:
                if is_ajax:
                    return jsonify({
                        'success': True, 
                        'message': 'Account created successfully! Please log in.',
                        'redirect': url_for('login')
                    })
                flash('Account created successfully! Please log in.', 'success')
                return redirect(url_for('login'))
            else:
                if is_ajax:
                    return jsonify({'success': False, 'message': result['error']})
                flash(result['error'], 'error')
        else:
            # Database not available - show error
            if is_ajax:
                return jsonify({'success': False, 'message': 'Database not available. Please try demo login: demo@aquatech.com / Demo123!'})
            flash('Database not available. Please try demo login: demo@aquatech.com / Demo123!', 'error')
    
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
            'description': 'pH, temperature, oxygen, turbidity, salinity, and ammonia monitoring',
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
        {'name': 'Ammonia Nitrogen', 'desc': 'Detect harmful compounds', 'icon': 'flask-conical'}
    ]
    
    return render_template('homepage.html', features=features, sensors=sensors)

@app.route('/water-monitoring')
@login_required
def water_monitoring():
    """Water monitoring page route"""
    # Try to get data from Firebase, fallback to random if unavailable
    if db.is_connected:
        current_data = db.get_latest_sensor_data()
        if not current_data:
            current_data = generate_fallback_sensor_data()
        else:
            # Format timestamp for display - handle timezone-aware timestamps
            timestamp = current_data['timestamp']
            if hasattr(timestamp, 'tzinfo') and timestamp.tzinfo is not None:
                timestamp = timestamp.replace(tzinfo=None)
            current_data['timestamp'] = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        
        # Get historical data from database
        historical_data = db.get_historical_sensor_data(24)
        # Format for chart display
        for item in historical_data:
            item['time'] = format_timestamp_for_display(item['timestamp'])
    else:
        # Fallback to generated data
        current_data = generate_fallback_sensor_data()
        historical_data = []
        for i in range(24):  # Last 24 hours
            timestamp = datetime.now() - timedelta(hours=i)
            historical_data.append({
                'time': timestamp.strftime('%H:%M'),
                'ammonia': round(random.uniform(0, 5), 3),
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
            # Format timestamp for display - handle timezone-aware timestamps
            timestamp = current_data['timestamp']
            if hasattr(timestamp, 'tzinfo') and timestamp.tzinfo is not None:
                timestamp = timestamp.replace(tzinfo=None)
            current_data['timestamp'] = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        
        # Get recent sensor data for charts (last 12 hours)
        historical_data = db.get_historical_sensor_data(12)
        
        if historical_data:
            chart_data = {
                'labels': [format_timestamp_for_display(item['timestamp']) for item in historical_data],
                'ammonia_data': [item['ammonia'] for item in historical_data],
                'temp_data': [item['temperature'] for item in historical_data],
                'do_data': [item['dissolved_oxygen'] for item in historical_data]
            }
        else:
            # Fallback chart data
            chart_data = {
                'labels': [(datetime.now() - timedelta(hours=i)).strftime('%H:%M') for i in range(11, -1, -1)],
                'ammonia_data': [round(random.uniform(0, 5), 3) for _ in range(12)],
                'temp_data': [round(random.uniform(20, 30), 1) for _ in range(12)],
                'do_data': [round(random.uniform(4, 12), 2) for _ in range(12)]
            }
        
        # Get recent alerts from database
        alerts_data = db.get_recent_alerts(3)
        alerts = []
        for alert in alerts_data:
            # Handle timezone-aware vs timezone-naive datetime comparison
            alert_timestamp = alert['timestamp']
            current_time = datetime.now()
            
            # If alert timestamp is timezone-aware, make current_time timezone-aware too
            if hasattr(alert_timestamp, 'tzinfo') and alert_timestamp.tzinfo is not None:
                # For timezone-aware timestamps, we need to make current_time timezone-aware
                # Since we don't have timezone info, we'll treat the alert timestamp as naive
                if hasattr(alert_timestamp, 'replace'):
                    alert_timestamp = alert_timestamp.replace(tzinfo=None)
            
            time_diff = current_time - alert_timestamp
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
