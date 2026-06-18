import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/chat_provider.dart';
import '../../models/message.dart';
import '../../services/auth_service.dart';
import 'package:intl/intl.dart';

class ChatScreen extends StatefulWidget {
  final Conversation conversation;
  const ChatScreen({super.key, required this.conversation});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ChatProvider>();
    final auth = context.read<AuthService>();
    final myId = auth.currentUser?.id ?? '';

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(radius: 16, backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: Text(widget.conversation.peerName[0], style: const TextStyle(fontSize: 12))),
            const SizedBox(width: 8),
            Text(widget.conversation.peerName),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.all(12),
              itemCount: provider.messages.length,
              itemBuilder: (context, index) {
                final msg = provider.messages[index];
                final isMe = msg.senderId == myId;
                return _MessageBubble(message: msg, isMe: isMe);
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)]),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      decoration: InputDecoration(
                        hintText: '输入消息...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                        filled: true, fillColor: Colors.grey[100],
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () {
                      if (_msgCtrl.text.trim().isNotEmpty) {
                        provider.sendMessage(_msgCtrl.text.trim());
                        _msgCtrl.clear();
                      }
                    },
                    icon: Icon(Icons.send_rounded, color: Theme.of(context).colorScheme.primary),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;
  const _MessageBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(radius: 14, backgroundColor: theme.colorScheme.primaryContainer,
              child: Text(message.senderName?[0] ?? '?', style: const TextStyle(fontSize: 11))),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isMe ? theme.colorScheme.primary : Colors.grey[100],
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isMe ? 16 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 16),
                ),
              ),
              child: Text(message.content, style: TextStyle(fontSize: 15, color: isMe ? Colors.black : Colors.black87)),
            ),
          ),
        ],
      ),
    );
  }
}
