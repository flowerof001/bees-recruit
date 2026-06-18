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
    if (auth.currentUser != null) {
      context.read<ChatProvider>().connect(auth.currentUser!.id);
      context.read<ChatProvider>().loadConversations(auth.currentUser!.id);
      context.read<JobProvider>().search();
      context.read<NotificationProvider>().fetchUnreadCount();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final notif = context.watch<NotificationProvider>();
    final isRecruiter = auth.currentUser?.isRecruiter == true;
    final isAdmin = auth.currentUser?.role == 'ADMIN';

    final pages = <Widget>[
      const JobListScreen(),
      const ConversationListScreen(),
      const ProfileScreen(),
      if (isAdmin) const AdminHomeScreen(),
    ];

    return Scaffold(
      body: pages[_currentIndex],
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
}
