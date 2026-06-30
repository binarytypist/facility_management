class WorkEvent {
  final String id;
  final String priority;
  final DateTime startDate;
  final DateTime? endDate;
  final String title;
  final String locationName;
  final String locationType;
  final String structureType;
  final String workTypeName;
  final String status;
  final String? description;
  final double? distance;
  final String? estimatedTravelTime;

  WorkEvent({
    required this.id,
    required this.priority,
    required this.startDate,
    this.endDate,
    required this.title,
    required this.locationName,
    required this.locationType,
    required this.structureType,
    required this.workTypeName,
    required this.status,
    this.description,
    this.distance,
    this.estimatedTravelTime,
  });

  factory WorkEvent.fromJson(Map<String, dynamic> json) {
    return WorkEvent(
      id: json['id']?.toString() ?? '',
      priority: json['priority'] ?? 'medium',
      startDate: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
      endDate: json['scheduled_date'] != null ? DateTime.parse(json['scheduled_date']) : null,
      title: json['title'] ?? 'No Title',
      locationName: json['location']?['name'] ?? 'Unknown Location',
      locationType: json['location']?['type'] ?? 'Unknown Type',
      structureType: json['structure_type'] ?? 'structured',
      workTypeName: json['workType']?['name'] ?? 'Unknown Work',
      status: json['status'] ?? 'created',
      description: json['description'],
      distance: json['distance'] != null ? (json['distance'] as num).toDouble() : null,
      estimatedTravelTime: json['estimatedTravelTime'],
    );
  }
}
