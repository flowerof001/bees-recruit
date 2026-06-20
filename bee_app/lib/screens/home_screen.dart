import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chat_provider.dart';
import '../providers/job_provider.dart';
import '../providers/notification_provider.dart';
import '../services/auth_service.dart';
import 'jobs/job_list_screen.dart';
import 'chat/conversation_list_screen.dart';
import 'profile/profile_screen.dart';
import 'jobs/job_post_screen.dart';
import 'admin/admin_home_screen.dart';
import 'auth/login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    // 无论是否登录都加载岗位列表（游客可浏览）
    context.read<JobProvider>().search();
    if (auth.currentUser != null) {
      _initLoggedIn(auth);
    }
  }

  void _initLoggedIn(AuthService auth) {
    context.read<ChatProvider>().connect(auth.currentUser!.id);
    context.read<ChatProvider>().loadConversations(auth.currentUser!.id);
    context.read<NotificationProvider>().fetchUnreadCount();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final notif = context.watch<NotificationProvider>();
    final isRecruiter = auth.currentUser?.isRecruiter == true;
    final isAdmin = auth.currentUser?.role == 'ADMIN';
    final isLoggedIn = auth.isLoggedIn;

    // 游客只能看到岗位页面
    if (!isLoggedIn) {
      return Scaffold(
        body: const JobListScreen(),
        bottomNavigationBar: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: const Offset(0, -2))],
          ),
          child: SafeArea(
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () => _navigateToLogin(context),
                icon: const Icon(Icons.login),
                label: const Text('登录/注册', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
        ),
      );
    }

    // 登录用户完整界面
    final pages = <Widget>[
      const JobListScreen(),
      const ConversationListScreen(),
      const ProfileScreen(),
      if (isAdmin) const AdminHomeScreen(),
    ];

    return Scaffold(
      body: pages[_currentIndex.clamp(0, pages.length - 1)],
      floatingActionButton: isRecruiter && _currentIndex == 0
        ? FloatingActionButton.extended(
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const JobPostScreen())).then((_) {
                context.read<JobProvider>().search();
              });
            },
            icon: const Icon(Icons.add),
            label: const Text('发布岗位'),
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Colors.black,
          )
        : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.work_outline), selectedIcon: Icon(Icons.work), label: '岗位'),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: notif.unreadCount > 0,
              label: Text('${notif.unreadCount}'),
              child: const Icon(Icons.chat_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: notif.unreadCount > 0,
              label: Text('${notif.unreadCount}'),
              child: const Icon(Icons.chat),
            ),
            label: '消息',
          ),
          const NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: '我的'),
          if (isAdmin)
            const NavigationDestination(icon: Icon(Icons.admin_panel_settings_outlined), selectedIcon: Icon(Icons.admin_panel_settings), label: '管理'),
        ],
      ),
    );
  }

  void _navigateToLogin(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    ).then((_) {
      // 登录成功后刷新状态
      final auth = context.read<AuthService>();
      if (auth.isLoggedIn) {
        _initLoggedIn(auth);
        setState(() {});
      }
    });
  }
}
