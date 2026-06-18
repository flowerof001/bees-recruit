import 'package:flutter/material.dart';
import '../../models/job.dart';

class JobDetailScreen extends StatelessWidget {
  final Job job;
  const JobDetailScreen({super.key, required this.job});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('岗位详情')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(radius: 28, backgroundColor: theme.colorScheme.primaryContainer,
                  child: Text(job.tenant?.name[0] ?? '?', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold))),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(job.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(job.tenant?.name ?? '', style: TextStyle(fontSize: 14, color: Colors.grey[600])),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  _infoRow(Icons.location_on_outlined, '地点', job.location ?? '不限'),
                  const Divider(),
                  _infoRow(Icons.attach_money, '薪资', job.salaryText),
                  const Divider(),
                  _infoRow(Icons.work_outline, '工作模式', job.locationType == 'REMOTE' ? '远程办公' : job.locationType == 'HYBRID' ? '混合办公' : '现场办公'),
                  if (job.educationReq != null) ...[
                    const Divider(),
                    _infoRow(Icons.school_outlined, '学历', job.educationReq!),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('职位描述', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(job.description, style: const TextStyle(fontSize: 15, height: 1.6)),
            if (job.requirements != null && job.requirements!.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('任职要求', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(job.requirements!, style: const TextStyle(fontSize: 15, height: 1.6)),
            ],
            if (job.tags.isNotEmpty) ...[
              const SizedBox(height: 16),
              Wrap(spacing: 8, runSpacing: 6, children: job.tags.map((t) => Chip(label: Text(t), visualDensity: VisualDensity.compact)).toList()),
            ],
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: const Offset(0, -2))]),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.chat_outlined),
                  label: const Text('立即沟通'),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    // TODO: 投递简历
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('投递成功！')));
                  },
                  icon: const Icon(Icons.send),
                  label: const Text('投递简历'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.black,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: 14, color: Colors.grey[600])),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
