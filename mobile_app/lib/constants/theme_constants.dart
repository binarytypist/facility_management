import 'package:flutter/material.dart';

class ThemeConstants {
  static const Color slate950 = Color(0xFF020617);
  static const Color slate900 = Color(0xFF0F172A);
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate100 = Color(0xFFF1F5F9);
  
  static const Color indigo900 = Color(0xFF312E81);
  static const Color indigo600 = Color(0xFF4F46E5);
  static const Color indigo500 = Color(0xFF6366F1);
  static const Color indigo400 = Color(0xFF818CF8);
}

InputDecoration createInputDecoration(String hint) {
  return InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: ThemeConstants.slate500),
    filled: true,
    fillColor: ThemeConstants.slate950,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ThemeConstants.slate700),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: ThemeConstants.indigo500),
    ),
  );
}

Widget buildLabel(String text, {bool required = false}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 8.0),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          text,
          style: const TextStyle(
            color: ThemeConstants.slate400,
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.1,
          ),
        ),
        if (required)
          const Padding(
            padding: EdgeInsets.only(left: 4.0),
            child: Text('*', style: TextStyle(color: Colors.redAccent)),
          ),
      ],
    ),
  );
}
