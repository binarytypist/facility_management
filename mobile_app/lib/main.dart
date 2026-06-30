import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/company_code_screen.dart';

void main() {
  runApp(const GeoTaskApp());
}

class GeoTaskApp extends StatelessWidget {
  const GeoTaskApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Geo Task Assignments',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
        textTheme: GoogleFonts.interTextTheme(
          Theme.of(context).textTheme,
        ),
      ),
      home: const CompanyCodeScreen(),
    );
  }
}
