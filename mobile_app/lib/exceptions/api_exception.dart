class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? responseBody;

  ApiException(this.message, {this.statusCode, this.responseBody});

  @override
  String toString() {
    if (statusCode != null) {
      return 'ApiException: $message (Status: $statusCode)';
    }
    return 'ApiException: $message';
  }
}

class NetworkException extends ApiException {
  NetworkException(super.message);
}

class ValidationException extends ApiException {
  ValidationException(super.message, {super.statusCode, super.responseBody});
}
