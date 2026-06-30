class Client {
  final String id;
  final String? code;
  final String name;

  Client({
    required this.id,
    this.code,
    required this.name,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString(),
      name: json['name'] ?? 'Unknown Client',
    );
  }
}
