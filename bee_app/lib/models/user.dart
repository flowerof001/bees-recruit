class User {
  final String id;
  final String? phone;
  final String? nickname;
  final String? avatar;
  final String role;
  final String? status;

  User({required this.id, this.phone, this.nickname, this.avatar, required this.role, this.status});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      phone: json['phone'],
      nickname: json['nickname'],
      avatar: json['avatar'],
      role: json['role'] ?? 'JOB_SEEKER',
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'phone': phone, 'nickname': nickname,
    'avatar': avatar, 'role': role, 'status': status,
  };

  bool get isRecruiter => role == 'RECRUITER' || role == 'ADMIN';
}
