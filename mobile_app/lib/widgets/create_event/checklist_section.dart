import 'package:flutter/material.dart';
import '../../constants/theme_constants.dart';

class ChecklistSection extends StatelessWidget {
  final TextEditingController controller;
  final List<String> checklistItems;
  final VoidCallback onAdd;
  final ValueChanged<int> onRemove;

  const ChecklistSection({
    super.key,
    required this.controller,
    required this.checklistItems,
    required this.onAdd,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ThemeConstants.slate900,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ThemeConstants.slate800),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.checklist, color: ThemeConstants.indigo400, size: 24),
              const SizedBox(width: 12),
              const Text(
                'Requirements Checklist',
                style: TextStyle(
                  color: ThemeConstants.slate100,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: ThemeConstants.slate800,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${checklistItems.length} items',
                  style: const TextStyle(color: ThemeConstants.slate300, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: controller,
                  style: const TextStyle(color: ThemeConstants.slate200, fontSize: 14),
                  decoration: createInputDecoration('Add a requirement or task...'),
                  onFieldSubmitted: (_) => onAdd(),
                ),
              ),
              const SizedBox(width: 12),
              Material(
                color: ThemeConstants.indigo600,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: onAdd,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: const Icon(Icons.add, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
          if (checklistItems.isNotEmpty) ...[
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: checklistItems.length,
              itemBuilder: (context, index) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: ThemeConstants.slate950,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: ThemeConstants.slate800),
                  ),
                  child: ListTile(
                    dense: true,
                    leading: const Icon(Icons.radio_button_unchecked, color: ThemeConstants.slate500, size: 20),
                    title: Text(
                      checklistItems[index],
                      style: const TextStyle(color: ThemeConstants.slate200),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.close, color: ThemeConstants.slate500, size: 18),
                      onPressed: () => onRemove(index),
                      splashRadius: 20,
                    ),
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}
