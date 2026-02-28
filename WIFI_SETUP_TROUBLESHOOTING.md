# WiFi Setup Troubleshooting Guide

## The Error You're Seeing

**Error:** "WiFi send error: AbortError: Aborted"

**What it means:** The app cannot reach the ESP32 because your phone is not connected to the ESP32's WiFi network.

## Step-by-Step Fix

### Step 1: Power On ESP32
1. Make sure ESP32 is powered on
2. Wait 10-15 seconds for it to boot up
3. ESP32 should create a WiFi network called "AquaTech-Setup"

### Step 2: Connect Phone to ESP32 WiFi
1. **Open your phone's WiFi settings** (not in the app)
2. Look for WiFi network: **"AquaTech-Setup"**
3. **Connect to "AquaTech-Setup"**
4. If it asks for password, there is NO password (open network)
5. Your phone may warn "No internet connection" - **This is normal, ignore it**
6. Stay connected to "AquaTech-Setup"

### Step 3: Open the App
1. Open AquaTech app
2. Go to Dashboard
3. Expand "WiFi Configuration" section

### Step 4: Enter Your Home WiFi Credentials
1. Enter your home WiFi name (SSID)
2. Enter your home WiFi password
3. Click "Send to ESP32"

### Step 5: Wait for Success
1. You should see: "✅ WiFi credentials sent! ESP32 will restart."
2. ESP32 will restart and connect to your home WiFi
3. Your phone will automatically reconnect to your home WiFi
4. Dashboard will start showing sensor data

## Common Issues

### Issue 1: "AquaTech-Setup" WiFi Not Showing Up

**Causes:**
- ESP32 not powered on
- ESP32 already connected to a WiFi network
- ESP32 is too far away

**Solutions:**
1. Check ESP32 power supply
2. Reset ESP32 (press reset button or power cycle)
3. Move closer to ESP32
4. Check Serial Monitor - should see "AP Mode started: AquaTech-Setup"

### Issue 2: Connection Timeout Error

**Cause:** Phone not connected to "AquaTech-Setup"

**Solution:**
1. Go to phone WiFi settings
2. Disconnect from current WiFi
3. Connect to "AquaTech-Setup"
4. Return to app and try again

### Issue 3: Phone Keeps Switching Back to Home WiFi

**Cause:** Android/iOS automatically switches to WiFi with internet

**Solution:**
1. **Android:** 
   - Go to WiFi settings
   - Tap "AquaTech-Setup"
   - Disable "Auto-switch to mobile data"
   - Or disable "Switch to mobile data automatically"

2. **iOS:**
   - Go to Settings > WiFi
   - Tap (i) next to "AquaTech-Setup"
   - Disable "Auto-Join"
   - Manually connect each time

### Issue 4: ESP32 Not Connecting to Home WiFi

**Causes:**
- Wrong WiFi password
- WiFi name has special characters
- WiFi is 5GHz (ESP32 only supports 2.4GHz)

**Solutions:**
1. Double-check WiFi password (case-sensitive)
2. Make sure WiFi is 2.4GHz, not 5GHz
3. Try a WiFi name without special characters
4. Check Serial Monitor for connection status

## How to Verify ESP32 WiFi Mode

### Check Serial Monitor (115200 baud):

**AP Mode (waiting for WiFi config):**
```
AP Mode started: AquaTech-Setup
Connect to 'AquaTech-Setup' and configure WiFi
HTTP server started. Waiting for credentials...
```

**Station Mode (connected to WiFi):**
```
Connecting to Wi-Fi: YourWiFiName
..........
Wi-Fi Connected!
IP Address: 192.168.1.xxx
ESP32 Ready!
```

**Failed Connection:**
```
Connecting to Wi-Fi: YourWiFiName
....................
Wi-Fi Connection Failed!
Starting AP mode...
AP Mode started: AquaTech-Setup
```

## Testing the Connection

### Test 1: Can you see "AquaTech-Setup" WiFi?
- ✅ Yes → ESP32 is in AP mode, proceed to connect
- ❌ No → ESP32 not powered or already connected to WiFi

### Test 2: Can you connect to "AquaTech-Setup"?
- ✅ Yes → Good, proceed to send credentials
- ❌ No → Check if password is required (should be open)

### Test 3: Can you send credentials?
- ✅ Yes → ESP32 will restart and connect to your WiFi
- ❌ Timeout → Phone not connected to "AquaTech-Setup"

### Test 4: Is ESP32 connected to your WiFi?
- Check Serial Monitor for "Wi-Fi Connected!" message
- Check your router's connected devices list
- Dashboard should start showing sensor data

## Quick Checklist

Before clicking "Send to ESP32":
- [ ] ESP32 is powered on
- [ ] "AquaTech-Setup" WiFi network is visible
- [ ] Phone is connected to "AquaTech-Setup" (check WiFi settings)
- [ ] Phone shows "Connected" to "AquaTech-Setup"
- [ ] Home WiFi SSID is correct
- [ ] Home WiFi password is correct
- [ ] Home WiFi is 2.4GHz (not 5GHz)

## Still Not Working?

### Reset ESP32 WiFi Settings:
1. Upload this code to ESP32 to clear EEPROM:
```cpp
#include <EEPROM.h>
void setup() {
  EEPROM.begin(96);
  for(int i=0; i<96; i++) EEPROM.write(i, 0);
  EEPROM.commit();
  Serial.println("EEPROM cleared!");
}
void loop() {}
```
2. Re-upload your main ESP32 code
3. ESP32 will start in AP mode again

### Alternative: Manual WiFi Configuration
Edit ESP32 code directly:
```cpp
// In setup(), replace WiFi.begin() with:
WiFi.begin("YourWiFiName", "YourWiFiPassword");
```

## Success Indicators

✅ **App shows:** "✅ WiFi credentials sent! ESP32 will restart."
✅ **Serial Monitor shows:** "Wi-Fi Connected!"
✅ **Dashboard shows:** Live sensor data updating
✅ **Phone reconnects:** To your home WiFi automatically

## Need More Help?

Check these files:
- `esp32_code_updated.ino` - ESP32 code
- `WIFI_SETUP_VERIFICATION.md` - Detailed WiFi setup guide
- Serial Monitor output - Shows real-time ESP32 status
