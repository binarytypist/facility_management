import 'package:flutter/material.dart';
import '../services/company_service.dart';
import 'assignment_list_screen.dart';

class CompanyCodeScreen extends StatefulWidget {
  const CompanyCodeScreen({super.key});

  @override
  State<CompanyCodeScreen> createState() => _CompanyCodeScreenState();
}

class _CompanyCodeScreenState extends State<CompanyCodeScreen> {
  final TextEditingController _codeController = TextEditingController();
  final CompanyService _companyService = CompanyService();
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _verifyCompanyCode() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter a company code';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final matchedClient = await _companyService.verifyCompanyCode(code);

      if (matchedClient != null) {
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => AssignmentListScreen(
                clientId: matchedClient.id,
                clientName: matchedClient.name,
              ),
            ),
          );
        }
      } else {
        setState(() {
          _errorMessage = 'Invalid company code. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error connecting to server: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // slate-950
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 400),
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A), // slate-900
              border: Border.all(color: const Color(0xFF1E293B)), // slate-800
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 32,
                  offset: const Offset(0, 16),
                )
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.business_center, size: 64, color: Color(0xFF6366F1)), // indigo-500
                const SizedBox(height: 24),
                const Text(
                  'Welcome Back',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFF1F5F9), // slate-100
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Enter your company code to continue',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF94A3B8), // slate-400
                  ),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _codeController,
                  style: const TextStyle(color: Color(0xFFE2E8F0)), // slate-200
                  decoration: InputDecoration(
                    labelText: 'Company Code',
                    labelStyle: const TextStyle(color: Color(0xFF64748B)), // slate-500
                    filled: true,
                    fillColor: const Color(0xFF020617), // slate-950
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF334155)), // slate-700
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF334155)), // slate-700
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF6366F1)), // indigo-500
                    ),
                    prefixIcon: const Icon(Icons.vpn_key, color: Color(0xFF64748B)),
                  ),
                  onSubmitted: (_) => _verifyCompanyCode(),
                ),
                if (_errorMessage != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    _errorMessage!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.redAccent, fontSize: 14),
                  ),
                ],
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _isLoading ? null : _verifyCompanyCode,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5), // indigo-600
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text(
                          'Continue',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
