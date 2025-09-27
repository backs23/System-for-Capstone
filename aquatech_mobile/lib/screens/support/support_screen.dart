import 'package:flutter/material.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Center(
              child: Column(
                children: [
                  Text('Support Center', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
Text('Get help with your TilapiaSync systems', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600])),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Support options cards
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: const [
                _SupportCard(
                  color: Color(0xFF2563EB),
                  icon: Icons.menu_book,
                  title: 'Documentation',
                  description: 'Comprehensive guides and technical documentation',
                  buttonText: 'View Docs',
                ),
                _SupportCard(
                  color: Color(0xFF16A34A),
                  icon: Icons.phone_in_talk,
                  title: '24/7 Support',
                  description: 'Get immediate help from our technical team',
                  buttonText: 'Call Support',
                ),
                _SupportCard(
                  color: Color(0xFF7C3AED),
                  icon: Icons.ondemand_video,
                  title: 'Video Tutorials',
                  description: 'Step-by-step video guides for system setup',
                  buttonText: 'Watch Videos',
                ),
              ],
            ),
            const SizedBox(height: 16),

            // FAQ
            Text('Frequently Asked Questions', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const _FaqItem(
              question: 'How do I set up my water monitoring system?',
              answer: 'Unpack and calibrate sensors, connect to the controller, configure Wi‑Fi via the app. Full setup typically takes 15–30 minutes.',
            ),
            const _FaqItem(
              question: 'What water parameters does the system monitor?',
              answer: 'Temperature, dissolved oxygen, ammonia, and additional parameters depending on your configuration (e.g., turbidity, salinity).',
            ),
            const _FaqItem(
              question: 'How often should I calibrate my sensors?',
              answer: 'Recommend calibration every 30 days. Some sensors (e.g., DO, ammonia) may need more frequent calibration depending on usage.',
            ),
            const _FaqItem(
              question: 'Can I control the system remotely?',
              answer: 'Yes, the mobile app and web dashboard allow real-time monitoring, historical analysis, and alert notifications from anywhere.',
            ),
            const SizedBox(height: 16),

            // Contact information + ticket form
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 800;
                return Flex(
                  direction: isWide ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 1,
                      child: _ContactInfoCard(),
                    ),
                    SizedBox(width: isWide ? 16 : 0, height: isWide ? 0 : 16),
                    Expanded(
                      flex: 1,
                      child: const _TicketForm(),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _SupportCard extends StatelessWidget {
  final Color color;
  final IconData icon;
  final String title;
  final String description;
  final String buttonText;
  const _SupportCard({required this.color, required this.icon, required this.title, required this.description, required this.buttonText});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 360,
      constraints: const BoxConstraints(maxWidth: 360),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          CircleAvatar(radius: 32, backgroundColor: color.withOpacity(0.12), child: Icon(icon, color: color, size: 32)),
          const SizedBox(height: 12),
          Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text(description, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[700])),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(backgroundColor: color),
            child: Text(buttonText),
          ),
        ],
      ),
    );
  }
}

class _FaqItem extends StatelessWidget {
  final String question;
  final String answer;
  const _FaqItem({required this.question, required this.answer});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: ExpansionTile(
        title: Text(question, style: const TextStyle(fontWeight: FontWeight.w600)),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(answer, style: TextStyle(color: Colors.grey[700])),
          )
        ],
      ),
    );
  }
}

class _ContactInfoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Contact Information', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _infoRow(Icons.phone, '+63 912 345 6789'),
            _infoRow(Icons.mail, 'atechsupport@aquatech.com'),
            _infoRow(Icons.access_time, '24/7 Support Available'),
            _infoRow(Icons.place, 'Deca Homes, Sabang, Danao City, Philippines'),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [Icon(icon, size: 18, color: Colors.grey[700]), const SizedBox(width: 8), Expanded(child: Text(text))]),
    );
  }
}

class _TicketForm extends StatefulWidget {
  const _TicketForm();
  @override
  State<_TicketForm> createState() => _TicketFormState();
}

class _TicketFormState extends State<_TicketForm> {
  final _subject = TextEditingController();
  String _priority = 'Low';
  final _description = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _subject.dispose();
    _description.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Submit a Ticket', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(controller: _subject, decoration: const InputDecoration(labelText: 'Subject')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _priority,
              items: const [
                DropdownMenuItem(value: 'Low', child: Text('Low')),
                DropdownMenuItem(value: 'Medium', child: Text('Medium')),
                DropdownMenuItem(value: 'High', child: Text('High')),
                DropdownMenuItem(value: 'Critical', child: Text('Critical')),
              ],
              onChanged: (v) => setState(() => _priority = v ?? 'Low'),
              decoration: const InputDecoration(labelText: 'Priority'),
            ),
            const SizedBox(height: 12),
            TextField(controller: _description, maxLines: 4, decoration: const InputDecoration(labelText: 'Description')),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _submitting ? null : () async {
                setState(() => _submitting = true);
                await Future.delayed(const Duration(milliseconds: 600));
                if (mounted) {
                  setState(() => _submitting = false);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ticket submitted (demo).')));
                }
              },
              child: _submitting ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Submit Ticket'),
            )
          ],
        ),
      ),
    );
  }
}
