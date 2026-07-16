import 'package:flutter/material.dart';
import '../../constants/theme_constants.dart';
import '../../models/work_type.dart';

class MasterDataFields extends StatelessWidget {
  final String? structureType;
  final String? workTypeId;
  final List<WorkType> workTypes;
  final ValueChanged<String?> onStructureTypeChanged;
  final ValueChanged<String?> onWorkTypeChanged;

  const MasterDataFields({
    super.key,
    required this.structureType,
    required this.workTypeId,
    required this.workTypes,
    required this.onStructureTypeChanged,
    required this.onWorkTypeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 600) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildStructureTypeField()),
              const SizedBox(width: 24),
              Expanded(child: _buildWorkTypeField()),
            ],
          );
        }
        return Column(
          children: [
            _buildStructureTypeField(),
            const SizedBox(height: 24),
            _buildWorkTypeField(),
          ],
        );
      },
    );
  }

  Widget _buildStructureTypeField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildLabel('STRUCTURE TYPE'),
        DropdownButtonFormField<String>(
          decoration: createInputDecoration('Select Structure'),
          dropdownColor: ThemeConstants.slate900,
          style: const TextStyle(color: ThemeConstants.slate200, fontSize: 14),
          initialValue: structureType,
          items: const [
            DropdownMenuItem(value: 'structured', child: Text('Structured Work')),
            DropdownMenuItem(value: 'semi-structured', child: Text('Semi-Structured Work')),
            DropdownMenuItem(value: 'unstructured', child: Text('Unstructured Work')),
          ],
          onChanged: onStructureTypeChanged,
        ),
      ],
    );
  }

  Widget _buildWorkTypeField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildLabel('WORK TYPE'),
        DropdownButtonFormField<String>(
          decoration: createInputDecoration('Select Work Type'),
          dropdownColor: ThemeConstants.slate900,
          style: const TextStyle(color: ThemeConstants.slate200, fontSize: 14),
          initialValue: workTypeId,
          items: workTypes.map((wt) {
            return DropdownMenuItem<String>(
              value: wt.id,
              child: Text(wt.name),
            );
          }).toList(),
          onChanged: onWorkTypeChanged,
        ),
      ],
    );
  }


}
