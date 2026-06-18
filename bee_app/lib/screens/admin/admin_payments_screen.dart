import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/admin_provider.dart';

class AdminPaymentsScreen extends StatefulWidget {
  const AdminPaymentsScreen({super.key});

  @override
  State<AdminPaymentsScreen> createState() => _AdminPaymentsScreenState();
}

class _AdminPaymentsScreenState extends State<AdminPaymentsScreen> {
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadPayments();
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
          child: Row(
            children: [
              const Text('筛选：', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('全部'),
                selected: _statusFilter == null,
                onSelected: (_) { setState(() => _statusFilter = null); admin.loadPayments(); },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('已支付'),
                selected: _statusFilter == 'PAID',
                onSelected: (_) { setState(() => _statusFilter = 'PAID'); admin.loadPayments(status: 'PAID'); },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('待支付'),
                selected: _statusFilter == 'PENDING',
                onSelected: (_) { setState(() => _statusFilter = 'PENDING'); admin.loadPayments(status: 'PENDING'); },
              ),
            ],
          ),
        ),
        Expanded(
          child: admin.isLoading && admin.payments.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: () => admin.loadPayments(status: _statusFilter),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: admin.payments.length,
                  itemBuilder: (ctx, i) {
                    final p = admin.payments[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _statusColor(p.status).withAlpha(25),
                          child: Icon(
                            p.status == 'PAID' ? Icons.check_circle : Icons.pending,
                            color: _statusColor(p.status),
                            size: 28,
                          ),
                        ),
                        title: Row(
                          children: [
                            Text('¥${(p.amount / 100).toStringAsFixed(2)}', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                            const SizedBox(width: 8),
                            _statusChip(p.status),
                          ],
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (p.tenantName != null) Text('企业: ${p.tenantName}', style: theme.textTheme.bodySmall),
                            if (p.userNickname != null) Text('用户: ${p.userNickname}', style: theme.textTheme.bodySmall),
                            Text('${p.method} · ${_formatTime(p.createdAt)}', style: theme.textTheme.bodySmall),
                          ],
                        ),
                        isThreeLine: true,
                      ),
                    );
                  },
                ),
              ),
        ),
      ],
    );
  }

  Widget _statusChip(String status) {
    final config = switch (status) {
      'PAID' => (Colors.green, '已支付'),
      'PENDING' => (Colors.orange, '待支付'),
      'REFUNDED' => (Colors.purple, '已退款'),
      _ => (Colors.grey, status),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: config.$1.withAlpha(20), borderRadius: BorderRadius.circular(10)),
      child: Text(config.$2, style: TextStyle(fontSize: 12, color: config.$1, fontWeight: FontWeight.w500)),
    );
  }

  Color _statusColor(String status) {
    return switch (status) {
      'PAID' => Colors.green,
      'PENDING' => Colors.orange,
      'REFUNDED' => Colors.purple,
      _ => Colors.grey,
    };
  }

  String _formatTime(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    super.dispose();
  }
}
