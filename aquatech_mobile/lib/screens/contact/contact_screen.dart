import 'package:flutter/material.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _company = TextEditingController();
  String _subject = '';
  final _message = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _phone.dispose();
    _company.dispose();
    _message.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contact Us')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 900;
                return Flex(
                  direction: isWide ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 1,
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Send us a Message', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Expanded(child: TextField(controller: _firstName, decoration: const InputDecoration(labelText: 'First Name'))),
                                  const SizedBox(width: 12),
                                  Expanded(child: TextField(controller: _lastName, decoration: const InputDecoration(labelText: 'Last Name'))),
                                ],
                              ),
                              const SizedBox(height: 12),
                              TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email Address')),
                              const SizedBox(height: 12),
                              TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone Number')),
                              const SizedBox(height: 12),
                              TextField(controller: _company, decoration: const InputDecoration(labelText: 'Company')),
                              const SizedBox(height: 12),
                              DropdownButtonFormField<String>(
                                initialValue: _subject.isEmpty ? null : _subject,
                                items: const [
                                  DropdownMenuItem(value: 'sales', child: Text('Sales Inquiry')),
                                  DropdownMenuItem(value: 'support', child: Text('Technical Support')),
                                  DropdownMenuItem(value: 'demo', child: Text('Request Demo')),
                                  DropdownMenuItem(value: 'partnership', child: Text('Partnership Opportunity')),
                                  DropdownMenuItem(value: 'other', child: Text('Other')),
                                ],
                                onChanged: (v) => setState(() => _subject = v ?? ''),
                                decoration: const InputDecoration(labelText: 'Subject'),
                              ),
                              const SizedBox(height: 12),
                              TextField(controller: _message, maxLines: 5, decoration: const InputDecoration(labelText: 'Message', hintText: 'Tell us about your aquaculture operation and how we can help...')),
                              const SizedBox(height: 16),
                              FilledButton(
                                onPressed: _sending ? null : _submit,
                                child: _sending ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Send Message'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: isWide ? 16 : 0, height: isWide ? 0 : 16),
                    Expanded(
                      flex: 1,
                      child: Column(
                        children: const [
                          _InfoCard(),
                          SizedBox(height: 16),
                          _QuickActionsCard(),
                          SizedBox(height: 16),
                          _SocialCard(),
                        ],
                      ),
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

  Future<void> _submit() async {
    setState(() => _sending = true);
    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;
    setState(() => _sending = false);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Message sent (demo).')));
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard();
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Get in Touch', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _row(Icons.place, 'Deca Homes, Sabang, Danao City, Philippines'),
            _row(Icons.phone, '+63 912 345 6789', subtitle: 'Available 24/7 for support'),
            _row(Icons.mail, 'atechsupport@aquatech.com', subtitle: 'We\'ll respond within 24 hours'),
            _row(Icons.access_time, 'Business Hours', subtitle: 'Mon–Fri: 8:00–18:00, Sat: 9:00–16:00, Sun: Emergency only'),
          ],
        ),
      ),
    );
  }

  Widget _row(IconData icon, String text, {String? subtitle}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: Colors.grey[700]),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(text),
                if (subtitle != null) Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _QuickActionsCard extends StatelessWidget {
  const _QuickActionsCard();
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Quick Actions', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Column(
              children: [
                _btn(Icons.monitor, 'View Live Demo', onPressed: () {}),
                const SizedBox(height: 8),
                _btn(Icons.calendar_month, 'Schedule Consultation', onPressed: () {}),
                const SizedBox(height: 8),
                _btn(Icons.download, 'Download Brochure', onPressed: () {}),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _btn(IconData icon, String text, {required VoidCallback onPressed}) {
    return FilledButton.tonal(
      onPressed: onPressed,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [Icon(icon), const SizedBox(width: 8), Text(text)],
      ),
    );
  }
}

class _SocialCard extends StatelessWidget {
  const _SocialCard();
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Follow Us', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                _iconButton(Icons.facebook, Colors.blue.shade700),
                const SizedBox(width: 8),
                _iconButton(Icons.alternate_email, Colors.lightBlue),
                const SizedBox(width: 8),
                _iconButton(Icons.link, Colors.blueGrey),
                const SizedBox(width: 8),
                _iconButton(Icons.ondemand_video, Colors.red.shade700),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _iconButton(IconData icon, Color color) {
    return Ink(
      decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
      child: IconButton(onPressed: () {}, icon: Icon(icon, color: color)),
    );
  }
}
