import '../constants/api_constants.dart';
import '../models/client.dart';
import 'company_service.interface.dart';
import 'api_service.interface.dart';

class CompanyService implements ICompanyService {
  final IApiService _apiService;
  
  CompanyService(this._apiService);

  @override
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
