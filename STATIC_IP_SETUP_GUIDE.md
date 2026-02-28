# Static IP Setup Guide

## What Changed

ESP32 now uses a **static IP address: 192.168.1.100**

This means:
- ESP32 will always be at 192.168.1.100 on your WiFi
- App knows exactly where to send WiFi credentials
- No more "Cannot find ESP32" errors

---

## First Time Setup

### Step 1: Configure ESP32 WiFi Manually

Since ESP32 doesn't have WiFi credentials yet, you need to add them directly to the code:

1. **Open `esp32_code_updated.ino`**

2. **Find this section in `setup()`:**
   ```cpp
   if(savedSSID.length()==0 || savedPassword.length()==0) {
   ```

3. **Before that line, add your WiFi credentials:**
   ```cpp
   // FIRST TIME SETUP - Add your WiFi here, then remove after first upload
   savedSSID = "YourWiFiName";
   savedPassword = "YourWiFiPassword";
   // Save to EEPROM
   for(int i=0; i<32; i++) EEPROM.write(i, i<savedSSID.length()?savedSSID[i]:0);
   for(int i=0; i<64; i++) EEPROM.write(32+i, i<savedPassword.length()?savedPassword[i]:0);
   EEPROM.commit();
   // END FIRST TIME SETUP
   ```

4. **Upload the code to ESP32**

5. **Open Serial Monitor (115200 baud)**

6. **You should see:**
   ```
   === ESP32 Starting ===
   Saved SSID: 'YourWiFiName'
   WiFi credentials found!
   Connecting to: YourWiFiName
   ..........
   ========================================
     ✓ WiFi Connected!
     SSID: YourWiFiName
     IP Address: 192.168.1.100
     Static IP: 192.168.1.100
     Dashboard will show live data
     Web server running for WiFi updates
   ========================================
   
   ESP32 Ready!
   ```

7. **Remove the setup code you added** (lines with "FIRST TIME SETUP")

8. **Upload the code again** (credentials are now saved in EEPROM)

---

## How to Use WiFi Configuration in App

### Step 1: Make Sure Both Are on Same WiFi
- ESP32 is connected to your WiFi (at 192.168.1.100)
- Your phone is connected to the SAME WiFi

### Step 2: Open App
1. Open AquaTech app
2. Go to Dashboard
3. Expand "WiFi Configuration"

### Step 3: Enter New WiFi Credentials
- Enter the NEW WiFi name you want ESP32 to connect to
- Enter the NEW WiFi password
- Click "Update WiFi"

### Step 4: ESP32 Restarts
- ESP32 receives credentials
- Saves them to memory
- Restarts
- Connects to the new WiFi (still at 192.168.1.100)

---

## Important Notes

### Router Configuration

Your router must allow static IP 192.168.1.100:

1. **Check your router's IP range:**
   - Most routers use 192.168.1.x
   - Some use 192.168.0.x or 10.0.0.x
   
2. **If your router uses different range:**
   - Edit ESP32 code
   - Change `IPAddress local_IP(192, 168, 1, 100);`
   - To match your router (e.g., `IPAddress local_IP(192, 168, 0, 100);`)
   - Also change gateway: `IPAddress gateway(192, 168, 1, 1);`

3. **Reserve IP in router (Optional but recommended):**
   - Log into your router admin panel
   - Find "DHCP Reservation" or "Static IP"
   - Reserve 192.168.1.100 for ESP32's MAC address
   - This prevents IP conflicts

### Troubleshooting

**Problem: ESP32 not connecting to WiFi**

Check Serial Monitor:
```
✗ WiFi Connection Failed!
Starting AP mode as fallback...
```

Solutions:
1. Wrong WiFi password - check credentials
2. WiFi is 5GHz - ESP32 only supports 2.4GHz
3. Router blocking static IP - check router settings

**Problem: App says "Cannot reach ESP32"**

Solutions:
1. Check ESP32 is connected (Serial Monitor shows "WiFi Connected!")
2. Check phone is on same WiFi as ESP32
3. Try pinging ESP32: Open phone browser, go to `http://192.168.1.100`
4. Check router firewall isn't blocking communication

**Problem: IP conflict**

If another device is using 192.168.1.100:
1. Change ESP32 IP in code to different number (e.g., 192.168.1.101)
2. Update app code to match:
   ```typescript
   const ESP32_IP = '192.168.1.101';
   ```

---

## Testing

### Test 1: Check ESP32 IP
1. Upload code to ESP32
2. Open Serial Monitor
3. Should see: "IP Address: 192.168.1.100"

### Test 2: Ping ESP32
1. Connect phone to same WiFi
2. Open phone browser
3. Go to: `http://192.168.1.100`
4. Should load (even if blank page)

### Test 3: Send WiFi Credentials
1. Open app
2. Go to Dashboard > WiFi Configuration
3. Enter test WiFi name and password
4. Click "Update WiFi"
5. Should see success message

### Test 4: Verify ESP32 Received
1. Check Serial Monitor
2. Should see:
   ```
   Received new WiFi credentials:
   SSID: TestWiFi
   Password: TestPassword
   WiFi credentials saved. ESP32 will restart...
   ```

---

## Summary

✅ ESP32 always uses IP: **192.168.1.100**
✅ App sends credentials to: **http://192.168.1.100/setWifi**
✅ Works when both are on same WiFi
✅ No need to connect to "AquaTech-Setup"
✅ Simple and reliable

---

## Quick Reference

**ESP32 Static IP:** 192.168.1.100
**Web Server Endpoint:** http://192.168.1.100/setWifi
**Serial Monitor Baud:** 115200
**WiFi Type:** 2.4GHz only (not 5GHz)
