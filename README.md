# AquaTech - Smart Aquaculture Solutions

A Python Flask-based website showcasing intelligent IoT-powered water monitoring and automated feeding systems for aquaculture operations.

## Features

- **Homepage**: Modern landing page with product showcase and features
- **Water Monitoring**: Real-time sensor data visualization with interactive charts
- **Feeding Systems**: Automated feeding control panel with scheduling
- **Dashboard**: Comprehensive monitoring dashboard with live data
- **Support**: Help center with FAQs and contact options
- **Contact**: Contact form and business information

## Technology Stack

- **Backend**: Python Flask 3.0.0
- **Database**: MongoDB with PyMongo
- **Frontend**: HTML5, TailwindCSS, JavaScript
- **Charts**: Chart.js for data visualization
- **Icons**: Lucide Icons
- **Styling**: Tailwind CSS via CDN + custom CSS

## Project Structure

```
python_website/
├── app.py                 # Main Flask application
├── database.py            # Firebase connection and data models
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/            # Jinja2 HTML templates
│   ├── layout.html       # Base template with navigation
│   ├── homepage.html     # Homepage template
│   ├── dashboard.html    # Dashboard with charts and data
│   ├── water_monitoring.html  # Water quality monitoring
│   ├── feeding_systems.html   # Feeding control panel
│   ├── support.html      # Support center
│   └── contact.html      # Contact page
└── static/              # Static assets
    └── css/
        └── style.css    # Custom CSS styles
```

## Setup Instructions

### Prerequisites

- Python 3.7+ installed on your system
- pip package manager
- Firebase account and project (for persistent data storage)

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd "C:\Users\Karlos\Documents\Capstone Front-end\python_website"
   ```

2. **Install required dependencies**:
   ```bash
   python -m pip install -r requirements.txt
   ```

3. **Set up Firebase** (Optional but recommended for persistent data):
   
   The application works with or without Firebase:
   - **Without Firebase**: Uses simulated sensor data (good for testing)
   - **With Firebase**: Uses real database with persistent data
   
   Follow these steps:
   
   a. **Create a Firebase project** - See FIREBASE_SETUP.md for detailed instructions
   
   b. **Set up service account key**:
      - Download the service account key JSON file from Firebase Console
      - Rename it to `firebase-service-account.json` and place it in the project root
   
   c. **Set up web configuration**:
      - Go to Firebase Console > Project Settings > Your apps
      - Register a new web app if you haven't already
      - Copy the Firebase configuration object
      - Create a file named `firebase-web-config.json` in the project root
      - Paste the configuration object into this file
      - A template file `firebase-web-config.json.template` has been created to help with this

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Open your web browser** and visit:
   ```
   http://127.0.0.1:5000
   ```

## Usage

### Navigation
- Use the navigation bar to browse between different sections
- The website is fully responsive and works on mobile devices
- Active page is highlighted in the navigation

### Dashboard Features
- View real-time sensor data with live updates
- Interactive charts showing historical trends
- Quick control buttons for system operations
- System alerts and status monitoring

### Water Monitoring
- Current sensor readings with visual indicators
- 24-hour trend charts
- Sensor status monitoring

## API Endpoints

- `GET /` - Homepage
- `GET /water-monitoring` - Water monitoring page
- `GET /feeding-systems` - Feeding systems page
- `GET /dashboard` - Dashboard page
- `GET /support` - Support page
- `GET /contact` - Contact page
- `GET /api/sensor-data` - JSON API for real-time sensor data

## Database Collections

The MongoDB database includes the following collections:

### sensor_data
- Real-time and historical sensor readings
- Fields: timestamp, ph, temperature, dissolved_oxygen, turbidity, salinity, ammonia
- Automatically populated with 7 days of sample data

### feeding_schedules  
- Daily feeding schedules and status
- Fields: date, time, amount_kg, status, tank, completed_at
- Tracks feeding history and upcoming schedules

### alerts
- System alerts and notifications
- Fields: timestamp, type, message, sensor_id, acknowledged
- Includes warnings, info, and success messages

### system_settings
- Application configuration and thresholds
- Tank settings, alert thresholds, feeding preferences
- System maintenance information

## Sample Data

When MongoDB is available, the application uses real database data:
- **With MongoDB**: 7 days of historical sensor data, real feeding schedules, system alerts
- **Without MongoDB**: Simulated real-time data for demonstration
  - pH levels (6.5 - 8.5)
  - Temperature (20°C - 30°C) 
  - Dissolved Oxygen (4 - 12 mg/L)
  - Turbidity (0 - 50 NTU)
  - Salinity (15 - 35 ppt)
  - Ammonia (0 - 5 mg/L)

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development

To modify the application:

1. **Templates**: Edit Jinja2 templates in the `templates/` directory
2. **Styling**: Modify `static/css/style.css` for custom styles
3. **Backend Logic**: Edit `app.py` for routes and data processing
4. **Dependencies**: Update `requirements.txt` as needed

## Production Deployment

For production deployment, consider:
- Using a production WSGI server (Gunicorn, uWSGI)
- Setting up a reverse proxy (Nginx, Apache)
- Configuring environment variables for sensitive settings
- Implementing proper logging and monitoring
- Setting up SSL certificates for HTTPS

## License

This project is created for demonstration purposes based on the original React frontend design.

## Support

For issues or questions, refer to the support page within the application or contact the development team.
