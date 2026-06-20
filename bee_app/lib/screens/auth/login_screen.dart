import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/auth_service.dart';
import '../../services/api_client.dart';
import '../home_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _isAdminMode = false;
  int _countdown = 0;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),
              Icon(Icons.emoji_nature, size: 72, color: theme.colorScheme.primary),
              const SizedBox(height: 16),
              Text('小蜜蜂招工', style: theme.textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text(_isAdminMode ? '管理后台' : 'AI 时代的人才连接平台', style: theme.textTheme.bodyLarge?.copyWith(color: Colors.grey), textAlign: TextAlign.center),
              const SizedBox(height: 48),

              if (_isAdminMode) ...[
                TextField(
                  controller: _usernameCtrl,
                  decoration: const InputDecoration(labelText: '管理员账号', prefixIcon: Icon(Icons.admin_panel_settings), border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: '密码', prefixIcon: Icon(Icons.lock_outline), border: OutlineInputBorder()),
                  onSubmitted: (_) => _adminLogin(),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _adminLogin,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.black,
                  ),
                  child: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('管理员登录', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => setState(() => _isAdminMode = false),
                  child: const Text('← 返回手机号登录'),
                ),
              ] else ...[
                TextField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: '手机号', prefixText: '+86 ', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _codeCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: '验证码', border: OutlineInputBorder()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      width: 120,
                      child: ElevatedButton(
                        onPressed: _countdown > 0 ? null : () async {
                          if (_phoneCtrl.text.length == 11) {
                            await auth.sendSms(_phoneCtrl.text);
                            setState(() => _countdown = 60);
                            _startCountdown();
                          }
                        },
                        child: Text(_countdown > 0 ? '${_countdown}s' : '发送验证码'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: auth.isLoading ? null : () async {
                    if (_phoneCtrl.text.length == 11 && _codeCtrl.text.isNotEmpty) {
                      await auth.loginByPhone(_phoneCtrl.text, _codeCtrl.text);
                      if (mounted) {
                        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.black,
                  ),
                  child: auth.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('登录', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen()));
                  },
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: const Text('注册新账号', style: TextStyle(fontSize: 15)),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.wechat, color: Color(0xFF07C160)),
                  label: const Text('微信扫码登录'),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => setState(() => _isAdminMode = true),
                  child: const Text('管理员登录', style: TextStyle(color: Colors.grey)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _adminLogin() async {
    if (_usernameCtrl.text.isEmpty || _passwordCtrl.text.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      final api = ApiClient();
      final res = await api.post('/auth/admin/login', data: {
        'username': _usernameCtrl.text,
        'password': _passwordCtrl.text,
      });
      final data = res.data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', data['accessToken']);
      await prefs.setString('currentUser', jsonEncode({
        'id': data['user']?['id'] ?? 'admin-seed',
        'nickname': data['user']?['username'] ?? _usernameCtrl.text,
        'role': 'ADMIN',
      }));
      await context.read<AuthService>().init();
      if (mounted) {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('登录失败: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _startCountdown() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() => _countdown--);
      return _countdown > 0;
    });
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _codeCtrl.dispose();
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }
}
