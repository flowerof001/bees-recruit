import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_client.dart';

class ApplicationListScreen extends StatefulWidget {
  const ApplicationListScreen({super.key});

  @override
  State<ApplicationListScreen> createState() => _ApplicationListScreenState();
}

class _ApplicationListScreenState extends State<ApplicationListScreen> {
  final ApiClient _api = ApiClient();
  List<dynamic> _applications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/applications/mine');
      _applications = res.data['items'] ?? [];
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING': return Colors.grey;
      case 'VIEWED': return Colors.blue;
      case 'ACCEPTED': return Colors.green;
      case 'REJECTED': return Colors.red;
      case 'CHATTING': return Colors.orange;
      default: return Colors.grey;
    }
  }

  String _statusText(String status) {
    switch (status) {
      case 'PENDING': return '待查看';
      case 'VIEWED': return '已查看';
      case 'ACCEPTED': return '已通过';
      case 'REJECTED': return '未通过';
      case 'CHATTING': return '沟通中';
      default: return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('投递记录')),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _applications.isEmpty
          ? const Center(child: Text('暂无投递记录', style: TextStyle(color: Colors.grey)))
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _applications.length,
                itemBuilder: (context, index) {
                  final app = _applications[index];
                  final job = app['job'] ?? {};
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(radius: 18, backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                                child: Text((job['tenant']?['name'] ?? '?')[0], style: const TextStyle(fontSize: 12))),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(job['title'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                                    Text(job['tenant']?['name'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _statusColor(app['status']).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(_statusText(app['status']), style: TextStyle(fontSize: 12, color: _statusColor(app['status']), fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('投递时间: ${DateFormat('yyyy-MM-dd HH:mm').format(DateTime.tryParse(app['createdAt'] ?? '') ?? DateTime.now())}',
                            style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
