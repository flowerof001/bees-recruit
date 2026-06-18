import 'tenant.dart';

class Job {
  final String id;
  final String title;
  final String description;
  final String? requirements;
  final String? location;
  final String? locationType;
  final int? salaryMin;
  final int? salaryMax;
  final String? educationReq;
  final List<String> tags;
  final int headcount;
  final String status;
  final int viewCount;
  final DateTime createdAt;
  final TenantBrief? tenant;
  final JobPublisher? publisher;

  Job({
    required this.id, required this.title, required this.description,
    this.requirements, this.location, this.locationType,
    this.salaryMin, this.salaryMax, this.educationReq,
    required this.tags, required this.headcount, required this.status,
    required this.viewCount, required this.createdAt,
    this.tenant, this.publisher,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'], title: json['title'], description: json['description'] ?? '',
      requirements: json['requirements'], location: json['location'],
      locationType: json['locationType'], salaryMin: json['salaryMin'],
      salaryMax: json['salaryMax'], educationReq: json['educationReq'],
      tags: List<String>.from(json['tags'] ?? []),
      headcount: json['headcount'] ?? 1, status: json['status'] ?? 'OPEN',
      viewCount: json['viewCount'] ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      tenant: json['tenant'] != null ? TenantBrief.fromJson(json['tenant']) : null,
      publisher: json['publisher'] != null ? JobPublisher.fromJson(json['publisher']) : null,
    );
  }

  String get salaryText {
    if (salaryMin == null && salaryMax == null) return '薪资面议';
    if (salaryMin != null && salaryMax != null) {
      return '${(salaryMin! / 1000).toStringAsFixed(0)}k-${(salaryMax! / 1000).toStringAsFixed(0)}k';
    }
    return '${(salaryMin ?? salaryMax)! ~/ 1000}k';
  }

  String get tagsText => tags.join(' · ');
}

class JobPublisher {
  final String id;
  final String? nickname;
  final String? avatar;
  JobPublisher({required this.id, this.nickname, this.avatar});
  factory JobPublisher.fromJson(Map<String, dynamic> json) =>
    JobPublisher(id: json['id'], nickname: json['nickname'], avatar: json['avatar']);
}
