import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/company_code_screen.dart';
import 'package:provider/provider.dart';
import 'services/theme_provider.dart';
import 'services/company_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        Provider(create: (_) => CompanyService()),
      ],
      child: const GeoTaskApp(),
    ),
  );
}

class GeoTaskApp extends StatelessWidget {
  const GeoTaskApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'Geo Task Assignments',
          debugShowCheckedModeBanner: false,
          themeMode: themeProvider.themeMode,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: Brightness.light),
            useMaterial3: true,
            textTheme: GoogleFonts.interTextTheme(
              ThemeData.light().textTheme,
            ),
          ),
          darkTheme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: Brightness.dark),
            useMaterial3: true,
            textTheme: GoogleFonts.interTextTheme(
              ThemeData.dark().textTheme,
            ),
          ),
          home: const CompanyCodeScreen(),
        );
      },
    );
  }
}
