import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/admin_provider.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    final theme = Theme.of(context);

    if (admin.isLoading && admin.dashboard == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final d = admin.dashboard;
    if (d == null) {
      return const Center(child: Text('暂无数据'));
    }

    return RefreshIndicator(
      onRefresh: () => admin.loadDashboard(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _sectionTitle('平台概览', theme),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _statCard('企业', '${d.tenants}', Icons.business, Colors.blue, theme)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('用户', '${d.users}', Icons.people, Colors.green, theme)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _statCard('开放岗位', '${d.openJobs}', Icons.work, Colors.orange, theme)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('投递', '${d.applications}', Icons.send, Colors.purple, theme)),
            ],
          ),
          const SizedBox(height: 24),
          _sectionTitle('今日投递动态', theme),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _statCard('今日', '${d.todayApps}', Icons.today, Colors.teal, theme)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('昨日', '${d.yesterdayApps}', Icons.event, Colors.grey, theme)),
            ],
          ),
          if (d.dailyApps.isNotEmpty) ...[
            const SizedBox(height: 24),
            _sectionTitle('近7天投递趋势', theme),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  height: 180,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: d.dailyApps.map((day) {
                      final maxCount = d.dailyApps.map((e) => e.count).reduce((a, b) => a > b ? a : b);
                      final barHeight = maxCount > 0 ? (day.count / maxCount * 120) : 0.0;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text('${day.count}', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                              const SizedBox(height: 4),
                              Container(
                                height: barHeight.clamp(4.0, 120.0),
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.primary,
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                day.date.substring(5), // MM-DD
                                style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 24),
          _sectionTitle('订阅', theme),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _statCard('活跃', '${d.activeSubs}', Icons.check_circle, Colors.green, theme)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('试用', '${d.trialSubs}', Icons.timer, Colors.amber, theme)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('过期', '${d.expiredSubs}', Icons.cancel, Colors.red, theme)),
            ],
          ),
          const SizedBox(height: 24),
          _sectionTitle('收入', theme),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _statCard('总收入', '¥${(d.totalRevenue / 100).toStringAsFixed(0)}', Icons.account_balance_wallet, Colors.indigo, theme)),
              const SizedBox(width: 12),
              Expanded(child: _statCard('本月', '¥${(d.monthRevenue / 100).toStringAsFixed(0)}', Icons.trending_up, Colors.teal, theme)),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title, ThemeData theme) {
    return Text(title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600));
  }

  Widget _statCard(String label, String value, IconData icon, Color color, ThemeData theme) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
                Icon(icon, size: 20, color: color),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
