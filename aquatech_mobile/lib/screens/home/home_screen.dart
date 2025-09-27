import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';

import '../../services/auth_service.dart';
import '../dashboard/dashboard_screen.dart';
import '../water/water_monitoring_screen.dart';
import '../support/support_screen.dart';
import '../contact/contact_screen.dart';
import '../alerts/alerts_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthService>();
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AquaTech'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () async {
              await auth.signOut();
            },
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${user?.email ?? 'User'}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Text(
              'Water Quality Monitoring',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _NavCard(
                  icon: Icons.water_drop,
                  title: 'Water Monitoring',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const WaterMonitoringScreen()),
                  ),
                ),
                _NavCard(
                  icon: Icons.bar_chart,
                  title: 'Dashboard',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const DashboardScreen()),
                  ),
                ),
                _NavCard(
                  icon: Icons.warning_amber,
                  title: 'Alerts',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AlertsScreen()),
                  ),
                ),
                _NavCard(
                  icon: Icons.support_agent,
                  title: 'Support',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const SupportScreen()),
                  ),
                ),
                _NavCard(
                  icon: Icons.contact_mail,
                  title: 'Contact',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const ContactScreen()),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _NavCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _NavCard({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 160,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 36, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(title, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
