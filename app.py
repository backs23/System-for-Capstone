from flask import Flask, render_template, jsonify
from datetime import datetime, timedelta
import random
from database import db

app = Flask(__name__)

# Fallback function for when database is not available
def generate_fallback_sensor_data():
    """Generate fallback sensor data when database is unavailable"""
    return {
        'ph': round(random.uniform(6.5, 8.5), 2),
        'temperature': round(random.uniform(20, 30), 1),
        'dissolved_oxygen': round(random.uniform(4, 12), 2),
        'turbidity': round(random.uniform(0, 50), 1),
        'salinity': round(random.uniform(15, 35), 2),
        'ammonia': round(random.uniform(0, 5), 3),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

@app.route('/')
def homepage():
    """Homepage route"""
    features = [
        {
            'title': '50% Labor Reduction',
            'description': 'Automated systems reduce manual monitoring and feeding tasks',
            'icon': 'trending-up'
        },
        {
            'title': '15% Better FCR',
            'description': 'Optimized feeding improves feed conversion ratio',
            'icon': 'shield'
        },
        {
            'title': 'Real-time Monitoring',
            'description': '24/7 water quality tracking with instant alerts',
            'icon': 'zap'
        },
        {
            'title': 'Cloud Integration',
            'description': 'Monitor multiple farms from anywhere with ThingSpeak API',
            'icon': 'users'
        }
    ]
    
    sensors = [
        {'name': 'pH Sensor', 'desc': 'Maintain optimal acidity levels', 'icon': 'beaker'},
        {'name': 'Temperature', 'desc': 'Monitor water temperature', 'icon': 'thermometer'},
        {'name': 'Dissolved Oxygen', 'desc': 'Ensure adequate O2 levels', 'icon': 'activity'},
        {'name': 'Turbidity', 'desc': 'Track water clarity', 'icon': 'eye'},
        {'name': 'Salinity', 'desc': 'Monitor salt concentration', 'icon': 'waves'},
        {'name': 'Ammonia Nitrogen', 'desc': 'Detect harmful compounds', 'icon': 'flask-conical'}
    ]
    
    return render_template('homepage.html', features=features, sensors=sensors)

@app.route('/water-monitoring')
def water_monitoring():
    """Water monitoring page route"""
    # Try to get data from MongoDB, fallback to random if unavailable
    if db.client:
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
                'ph': round(random.uniform(6.5, 8.5), 2),
                'temperature': round(random.uniform(20, 30), 1),
                'dissolved_oxygen': round(random.uniform(4, 12), 2),
            })
        historical_data = list(reversed(historical_data))
    
    return render_template('water_monitoring.html', 
                         current_data=current_data, 
                         historical_data=historical_data)

@app.route('/feeding-systems')
def feeding_systems():
    """Feeding systems page route"""
    # Try to get feeding schedule from MongoDB
    if db.client:
        feeding_schedule = db.get_todays_feeding_schedule()
        # Format the data for template display
        for feeding in feeding_schedule:
            feeding['amount'] = f"{feeding['amount_kg']} kg"
    else:
        # Fallback to static data
        feeding_schedule = [
            {'time': '06:00', 'amount': '2.5 kg', 'status': 'completed'},
            {'time': '10:00', 'amount': '3.0 kg', 'status': 'completed'},
            {'time': '14:00', 'amount': '2.8 kg', 'status': 'pending'},
            {'time': '18:00', 'amount': '2.5 kg', 'status': 'scheduled'},
            {'time': '23:00', 'amount': '1.8 kg', 'status': 'scheduled'},
        ]
    
    return render_template('feeding_systems.html', feeding_schedule=feeding_schedule)

@app.route('/dashboard')
def dashboard():
    """Dashboard demo page route"""
    # Try to get data from MongoDB
    if db.client:
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
                'ph_data': [item['ph'] for item in historical_data],
                'temp_data': [item['temperature'] for item in historical_data],
                'do_data': [item['dissolved_oxygen'] for item in historical_data]
            }
        else:
            # Fallback chart data
            chart_data = {
                'labels': [(datetime.now() - timedelta(hours=i)).strftime('%H:%M') for i in range(11, -1, -1)],
                'ph_data': [round(random.uniform(6.5, 8.5), 2) for _ in range(12)],
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
            'ph_data': [round(random.uniform(6.5, 8.5), 2) for _ in range(12)],
            'temp_data': [round(random.uniform(20, 30), 1) for _ in range(12)],
            'do_data': [round(random.uniform(4, 12), 2) for _ in range(12)]
        }
        alerts = [
            {'type': 'warning', 'message': 'pH level approaching lower threshold', 'time': '10 min ago'},
            {'type': 'info', 'message': 'Feeding completed successfully', 'time': '2 hours ago'},
            {'type': 'success', 'message': 'Water quality parameters optimal', 'time': '4 hours ago'}
        ]
    
    return render_template('dashboard.html', 
                         current_data=current_data, 
                         chart_data=chart_data, 
                         alerts=alerts)

@app.route('/support')
def support():
    """Support page route"""
    return render_template('support.html')

@app.route('/contact')
def contact():
    """Contact page route"""
    return render_template('contact.html')

@app.route('/api/sensor-data')
def api_sensor_data():
    """API endpoint for real-time sensor data"""
    if db.client:
        current_data = db.get_latest_sensor_data()
        if current_data:
            # Convert datetime to string for JSON serialization
            current_data['timestamp'] = current_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            return jsonify(current_data)
    
    # Fallback to generated data
    return jsonify(generate_fallback_sensor_data())

@app.route('/api/feeding-schedule', methods=['GET'])
def api_get_feeding_schedules():
    """API endpoint to get feeding schedules"""
    if db.client:
        schedules = db.get_todays_feeding_schedule()
        return jsonify(schedules)
    else:
        # Fallback data
        schedules = [
            {'_id': '1', 'time': '06:00', 'amount_kg': 2.5, 'status': 'completed'},
            {'_id': '2', 'time': '10:00', 'amount_kg': 3.0, 'status': 'completed'},
            {'_id': '3', 'time': '14:00', 'amount_kg': 2.8, 'status': 'pending'},
            {'_id': '4', 'time': '18:00', 'amount_kg': 2.5, 'status': 'scheduled'},
            {'_id': '5', 'time': '22:00', 'amount_kg': 1.8, 'status': 'scheduled'},
        ]
        return jsonify(schedules)

@app.route('/api/feeding-schedule/<schedule_id>', methods=['GET'])
def api_get_feeding_schedule(schedule_id):
    """API endpoint to get a specific feeding schedule"""
    if db.client:
        schedule = db.get_feeding_schedule_by_id(schedule_id)
        if schedule:
            return jsonify(schedule)
        return jsonify({'error': 'Schedule not found'}), 404
    else:
        # Fallback for demo
        return jsonify({
            '_id': schedule_id,
            'time': '14:00',
            'amount_kg': 2.8,
            'status': 'scheduled',
            'tank': 'Tank A'
        })

@app.route('/api/feeding-schedule', methods=['POST'])
def api_add_feeding_schedule():
    """API endpoint to add a new feeding schedule"""
    from flask import request
    from datetime import datetime
    
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['time', 'amount_kg']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Set default values
    if 'date' not in data:
        data['date'] = datetime.now().date()
    if 'status' not in data:
        data['status'] = 'scheduled'
    if 'tank' not in data:
        data['tank'] = 'Tank A'
    
    if db.client:
        schedule_id = db.add_feeding_schedule(data)
        if schedule_id:
            return jsonify({'success': True, 'id': schedule_id}), 201
        return jsonify({'error': 'Failed to add schedule'}), 500
    else:
        # Fallback response for demo
        return jsonify({'success': True, 'id': 'demo_id'}), 201

@app.route('/api/feeding-schedule/<schedule_id>', methods=['PUT'])
def api_update_feeding_schedule(schedule_id):
    """API endpoint to update a feeding schedule"""
    from flask import request
    
    data = request.get_json()
    
    # Remove _id if it exists (shouldn't be updated)
    data.pop('_id', None)
    data.pop('date', None)  # Don't allow date changes for now
    
    if db.client:
        success = db.update_feeding_schedule(schedule_id, data)
        if success:
            return jsonify({'success': True})
        return jsonify({'error': 'Failed to update schedule'}), 500
    else:
        # Fallback response for demo
        return jsonify({'success': True})

@app.route('/api/feeding-schedule/<schedule_id>', methods=['DELETE'])
def api_delete_feeding_schedule(schedule_id):
    """API endpoint to delete a feeding schedule"""
    if db.client:
        success = db.delete_feeding_schedule(schedule_id)
        if success:
            return jsonify({'success': True})
        return jsonify({'error': 'Failed to delete schedule'}), 500
    else:
        # Fallback response for demo
        return jsonify({'success': True})

# Clean up database connection when Flask is shutting down
@app.teardown_appcontext
def close_db_connection(exception):
    if db.client:
        db.close_connection()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
