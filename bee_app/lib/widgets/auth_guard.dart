import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';

/// 游客操作拦截弹框 — 当未登录用户点击「立即沟通」或「投递简历」时显示
class AuthGuardDialog extends StatelessWidget {
  final String actionLabel; // e.g. "立即沟通" or "投递简历"
  final String jobTitle;    // 岗位名称，用于提示
  final VoidCallback? onAuthSuccess; // 认证成功后的回调

  const AuthGuardDialog({
    super.key,
    required this.actionLabel,
    required this.jobTitle,
    this.onAuthSuccess,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline, size: 56, color: theme.colorScheme.primary),
            const SizedBox(height: 16),
            Text(
              '需要登录才能${actionLabel}',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              '登录后即可对「$jobTitle」进行${actionLabel}',
              style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context); // 关闭弹框
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  ).then((_) {
                    final auth = context.read<AuthService>();
                    if (auth.isLoggedIn) {
                      onAuthSuccess?.call();
                    }
                  });
                },
                icon: const Icon(Icons.login),
                label: const Text('登录', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(context); // 关闭弹框
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RegisterScreen()),
                  ).then((_) {
                    final auth = context.read<AuthService>();
                    if (auth.isLoggedIn) {
                      onAuthSuccess?.call();
                    }
                  });
                },
                icon: const Icon(Icons.person_add_outlined),
                label: const Text('注册新账号', style: TextStyle(fontSize: 16)),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('暂不登录，继续浏览'),
            ),
          ],
        ),
      ),
    );
  }

  /// 便捷方法：显示认证拦截弹框
  static Future<void> show(
    BuildContext context, {
    required String actionLabel,
    required String jobTitle,
    VoidCallback? onAuthSuccess,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (_) => AuthGuardDialog(
        actionLabel: actionLabel,
        jobTitle: jobTitle,
        onAuthSuccess: onAuthSuccess,
      ),
    );
  }
}
