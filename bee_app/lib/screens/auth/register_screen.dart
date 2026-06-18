import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _phoneCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _nicknameCtrl = TextEditingController();
  String _selectedRole = 'JOB_SEEKER';
  int _countdown = 0;
  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('注册'), leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () => Navigator.pop(context),
      )),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              _buildStepIndicator(),
              const SizedBox(height: 40),
              if (_currentStep == 0) _buildRoleStep(theme),
              if (_currentStep == 1) _buildInfoStep(theme, auth),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      children: [
        _stepDot(0, '选择身份'),
        Expanded(child: Container(height: 2, color: _currentStep >= 1 ? Theme.of(context).colorScheme.primary : Colors.grey.shade300)),
        _stepDot(1, '填写信息'),
      ],
    );
  }

  Widget _stepDot(int step, String label) {
    final isActive = _currentStep >= step;
    final theme = Theme.of(context);
    return Column(
      children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive ? theme.colorScheme.primary : Colors.grey.shade200,
          ),
          child: Center(
            child: isActive
              ? Icon(Icons.check, size: 18, color: isActive ? Colors.black : Colors.grey)
              : Text('${step + 1}', style: TextStyle(color: Colors.grey.shade600)),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, color: isActive ? Colors.black87 : Colors.grey)),
      ],
    );
  }

  Widget _buildRoleStep(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('请选择您的身份', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text('不同身份将使用不同的功能', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey), textAlign: TextAlign.center),
        const SizedBox(height: 32),
        _buildRoleCard(
          role: 'JOB_SEEKER',
          icon: Icons.person_search,
          title: '我是求职者',
          desc: '浏览岗位、投递简历、与招聘方沟通',
          theme: theme,
        ),
        const SizedBox(height: 16),
        _buildRoleCard(
          role: 'RECRUITER',
          icon: Icons.business_center,
          title: '我是招聘者',
          desc: '发布岗位、管理申请、与企业团队协作',
          theme: theme,
        ),
        const SizedBox(height: 40),
        ElevatedButton(
          onPressed: () => setState(() => _currentStep = 1),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: theme.colorScheme.primary,
            foregroundColor: Colors.black,
          ),
          child: const Text('下一步', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  Widget _buildRoleCard({required String role, required IconData icon, required String title, required String desc, required ThemeData theme}) {
    final isSelected = _selectedRole == role;
    return GestureDetector(
      onTap: () => setState(() => _selectedRole = role),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? theme.colorScheme.primary : Colors.grey.shade300, width: isSelected ? 2 : 1),
          color: isSelected ? theme.colorScheme.primary.withAlpha(20) : Colors.white,
        ),
        child: Row(
          children: [
            Container(
              width: 52, height: 52,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: isSelected ? theme.colorScheme.primary.withAlpha(30) : Colors.grey.shade100,
              ),
              child: Icon(icon, color: isSelected ? theme.colorScheme.primary : Colors.grey.shade500, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(desc, style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
                ],
              ),
            ),
            if (isSelected) Icon(Icons.check_circle, color: theme.colorScheme.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoStep(ThemeData theme, AuthService auth) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('完善注册信息', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text('身份：${_selectedRole == 'JOB_SEEKER' ? '求职者' : '招聘者'}', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey), textAlign: TextAlign.center),
        const SizedBox(height: 32),
        TextField(
          controller: _nicknameCtrl,
          decoration: const InputDecoration(labelText: '昵称', hintText: '给自己取个名字吧', prefixIcon: Icon(Icons.person_outline)),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _phoneCtrl,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(labelText: '手机号', prefixText: '+86 ', prefixIcon: Icon(Icons.phone_outlined)),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _codeCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: '验证码', prefixIcon: Icon(Icons.sms_outlined)),
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 120,
              child: ElevatedButton(
                onPressed: _countdown > 0 ? null : () async {
                  if (_phoneCtrl.text.length == 11) {
                    try {
                      await auth.sendSms(_phoneCtrl.text);
                      setState(() { _countdown = 60; });
                      _startCountdown();
                    } catch (e) {
                      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('发送失败: $e')));
                    }
                  }
                },
                child: Text(_countdown > 0 ? '${_countdown}s' : '发送验证码'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: auth.isLoading ? null : () async {
            if (_phoneCtrl.text.length != 11) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请输入正确的手机号')));
              return;
            }
            if (_codeCtrl.text.isEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请输入验证码')));
              return;
            }
            try {
              await auth.register(_phoneCtrl.text, _codeCtrl.text, _selectedRole,
                nickname: _nicknameCtrl.text.isNotEmpty ? _nicknameCtrl.text : null,
              );
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const HomeScreen()),
                  (route) => false,
                );
              }
            } catch (e) {
              if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('注册失败: $e')));
            }
          },
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: theme.colorScheme.primary,
            foregroundColor: Colors.black,
          ),
          child: auth.isLoading
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
            : const Text('完成注册', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => setState(() => _currentStep = 0),
          child: const Text('返回上一步'),
        ),
      ],
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
    _nicknameCtrl.dispose();
    super.dispose();
  }
}
