class ChatMessage {
  final String id;
  final String content;
  final String type;
  final String senderId;
  final String? senderName;
  final String? senderAvatar;
  final bool isRead;
  final DateTime createdAt;

  ChatMessage({
    required this.id, required this.content, required this.type,
    required this.senderId, this.senderName, this.senderAvatar,
    required this.isRead, required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'], content: json['content'] ?? '',
      type: json['type'] ?? 'TEXT', senderId: json['senderId'] ?? json['sender']?['id'] ?? '',
      senderName: json['sender']?['nickname'], senderAvatar: json['sender']?['avatar'],
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class Conversation {
  final String id;
  final String lastMessage;
  final DateTime? lastSentAt;
  final int unreadCount;
  final String peerId;
  final String peerName;
  final String? peerAvatar;
  final String? peerRole;

  Conversation({
    required this.id, this.lastMessage = '', this.lastSentAt,
    required this.unreadCount, required this.peerId,
    required this.peerName, this.peerAvatar, this.peerRole,
  });

  factory Conversation.fromJson(Map<String, dynamic> json, String myId) {
    final isUser1 = json['user1']?['id'] == myId;
    final peer = isUser1 ? json['user2'] : json['user1'];
    return Conversation(
      id: json['id'],
      lastMessage: json['lastMessage'] ?? '',
      lastSentAt: json['lastSentAt'] != null ? DateTime.tryParse(json['lastSentAt']) : null,
      unreadCount: isUser1 ? (json['unreadCount1'] ?? 0) : (json['unreadCount2'] ?? 0),
      peerId: peer?['id'] ?? '',
      peerName: peer?['nickname'] ?? '用户',
      peerAvatar: peer?['avatar'],
      peerRole: peer?['role'],
    );
  }
}
