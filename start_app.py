#!/usr/bin/env python3
"""
Start the AquaTech Flask application with proper configuration
"""

import os
import sys

def main():
    print("🚀 Starting AquaTech Flask Application")
    print("=" * 50)
    
    # Add current directory to path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    try:
        # Import and configure the app
        from app import app
        
        print("✅ App imported successfully")
        print("📊 Database connection status:", "✅ Connected" if hasattr(app, 'db') else "⚠️  Fallback mode")
        print()
        print("🌐 Application will be available at:")
        print("   http://127.0.0.1:5000")
        print()
        print("🔐 Demo Login Credentials:")
        print("   Email: demo@aquatech.com")
        print("   Password: Demo123!")
        print()
        print("👤 Create New Account:")
        print("   1. Go to http://127.0.0.1:5000/signup")
        print("   2. Fill in your details")
        print("   3. Use any email (e.g., user@example.com)")
        print("   4. Password must have: 8+ chars, uppercase, lowercase, number")
        print()
        print("📝 Navigation Flow:")
        print("   1. Signup (/signup) → Login (/) → Homepage (/homepage)")
        print("   2. Homepage → Dashboard, Water Monitoring, etc.")
        print("   3. All pages protected by login requirement")
        print("   4. User data stored in 'fallback_users.json' (if no MongoDB)")
        print()
        print("⚡ Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Start the Flask development server
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=True,
            use_reloader=True
        )
        
    except ImportError as e:
        print(f"❌ Error importing app: {e}")
        print("Make sure all dependencies are installed:")
        print("   python -m pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
