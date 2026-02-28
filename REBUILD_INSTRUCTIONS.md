# Rebuild Instructions for Excel Export Feature

The Excel export feature now uses `expo-media-library` which requires a native rebuild.

## Steps to Rebuild:

### For Android:
```bash
npx expo prebuild --clean
npx expo run:android
```

### For iOS:
```bash
npx expo prebuild --clean
npx expo run:ios
```

### Or using EAS Build:
```bash
eas build --platform android --profile development
```

## What the Export Feature Does:

1. Creates an Excel (.xlsx) file with your water quality data
2. Saves it to your device's Downloads folder (Android) or Photos (iOS)
3. Shows a success message with the filename

## After Rebuild:

When you click "Export Data":
- First time: App will ask for storage permissions
- Creates Excel file: `AquaTech_Data_YYYY-MM-DDTHH-MM-SS.xlsx`
- Saves to Downloads folder automatically
- Shows success message

The file will be accessible from your device's file manager or Downloads app!
