import 'package:flutter/material.dart';
import '../../services/api_client.dart';

class CreateCompanyScreen extends StatefulWidget {
  const CreateCompanyScreen({super.key});

  @override
  State<CreateCompanyScreen> createState() => _CreateCompanyScreenState();
}

class _CreateCompanyScreenState extends State<CreateCompanyScreen> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _slugCtrl = TextEditingController();
  String _industry = '互联网/IT';
  String _scale = '1-49人';
  bool _isLoading = false;

  static const _industries = ['互联网/IT', '金融', '教育', '医疗', '制造', '房地产', '零售', '物流', '文化传媒', '其他'];
  static const _scales = ['1-49人', '50-99人', '100-499人', '500-999人', '1000人以上'];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('创建企业')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(Icons.business, size: 64, color: theme.colorScheme.primary),
            const SizedBox(height: 24),
            Text('创建您的企业', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text('创建企业后即可发布岗位、管理招聘', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey), textAlign: TextAlign.center),
            const SizedBox(height: 32),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: '企业名称 *', hintText: '请输入企业名称', prefixIcon: Icon(Icons.business)),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _slugCtrl,
              decoration: const InputDecoration(
                labelText: '企业标识', hintText: '英文短标识（选填）',
                prefixIcon: Icon(Icons.link), helperText: '将用于企业主页链接，如 your-company',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: '企业简介', hintText: '简单介绍一下企业（选填）', prefixIcon: Icon(Icons.description)),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.category, color: Colors.grey),
                const SizedBox(width: 12),
                const Text('行业：'),
                const SizedBox(width: 8),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _industry,
                    decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    items: _industries.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                    onChanged: (v) => setState(() => _industry = v!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.people, color: Colors.grey),
                const SizedBox(width: 12),
                const Text('规模：'),
                const SizedBox(width: 8),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _scale,
                    decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                    items: _scales.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                    onChanged: (v) => setState(() => _scale = v!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isLoading ? null : _create,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: Colors.black,
              ),
              child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('创建企业', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('加入已有企业'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _create() async {
    if (_nameCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请输入企业名称')));
      return;
    }
    setState(() => _isLoading = true);
    try {
      await ApiClient().post('/companies', data: {
        'name': _nameCtrl.text.trim(),
        'slug': _slugCtrl.text.trim().isNotEmpty ? _slugCtrl.text.trim() : null,
        'description': _descCtrl.text.trim().isNotEmpty ? _descCtrl.text.trim() : null,
        'industry': _industry,
        'scale': _scale,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('企业创建成功！')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('创建失败: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
