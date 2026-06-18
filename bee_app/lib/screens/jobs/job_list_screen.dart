import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/job_provider.dart';
import '../../models/job.dart';
import 'job_detail_screen.dart';

class JobListScreen extends StatefulWidget {
  const JobListScreen({super.key});

  @override
  State<JobListScreen> createState() => _JobListScreenState();
}

class _JobListScreenState extends State<JobListScreen> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JobProvider>().search();
    });
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 200) {
        context.read<JobProvider>().loadMore();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<JobProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('小蜜蜂招工', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () => _showSearch(context)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.search(),
        child: provider.isLoading && provider.jobs.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : provider.jobs.isEmpty
            ? const Center(child: Text('暂无岗位', style: TextStyle(fontSize: 16, color: Colors.grey)))
            : ListView.builder(
                controller: _scrollCtrl,
                padding: const EdgeInsets.all(12),
                itemCount: provider.jobs.length + (provider.hasMore ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index >= provider.jobs.length) {
                    return const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()));
                  }
                  return _JobCard(job: provider.jobs[index]);
                },
              ),
      ),
    );
  }

  void _showSearch(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: '搜索岗位、技能、公司',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(icon: const Icon(Icons.close), onPressed: () => _searchCtrl.clear()),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onSubmitted: (v) {
                Navigator.pop(context);
                context.read<JobProvider>().search(keyword: v);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }
}

class _JobCard extends StatelessWidget {
  final Job job;
  const _JobCard({required this.job});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          context.read<JobProvider>().getJobDetail(job.id);
          Navigator.push(context, MaterialPageRoute(builder: (_) => JobDetailScreen(job: job)));
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: theme.colorScheme.primaryContainer,
                    child: Text(job.tenant?.name[0] ?? '?', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(job.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(job.tenant?.name ?? '', style: TextStyle(fontSize: 13, color: Colors.grey[600])),
                      ],
                    ),
                  ),
                  if (job.salaryMin != null)
                    Text(job.salaryText, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8, runSpacing: 6,
                children: [
                  _tag(job.location ?? '全国'),
                  _tag(job.locationType == 'REMOTE' ? '远程' : job.locationType == 'HYBRID' ? '混合' : '现场'),
                  ...job.tags.take(3).map(_tag),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(text, style: TextStyle(fontSize: 12, color: Colors.grey[700])),
    );
  }
}
