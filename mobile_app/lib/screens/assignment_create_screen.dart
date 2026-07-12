import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/work_event_service.interface.dart';
import '../../models/work_type.dart';
import '../../models/location.dart';
import '../../constants/theme_constants.dart';
import '../widgets/create_event/title_field.dart';
import '../widgets/create_event/location_field.dart';
import '../widgets/create_event/master_data_fields.dart';
import '../widgets/create_event/priority_field.dart';
import '../widgets/create_event/checklist_section.dart';
import '../widgets/create_event/footer_buttons.dart';

class AssignmentCreateScreen extends StatefulWidget {
  final String? clientId;

  const AssignmentCreateScreen({super.key, this.clientId});

  @override
  State<AssignmentCreateScreen> createState() => _AssignmentCreateScreenState();
}

class _AssignmentCreateScreenState extends State<AssignmentCreateScreen> {
  late final IWorkEventService _workEventService;
  
  bool _isLoadingMasterData = true;
  bool _isSaving = false;

  // Master Data
  List<WorkType> _workTypes = [];
  List<Location> _locations = [];

  // Form State
  String _title = '';
  String? _locationId;
  String? _workTypeId;
  String _priority = 'medium';
  String _structureType = 'structured';
  String _description = '';
  
  // Checklist
  final TextEditingController _checklistController = TextEditingController();
  final List<String> _checklistItems = [];

  @override
  void initState() {
    super.initState();
    _workEventService = context.read<IWorkEventService>();
    _loadAllMasterData();
  }

  @override
  void dispose() {
    _checklistController.dispose();
    super.dispose();
  }

  Future<void> _loadAllMasterData() async {
    try {
      final masterDataFuture = _workEventService.getMasterData();
      final locationsFuture = _workEventService.getLocations();

      final results = await Future.wait([masterDataFuture, locationsFuture]);
      final masterData = results[0] as Map<String, List<dynamic>>;
      final locations = results[1] as List<Location>;

      if (mounted) {
        setState(() {
          _workTypes = List<WorkType>.from(masterData['workTypes'] ?? []);
          _locations = locations;
          _isLoadingMasterData = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingMasterData = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load form data: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  List<WorkType> _getFilteredWorkTypes() {
    final normalizedSelected = _structureType.toLowerCase().replaceAll('-', '');
    return _workTypes.where((wt) {
      if (wt.category == null) return true;
      final wtCat = wt.category!.toLowerCase().replaceAll('-', '');
      return wtCat == normalizedSelected;
    }).toList();
  }

  void _addChecklistItem() {
    final text = _checklistController.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        _checklistItems.add(text);
        _checklistController.clear();
      });
    }
  }

  void _removeChecklistItem(int index) {
    setState(() {
      _checklistItems.removeAt(index);
    });
  }

  Future<void> _submitCreateEvent() async {
    final effectiveClientId = widget.clientId;
    if (_title.isEmpty || effectiveClientId == null || _locationId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields: Title and Location'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    try {
      await _workEventService.createEvent(
        title: _title,
        clientId: effectiveClientId,
        locationId: _locationId,
        serviceCategoryId: null,
        workTypeId: _workTypeId,
        teamId: null,
        priority: _priority,
        scheduleType: 'scheduled',
        structureType: _structureType,
        executionType: 'internal',
        description: _description,
        checklist: _checklistItems,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Event created successfully!'), backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating event: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ThemeConstants.slate950,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: ThemeConstants.slate900,
                border: Border(bottom: BorderSide(color: ThemeConstants.slate800)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: ThemeConstants.slate400),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Assign Selected Work Items',
                          style: TextStyle(
                            color: ThemeConstants.slate100,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Assign multiple work events to an assignee.',
                          style: TextStyle(color: ThemeConstants.slate500, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Form Body
            Expanded(
              child: _isLoadingMasterData
                  ? const Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TitleField(
                            title: _title,
                            description: _description,
                            onTitleChanged: (val) => setState(() => _title = val),
                            onDescriptionChanged: (val) => setState(() => _description = val),
                          ),
                          const SizedBox(height: 32),
                          const Divider(color: ThemeConstants.slate800),
                          const SizedBox(height: 32),
                          
                          MasterDataFields(
                            structureType: _structureType,
                            workTypeId: _workTypeId,
                            workTypes: _getFilteredWorkTypes(),
                            onStructureTypeChanged: (val) {
                              if (val != null) {
                                setState(() {
                                  _structureType = val;
                                  _workTypeId = null;
                                });
                              }
                            },
                            onWorkTypeChanged: (val) => setState(() => _workTypeId = val),
                          ),
                          const SizedBox(height: 24),
                          
                          LocationField(
                            locationId: _locationId,
                            locations: _locations,
                            onChanged: (val) => setState(() => _locationId = val),
                          ),
                          const SizedBox(height: 32),
                          const Divider(color: ThemeConstants.slate800),
                          const SizedBox(height: 32),
                          
                          PriorityField(
                            priority: _priority,
                            onChanged: (val) => setState(() => _priority = val),
                          ),
                          const SizedBox(height: 32),
                          
                          ChecklistSection(
                            controller: _checklistController,
                            checklistItems: _checklistItems,
                            onAdd: _addChecklistItem,
                            onRemove: _removeChecklistItem,
                          ),
                        ],
                      ),
                    ),
            ),
            
            // Footer
            FooterButtons(
              isSaving: _isSaving,
              onCancel: () => Navigator.pop(context),
              onSave: _submitCreateEvent,
            ),
          ],
        ),
      ),
    );
  }
}
