import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/admin_provider.dart';

class AdminTenantsScreen extends StatefulWidget {
  const AdminTenantsScreen({super.key});

  @override
  State<AdminTenantsScreen> createState() => _AdminTenantsScreenState();
}

class _AdminTenantsScreenState extends State<AdminTenantsScreen> {
  final _searchCtrl = TextEditingController();
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadTenants();
    });
  }

  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    final theme = Theme.of(context);

    return Column(
      children: [
        _buildFilterBar(admin, theme),
        Expanded(
          child: admin.isLoading && admin.tenants.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: () => admin.loadTenants(search: _searchCtrl.text, status: _statusFilter),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: admin.tenants.length,
                  itemBuilder: (ctx, i) {
                    final t = admin.tenants[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: Colors.grey.shade200,
                                  child: Text(t.name.isNotEmpty ? t.name[0] : '?', style: const TextStyle(fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(child: Text(t.name, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600))),
                                          if (t.verified) ...[
                                            const SizedBox(width: 6),
                                            Icon(Icons.verified, size: 18, color: Colors.blue.shade400),
                                          ],
                                        ],
                                      ),
                                      if (t.industry != null)
                                        Text(t.industry!, style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
                                    ],
                                  ),
                                ),
                                _statusChip(t.status),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                _infoChip(Icons.work, '${t.jobCount} 岗位'),
                                const SizedBox(width: 12),
                                _infoChip(Icons.people, '${t.memberCount} 成员'),
                                if (t.planName != null) ...[
                                  const SizedBox(width: 12),
                                  _infoChip(Icons.card_membership, t.planName!),
                                ],
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (!t.verified)
                                  TextButton.icon(
                                    icon: const Icon(Icons.verified, size: 18),
                                    label: const Text('认证'),
                                    onPressed: () => _confirmAction(context, '认证企业 "${t.name}"？', () => admin.verifyTenant(t.id)),
                                  ),
                                if (t.status == 'ACTIVE')
                                  TextButton.icon(
                                    icon: const Icon(Icons.block, size: 18),
                                    label: const Text('停用'),
                                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                                    onPressed: () => _confirmAction(context, '停用企业 "${t.name}"？', () => admin.updateTenantStatus(t.id, 'SUSPENDED')),
                                  ),
                                if (t.status == 'SUSPENDED')
                                  TextButton.icon(
                                    icon: const Icon(Icons.check_circle, size: 18),
                                    label: const Text('启用'),
                                    style: TextButton.styleFrom(foregroundColor: Colors.green),
                                    onPressed: () => _confirmAction(context, '启用企业 "${t.name}"？', () => admin.updateTenantStatus(t.id, 'ACTIVE')),
                                  ),
                              ],
                            ),
                          ],
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

  Widget _buildFilterBar(AdminProvider admin, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: '搜索企业名称/行业',
                prefixIcon: const Icon(Icons.search, size: 20),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onSubmitted: (v) => admin.loadTenants(search: v, status: _statusFilter),
            ),
          ),
          const SizedBox(width: 8),
          DropdownButton<String?>(
            value: _statusFilter,
            hint: const Text('状态'),
            underline: const SizedBox(),
            items: const [
              DropdownMenuItem(value: null, child: Text('全部')),
              DropdownMenuItem(value: 'ACTIVE', child: Text('活跃')),
              DropdownMenuItem(value: 'SUSPENDED', child: Text('停用')),
            ],
            onChanged: (v) {
              setState(() => _statusFilter = v);
              admin.loadTenants(search: _searchCtrl.text, status: v);
            },
          ),
        ],
      ),
    );
  }

  Widget _statusChip(String status) {
    final config = switch (status) {
      'ACTIVE' => (Colors.green, '活跃'),
      'SUSPENDED' => (Colors.red, '停用'),
      _ => (Colors.grey, status),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: config.$1.withAlpha(25),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(config.$2, style: TextStyle(fontSize: 12, color: config.$1, fontWeight: FontWeight.w500)),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.grey),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
      ],
    );
  }

  void _confirmAction(BuildContext context, String message, VoidCallback onConfirm) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认操作'),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              onConfirm();
            },
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }
}
