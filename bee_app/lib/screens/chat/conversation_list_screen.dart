import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/chat_provider.dart';
import '../../models/message.dart';
import '../../services/auth_service.dart';
import 'chat_screen.dart';
import 'package:intl/intl.dart';

class ConversationListScreen extends StatelessWidget {
  const ConversationListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ChatProvider>();
    final auth = context.read<AuthService>();

    if (auth.currentUser == null) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(title: const Text('消息', style: TextStyle(fontWeight: FontWeight.bold))),
      body: provider.conversations.isEmpty
        ? const Center(child: Text('暂无消息', style: TextStyle(fontSize: 16, color: Colors.grey)))
        : ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: provider.conversations.length,
            separatorBuilder: (_, __) => const Divider(height: 1, indent: 72),
            itemBuilder: (context, index) {
              final conv = provider.conversations[index];
              return ListTile(
                leading: Badge(
                  isLabelVisible: conv.unreadCount > 0,
                  label: Text('${conv.unreadCount}'),
                  child: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                    child: Text(conv.peerName[0], style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                title: Text(conv.peerName, style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(conv.lastMessage, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[600])),
                trailing: Text(conv.lastSentAt != null ? DateFormat('HH:mm').format(conv.lastSentAt!) : '', style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                onTap: () async {
                  await provider.loadMessages(conv.id);
                  if (context.mounted) {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(conversation: conv)));
                  }
                },
              );
            },
          ),
    );
  }
}
