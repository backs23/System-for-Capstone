# Upload Interval Updated ✅

## Changes Made

### ESP32 Code Updated to Upload Every 5 Minutes

**What changed:**
1. Added upload timing variables:
   - `lastUploadTime` - tracks when last upload happened
   - `UPLOAD_INTERVAL` - set to 300,000 milliseconds (5 minutes)

2. Modified upload logic:
   - Arduino still sends data every ~11 seconds
   - ESP32 receives and parses data every ~11 seconds
   - ESP32 only uploads to Firebase every 5 minutes
   - Always uploads the LATEST data received

3. Added countdown display:
   - Shows "Next upload in: X seconds" in Serial Monitor
   - Helps you track when next upload will happen

## How It Works Now

```
Timeline:
0:00 - Data received → Upload to Firebase ✓
0:11 - Data received → Stored (not uploaded)
0:22 - Data received → Stored (not uploaded)
0:33 - Data received → Stored (not uploaded)
...
4:55 - Data received → Stored (not uploaded)
5:00 - Data received → Upload to Firebase ✓ (5 minutes passed)
5:11 - Data received → Stored (not uploaded)
...
```

## Benefits

✅ **Reduces Firebase writes** - Only 12 uploads per hour instead of 327
✅ **Saves bandwidth** - Less data transmission
✅ **Lower costs** - Fewer Firebase database operations
✅ **Still monitors continuously** - Arduino reads sensors every 11 seconds
✅ **Always uploads latest data** - Most recent readings go to Firebase

## Serial Monitor Output

You'll see messages like:
```
=== Parsed Data ===
Temperature: 28.5
Ammonia: 0.05
Turbidity (%): 15.2
==================
Next upload in: 287 seconds

...

=== Parsed Data ===
Temperature: 28.6
Ammonia: 0.06
Turbidity (%): 15.5
==================
5 minutes elapsed. Uploading to Firebase...
Firebase Response: 200
```

## Want to Change the Interval?

Edit this line in ESP32 code:
```cpp
const unsigned long UPLOAD_INTERVAL = 300000; // 5 minutes
```

**Common intervals:**
- 1 minute: `60000`
- 5 minutes: `300000` ← Current setting
- 10 minutes: `600000`
- 15 minutes: `900000`
- 30 minutes: `1800000`
- 1 hour: `3600000`

## Testing

To test if it works:
1. Upload the updated ESP32 code
2. Open Serial Monitor (115200 baud)
3. Watch for "Next upload in: X seconds" messages
4. Wait 5 minutes
5. Should see "5 minutes elapsed. Uploading to Firebase..."
6. Check Firebase database for new data

## Important Notes

⚠️ **First upload happens immediately** when ESP32 starts
⚠️ **Countdown resets** if ESP32 restarts
⚠️ **Data is not stored** between uploads (only latest reading is kept)
⚠️ **If you need historical data**, consider adding SD card storage

## Dashboard Impact

- Dashboard will update every 5 minutes instead of every 11 seconds
- Charts will show data points 5 minutes apart
- This is normal and expected behavior
- Good for production monitoring (not real-time testing)

## For Real-Time Testing

If you need to see live updates during testing, temporarily change to:
```cpp
const unsigned long UPLOAD_INTERVAL = 15000; // 15 seconds for testing
```

Then change back to 300000 (5 minutes) for production use.
