import '../models/work_event.dart';
import '../models/location.dart';

abstract class IWorkEventService {
  Future<List<WorkEvent>> getEvents();
  Future<Map<String, List<dynamic>>> getMasterData();
  Future<List<Location>> getLocations();
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
  });
}
