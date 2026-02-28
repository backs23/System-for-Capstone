# Pre-Rebuild Checklist ✅

## Things to Consider Before Rebuilding

### ✅ 1. **Dependencies Verified**
- [x] expo-media-library: v55.0.9 ✓
- [x] expo-file-system: v19.0.21 ✓
- [x] xlsx: v0.18.5 ✓
- [x] All packages installed correctly

### ✅ 2. **Code Changes Completed**
- [x] Arduino turbidity sensor fixed (simple ADC mapping)
- [x] ESP32 turbidity parsing updated
- [x] Dashboard WiFi configuration added
- [x] Excel export functionality implemented
- [x] No TypeScript errors

### ⚠️ 3. **Backup Current App**
- [ ] **IMPORTANT**: If you have a working APK, save it before rebuilding
- [ ] Save current app version somewhere safe
- [ ] Note: Rebuilding will create a new native build

### ⚠️ 4. **Development Environment**
- [ ] Make sure you have Android Studio installed (for Android)
- [ ] Make sure you have Xcode installed (for iOS, Mac only)
- [ ] Ensure you have enough disk space (~5-10 GB)
- [ ] Close any running emulators/simulators

### ⚠️ 5. **Testing Strategy**
After rebuild, test in this order:
1. [ ] App launches successfully
2. [ ] Firebase authentication works
3. [ ] Dashboard displays sensor data
4. [ ] WiFi configuration sends credentials
5. [ ] Export Data creates Excel file
6. [ ] Storage permission is requested
7. [ ] Excel file appears in Downloads folder

### ⚠️ 6. **Potential Issues to Watch For**

**Issue 1: Build Fails**
- Solution: Run `npx expo prebuild --clean` first
- Delete `android/` and `ios/` folders if they exist
- Clear npm cache: `npm cache clean --force`

**Issue 2: Permission Denied on Android**
- The app will request permission on first export
- If denied, user must enable in Settings > Apps > AquaTech > Permissions

**Issue 3: File Not Found in Downloads**
- On Android 10+, files may be in "Recent" or "Files" app
- Check: Files app > Downloads folder
- File name format: `AquaTech_Data_YYYY-MM-DDTHH-MM-SS.xlsx`

### ⚠️ 7. **Alternative: Test Without Rebuild First**

If you want to test other features without rebuilding:
- WiFi configuration works without rebuild ✓
- Dashboard display works without rebuild ✓
- Firebase data works without rebuild ✓
- Only Excel export requires rebuild

You can test everything else first, then rebuild when ready.

### 📱 8. **Build Commands**

**For Development Build (Recommended):**
```bash
# Clean previous builds
npx expo prebuild --clean

# Build for Android
npx expo run:android

# Or build for iOS (Mac only)
npx expo run:ios
```

**For Production Build (EAS):**
```bash
# Make sure you're logged in
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

### 🔧 9. **If Build Fails, Try This:**
```bash
# 1. Clean everything
rm -rf node_modules
rm -rf android
rm -rf ios
rm package-lock.json

# 2. Reinstall
npm install

# 3. Prebuild
npx expo prebuild --clean

# 4. Run
npx expo run:android
```

### ✅ 10. **What's Working Now (No Rebuild Needed)**
- Firebase real-time data ✓
- Temperature, Ammonia, Turbidity display ✓
- WiFi configuration UI ✓
- Charts and alerts ✓
- All navigation ✓

### ⚠️ 11. **What Requires Rebuild**
- Excel export to Downloads folder ❌ (needs expo-media-library native module)

---

## Recommendation:

**Option A: Rebuild Now**
- If you need Excel export immediately
- If you have time for potential troubleshooting
- If you have a backup of current working app

**Option B: Test First, Rebuild Later**
- Test all other features first
- Make sure WiFi config, sensors, dashboard all work
- Rebuild when you're ready for Excel export
- Less risky approach

## My Suggestion:
Test the Arduino turbidity sensor fix first (upload the Arduino code), verify it shows correct readings on LCD and dashboard. If that works well, then proceed with the app rebuild for Excel export.

---

## Ready to Rebuild?
If yes, run:
```bash
npx expo prebuild --clean
npx expo run:android
```

This will take 5-15 minutes depending on your computer.
