import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../exceptions/api_exception.dart';

class ApiService {
  Future<dynamic> get(String url) async {
    try {
      final response = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 15));
      return _processResponse(response);
    } on SocketException {
      throw NetworkException('No Internet connection');
    } on TimeoutException {
      throw NetworkException('Request timed out');
    } catch (e, stackTrace) {
      // Avoid printing stack trace in production, but useful for debugging
      throw ApiException('Unexpected error occurred: $e');
    }
  }

  Future<dynamic> post(String url, Map<String, dynamic> body) async {
    try {
      final response = await http
          .post(
            Uri.parse(url),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 15));
      return _processResponse(response);
    } on SocketException {
      throw NetworkException('No Internet connection');
    } on TimeoutException {
      throw NetworkException('Request timed out');
    } catch (e) {
      throw ApiException('Unexpected error occurred: $e');
    }
  }

  dynamic _processResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
      case 201:
        final responseJson = jsonDecode(response.body);
        return responseJson;
      case 400:
        throw ValidationException(
          'Bad request',
          statusCode: response.statusCode,
          responseBody: response.body,
        );
      case 401:
      case 403:
        throw ApiException(
          'Unauthorized',
          statusCode: response.statusCode,
        );
      case 404:
        throw ApiException(
          'Resource not found',
          statusCode: response.statusCode,
        );
      case 500:
      default:
        throw ApiException(
          'Error occurred while communicating with server',
          statusCode: response.statusCode,
        );
    }
  }
}
