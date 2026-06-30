import 'package:flutter/material.dart';
import '../../constants/theme_constants.dart';

class TitleField extends StatelessWidget {
  final String title;
  final String description;
  final ValueChanged<String> onTitleChanged;
  final ValueChanged<String> onDescriptionChanged;

  const TitleField({
    super.key,
    required this.title,
    required this.description,
    required this.onTitleChanged,
    required this.onDescriptionChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildLabel('EVENT TITLE', required: true),
        TextFormField(
          initialValue: title,
          style: const TextStyle(color: ThemeConstants.slate200, fontSize: 14),
          decoration: createInputDecoration('Enter event title'),
          onChanged: onTitleChanged,
        ),
        const SizedBox(height: 24),
        buildLabel('DESCRIPTION'),
        TextFormField(
          initialValue: description,
          maxLines: 4,
          style: const TextStyle(color: ThemeConstants.slate200, fontSize: 14),
          decoration: createInputDecoration('Provide detailed description of the work required...'),
          onChanged: onDescriptionChanged,
        ),
      ],
    );
  }
}
