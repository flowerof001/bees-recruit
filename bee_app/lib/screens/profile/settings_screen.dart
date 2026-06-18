import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_client.dart';
import '../auth/login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.currentUser;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('设置')),
      body: ListView(
        children: [
          const SizedBox(height: 8),
          _sectionTitle('账号信息', theme),
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: const Text('昵称'),
            subtitle: Text(user?.nickname ?? '未设置'),
            trailing: const Icon(Icons.chevron_right, size: 20),
            onTap: () => _showEditDialog('昵称', user?.nickname ?? '', (v) async {
              await ApiClient().put('/users/profile', data: {'nickname': v});
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('昵称已更新')));
              }
            }),
          ),
          ListTile(
            leading: const Icon(Icons.phone_outlined),
            title: const Text('手机号'),
            subtitle: Text(user?.phone ?? '未绑定'),
            trailing: const Icon(Icons.chevron_right, size: 20),
            onTap: () => _showBindPhoneDialog(),
          ),
          const Divider(),
          _sectionTitle('账号安全', theme),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: const Text('修改密码'),
            trailing: const Icon(Icons.chevron_right, size: 20),
            onTap: () => _showPasswordDialog(),
          ),
          const Divider(),
          _sectionTitle('通知设置', theme),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_outlined),
            title: const Text('推送通知'),
            value: true,
            onChanged: (_) {},
          ),
          const Divider(),
          _sectionTitle('其他', theme),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('关于'),
            subtitle: const Text('小蜜蜂招工 v1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.delete_outline, color: Colors.red),
            title: const Text('注销账号', style: TextStyle(color: Colors.red)),
            onTap: () => _showDeleteAccountDialog(),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: OutlinedButton(
              onPressed: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (_) => false);
                }
              },
              style: OutlinedButton.styleFrom(foregroundColor: Colors.red, padding: const EdgeInsets.symmetric(vertical: 14)),
              child: const Text('退出登录'),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Text(title, style: theme.textTheme.titleSmall?.copyWith(color: Colors.grey, fontWeight: FontWeight.w600)),
    );
  }

  void _showEditDialog(String label, String current, Function(String) onSave) {
    final ctrl = TextEditingController(text: current);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('修改$label'),
        content: TextField(controller: ctrl, decoration: InputDecoration(labelText: label, border: const OutlineInputBorder())),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          ElevatedButton(onPressed: () { Navigator.pop(ctx); onSave(ctrl.text); }, child: const Text('保存')),
        ],
      ),
    );
  }

  void _showBindPhoneDialog() {
    final phoneCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('绑定手机号'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: '手机号', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: codeCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: '验证码', border: OutlineInputBorder())),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          ElevatedButton(onPressed: () {
            Navigator.pop(ctx);
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('绑定请求已发送')));
          }, child: const Text('确认绑定')),
        ],
      ),
    );
  }

  void _showPasswordDialog() {
    final oldCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('修改密码'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: oldCtrl, obscureText: true, decoration: const InputDecoration(labelText: '原密码', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: newCtrl, obscureText: true, decoration: const InputDecoration(labelText: '新密码', border: OutlineInputBorder())),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          ElevatedButton(onPressed: () {
            Navigator.pop(ctx);
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('密码已修改')));
          }, child: const Text('确认')),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('注销账号'),
        content: const Text('注销后，您的所有数据将被清除且不可恢复。确定要继续吗？'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('账号已注销')));
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('确认注销'),
          ),
        ],
      ),
    );
  }
}
