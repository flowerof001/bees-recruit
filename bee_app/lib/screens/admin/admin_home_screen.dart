import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';
import 'admin_dashboard_screen.dart';
import 'admin_tenants_screen.dart';
import 'admin_users_screen.dart';
import 'admin_payments_screen.dart';
import 'admin_audit_logs_screen.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int _selectedIndex = 0;

  static const _pages = <Widget>[
    AdminDashboardScreen(),
    AdminTenantsScreen(),
    AdminUsersScreen(),
    AdminPaymentsScreen(),
    AdminAuditLogsScreen(),
  ];

  static const _titles = ['数据看板', '企业管理', '用户管理', '支付记录', '审计日志'];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        backgroundColor: theme.colorScheme.primaryContainer,
        foregroundColor: theme.colorScheme.onPrimaryContainer,
      ),
      drawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: theme.colorScheme.primaryContainer),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  const Icon(Icons.admin_panel_settings, size: 48, color: Colors.black54),
                  const SizedBox(height: 8),
                  Text('管理后台', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                  Text(auth.currentUser?.nickname ?? '管理员', style: theme.textTheme.bodyMedium),
                ],
              ),
            ),
            for (int i = 0; i < _titles.length; i++)
              ListTile(
                leading: Icon(_drawerIcons[i]),
                title: Text(_titles[i]),
                selected: _selectedIndex == i,
                selectedTileColor: theme.colorScheme.primary.withAlpha(25),
                onTap: () {
                  setState(() => _selectedIndex = i);
                  Navigator.pop(context);
                },
              ),
            const Spacer(),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('退出管理后台'),
              onTap: () {
                Navigator.pop(context); // close drawer
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
                auth.logout();
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
    );
  }
}

const _drawerIcons = [
  Icons.dashboard,
  Icons.business,
  Icons.people,
  Icons.payments,
  Icons.history,
];
