import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../models/sensor_data.dart';
import '../../services/firestore_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _fs = FirestoreService();
  late Future<List<SensorData>> _history;

  @override
  void initState() {
    super.initState();
    _history = _fs.fetchHistoricalData(hours: 12);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Water Quality Trends (Last 12 Hours)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Expanded(
              child: FutureBuilder<List<SensorData>>(
                future: _history,
                builder: (context, snap) {
                  if (snap.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  final data = snap.data ?? [];
                  if (data.isEmpty) {
                    return const Center(child: Text('No data'));
                  }
                  return LineChart(
                    LineChartData(
                      titlesData: FlTitlesData(
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 28,
                            interval: (data.length / 6).clamp(1, 6).toDouble(),
                            getTitlesWidget: (value, meta) {
                              final i = value.toInt();
                              if (i < 0 || i >= data.length) return const SizedBox.shrink();
                              return Text(FirestoreService.formatTime(data[i].timestamp), style: const TextStyle(fontSize: 10));
                            },
                          ),
                        ),
                        leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 36)),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      ),
                      lineBarsData: [
                        _line(data.map((e) => e.temperature).toList(), Colors.red),
                        _line(data.map((e) => e.dissolvedOxygen).toList(), Colors.green),
                        _line(data.map((e) => e.ammonia).toList(), Colors.orange),
                      ],
                      gridData: const FlGridData(show: true),
                      borderData: FlBorderData(show: true),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  LineChartBarData _line(List<double> values, Color color) {
    final spots = List.generate(values.length, (i) => FlSpot(i.toDouble(), values[i]));
    return LineChartBarData(
      spots: spots,
      isCurved: true,
      color: color,
      barWidth: 2,
      dotData: const FlDotData(show: false),
      belowBarData: BarAreaData(show: true, color: color.withOpacity(0.1)),
    );
  }
}
