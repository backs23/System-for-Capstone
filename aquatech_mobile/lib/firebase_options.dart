import 'dart:io' show Platform;
import 'package:firebase_core/firebase_core.dart';

/// Placeholder Firebase options. Replace this file by running:
///   flutter pub global activate flutterfire_cli
///   flutterfire configure --project=<your-firebase-project>
/// This will generate proper platform-specific options.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (Platform.isAndroid) {
      return const FirebaseOptions(
        apiKey: '',
        appId: '',
        messagingSenderId: '',
        projectId: '',
        storageBucket: '',
      );
    } else if (Platform.isIOS) {
      return const FirebaseOptions(
        apiKey: '',
        appId: '',
        messagingSenderId: '',
        projectId: '',
        storageBucket: '',
        iosBundleId: 'com.example.aquatechMobile',
      );
    } else {
      // Fallback (e.g., web/desktop if you add later)
      return const FirebaseOptions(
        apiKey: '',
        appId: '',
        messagingSenderId: '',
        projectId: '',
        storageBucket: '',
      );
    }
  }
}
