import 'package:flutter/material.dart';
import '../../models/tenant.dart';

class CompanyProfileScreen extends StatelessWidget {
  final TenantBrief tenant;
  final List<dynamic>? openJobs;
  final int jobCount;

  const CompanyProfileScreen({
    super.key,
    required this.tenant,
    this.openJobs,
    required this.jobCount,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(tenant.name)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [theme.colorScheme.primaryContainer, theme.colorScheme.primaryContainer.withValues(alpha: 0.3)],
                  begin: Alignment.topCenter, end: Alignment.bottomCenter,
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: theme.colorScheme.primary,
                    child: Text(tenant.name[0], style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(tenant.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      if (tenant.verified) ...[
                        const SizedBox(width: 6),
                        Icon(Icons.verified, size: 20, color: theme.colorScheme.primary),
                      ],
                    ],
                  ),
                  if (tenant.industry != null) ...[
                    const SizedBox(height: 4),
                    Text(tenant.industry!, style: TextStyle(color: Colors.grey[600])),
                  ],
                ],
              ),
            ),
            // Stats
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _statItem('在招岗位', '$jobCount'),
                  _statItem('企业规模', tenant.scale ?? '未设置'),
                ],
              ),
            ),
            // Description
            if (tenant.description != null && tenant.description!.isNotEmpty) ...[
              const Divider(),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('企业介绍', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(tenant.description!, style: const TextStyle(fontSize: 14, height: 1.6)),
                  ],
                ),
              ),
            ],
            // Open Jobs
            if (openJobs != null && openJobs!.isNotEmpty) ...[
              const Divider(),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('在招岗位', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    ...openJobs!.map((job) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        title: Text(job['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(job['location'] ?? ''),
                        trailing: job['salaryMin'] != null
                          ? Text('${(job['salaryMin'] / 1000).toStringAsFixed(0)}k-${(job['salaryMax'] / 1000).toStringAsFixed(0)}k',
                              style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.w600))
                          : null,
                      ),
                    )),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[600])),
      ],
    );
  }
}
