import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../models/message.dart';
import '../services/api_client.dart';

class ChatProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  late io.Socket _socket;
  List<Conversation> _conversations = [];
  List<ChatMessage> _messages = [];
  String? _currentConversationId;
  bool _isConnected = false;
  int _unreadCount = 0;

  List<Conversation> get conversations => _conversations;
  List<ChatMessage> get messages => _messages;
  bool get isConnected => _isConnected;
  int get unreadCount => _unreadCount;

  Future<void> connect(String userId) async {
    _socket = io.io(const bool.fromEnvironment('production') ? 'https://bee-api.onrender.com/chat' : 'http://localhost:3001/chat', <String, dynamic>{
      'transports': ['websocket'],
      'query': {'userId': userId},
    });

    _socket.onConnect((_) {
      _isConnected = true;
      notifyListeners();
    });

    _socket.onDisconnect((_) {
      _isConnected = false;
      notifyListeners();
    });

    _socket.on('message:new', (data) {
      final msg = ChatMessage.fromJson(data);
      if (data['conversationId'] == _currentConversationId) {
        _messages.add(msg);
      }
      _fetchUnreadCount();
      notifyListeners();
    });
  }

  Future<void> loadConversations(String userId) async {
    try {
      final res = await _api.get('/chat/conversations');
      _conversations = (res.data as List)
        .map((c) => Conversation.fromJson(c, userId))
        .toList();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> loadMessages(String conversationId) async {
    _currentConversationId = conversationId;
    try {
      final res = await _api.get('/chat/conversations/$conversationId/messages');
      _messages = (res.data['items'] as List)
        .map((m) => ChatMessage.fromJson(m))
        .toList();
      notifyListeners();
      await _api.post('/chat/conversations/$conversationId/read');
    } catch (_) {}
  }

  Future<void> sendMessage(String content, {String type = 'TEXT'}) async {
    if (_currentConversationId == null) return;
    _socket.emit('message:send', {
      'conversationId': _currentConversationId,
      'content': content,
      'type': type,
    });
  }

  Future<void> _fetchUnreadCount() async {
    try {
      final res = await _api.get('/chat/unread');
      _unreadCount = res.data['count'] ?? 0;
      notifyListeners();
    } catch (_) {}
  }

  @override
  void dispose() {
    _socket.dispose();
    super.dispose();
  }
}
