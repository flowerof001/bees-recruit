class Resume {
  final String id;
  final String name;
  final String? title;
  final String phone;
  final String? email;
  final String? avatar;
  final String? gender;
  final int? birthYear;
  final List<dynamic>? education;
  final List<dynamic>? experience;
  final List<String> skills;
  final String? summary;
  final int? workYears;
  final dynamic salaryExpect;
  final String? jobStatus;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;

  Resume({
    required this.id, required this.name, this.title, required this.phone,
    this.email, this.avatar, this.gender, this.birthYear,
    this.education, this.experience, required this.skills,
    this.summary, this.workYears, this.salaryExpect,
    this.jobStatus, required this.isDefault,
    required this.createdAt, required this.updatedAt,
  });

  factory Resume.fromJson(Map<String, dynamic> json) {
    return Resume(
      id: json['id'], name: json['name'] ?? '', title: json['title'],
      phone: json['phone'] ?? '', email: json['email'], avatar: json['avatar'],
      gender: json['gender'], birthYear: json['birthYear'],
      education: json['education'], experience: json['experience'],
      skills: List<String>.from(json['skills'] ?? []),
      summary: json['summary'], workYears: json['workYears'],
      salaryExpect: json['salaryExpect'], jobStatus: json['jobStatus'],
      isDefault: json['isDefault'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
    );
  }
}
