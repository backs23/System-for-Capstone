import 'package:flutter/material.dart';

import '../../models/sensor_data.dart';
import '../../services/firestore_service.dart';

class WaterMonitoringScreen extends StatelessWidget {
  const WaterMonitoringScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final fs = FirestoreService();

    return Scaffold(
      appBar: AppBar(title: const Text('Water Monitoring')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            StreamBuilder<SensorData?>(
              stream: fs.streamLatestSensorData(),
              builder: (context, snap) {
                final data = snap.data;
                if (snap.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                if (data == null) {
                  return const Text('No current data');
                }
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _MetricCard(label: 'Temp (°C)', value: data.temperature.toStringAsFixed(1), color: Colors.red),
                    _MetricCard(label: 'DO (mg/L)', value: data.dissolvedOxygen.toStringAsFixed(2), color: Colors.green),
                    _MetricCard(label: 'NH₃ (mg/L)', value: data.ammonia.toStringAsFixed(2), color: Colors.orange),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),
            Expanded(
              child: FutureBuilder<List<SensorData>>(
                future: fs.fetchHistoricalData(hours: 24),
                builder: (context, snap) {
                  final items = snap.data ?? [];
                  if (snap.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (items.isEmpty) {
                    return const Center(child: Text('No historical data'));
                  }
                  return ListView.separated(
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, i) {
                      final e = items[i];
                      return ListTile(
                        leading: const Icon(Icons.timeline),
                        title: Text('T: ${e.temperature.toStringAsFixed(1)}  DO: ${e.dissolvedOxygen.toStringAsFixed(2)}  NH₃: ${e.ammonia.toStringAsFixed(2)}'),
                        subtitle: Text(e.timestamp.toLocal().toString()),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _MetricCard({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 110,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: TextStyle(color: color)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
