class Team {
  final String id;
  final String name;
  final String? type;

  Team({
    required this.id,
    required this.name,
    this.type,
  });

  factory Team.fromJson(Map<String, dynamic> json) {
    return Team(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown Team',
      type: json['type'],
    );
  }
}
