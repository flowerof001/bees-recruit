import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
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
  bool _codeSent = false;
  int _countdown = 0;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(Icons.emoji_nature, size: 72, color: theme.colorScheme.primary),
              const SizedBox(height: 16),
              Text('小蜜蜂招工', style: theme.textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text('AI 时代的人才连接平台', style: theme.textTheme.bodyLarge?.copyWith(color: Colors.grey), textAlign: TextAlign.center),
              const SizedBox(height: 48),
              TextField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: '手机号', prefixText: '+86 ',
                  border: OutlineInputBorder(),
                ),
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
                          setState(() { _codeSent = true; _countdown = 60; });
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
                onPressed: () {
                  // TODO: 微信登录
                },
                icon: const Icon(Icons.wechat, color: Color(0xFF07C160)),
                label: const Text('微信扫码登录'),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
              ),
            ],
          ),
        ),
      ),
    );
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
    super.dispose();
  }
}
