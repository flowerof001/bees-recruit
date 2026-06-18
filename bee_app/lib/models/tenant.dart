class TenantBrief {
  final String id;
  final String name;
  final String? logo;
  final bool verified;
  final String? scale;
  final String? industry;
  final String? description;

  TenantBrief({required this.id, required this.name, this.logo, required this.verified, this.scale, this.industry, this.description});

  factory TenantBrief.fromJson(Map<String, dynamic> json) {
    return TenantBrief(
      id: json['id'], name: json['name'] ?? '', logo: json['logo'],
      verified: json['verified'] ?? false, scale: json['scale'],
      industry: json['industry'], description: json['description'],
    );
  }
}
