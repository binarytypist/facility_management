import '../constants/api_constants.dart';
import '../models/work_event.dart';
import '../models/category.dart';
import '../models/work_type.dart';
import '../models/team.dart';
import '../models/location.dart';
import 'api_service.dart';

class WorkEventService {
  final ApiService _apiService = ApiService();

  Future<List<WorkEvent>> getEvents() async {
    final response = await _apiService.get(ApiConstants.workEvents);
    final eventsList = response is List ? response : (response['workEvents'] ?? []);
    return eventsList.map<WorkEvent>((json) => WorkEvent.fromJson(json)).toList();
  }

  Future<Map<String, List<dynamic>>> getMasterData() async {
    final response = await _apiService.get(ApiConstants.masterData);
    if (response['success'] == true) {
      final categories = (response['categories'] as List? ?? []).map((json) => Category.fromJson(json)).toList();
      final workTypes = (response['workTypes'] as List? ?? []).map((json) => WorkType.fromJson(json)).toList();
      final teams = (response['teams'] as List? ?? []).map((json) => Team.fromJson(json)).toList();
      
      return {
        'categories': categories,
        'workTypes': workTypes,
        'teams': teams,
      };
    }
    return {'categories': [], 'workTypes': [], 'teams': []};
  }

  Future<List<Location>> getLocations() async {
    final response = await _apiService.get(ApiConstants.locations);
    if (response['success'] == true) {
      return (response['locations'] as List? ?? []).map((json) => Location.fromJson(json)).toList();
    }
    return [];
  }

  Future<void> createEvent({
    required String title,
    required String? clientId,
    required String? locationId,
    required String? serviceCategoryId,
    required String? workTypeId,
    required String? teamId,
    required String priority,
    required String scheduleType,
    required String structureType,
    required String executionType,
    String? description,
    List<String>? checklist,
  }) async {
    final payload = {
      'title': title,
      'description': description,
      'client_id': clientId,
      'service_category_id': serviceCategoryId,
      'work_type_id': workTypeId,
      'location_id': locationId,
      'assigned_team_id': teamId,
      'priority': priority,
      'schedule_type': scheduleType,
      'structure_type': structureType,
      'execution_type': executionType,
      'checklist': checklist?.join('\n'),
    };

    await _apiService.post(ApiConstants.workEvents, payload);
  }
}
