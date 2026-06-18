import 'package:flutter/material.dart';
import '../../services/api_client.dart';

class RecruiterDashboardScreen extends StatefulWidget {
  const RecruiterDashboardScreen({super.key});

  @override
  State<RecruiterDashboardScreen> createState() => _RecruiterDashboardScreenState();
}

class _RecruiterDashboardScreenState extends State<RecruiterDashboardScreen> {
  Map<String, dynamic>? _data;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ApiClient().get('/companies/mine/brief');
      if (res.data != null) setState(() => _data = res.data);
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('数据看板')),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _data == null
          ? const Center(child: Text('暂无企业信息'))
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        children: [
                          CircleAvatar(radius: 28, backgroundColor: theme.colorScheme.primary, child: Text((_data!['name'] ?? '?')[0], style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold))),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_data!['name'] ?? '', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                                if (_data!['verified'] == true)
                                  Row(children: [Icon(Icons.verified, size: 16, color: Colors.blue), const SizedBox(width: 4), Text('已认证', style: TextStyle(color: Colors.blue, fontSize: 12))]),
                                Text('角色：${_data!['myRole'] == 'OWNER' ? '所有者' : _data!['myRole'] == 'ADMIN' ? '管理员' : '招聘者'}', style: TextStyle(fontSize: 13, color: Colors.grey)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text('招聘概览', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _statCard('新投递', '${_data!['newApplications'] ?? 0}', Icons.inbox, Colors.orange, theme)),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color, ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(value, style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label, style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
