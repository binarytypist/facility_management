import 'package:flutter/material.dart';
import '../services/company_service.dart';
import '../models/client.dart';

class CompanyCodeProvider extends ChangeNotifier {
  final CompanyService _companyService;
  
  CompanyCodeProvider(this._companyService);

  final TextEditingController codeController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  @override
  void dispose() {
    codeController.dispose();
    super.dispose();
  }

  Future<Client?> verifyCompanyCode() async {
    final code = codeController.text.trim();
    if (code.isEmpty || code.length < 3) {
      _errorMessage = 'Invalid code format';
      notifyListeners();
      return null;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final matchedClient = await _companyService.verifyCompanyCode(code);
      if (matchedClient == null) {
        _errorMessage = 'Invalid company code. Please try again.';
      }
      return matchedClient;
    } catch (e) {
      debugPrint('Error connecting to server: $e');
      _errorMessage = 'Something went wrong. Please try again.';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
