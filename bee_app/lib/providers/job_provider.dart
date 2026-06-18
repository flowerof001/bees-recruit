import 'package:flutter/foundation.dart';
import '../models/job.dart';
import '../services/api_client.dart';

class JobProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  List<Job> _jobs = [];
  Job? _currentJob;
  bool _isLoading = false;
  int _total = 0;
  int _page = 1;

  List<Job> get jobs => _jobs;
  Job? get currentJob => _currentJob;
  bool get isLoading => _isLoading;
  int get total => _total;
  bool get hasMore => _jobs.length < _total;

  Future<void> search({String? keyword, String? location, int? salaryMin, String? tag}) async {
    _isLoading = true; _page = 1; notifyListeners();
    try {
      final res = await _api.get('/jobs', params: {
        if (keyword != null && keyword.isNotEmpty) 'keyword': keyword,
        if (location != null && location.isNotEmpty) 'location': location,
        if (salaryMin != null) 'salaryMin': salaryMin,
        if (tag != null && tag.isNotEmpty) 'tag': tag,
        'page': _page, 'pageSize': 20,
      });
      final data = res.data;
      _jobs = (data['items'] as List).map((j) => Job.fromJson(j)).toList();
      _total = data['total'] ?? 0;
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> loadMore() async {
    if (_isLoading || !hasMore) return;
    _isLoading = true; _page++; notifyListeners();
    try {
      final res = await _api.get('/jobs', params: {'page': _page, 'pageSize': 20});
      final data = res.data;
      _jobs.addAll((data['items'] as List).map((j) => Job.fromJson(j)));
      _total = data['total'] ?? _total;
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> getJobDetail(String id) async {
    _isLoading = true; notifyListeners();
    try {
      final res = await _api.get('/jobs/$id');
      _currentJob = Job.fromJson(res.data);
    } finally {
      _isLoading = false; notifyListeners();
    }
  }
}
