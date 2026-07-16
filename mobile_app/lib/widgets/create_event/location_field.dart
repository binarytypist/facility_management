import 'package:flutter/material.dart';
import '../../constants/theme_constants.dart';
import '../../models/location.dart';

class LocationField extends StatelessWidget {
  final String? locationId;
  final List<Location> locations;
  final ValueChanged<String?> onChanged;

  const LocationField({
    super.key,
    required this.locationId,
    required this.locations,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildLabel('LOCATION', required: true),
        DropdownButtonFormField<String>(
          decoration: createInputDecoration('Select Location'),
          dropdownColor: ThemeConstants.slate900,
          style: const TextStyle(color: ThemeConstants.slate200, fontSize: 14),
          initialValue: locationId,
          items: locations.map((loc) {
            return DropdownMenuItem<String>(
              value: loc.id,
              child: Text(loc.name),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }
}
