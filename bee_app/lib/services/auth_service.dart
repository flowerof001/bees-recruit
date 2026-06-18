import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  User? _currentUser;
  String? _accessToken;
  bool _isLoading = false;

  User? get currentUser => _currentUser;
  String? get accessToken => _accessToken;
  bool get isLoggedIn => _accessToken != null;
  bool get isLoading => _isLoading;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString('accessToken');
    final userJson = prefs.getString('currentUser');
    if (userJson != null) {
      _currentUser = User.fromJson(jsonDecode(userJson));
    }
    notifyListeners();
  }

  Future<void> sendSms(String phone) async {
    await _api.post('/auth/sms/send', data: {'phone': phone});
  }

  Future<User> loginByPhone(String phone, String code) async {
    _isLoading = true; notifyListeners();
    try {
      final res = await _api.post('/auth/phone/login', data: {'phone': phone, 'code': code});
      return _saveAuth(res.data);
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<User> register(String phone, String code, String role, {String? nickname}) async {
    _isLoading = true; notifyListeners();
    try {
      final res = await _api.post('/auth/phone/register', data: {
        'phone': phone, 'code': code, 'role': role,
        if (nickname != null) 'nickname': nickname,
      });
      return _saveAuth(res.data);
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<User> loginByWechat(String code) async {
    _isLoading = true; notifyListeners();
    try {
      final res = await _api.post('/auth/wechat/login', data: {'code': code});
      return _saveAuth(res.data);
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> logout() async {
    _accessToken = null;
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('currentUser');
    notifyListeners();
  }

  User _saveAuth(Map<String, dynamic> data) {
    _accessToken = data['accessToken'];
    _currentUser = User.fromJson(data['user'] ?? {});
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString('accessToken', _accessToken!);
      prefs.setString('currentUser', jsonEncode(_currentUser!.toJson()));
    });
    return _currentUser!;
  }
}
