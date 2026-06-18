import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/resume.dart';
import '../../services/api_client.dart';
import '../../services/auth_service.dart';

class ResumeEditScreen extends StatefulWidget {
  final Resume? resume;
  const ResumeEditScreen({super.key, this.resume});

  @override
  State<ResumeEditScreen> createState() => _ResumeEditScreenState();
}

class _ResumeEditScreenState extends State<ResumeEditScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _titleCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _summaryCtrl = TextEditingController();
  String _gender = 'male';
  int? _birthYear;
  int? _workYears;
  String _jobStatus = 'LOOKING';
  List<String> _skills = [];
  final _skillCtrl = TextEditingController();
  bool _isDefault = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.resume != null) {
      final r = widget.resume!;
      _nameCtrl.text = r.name;
      _titleCtrl.text = r.title ?? '';
      _phoneCtrl.text = r.phone;
      _emailCtrl.text = r.email ?? '';
      _summaryCtrl.text = r.summary ?? '';
      _gender = r.gender ?? 'male';
      _birthYear = r.birthYear;
      _workYears = r.workYears;
      _jobStatus = r.jobStatus ?? 'LOOKING';
      _skills = List.from(r.skills);
      _isDefault = r.isDefault;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _titleCtrl.dispose(); _phoneCtrl.dispose();
    _emailCtrl.dispose(); _summaryCtrl.dispose(); _skillCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final api = ApiClient();
    final data = {
      'name': _nameCtrl.text.trim(),
      'title': _titleCtrl.text.trim(),
      'phone': _phoneCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'gender': _gender,
      'birthYear': _birthYear,
      'workYears': _workYears,
      'jobStatus': _jobStatus,
      'skills': _skills,
      'summary': _summaryCtrl.text.trim(),
      'isDefault': _isDefault,
    };

    try {
      if (widget.resume != null) {
        await api.put('/resumes/${widget.resume!.id}', data: data);
      } else {
        await api.post('/resumes', data: data);
      }
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('简历保存成功')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('保存失败: $e')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.resume != null ? '编辑简历' : '创建简历')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: '姓名 *', border: OutlineInputBorder()), validator: (v) => v?.isEmpty == true ? '必填' : null),
            const SizedBox(height: 16),
            TextFormField(controller: _titleCtrl, decoration: const InputDecoration(labelText: '求职意向', hintText: '如：Flutter 高级开发', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            TextFormField(controller: _phoneCtrl, decoration: const InputDecoration(labelText: '手机号 *', border: OutlineInputBorder()), keyboardType: TextInputType.phone, validator: (v) => v?.isEmpty == true ? '必填' : null),
            const SizedBox(height: 16),
            TextFormField(controller: _emailCtrl, decoration: const InputDecoration(labelText: '邮箱', border: OutlineInputBorder()), keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _gender,
              decoration: const InputDecoration(labelText: '性别', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'male', child: Text('男')),
                DropdownMenuItem(value: 'female', child: Text('女')),
              ],
              onChanged: (v) => setState(() => _gender = v!),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _jobStatus,
              decoration: const InputDecoration(labelText: '求职状态', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'LOOKING', child: Text('正在找工作')),
                DropdownMenuItem(value: 'PASSIVE', child: Text('观望机会')),
                DropdownMenuItem(value: 'NOT_LOOKING', child: Text('不找工作')),
              ],
              onChanged: (v) => setState(() => _jobStatus = v!),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    decoration: const InputDecoration(labelText: '出生年份', border: OutlineInputBorder()),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => _birthYear = int.tryParse(v),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    decoration: const InputDecoration(labelText: '工作年限', border: OutlineInputBorder()),
                    keyboardType: TextInputType.number,
                    onChanged: (v) => _workYears = int.tryParse(v),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text('技能标签', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8, runSpacing: 6,
              children: [
                ..._skills.map((s) => Chip(
                  label: Text(s),
                  onDeleted: () => setState(() => _skills.remove(s)),
                  visualDensity: VisualDensity.compact,
                )),
                SizedBox(
                  width: 120,
                  child: TextField(
                    controller: _skillCtrl,
                    decoration: const InputDecoration(
                      hintText: '添加技能',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (v) {
                      if (v.trim().isNotEmpty && !_skills.contains(v.trim())) {
                        setState(() => _skills.add(v.trim()));
                        _skillCtrl.clear();
                      }
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(controller: _summaryCtrl, decoration: const InputDecoration(labelText: '自我描述', hintText: '简要介绍你的优势和特点...', border: OutlineInputBorder()), maxLines: 4),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('设为默认简历'),
              value: _isDefault,
              onChanged: (v) => setState(() => _isDefault = v),
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isSaving ? null : _save,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.black,
              ),
              child: _isSaving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('保存简历', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
