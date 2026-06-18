import 'package:flutter/foundation.dart';
import '../services/api_client.dart';

class NotificationItem {
  final String id;
  final String type;
  final String title;
  final String content;
  final bool isRead;
  final String? linkUrl;
  final DateTime createdAt;

  NotificationItem({
    required this.id, required this.type, required this.title,
    required this.content, required this.isRead, this.linkUrl,
    required this.createdAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] ?? '',
      type: json['type'] ?? 'SYSTEM',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      isRead: json['isRead'] ?? false,
      linkUrl: json['linkUrl'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class NotificationProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  List<NotificationItem> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  List<NotificationItem> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  Future<void> loadNotifications() async {
    _isLoading = true; notifyListeners();
    try {
      final res = await _api.get('/notifications', params: {'pageSize': '50'});
      _notifications = (res.data['items'] as List)
        .map((n) => NotificationItem.fromJson(n))
        .toList();
      _unreadCount = res.data['items']?.where((n) => n['isRead'] == false).length ?? 0;
    } catch (_) {} finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _api.put('/notifications/$id/read');
      final idx = _notifications.indexWhere((n) => n.id == id);
      if (idx >= 0 && !_notifications[idx].isRead) {
        _notifications[idx] = NotificationItem(
          id: _notifications[idx].id, type: _notifications[idx].type,
          title: _notifications[idx].title, content: _notifications[idx].content,
          isRead: true, linkUrl: _notifications[idx].linkUrl,
          createdAt: _notifications[idx].createdAt,
        );
        _unreadCount = (_unreadCount - 1).clamp(0, 999);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await _api.put('/notifications/read-all');
      _notifications = _notifications.map((n) => NotificationItem(
        id: n.id, type: n.type, title: n.title, content: n.content,
        isRead: true, linkUrl: n.linkUrl, createdAt: n.createdAt,
      )).toList();
      _unreadCount = 0;
      notifyListeners();
    } catch (_) {}
  }

  void setUnreadCount(int count) {
    _unreadCount = count;
    notifyListeners();
  }

  Future<void> fetchUnreadCount() async {
    try {
      final res = await _api.get('/notifications/unread-count');
      _unreadCount = res.data['count'] ?? 0;
      notifyListeners();
    } catch (_) {}
  }
}
