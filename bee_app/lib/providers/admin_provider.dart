import 'package:flutter/foundation.dart';
import '../services/api_client.dart';

class AdminDashboardData {
  final int tenants;
  final int users;
  final int openJobs;
  final int applications;
  final int todayApps;
  final int yesterdayApps;
  final int activeSubs;
  final int trialSubs;
  final int expiredSubs;
  final int totalRevenue;
  final int monthRevenue;
  final int paidOrders;
  final List<DailyApp> dailyApps;

  AdminDashboardData({
    required this.tenants, required this.users, required this.openJobs,
    required this.applications, required this.todayApps, required this.yesterdayApps,
    required this.activeSubs, required this.trialSubs, required this.expiredSubs,
    required this.totalRevenue, required this.monthRevenue, required this.paidOrders,
    required this.dailyApps,
  });

  factory AdminDashboardData.fromJson(Map<String, dynamic> json) {
    final totals = json['totals'] ?? {};
    final apps = json['applications'] ?? {};
    final subs = json['subscriptions'] ?? {};
    final rev = json['revenue'] ?? {};
    return AdminDashboardData(
      tenants: totals['tenants'] ?? 0,
      users: totals['users'] ?? 0,
      openJobs: totals['openJobs'] ?? 0,
      applications: totals['applications'] ?? 0,
      todayApps: apps['today'] ?? 0,
      yesterdayApps: apps['yesterday'] ?? 0,
      activeSubs: subs['active'] ?? 0,
      trialSubs: subs['trial'] ?? 0,
      expiredSubs: subs['expired'] ?? 0,
      totalRevenue: rev['total'] ?? 0,
      monthRevenue: rev['thisMonth'] ?? 0,
      paidOrders: rev['paidOrders'] ?? 0,
      dailyApps: ((apps['daily'] ?? []) as List).map((d) => DailyApp.fromJson(d)).toList(),
    );
  }
}

class DailyApp {
  final String date;
  final int count;
  DailyApp({required this.date, required this.count});
  factory DailyApp.fromJson(Map<String, dynamic> json) => DailyApp(
    date: json['date'] ?? '', count: json['count'] ?? 0,
  );
}

class TenantItem {
  final String id;
  final String name;
  final String? logo;
  final String? industry;
  final String? scale;
  final bool verified;
  final String status;
  final DateTime createdAt;
  final int jobCount;
  final int memberCount;
  final String? planName;

  TenantItem({
    required this.id, required this.name, this.logo, this.industry, this.scale,
    required this.verified, required this.status, required this.createdAt,
    required this.jobCount, required this.memberCount, this.planName,
  });

  factory TenantItem.fromJson(Map<String, dynamic> json) {
    final count = json['_count'] ?? {};
    final sub = json['subscription'];
    return TenantItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      logo: json['logo'],
      industry: json['industry'],
      scale: json['scale'],
      verified: json['verified'] ?? false,
      status: json['status'] ?? 'ACTIVE',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      jobCount: count['jobs'] ?? 0,
      memberCount: count['members'] ?? 0,
      planName: sub?['plan']?['nameCN'],
    );
  }
}

class UserItem {
  final String id;
  final String? phone;
  final String? nickname;
  final String? avatar;
  final String role;
  final String status;
  final DateTime createdAt;
  final int appCount;
  final int resumeCount;

  UserItem({
    required this.id, this.phone, this.nickname, this.avatar,
    required this.role, required this.status, required this.createdAt,
    required this.appCount, required this.resumeCount,
  });

  factory UserItem.fromJson(Map<String, dynamic> json) {
    final count = json['_count'] ?? {};
    return UserItem(
      id: json['id'] ?? '',
      phone: json['phone'],
      nickname: json['nickname'],
      avatar: json['avatar'],
      role: json['role'] ?? 'JOB_SEEKER',
      status: json['status'] ?? 'ACTIVE',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      appCount: count['applications'] ?? 0,
      resumeCount: count['resumes'] ?? 0,
    );
  }
}

class PaymentItem {
  final String id;
  final int amount;
  final String method;
  final String status;
  final String orderNo;
  final String? tenantName;
  final String? userNickname;
  final DateTime createdAt;

  PaymentItem({
    required this.id, required this.amount, required this.method,
    required this.status, required this.orderNo, this.tenantName,
    this.userNickname, required this.createdAt,
  });

  factory PaymentItem.fromJson(Map<String, dynamic> json) {
    return PaymentItem(
      id: json['id'] ?? '',
      amount: json['amount'] ?? 0,
      method: json['method'] ?? '',
      status: json['status'] ?? 'PENDING',
      orderNo: json['orderNo'] ?? '',
      tenantName: json['tenant']?['name'],
      userNickname: json['user']?['nickname'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class AuditLogItem {
  final String id;
  final String action;
  final String resource;
  final String? resourceId;
  final String? userId;
  final String? ip;
  final DateTime createdAt;

  AuditLogItem({
    required this.id, required this.action, required this.resource,
    this.resourceId, this.userId, this.ip, required this.createdAt,
  });

  factory AuditLogItem.fromJson(Map<String, dynamic> json) {
    return AuditLogItem(
      id: json['id'] ?? '',
      action: json['action'] ?? '',
      resource: json['resource'] ?? '',
      resourceId: json['resourceId'],
      userId: json['userId'],
      ip: json['ip'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class AdminProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();

  AdminDashboardData? _dashboard;
  List<TenantItem> _tenants = [];
  List<UserItem> _users = [];
  List<PaymentItem> _payments = [];
  List<AuditLogItem> _auditLogs = [];
  bool _isLoading = false;
  int _tenantTotal = 0;
  int _userTotal = 0;
  int _paymentTotal = 0;
  int _auditLogTotal = 0;

  AdminDashboardData? get dashboard => _dashboard;
  List<TenantItem> get tenants => _tenants;
  List<UserItem> get users => _users;
  List<PaymentItem> get payments => _payments;
  List<AuditLogItem> get auditLogs => _auditLogs;
  bool get isLoading => _isLoading;
  int get tenantTotal => _tenantTotal;
  int get userTotal => _userTotal;
  int get paymentTotal => _paymentTotal;
  int get auditLogTotal => _auditLogTotal;

  Future<void> loadDashboard() async {
    _isLoading = true; notifyListeners();
    try {
      final res = await _api.get('/admin/dashboard');
      _dashboard = AdminDashboardData.fromJson(res.data);
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> loadTenants({int page = 1, int pageSize = 20, String? status, String? search}) async {
    _isLoading = true; notifyListeners();
    try {
      final params = <String, dynamic>{'page': page, 'pageSize': pageSize};
      if (status != null) params['status'] = status;
      if (search != null && search.isNotEmpty) params['search'] = search;
      final res = await _api.get('/admin/tenants', params: params);
      _tenants = (res.data['items'] as List).map((t) => TenantItem.fromJson(t)).toList();
      _tenantTotal = res.data['total'] ?? 0;
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> updateTenantStatus(String id, String status) async {
    await _api.put('/admin/tenants/$id/status', data: {'status': status});
    await loadTenants();
  }

  Future<void> verifyTenant(String id) async {
    await _api.post('/admin/tenants/$id/verify');
    await loadTenants();
  }

  Future<void> loadUsers({int page = 1, int pageSize = 20, String? role, String? status, String? search}) async {
    _isLoading = true; notifyListeners();
    try {
      final params = <String, dynamic>{'page': page, 'pageSize': pageSize};
      if (role != null) params['role'] = role;
      if (status != null) params['status'] = status;
      if (search != null && search.isNotEmpty) params['search'] = search;
      final res = await _api.get('/admin/users', params: params);
      _users = (res.data['items'] as List).map((u) => UserItem.fromJson(u)).toList();
      _userTotal = res.data['total'] ?? 0;
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> updateUserStatus(String id, String status) async {
    await _api.put('/admin/users/$id/status', data: {'status': status});
    await loadUsers();
  }

  Future<void> loadPayments({int page = 1, int pageSize = 20, String? status}) async {
    _isLoading = true; notifyListeners();
    try {
      final params = <String, dynamic>{'page': page, 'pageSize': pageSize};
      if (status != null) params['status'] = status;
      final res = await _api.get('/admin/payments', params: params);
      _payments = (res.data['items'] as List).map((p) => PaymentItem.fromJson(p)).toList();
      _paymentTotal = res.data['total'] ?? 0;
    } finally {
      _isLoading = false; notifyListeners();
    }
  }

  Future<void> loadAuditLogs({int page = 1, int pageSize = 20, String? action, String? resource}) async {
    _isLoading = true; notifyListeners();
    try {
      final params = <String, dynamic>{'page': page, 'pageSize': pageSize};
      if (action != null) params['action'] = action;
      if (resource != null) params['resource'] = resource;
      final res = await _api.get('/admin/audit-logs', params: params);
      _auditLogs = (res.data['items'] as List).map((a) => AuditLogItem.fromJson(a)).toList();
      _auditLogTotal = res.data['total'] ?? 0;
    } finally {
      _isLoading = false; notifyListeners();
    }
  }
}
