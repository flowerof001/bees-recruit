import 'package:flutter/material.dart';
import '../../services/api_client.dart';

class JobPostScreen extends StatefulWidget {
  const JobPostScreen({super.key});

  @override
  State<JobPostScreen> createState() => _JobPostScreenState();
}

class _JobPostScreenState extends State<JobPostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _reqCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  String _locationType = 'ONSITE';
  int? _salaryMin;
  int? _salaryMax;
  int _headcount = 1;
  String _educationReq = '本科';
  List<String> _tags = [];
  final _tagCtrl = TextEditingController();
  bool _isSaving = false;

  @override
  void dispose() {
    _titleCtrl.dispose(); _descCtrl.dispose(); _reqCtrl.dispose();
    _locationCtrl.dispose(); _tagCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final api = ApiClient();
    try {
      await api.post('/jobs', data: {
        'title': _titleCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'requirements': _reqCtrl.text.trim(),
        'location': _locationCtrl.text.trim(),
        'locationType': _locationType,
        'salaryMin': _salaryMin,
        'salaryMax': _salaryMax,
        'headcount': _headcount,
        'educationReq': _educationReq,
        'tags': _tags,
      });
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('岗位发布成功')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('发布失败: $e')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('发布岗位')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _titleCtrl,
              decoration: const InputDecoration(labelText: '岗位名称 *', hintText: '如：高级 Flutter 开发工程师', border: OutlineInputBorder()),
              validator: (v) => v?.isEmpty == true ? '必填' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descCtrl,
              decoration: const InputDecoration(labelText: '岗位描述 *', hintText: '描述工作内容和职责...', border: OutlineInputBorder()),
              maxLines: 5, validator: (v) => v?.isEmpty == true ? '必填' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(controller: _reqCtrl, decoration: const InputDecoration(labelText: '任职要求', hintText: '技能要求、经验要求...', border: OutlineInputBorder()), maxLines: 4),
            const SizedBox(height: 16),
            TextFormField(controller: _locationCtrl, decoration: const InputDecoration(labelText: '工作地点', hintText: '如：北京·海淀区', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _locationType,
              decoration: const InputDecoration(labelText: '工作模式', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'ONSITE', child: Text('现场办公')),
                DropdownMenuItem(value: 'REMOTE', child: Text('远程办公')),
                DropdownMenuItem(value: 'HYBRID', child: Text('混合办公')),
              ],
              onChanged: (v) => setState(() => _locationType = v!),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _educationReq,
              decoration: const InputDecoration(labelText: '学历要求', border: OutlineInputBorder()),
              items: const ['不限', '大专', '本科', '硕士', '博士'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => setState(() => _educationReq = v!),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    decoration: const InputDecoration(labelText: '最低薪资(k)', border: OutlineInputBorder()),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => _salaryMin = int.tryParse(v) != null ? int.parse(v) * 1000 : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    decoration: const InputDecoration(labelText: '最高薪资(k)', border: OutlineInputBorder()),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => _salaryMax = int.tryParse(v) != null ? int.parse(v) * 1000 : null,
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 80,
                  child: TextFormField(
                    decoration: const InputDecoration(labelText: '人数', border: OutlineInputBorder()),
                    keyboardType: TextInputType.number,
                    initialValue: '1',
                    onChanged: (v) => _headcount = int.tryParse(v) ?? 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text('技能标签', style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8, runSpacing: 6,
              children: [
                ..._tags.map((t) => Chip(label: Text(t), onDeleted: () => setState(() => _tags.remove(t)), visualDensity: VisualDensity.compact)),
                SizedBox(
                  width: 130,
                  child: TextField(
                    controller: _tagCtrl,
                    decoration: const InputDecoration(hintText: '添加标签', isDense: true, border: OutlineInputBorder()),
                    onSubmitted: (v) {
                      if (v.trim().isNotEmpty && !_tags.contains(v.trim())) {
                        setState(() => _tags.add(v.trim()));
                        _tagCtrl.clear();
                      }
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isSaving ? null : _save,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: theme.colorScheme.primary, foregroundColor: Colors.black),
              child: _isSaving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('发布岗位', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
