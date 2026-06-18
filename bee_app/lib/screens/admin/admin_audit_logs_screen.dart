import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/admin_provider.dart';

class AdminAuditLogsScreen extends StatefulWidget {
  const AdminAuditLogsScreen({super.key});

  @override
  State<AdminAuditLogsScreen> createState() => _AdminAuditLogsScreenState();
}

class _AdminAuditLogsScreenState extends State<AdminAuditLogsScreen> {
  String? _actionFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadAuditLogs();
    });
  }

  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    final theme = Theme.of(context);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                const Text('操作：', style: TextStyle(fontSize: 14)),
                const SizedBox(width: 8),
                FilterChip(label: const Text('全部'), selected: _actionFilter == null, onSelected: (_) { setState(() => _actionFilter = null); admin.loadAuditLogs(); }),
                const SizedBox(width: 6),
                FilterChip(label: const Text('登录'), selected: _actionFilter == 'LOGIN', onSelected: (_) { setState(() => _actionFilter = 'LOGIN'); admin.loadAuditLogs(action: 'LOGIN'); }),
                const SizedBox(width: 6),
                FilterChip(label: const Text('创建'), selected: _actionFilter == 'CREATE', onSelected: (_) { setState(() => _actionFilter = 'CREATE'); admin.loadAuditLogs(action: 'CREATE'); }),
                const SizedBox(width: 6),
                FilterChip(label: const Text('更新'), selected: _actionFilter == 'UPDATE', onSelected: (_) { setState(() => _actionFilter = 'UPDATE'); admin.loadAuditLogs(action: 'UPDATE'); }),
                const SizedBox(width: 6),
                FilterChip(label: const Text('删除'), selected: _actionFilter == 'DELETE', onSelected: (_) { setState(() => _actionFilter = 'DELETE'); admin.loadAuditLogs(action: 'DELETE'); }),
              ],
            ),
          ),
        ),
        Expanded(
          child: admin.isLoading && admin.auditLogs.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: () => admin.loadAuditLogs(action: _actionFilter),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: admin.auditLogs.length,
                  itemBuilder: (ctx, i) {
                    final log = admin.auditLogs[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          radius: 18,
                          backgroundColor: _actionColor(log.action).withAlpha(25),
                          child: Icon(_actionIcon(log.action), size: 18, color: _actionColor(log.action)),
                        ),
                        title: Row(
                          children: [
                            _actionChip(log.action),
                            const SizedBox(width: 8),
                            Text(log.resource, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                          ],
                        ),
                        subtitle: Text(
                          '${_formatTime(log.createdAt)}${log.userId != null ? ' · ${log.userId!.substring(0, 8)}' : ''}${log.ip != null ? ' · ${log.ip}' : ''}',
                          style: theme.textTheme.bodySmall,
                        ),
                      ),
                    );
                  },
                ),
              ),
        ),
      ],
    );
  }

  Widget _actionChip(String action) {
    final config = switch (action) {
      'LOGIN' => (Colors.blue, '登录'),
      'LOGOUT' => (Colors.grey, '登出'),
      'CREATE' => (Colors.green, '创建'),
      'UPDATE' => (Colors.orange, '更新'),
      'DELETE' => (Colors.red, '删除'),
      'PAYMENT' => (Colors.purple, '支付'),
      _ => (Colors.grey, action),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: config.$1.withAlpha(20), borderRadius: BorderRadius.circular(10)),
      child: Text(config.$2, style: TextStyle(fontSize: 12, color: config.$1, fontWeight: FontWeight.w500)),
    );
  }

  IconData _actionIcon(String action) {
    return switch (action) {
      'LOGIN' => Icons.login,
      'LOGOUT' => Icons.logout,
      'CREATE' => Icons.add_circle_outline,
      'UPDATE' => Icons.edit,
      'DELETE' => Icons.delete_outline,
      'PAYMENT' => Icons.payment,
      _ => Icons.info_outline,
    };
  }

  Color _actionColor(String action) {
    return switch (action) {
      'LOGIN' => Colors.blue,
      'LOGOUT' => Colors.grey,
      'CREATE' => Colors.green,
      'UPDATE' => Colors.orange,
      'DELETE' => Colors.red,
      'PAYMENT' => Colors.purple,
      _ => Colors.grey,
    };
  }

  String _formatTime(DateTime dt) {
    return '${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
