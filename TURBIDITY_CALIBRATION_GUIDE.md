# Turbidity Sensor Calibration Guide

## Problem: Turbidity showing 100% even in clear water

This happens because the voltage constants need to be calibrated for your specific sensor.

## Solution: Follow this calibration procedure

### Step 1: Upload Code with Calibration Helper

The updated Arduino code now includes automatic calibration on startup.

### Step 2: Calibration Process

#### A. Clear Water Calibration
1. **Fill a clean container with clear/filtered water**
2. **Place turbidity sensor in the clear water**
3. **Open Serial Monitor** (9600 baud)
4. **Reset Arduino** (press reset button)
5. **Wait 5 seconds** while it takes 50 samples
6. **Note the voltage readings** displayed

#### B. Turbid Water Calibration (Optional but recommended)
1. **Add dirt/sediment to water** to make it turbid
2. **Reset Arduino again**
3. **Note the voltage readings** for turbid water

### Step 3: Update Constants

After calibration, the Serial Monitor will show:

```
========================================
CALIBRATION RESULTS:
Min Voltage: 2.345V
Max Voltage: 4.123V
========================================
Update these values in your code:
TURBIDITY_VOLTAGE_CLEAR = 4.123; // (clear water)
TURBIDITY_VOLTAGE_TURBID = 2.345; // (turbid water)
========================================
```

**Update these lines in your Arduino code:**

```cpp
// Turbidity Sensor
#define TURBIDITY_PIN A2
const float TURBIDITY_VOLTAGE_CLEAR = 4.123;  // Use YOUR measured value
const float TURBIDITY_VOLTAGE_TURBID = 2.345; // Use YOUR measured value
```

### Step 4: Verify

After updating the constants:
1. **Upload the code again**
2. **Test with clear water** → Should show 0-10%
3. **Test with turbid water** → Should show higher percentage

---

## Understanding the Sensor

### How Turbidity Sensors Work:

Most turbidity sensors work in one of two ways:

**Type 1: Optical (Most Common)**
- **Clear water** → Light passes through → **HIGH voltage** (3.5-5V)
- **Turbid water** → Light blocked → **LOW voltage** (0.5-2V)

**Type 2: Inverted**
- **Clear water** → **LOW voltage**
- **Turbid water** → **HIGH voltage**

### Current Code Assumes Type 1 (Optical)

If your sensor is Type 2, you'll need to invert the calculation.

---

## Debugging Tips

### Check Raw Voltage in Serial Monitor

The code now prints voltage readings:

```
Turbidity Voltage: 3.456V | Calculated: 15.3%
```

### Expected Voltage Ranges:

**For Type 1 Sensors (Optical):**
- Clear water: 3.5V - 5.0V
- Slightly turbid: 2.5V - 3.5V
- Very turbid: 0.5V - 2.5V

**For Type 2 Sensors (Inverted):**
- Clear water: 0.5V - 1.5V
- Slightly turbid: 1.5V - 3.0V
- Very turbid: 3.0V - 5.0V

---

## If Sensor is Inverted (Type 2)

If clear water shows HIGH percentage and turbid water shows LOW percentage, your sensor is inverted.

**Change the calculation to:**

```cpp
float calcTurbidity(float voltage) {
  Serial.print("Turbidity Voltage: ");
  Serial.print(voltage, 3);
  Serial.print("V | ");
  
  if (voltage <= TURBIDITY_VOLTAGE_CLEAR) {
    Serial.println("Clear (0%)");
    return 0.0;
  }
  
  if (voltage >= TURBIDITY_VOLTAGE_TURBID) {
    Serial.println("Max Turbid (100%)");
    return 100.0;
  }
  
  // INVERTED: lower voltage = clearer water
  float turbidity = ((voltage - TURBIDITY_VOLTAGE_CLEAR) / 
                    (TURBIDITY_VOLTAGE_TURBID - TURBIDITY_VOLTAGE_CLEAR)) * 100.0;
  
  turbidity = constrain(turbidity, 0.0, 100.0);
  
  Serial.print("Calculated: ");
  Serial.print(turbidity, 1);
  Serial.println("%");
  
  return turbidity;
}
```

And swap the constants:
```cpp
const float TURBIDITY_VOLTAGE_CLEAR = 0.5;   // LOW voltage for clear
const float TURBIDITY_VOLTAGE_TURBID = 4.2;  // HIGH voltage for turbid
```

---

## Quick Test Procedure

1. **Upload code**
2. **Open Serial Monitor** (9600 baud)
3. **Watch voltage readings** during calibration
4. **Place sensor in clear water** → Note voltage
5. **Place sensor in turbid water** → Note voltage
6. **Update constants** based on readings
7. **Upload again** and verify

---

## Common Issues

### Issue: Always shows 100%
**Cause:** Voltage is below TURBIDITY_VOLTAGE_TURBID threshold  
**Solution:** Lower the TURBIDITY_VOLTAGE_TURBID value

### Issue: Always shows 0%
**Cause:** Voltage is above TURBIDITY_VOLTAGE_CLEAR threshold  
**Solution:** Lower the TURBIDITY_VOLTAGE_CLEAR value

### Issue: Readings are inverted
**Cause:** Sensor type is inverted  
**Solution:** Use the inverted calculation formula above

### Issue: Unstable readings
**Cause:** Sensor needs cleaning or water has bubbles  
**Solution:** Clean sensor, remove air bubbles, ensure proper immersion

---

## Final Notes

- **Calibrate in actual tank water** for best accuracy
- **Re-calibrate monthly** as sensor may drift
- **Clean sensor weekly** to maintain accuracy
- **Check wiring** if readings are erratic (0V or 5V constantly)

Good luck with calibration! 🎯
