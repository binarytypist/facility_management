abstract class IApiService {
  Future<dynamic> get(String url);
  Future<dynamic> post(String url, Map<String, dynamic> body);
}
