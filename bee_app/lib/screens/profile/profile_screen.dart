import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_client.dart';
import '../../providers/notification_provider.dart';
import '../../models/tenant.dart';
import '../../models/resume.dart';
import '../auth/login_screen.dart';
import '../company/company_profile_screen.dart';
import '../company/create_company_screen.dart';
import '../company/recruiter_dashboard_screen.dart';
import '../notification/notification_list_screen.dart';
import 'resume_edit_screen.dart';
import '../jobs/job_post_screen.dart';
import '../jobs/application_list_screen.dart';
import 'settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  List<dynamic> _resumes = [];
  Map<String, dynamic>? _tenant;
  Map<String, dynamic>? _subscription;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final api = ApiClient();
    try {
      final res = await api.get('/resumes');
      _resumes = res.data['items'] ?? res.data ?? [];
    } catch (_) {}
    try {
      final res = await api.get('/companies/mine');
      _tenant = res.data;
      if (_tenant != null) {
        final subRes = await api.get('/subscriptions/current', params: {'tenantId': _tenant!['id']});
        _subscription = subRes.data;
      }
    } catch (_) {}
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final notif = context.watch<NotificationProvider>();
    final user = auth.currentUser;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('我的', style: TextStyle(fontWeight: FontWeight.bold))),
      body: ListView(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            color: theme.colorScheme.primaryContainer.withValues(alpha: 0.3),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32, backgroundColor: theme.colorScheme.primary,
                  child: Text(user?.nickname?[0] ?? '?', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.nickname ?? '未登录', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text(user?.phone ?? '', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
                      if (_tenant != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.business, size: 14, color: Colors.grey.shade600),
                            const SizedBox(width: 4),
                            Text(_tenant!['name'] ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                            if (_tenant!['verified'] == true) ...[
                              const SizedBox(width: 4),
                              Icon(Icons.verified, size: 14, color: Colors.blue),
                            ],
                          ],
                        ),
                        if (_subscription != null && _subscription!['plan'] != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withAlpha(30),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(_subscription!['plan']!['nameCN'] ?? '', style: TextStyle(fontSize: 10, color: theme.colorScheme.primary)),
                            ),
                          ),
                      ],
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined),
                  onPressed: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // 通知入口
          _MenuItem(
            icon: Icons.notifications_outlined,
            title: '消息通知',
            badge: notif.unreadCount > 0 ? '${notif.unreadCount}' : null,
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationListScreen()))
                .then((_) => context.read<NotificationProvider>().fetchUnreadCount());
            },
          ),
          const Divider(),
          // 简历
          if (user?.role == 'JOB_SEEKER') ...[
            _MenuItem(icon: Icons.article_outlined, title: '我的简历', onTap: () {
              showModalBottomSheet(
                context: context,
                builder: (_) => SafeArea(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('选择简历', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                      ...(_resumes.map((r) => ListTile(
                        leading: const Icon(Icons.description_outlined),
                        title: Text(r['name'] ?? '未命名'),
                        subtitle: Text(r['title'] ?? ''),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(
                            builder: (_) => ResumeEditScreen(resume: r),
                          )).then((_) => _loadData());
                        },
                      ))),
                      ListTile(
                        leading: const Icon(Icons.add_circle_outline, color: Colors.blue),
                        title: const Text('新建简历', style: TextStyle(color: Colors.blue)),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const ResumeEditScreen())).then((_) => _loadData());
                        },
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              );
            }),
            _MenuItem(icon: Icons.send_outlined, title: '投递记录', onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ApplicationListScreen()));
            }),
            const Divider(),
          ],
          // 招聘者
          if (user?.isRecruiter == true) ...[
            _MenuItem(icon: Icons.business_outlined, title: _tenant != null ? '我的企业: ${_tenant!['name']}' : '创建/加入企业', onTap: () {
              if (_tenant != null) {
                final tenantBrief = TenantBrief(
                  id: _tenant!['id'], name: _tenant!['name'] ?? '',
                  verified: _tenant!['verified'] ?? false,
                  scale: _tenant!['scale'], industry: _tenant!['industry'],
                  description: _tenant!['description'],
                );
                Navigator.push(context, MaterialPageRoute(
                  builder: (_) => CompanyProfileScreen(tenant: tenantBrief, jobCount: 0),
                ));
              }
            }),
            _MenuItem(icon: Icons.add_circle_outline, title: '发布新岗位', onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const JobPostScreen()));
            }),
            _MenuItem(icon: Icons.people_outline, title: '收到的简历', onTap: () { Navigator.push(context, MaterialPageRoute(builder: (_) => const ApplicationListScreen())); }),
            _MenuItem(icon: Icons.bar_chart_outlined, title: '数据看板', onTap: () { Navigator.push(context, MaterialPageRoute(builder: (_) => const RecruiterDashboardScreen())); }),
            const Divider(),
          ],
          _MenuItem(icon: Icons.settings_outlined, title: '设置', onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
          }),
          _MenuItem(icon: Icons.help_outline, title: '帮助与反馈', onTap: () { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('帮助中心即将上线'))); }),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: OutlinedButton(
              onPressed: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (_) => false);
                }
              },
              style: OutlinedButton.styleFrom(foregroundColor: Colors.red, padding: const EdgeInsets.symmetric(vertical: 14)),
              child: const Text('退出登录'),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final String? badge;
  const _MenuItem({required this.icon, required this.title, required this.onTap, this.badge});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(badge!, style: const TextStyle(fontSize: 11, color: Colors.black, fontWeight: FontWeight.w600)),
            ),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, size: 20),
        ],
      ),
      onTap: onTap,
    );
  }
}
