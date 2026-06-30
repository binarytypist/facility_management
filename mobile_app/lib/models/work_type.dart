class WorkType {
  final String id;
  final String name;
  final String? category;

  WorkType({
    required this.id,
    required this.name,
    this.category,
  });

  factory WorkType.fromJson(Map<String, dynamic> json) {
    return WorkType(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown Work Type',
      category: json['category']?.toString(),
    );
  }
}
