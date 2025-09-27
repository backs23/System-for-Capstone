import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

import '../models/sensor_data.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<SensorData?> streamLatestSensorData() {
    return _db
        .collection('sensor_data')
        .orderBy('timestamp', descending: true)
        .limit(1)
        .snapshots()
        .map((snap) => snap.docs.isEmpty ? null : SensorData.fromMap(snap.docs.first.data()));
  }

  Future<List<SensorData>> fetchHistoricalData({int hours = 24}) async {
    final start = DateTime.now().toUtc().subtract(Duration(hours: hours));
    final query = await _db
        .collection('sensor_data')
        .where('timestamp', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
        .orderBy('timestamp')
        .get();
    return query.docs.map((d) => SensorData.fromMap(d.data())).toList();
  }

  static String formatTime(DateTime ts) => DateFormat('HH:mm').format(ts.toLocal());
}
