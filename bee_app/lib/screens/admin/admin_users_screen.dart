import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/admin_provider.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _searchCtrl = TextEditingController();
  String? _roleFilter;
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    final theme = Theme.of(context);

    return Column(
      children: [
        _buildFilterBar(admin),
        Expanded(
          child: admin.isLoading && admin.users.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: () => admin.loadUsers(search: _searchCtrl.text, role: _roleFilter, status: _statusFilter),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: admin.users.length,
                  itemBuilder: (ctx, i) {
                    final u = admin.users[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _roleColor(u.role).withAlpha(30),
                          child: Text(u.nickname?.isNotEmpty == true ? u.nickname![0].toUpperCase() : '?',
                            style: TextStyle(color: _roleColor(u.role), fontWeight: FontWeight.bold)),
                        ),
                        title: Row(
                          children: [
                            Flexible(child: Text(u.nickname ?? u.phone ?? u.id.substring(0, 8), style: theme.textTheme.titleSmall)),
                            const SizedBox(width: 8),
                            _roleBadge(u.role),
                          ],
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (u.phone != null) Text(u.phone!, style: theme.textTheme.bodySmall),
                            Row(
                              children: [
                                Text('投递 ${u.appCount}', style: theme.textTheme.bodySmall),
                                const SizedBox(width: 12),
                                Text('简历 ${u.resumeCount}', style: theme.textTheme.bodySmall),
                                const SizedBox(width: 12),
                                _statusBadge(u.status),
                              ],
                            ),
                          ],
                        ),
                        trailing: PopupMenuButton<String>(
                          onSelected: (action) {
                            if (action == 'BAN') {
                              _confirmAction(context, '封禁用户 "${u.nickname ?? u.phone}"？', () => admin.updateUserStatus(u.id, 'BANNED'));
                            } else if (action == 'ACTIVE') {
                              _confirmAction(context, '解封用户 "${u.nickname ?? u.phone}"？', () => admin.updateUserStatus(u.id, 'ACTIVE'));
                            }
                          },
                          itemBuilder: (_) => [
                            if (u.status == 'ACTIVE')
                              const PopupMenuItem(value: 'BAN', child: Row(children: [Icon(Icons.block, size: 18, color: Colors.red), SizedBox(width: 8), Text('封禁')])),
                            if (u.status == 'BANNED')
                              const PopupMenuItem(value: 'ACTIVE', child: Row(children: [Icon(Icons.check_circle, size: 18, color: Colors.green), SizedBox(width: 8), Text('解封')])),
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

  Widget _buildFilterBar(AdminProvider admin) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: '搜索手机/昵称',
                prefixIcon: const Icon(Icons.search, size: 20),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onSubmitted: (v) => admin.loadUsers(search: v, role: _roleFilter, status: _statusFilter),
            ),
          ),
          const SizedBox(width: 8),
          DropdownButton<String?>(
            value: _roleFilter,
            hint: const Text('角色'),
            underline: const SizedBox(),
            items: const [
              DropdownMenuItem(value: null, child: Text('全部')),
              DropdownMenuItem(value: 'JOB_SEEKER', child: Text('求职者')),
              DropdownMenuItem(value: 'RECRUITER', child: Text('招聘者')),
            ],
            onChanged: (v) {
              setState(() => _roleFilter = v);
              admin.loadUsers(search: _searchCtrl.text, role: v, status: _statusFilter);
            },
          ),
        ],
      ),
    );
  }

  Widget _roleBadge(String role) {
    final label = role == 'RECRUITER' ? '招聘者' : role == 'ADMIN' ? '管理员' : '求职者';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: _roleColor(role).withAlpha(20),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: TextStyle(fontSize: 10, color: _roleColor(role))),
    );
  }

  Widget _statusBadge(String status) {
    final config = switch (status) {
      'ACTIVE' => (Colors.green, '正常'),
      'BANNED' => (Colors.red, '已封禁'),
      _ => (Colors.grey, status),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: config.$1.withAlpha(20),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(config.$2, style: TextStyle(fontSize: 10, color: config.$1)),
    );
  }

  Color _roleColor(String role) {
    return switch (role) {
      'RECRUITER' => Colors.blue,
      'ADMIN' => Colors.purple,
      _ => Colors.teal,
    };
  }

  void _confirmAction(BuildContext context, String message, VoidCallback onConfirm) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认操作'),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          ElevatedButton(onPressed: () { Navigator.pop(ctx); onConfirm(); }, child: const Text('确定')),
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
