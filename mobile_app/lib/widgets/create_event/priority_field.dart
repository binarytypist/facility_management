import 'package:flutter/material.dart';
import '../../constants/theme_constants.dart';

class PriorityField extends StatelessWidget {
  final String priority;
  final ValueChanged<String> onChanged;

  const PriorityField({
    super.key,
    required this.priority,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildLabel('PRIORITY', required: true),
        Row(
          children: [
            _buildPriorityChip('low', 'Low', Icons.arrow_downward, Colors.green),
            const SizedBox(width: 12),
            _buildPriorityChip('medium', 'Medium', Icons.remove, Colors.orange),
            const SizedBox(width: 12),
            _buildPriorityChip('high', 'High', Icons.arrow_upward, Colors.red),
          ],
        ),
      ],
    );
  }

  Widget _buildPriorityChip(String value, String label, IconData icon, MaterialColor baseColor) {
    final isSelected = priority == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? baseColor.withValues(alpha: 0.15) : ThemeConstants.slate950,
            border: Border.all(
              color: isSelected ? baseColor.shade400 : ThemeConstants.slate700,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: isSelected ? baseColor.shade400 : ThemeConstants.slate500,
                size: 20,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? baseColor.shade400 : ThemeConstants.slate400,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
