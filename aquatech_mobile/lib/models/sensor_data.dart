import 'package:cloud_firestore/cloud_firestore.dart' show Timestamp;

class SensorData {
  final double temperature;
  final double dissolvedOxygen;
  final double ammonia;
  final DateTime timestamp;

  SensorData({
    required this.temperature,
    required this.dissolvedOxygen,
    required this.ammonia,
    required this.timestamp,
  });

  factory SensorData.fromMap(Map<String, dynamic> map) {
    final ts = map['timestamp'];
    DateTime when;
    if (ts is Timestamp) {
      when = ts.toDate();
    } else if (ts is DateTime) {
      when = ts;
    } else if (ts is String) {
      when = DateTime.tryParse(ts) ?? DateTime.now();
    } else {
      when = DateTime.now();
    }
    return SensorData(
      temperature: (map['temperature'] as num?)?.toDouble() ?? 0,
      dissolvedOxygen: (map['dissolved_oxygen'] as num?)?.toDouble() ?? 0,
      ammonia: (map['ammonia'] as num?)?.toDouble() ?? 0,
      timestamp: when.toUtc(),
    );
  }
}
