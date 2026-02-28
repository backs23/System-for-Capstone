# Data Upload Timing Explanation

## Current Upload Frequency

### Arduino sends data every: **11 seconds**

Here's the breakdown:

1. **Screen 1 (Data Values)**: 5 seconds
   - Shows Temperature, Ammonia, Turbidity values
   - Sends data to ESP32 at the end
   - `delay(5000)` - Line 165

2. **Screen 2 (Status)**: 5 seconds  
   - Shows status messages (OK, WARNING, DANGER)
   - `delay(1000)` at end - Line 194
   - Plus additional delays for buzzer beeps

3. **Total cycle time**: ~11 seconds per upload

### ESP32 Upload to Firebase

**Immediately** when data is received from Arduino:
- ESP32 receives data from Arduino via Serial
- Parses the data (TEMP, NH3, TURBIDITY)
- Uploads to Firebase right away (no delay)
- If WiFi is disconnected, it skips upload

### Summary

```
Arduino Loop Cycle:
├─ Read sensors
├─ Display Screen 1 (5 sec) ──┐
├─ Send to ESP32              │
├─ Display Screen 2 (5 sec)   │ = ~11 seconds total
└─ Loop back                  │
                              │
ESP32:                        │
└─ Receives data ─────────────┘
   └─ Uploads to Firebase immediately (< 1 sec)
```

## Data Upload Rate

- **Every ~11 seconds** new data appears in Firebase
- **~5-6 uploads per minute**
- **~300-360 uploads per hour**

## Want to Change Upload Frequency?

### To upload MORE frequently (e.g., every 5 seconds):

Change Arduino code:
```cpp
// Reduce screen display times
delay(2500);  // Screen 1: 2.5 seconds
// ...
delay(2500);  // Screen 2: 2.5 seconds
```

### To upload LESS frequently (e.g., every 30 seconds):

Add delay after sending data:
```cpp
Serial1.print("#");
delay(30000);  // Wait 30 seconds before next reading
```

### Recommended Settings

**For Testing**: 5-10 seconds (current: 11 sec) ✓
**For Production**: 30-60 seconds (saves battery, reduces Firebase usage)
**For Critical Monitoring**: 5 seconds (real-time alerts)

## Current Setting: ✓ Good for Testing

Your current 11-second interval is perfect for:
- Testing the system
- Seeing real-time updates
- Debugging sensor issues
- Watching the dashboard update live

Consider increasing to 30-60 seconds for production to:
- Reduce Firebase database writes (lower costs)
- Save power
- Reduce data storage needs
