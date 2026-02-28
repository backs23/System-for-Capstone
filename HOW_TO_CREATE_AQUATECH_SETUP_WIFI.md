# How to Create "AquaTech-Setup" WiFi Network

## Problem
ESP32 is not creating the "AquaTech-Setup" WiFi network because it already has WiFi credentials saved in memory.

## Solution: Clear WiFi Credentials

### Method 1: Upload Clear WiFi Code (EASIEST)

1. **Open Arduino IDE**
2. **Open the file:** `esp32_clear_wifi.ino`
3. **Select your ESP32 board:**
   - Tools > Board > ESP32 Dev Module (or your ESP32 board)
4. **Select COM port:**
   - Tools > Port > COM3 (or your ESP32's port)
5. **Click Upload** (arrow button)
6. **Wait for upload to complete**
7. **Open Serial Monitor** (115200 baud)
8. **You should see:**
   ```
   Clearing WiFi credentials from EEPROM...
   ✓ WiFi credentials cleared!
   ✓ ESP32 will start in AP mode on next boot
   
   Now upload your main esp32_code_updated.ino
   ESP32 will create 'AquaTech-Setup' WiFi network
   ```

9. **Now upload your main code:**
   - Open `esp32_code_updated.ino`
   - Click Upload
   - Wait for upload to complete

10. **Check Serial Monitor** (115200 baud)
    - You should see:
    ```
    === ESP32 Starting ===
    Saved SSID: ''
    Saved Password: '(empty)'
    
    No WiFi credentials found in EEPROM
    Starting AP Mode...
    
    ========================================
      AP Mode: AquaTech-Setup
      IP Address: 192.168.4.1
      Connect phone to 'AquaTech-Setup'
      Then use app to configure WiFi
    ========================================
    
    HTTP server started on http://192.168.4.1
    ESP32 Ready!
    ```

11. **Check your phone WiFi list**
    - You should now see "AquaTech-Setup" WiFi network

---

### Method 2: Manual EEPROM Clear (Alternative)

If Method 1 doesn't work, add this to your main code temporarily:

```cpp
// Add this at the START of setup() function
void setup() {
  Serial.begin(115200);
  
  // FORCE CLEAR EEPROM - Remove after first run
  EEPROM.begin(96);
  for(int i=0; i<96; i++) EEPROM.write(i, 0);
  EEPROM.commit();
  Serial.println("EEPROM CLEARED!");
  // END FORCE CLEAR
  
  // ... rest of your setup code
}
```

Then:
1. Upload code with this added
2. Open Serial Monitor - should see "EEPROM CLEARED!"
3. Remove those lines from code
4. Upload again
5. ESP32 will start in AP mode

---

### Method 3: Physical Reset (If above don't work)

Some ESP32 boards have EEPROM that persists. Try:

1. **Erase flash completely:**
   ```
   esptool.py --port COM3 erase_flash
   ```
   
2. **Or in Arduino IDE:**
   - Tools > Erase Flash > "All Flash Contents"
   - Then upload your code

---

## Verify It's Working

### Step 1: Check Serial Monitor
After uploading `esp32_code_updated.ino`, Serial Monitor should show:
```
========================================
  AP Mode: AquaTech-Setup
  IP Address: 192.168.4.1
========================================
```

### Step 2: Check Phone WiFi
Open phone WiFi settings and look for "AquaTech-Setup" in the list.

### Step 3: Connect to AquaTech-Setup
1. Tap "AquaTech-Setup" in WiFi list
2. Should connect (no password needed)
3. Phone may warn "No internet" - this is normal, ignore it

### Step 4: Test in Browser
1. While connected to "AquaTech-Setup"
2. Open phone browser
3. Go to: `http://192.168.4.1`
4. Should load a page (even if blank)

### Step 5: Use App
1. Open AquaTech app
2. Go to Dashboard
3. Expand WiFi Configuration
4. Enter your home WiFi credentials
5. Click "Send to ESP32"
6. Should see success message

---

## Troubleshooting

### "AquaTech-Setup" still not showing up

**Check Serial Monitor output:**

If you see:
```
Saved SSID: 'YourWiFiName'
Saved Password: '***'
Connecting to: YourWiFiName
```

This means WiFi credentials are still saved. Solutions:
1. Upload `esp32_clear_wifi.ino` again
2. Make sure it says "WiFi credentials cleared!"
3. Then upload main code again

### Serial Monitor shows nothing

**Check:**
- Baud rate is 115200
- Correct COM port selected
- USB cable is data cable (not charge-only)
- Press ESP32 reset button

### ESP32 connects to old WiFi instead of AP mode

**This means EEPROM wasn't cleared:**
1. Try Method 2 (manual EEPROM clear)
2. Or try Method 3 (erase flash)

### "AquaTech-Setup" appears but can't connect

**Check:**
- ESP32 is powered on
- You're close enough to ESP32
- Try restarting ESP32
- Check Serial Monitor for errors

---

## What Happens After WiFi Configuration

1. You send WiFi credentials via app
2. ESP32 saves them to EEPROM
3. ESP32 restarts
4. ESP32 connects to your home WiFi
5. "AquaTech-Setup" network disappears
6. Dashboard starts showing sensor data

---

## To Reconfigure WiFi Later

If you need to change WiFi credentials:

**Option 1: Clear EEPROM**
- Upload `esp32_clear_wifi.ino`
- Then upload main code
- "AquaTech-Setup" will appear again

**Option 2: Let it fail**
- If ESP32 can't connect to saved WiFi (wrong password, WiFi not available)
- It will automatically start AP mode as fallback
- "AquaTech-Setup" will appear

**Option 3: Hardcode WiFi**
- Edit `esp32_code_updated.ino`
- Find this line in setup():
  ```cpp
  WiFi.begin(savedSSID.c_str(), savedPassword.c_str());
  ```
- Replace with:
  ```cpp
  WiFi.begin("YourWiFiName", "YourPassword");
  ```
- Upload code

---

## Summary

1. Upload `esp32_clear_wifi.ino` to clear saved WiFi
2. Upload `esp32_code_updated.ino` (main code)
3. Check Serial Monitor - should see "AP Mode: AquaTech-Setup"
4. Check phone WiFi - should see "AquaTech-Setup" network
5. Connect phone to "AquaTech-Setup"
6. Use app to send WiFi credentials
7. ESP32 connects to your home WiFi
8. Dashboard shows sensor data

Done!
