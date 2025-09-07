# MongoDB Integration Guide

## 🎯 What's New

Your AquaTech Flask application now includes **full MongoDB integration**! This means you can use a real database instead of simulated data.

## 🔄 How It Works

The application is designed to work in **two modes**:

### 1. **With MongoDB** (Recommended)
- ✅ Real persistent data storage
- ✅ Historical sensor readings (7 days of data)
- ✅ Actual feeding schedules and tracking
- ✅ System alerts and notifications
- ✅ Better performance and analytics

### 2. **Without MongoDB** (Fallback)
- ✅ Simulated real-time data
- ✅ Works immediately without setup
- ✅ Good for testing and development
- ⚠️ No data persistence between sessions

## 🗄️ Database Schema

### Collections Created Automatically:

1. **`sensor_data`** - Water quality measurements
   ```json
   {
     "timestamp": "2024-01-15T10:30:00Z",
     "ph": 7.2,
     "temperature": 24.5,
     "dissolved_oxygen": 8.3,
     "turbidity": 12.1,
     "salinity": 28.5,
     "ammonia": 0.05,
     "location": "Tank A",
     "sensor_id": "SENSOR_001"
   }
   ```

2. **`feeding_schedules`** - Daily feeding plans
   ```json
   {
     "date": "2024-01-15",
     "time": "06:00",
     "amount_kg": 2.5,
     "status": "completed",
     "completed_at": "2024-01-15T06:05:00Z",
     "tank": "Tank A"
   }
   ```

3. **`alerts`** - System notifications
   ```json
   {
     "timestamp": "2024-01-15T10:25:00Z",
     "type": "warning",
     "message": "pH level approaching lower threshold",
     "sensor_id": "SENSOR_001",
     "value": 6.4,
     "threshold": 6.5,
     "acknowledged": false
   }
   ```

4. **`system_settings`** - Configuration data
   ```json
   {
     "tank_settings": {...},
     "alert_thresholds": {...},
     "feeding_settings": {...},
     "system_info": {...}
   }
   ```

## 🚀 Quick Setup Options

### Option 1: MongoDB Atlas (Cloud) - **Recommended**
1. **Free tier available** - No local installation needed
2. **Run setup script**: `python setup_mongodb.py` → Choose option 3
3. **Follow instructions** to create account and get connection string
4. **Set environment variable** or update `database.py`

### Option 2: Local MongoDB Installation
1. **Run setup script**: `python setup_mongodb.py` → Choose option 2
2. **Follow OS-specific instructions** provided
3. **Start MongoDB service**
4. **Application connects automatically** to `localhost:27017`

### Option 3: Use Without Database (Current Mode)
- **No setup required** - Application works as-is with simulated data
- **Good for immediate testing** and development

## 📊 Sample Data

When you first connect to MongoDB, the application automatically creates:
- **168 sensor readings** (7 days × 24 hours)
- **5 feeding schedules** for today
- **3 system alerts** (warning, info, success)
- **Complete system settings** with thresholds and preferences

## 🔧 Technical Details

### Connection Handling
- **Graceful fallback**: If MongoDB is unavailable, app uses simulated data
- **Error logging**: Clear messages about connection status
- **Performance**: Database connections are optimized with proper indexing

### Data Flow
1. **App startup** → Try MongoDB connection
2. **If connected** → Initialize collections with sample data (if empty)
3. **Routes** → Fetch real data from MongoDB or use fallback
4. **API endpoints** → Return database data or simulated data

### Environment Variables
```bash
# Set this to use custom MongoDB connection
MONGODB_URI=mongodb://your-connection-string
```

## 🧪 Testing Your Setup

**Run the setup script**:
```bash
python setup_mongodb.py
```

**Choose option 4** to test your database connection and see:
- ✅ Connection status
- 📊 Collection names
- 📈 Data counts
- 🔍 Sample records

## 🎮 Using the Application

### With MongoDB:
- **Dashboard** shows real historical trends
- **Water Monitoring** displays actual sensor readings over time
- **Feeding Systems** tracks real schedule completion
- **Data persists** between application restarts

### Without MongoDB:
- **All features work** with simulated data
- **Fresh data** generated on each page load
- **No persistence** - resets when app restarts

## 🔍 Monitoring

The application provides clear feedback about database status:
- **Console logs** show connection status on startup
- **Fallback messages** appear if database is unavailable
- **Setup script** helps diagnose connection issues

## 📈 Benefits of Using MongoDB

1. **Data Persistence** - Your data survives app restarts
2. **Historical Analytics** - Real trends and patterns
3. **Scalability** - Handle large amounts of sensor data
4. **Flexibility** - Easy to add new fields and collections
5. **Cloud Ready** - Works with MongoDB Atlas for production

## 🆘 Troubleshooting

**MongoDB not connecting?**
```bash
python setup_mongodb.py  # Choose option 1 to check status
```

**Want to reset database?**
- Delete collections in MongoDB Compass or Atlas dashboard
- Restart application to recreate sample data

**Need help with Atlas setup?**
```bash
python setup_mongodb.py  # Choose option 3 for detailed instructions
```

---

**Your application now has enterprise-grade database capabilities while maintaining the simplicity of immediate testing without setup!** 🎉
