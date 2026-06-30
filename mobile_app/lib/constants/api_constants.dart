class ApiConstants {
  // Base URL for the backend API.
  // When running on an Android emulator, 'localhost' or '127.0.0.1' points to the emulator itself.
  // Use '10.0.2.2' for Android emulator to connect to the host machine's localhost.
  // For iOS simulator, web, or windows desktop, 'localhost' or '127.0.0.1' works.
  static const String baseUrl = 'http://localhost:3000/api';

  // Specific API endpoints
  static const String clients = '$baseUrl/clients';
  static const String masterData = '$baseUrl/master-data';
  static const String locations = '$baseUrl/locations';
  static const String workEvents = '$baseUrl/work-events';
  
  // Helper to parse URIs easily
  static Uri getUri(String endpoint) {
    return Uri.parse(endpoint);
  }
}
