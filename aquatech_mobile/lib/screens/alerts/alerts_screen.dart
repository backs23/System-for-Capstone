import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  Color _typeColor(String type, BuildContext context) {
    switch (type.toLowerCase()) {
      case 'warning':
        return const Color(0xFFF59E0B); // amber-500
      case 'success':
        return const Color(0xFF16A34A); // green-600
      default:
        return const Color(0xFF2563EB); // blue-600
    }
  }

  @override
  Widget build(BuildContext context) {
    final alerts = FirebaseFirestore.instance
        .collection('alerts')
        .orderBy('timestamp', descending: true)
        .limit(25)
        .snapshots();

    return Scaffold(
      appBar: AppBar(title: const Text('System Alerts')),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: alerts,
              builder: (context, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                final docs = snap.data?.docs ?? [];
                if (docs.isEmpty) {
                  return const Center(child: Text('No recent alerts'));
                }
                return ListView.separated(
                  itemCount: docs.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, i) {
                    final a = docs[i].data();
                    final type = (a['type'] ?? 'info').toString();
                    final color = _typeColor(type, context);
                    final msg = (a['message'] ?? '').toString();
                    final ts = a['timestamp'];
                    DateTime time;
                    if (ts is Timestamp) {
                      time = ts.toDate();
                    } else if (ts is String) {
                      time = DateTime.tryParse(ts) ?? DateTime.now();
                    } else {
                      time = DateTime.now();
                    }
                    final timeStr = DateFormat('yyyy-MM-dd HH:mm').format(time.toLocal());

                    return ListTile(
                      leading: Icon(Icons.warning_amber, color: color),
                      title: Text(msg),
                      subtitle: Text('$type • $timeStr'),
                      trailing: a['acknowledged'] == true
                          ? Icon(Icons.check_circle, color: Colors.green.shade600)
                          : null,
                    );
                  },
                );
              },
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Expanded(
                  child: FilledButton.tonal(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Reset Alerts (demo)')),
                      );
                    },
                    child: const Text('Reset Alerts'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.tonal(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Export Data (demo)')),
                      );
                    },
                    child: const Text('Export Data'),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
