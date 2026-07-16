import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

class AuthService extends ChangeNotifier {
  final FlutterAppAuth _appAuth = const FlutterAppAuth();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // Configuration for Keycloak
  final String _clientId = 'geo-task-mobile-client';
  final String _redirectUrl = 'com.geotask.app://oauth2redirect';
  final String _issuer = 'http://10.0.2.2:8081/realms/geo-task-realm'; // 10.0.2.2 for Android emulator
  final String _discoveryUrl = 'http://10.0.2.2:8081/realms/geo-task-realm/.well-known/openid-configuration';
  
  bool _isAuthenticated = false;
  bool get isAuthenticated => _isAuthenticated;

  String? _accessToken;
  String? get accessToken => _accessToken;

  Future<void> initAuth() async {
    final token = await _secureStorage.read(key: 'access_token');
    if (token != null) {
      _accessToken = token;
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<void> login() async {
    try {
      final AuthorizationTokenResponse? result =
          await _appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          _clientId,
          _redirectUrl,
          issuer: _issuer,
          discoveryUrl: _discoveryUrl,
          scopes: ['openid', 'profile', 'email'],
          // For Keycloak without HTTPS in local dev
          allowInsecureConnections: true,
        ),
      );

      if (result != null && result.accessToken != null) {
        _accessToken = result.accessToken;
        _isAuthenticated = true;
        await _secureStorage.write(key: 'access_token', value: _accessToken);
        await _secureStorage.write(key: 'id_token', value: result.idToken);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Login Error: $e');
      _isAuthenticated = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _secureStorage.deleteAll();
    _accessToken = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
