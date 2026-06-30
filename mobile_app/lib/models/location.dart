class Location {
  final String id;
  final String name;

  Location({
    required this.id,
    required this.name,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown Location',
    );
  }
}
