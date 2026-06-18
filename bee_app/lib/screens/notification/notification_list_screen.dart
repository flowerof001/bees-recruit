import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/notification_provider.dart';
import 'package:intl/intl.dart';

class NotificationListScreen extends StatefulWidget {
  const NotificationListScreen({super.key});

  @override
  State<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  @override
  void initState() {
    super.initState();
    context.read<NotificationProvider>().loadNotifications();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NotificationProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('消息通知'),
        actions: [
          if (provider.unreadCount > 0)
            TextButton(
              onPressed: () => provider.markAllAsRead(),
              child: const Text('全部已读'),
            ),
        ],
      ),
      body: provider.isLoading && provider.notifications.isEmpty
        ? const Center(child: CircularProgressIndicator())
        : provider.notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('暂无通知', style: theme.textTheme.bodyLarge?.copyWith(color: Colors.grey)),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: () => provider.loadNotifications(),
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: provider.notifications.length,
                separatorBuilder: (_, __) => const Divider(height: 1, indent: 72),
                itemBuilder: (ctx, i) {
                  final n = provider.notifications[i];
                  return ListTile(
                    leading: CircleAvatar(
                      radius: 20,
                      backgroundColor: _typeColor(n.type).withAlpha(25),
                      child: Icon(_typeIcon(n.type), size: 20, color: _typeColor(n.type)),
                    ),
                    title: Text(n.title, style: TextStyle(
                      fontWeight: n.isRead ? FontWeight.normal : FontWeight.w600,
                      fontSize: 14,
                    )),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(n.content, maxLines: 2, overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                        const SizedBox(height: 4),
                        Text(_formatTime(n.createdAt), style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                      ],
                    ),
                    trailing: n.isRead ? null : Container(
                      width: 8, height: 8,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary, shape: BoxShape.circle,
                      ),
                    ),
                    onTap: () {
                      if (!n.isRead) provider.markAsRead(n.id);
                    },
                    isThreeLine: true,
                  );
                },
              ),
            ),
    );
  }

  IconData _typeIcon(String type) {
    return switch (type) {
      'SYSTEM' => Icons.campaign,
      'APPLICATION' => Icons.send,
      'CHAT' => Icons.chat,
      'PAYMENT' => Icons.payment,
      'SUBSCRIPTION' => Icons.card_membership,
      _ => Icons.notifications,
    };
  }

  Color _typeColor(String type) {
    return switch (type) {
      'SYSTEM' => Colors.blue,
      'APPLICATION' => Colors.green,
      'CHAT' => Colors.orange,
      'PAYMENT' => Colors.purple,
      'SUBSCRIPTION' => Colors.indigo,
      _ => Colors.grey,
    };
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}分钟前';
    if (diff.inHours < 24) return '${diff.inHours}小时前';
    if (diff.inDays < 7) return '${diff.inDays}天前';
    return DateFormat('MM-dd HH:mm').format(dt);
  }
}
