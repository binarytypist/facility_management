import '../constants/api_constants.dart';
import '../models/client.dart';
import 'api_service.dart';

class CompanyService {
  final ApiService _apiService = ApiService();

  Future<Client?> verifyCompanyCode(String code) async {
    final response = await _apiService.get(ApiConstants.clients);
    final clients = response is List ? response : (response['clients'] ?? []);
    
    final matchedClientJson = clients.firstWhere(
      (c) => c['code'] == code,
      orElse: () => null,
    );

    if (matchedClientJson != null) {
      return Client.fromJson(matchedClientJson);
    }
    return null;
  }
}
