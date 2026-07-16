import { prisma } from '../lib/db/prisma';

async function seedMasterData() {
  console.log('Seeding master data...');

  // 1. Roles
  const roles = [
    { name: 'Admin', code: 'admin', description: 'Full access to all modules and configurations.' },
    { name: 'Manager', code: 'manager', description: 'Manage events, work items, and assign tasks.' },
    { name: 'Editor', code: 'editor', description: 'Edit events and update statuses.' },
    { name: 'User', code: 'user', description: 'Read-only access to view events.' },
  ];

  // 2. Designations
  const designations = [
    { code: '1001', name: 'CEO' },
    { code: '1002', name: 'COO' },
    { code: '1003', name: 'Accountant' },
  ];

  // 3. Company Types
  const companyTypes = [
    { code: '10001', name: 'Default Business' },
    { code: '10002', name: 'Hotel' },
    { code: '10003', name: 'Hospital' },
    { code: '10004', name: 'Airline' },
    { code: '10005', name: 'Cafe' },
    { code: '10006', name: 'Government Office' },
  ];



  // Run initial lookup updates atomically inside a transaction
  await prisma.$transaction([
    ...roles.map((r) =>
      prisma.role.upsert({
        where: { code: r.code },
        update: { name: r.name, description: r.description },
        create: r,
      })
    ),
    ...designations.map((d) =>
      prisma.designation.upsert({
        where: { code: d.code },
        update: { name: d.name },
        create: d,
      })
    ),
    ...companyTypes.map((c) =>
      prisma.companyType.upsert({
        where: { code: c.code },
        update: { name: c.name },
        create: c,
      })
    ),

  ], { timeout: 30000 });

  console.log('Roles, designations, and company types upserted.');

  const workTypes = [
    { name: 'Cleaning', code: 'CLEANING', category: 'structured' },
    { name: 'Laundry', code: 'LAUNDRY', category: 'structured' },
    { name: 'Waste Collection', code: 'WASTE_MGMT', category: 'structured' },
    { name: 'Preventive Maintenance', code: 'PREVENTIVE', category: 'structured' },
    { name: 'Security Patrol', code: 'SECURITY', category: 'structured' },
    { name: 'Room Preparation', code: 'ROOM_PREP', category: 'semi-structured' },
    { name: 'Equipment Setup', code: 'EQUIP_SETUP', category: 'semi-structured' },
    { name: 'Minor Repair', code: 'MINOR_REPAIR', category: 'semi-structured' },
    { name: 'Inspection', code: 'INSPECTION', category: 'semi-structured' },
    { name: 'Furniture Move', code: 'FURN_MOVE', category: 'semi-structured' },
    { name: 'Emergency Repair', code: 'EMERG_REPAIR', category: 'unstructured' },
    { name: 'Water Leak', code: 'WATER_LEAK', category: 'unstructured' },
    { name: 'Flood Cleanup', code: 'FLOOD_CLEAN', category: 'unstructured' },
    { name: 'Power Failure', code: 'POWER_FAIL', category: 'unstructured' },
    { name: 'Accident Response', code: 'ACCIDENT_RESP', category: 'unstructured' },
  ];

  await prisma.$transaction(
    workTypes.map((w) =>
      prisma.workType.upsert({
        where: { code: w.code },
        update: { name: w.name, category: w.category },
        create: w,
      })
    ),
    { timeout: 30000 }
  );
  console.log('Hierarchical work types seeded.');

  console.log('Master data seeding finished.');
}

async function seedDemoData() {
  console.log('Seeding demo data...');

  // 1. Teams
  const teamsCount = await prisma.team.count();
  if (teamsCount === 0) {
    await prisma.team.createMany({
      data: [
        { name: 'In-house Electrical Team', type: 'internal', contactInfo: 'elect@facility.com' },
        { name: 'In-house Plumbing Team', type: 'internal', contactInfo: 'plumb@facility.com' },
        { name: 'In-house Cleaning Team', type: 'internal', contactInfo: 'clean@facility.com' },
        { name: 'In-house Security Team', type: 'internal', contactInfo: 'sec@facility.com' },
        { name: 'External HVAC Services Ltd', type: 'external', contactInfo: 'info@hvacservices.com' },
        { name: 'External Apex Security Solutions', type: 'external', contactInfo: 'contact@apexsecurity.com' },
        { name: 'External PaintCraft Inc.', type: 'external', contactInfo: 'projects@paintcraft.com' },
      ],
    });
    console.log('Teams seeded.');
  }

  // 2. Locations Hierarchy
  const locationsCount = await prisma.location.count();
  if (locationsCount === 0) {
    // Sites
    const siteA = await prisma.location.create({ data: { name: 'Site A', type: 'site' } });
    const siteB = await prisma.location.create({ data: { name: 'Site B', type: 'site' } });

    // Buildings
    const b1 = await prisma.location.create({ data: { name: 'Building 1', type: 'building', parentId: siteA.id } });
    const b2 = await prisma.location.create({ data: { name: 'Building 2', type: 'building', parentId: siteB.id } });

    // Floors
    const f1 = await prisma.location.create({ data: { name: 'Floor 1', type: 'floor', parentId: b1.id } });
    const f2 = await prisma.location.create({ data: { name: 'Floor 2', type: 'floor', parentId: b1.id } });
    const fb2 = await prisma.location.create({ data: { name: 'Floor 1', type: 'floor', parentId: b2.id } });

    // Rooms
    const r101 = await prisma.location.create({ data: { name: 'Room 101', type: 'room', parentId: f1.id } });
    const r102 = await prisma.location.create({ data: { name: 'Room 102', type: 'room', parentId: f1.id } });
    const r201 = await prisma.location.create({ data: { name: 'Room 201', type: 'room', parentId: f2.id } });
    const lobby = await prisma.location.create({ data: { name: 'Lobby', type: 'room', parentId: fb2.id } });
    const r103 = await prisma.location.create({ data: { name: 'Room 103', type: 'room', parentId: fb2.id } });

    // Assets / Equipment
    await prisma.location.createMany({
      data: [
        { name: 'AC Unit 101', type: 'asset', parentId: r101.id },
        { name: 'Main Power Board', type: 'asset', parentId: r101.id },
        { name: 'Water Pump A', type: 'asset', parentId: r102.id },
        { name: 'Server Rack 1', type: 'asset', parentId: r201.id },
        { name: 'CCTV Camera 1', type: 'asset', parentId: lobby.id },
        { name: 'Water Heater B', type: 'asset', parentId: r103.id },
      ],
    });
    console.log('Location hierarchy seeded.');
  }

  // 3. Facility Types
  const facTypesCount = await prisma.facilityType.count();
  if (facTypesCount === 0) {
    await prisma.facilityType.createMany({
      data: [
        { name: 'Scheduled Facility', code: 'SCHEDULED' },
        { name: 'Unscheduled Facility', code: 'UNSCHEDULED' },
      ],
    });
    console.log('Facility types seeded.');
  }

  // 4. Facilities
  const facCount = await prisma.facility.count();
  if (facCount === 0) {
    const schedType = await prisma.facilityType.findFirst({ where: { code: 'SCHEDULED' } });
    const unschedType = await prisma.facilityType.findFirst({ where: { code: 'UNSCHEDULED' } });
    const lobbyLoc = await prisma.location.findFirst({ where: { name: 'Lobby' } });
    const acLoc = await prisma.location.findFirst({ where: { name: 'AC Unit 101' } });

    if (schedType && unschedType && lobbyLoc && acLoc) {
      await prisma.facility.createMany({
        data: [
          { name: 'Main Lobby HVAC System', facilityTypeId: schedType.id, locationId: lobbyLoc.id },
          { name: 'AC Condenser Block 101', facilityTypeId: schedType.id, locationId: acLoc.id },
          { name: 'Emergency Water Pump Facility', facilityTypeId: unschedType.id, locationId: lobbyLoc.id },
        ],
      });
      console.log('Facilities seeded.');
    }
  }

  // 5. Work Items (Templates)
  const itemsCount = await prisma.workItem.count();
  if (itemsCount === 0) {
    const fac1 = await prisma.facility.findFirst({ where: { name: 'Main Lobby HVAC System' } });
    const fac2 = await prisma.facility.findFirst({ where: { name: 'AC Condenser Block 101' } });
    const cleanType = await prisma.workType.findUnique({ where: { code: 'CLEANING' } });
    const elecType = await prisma.workType.findUnique({ where: { code: 'PREVENTIVE' } });

    if (fac1 && fac2 && cleanType && elecType) {
      await prisma.workItem.createMany({
        data: [
          { title: 'HVAC Filter Cleaning', description: 'Clean the filters in the lobby air conditioner units.', facilityId: fac1.id, workTypeId: elecType.id, estimatedDuration: 1.5 },
          { title: 'Lobby Duct Sanitization', description: 'Sanitize the main ducts using specialized antibacterial solutions.', facilityId: fac1.id, workTypeId: cleanType.id, estimatedDuration: 3.0 },
          { title: 'AC Condenser Inspection', description: 'Verify condenser electrical connections and coolant levels.', facilityId: fac2.id, workTypeId: elecType.id, estimatedDuration: 2.0 },
        ],
      });
      console.log('Work Items templates seeded.');
    }
  }

  // 6. Work Events and Results
  const eventsCount = await prisma.workEvent.count();
  if (eventsCount === 0) {
    const cleanType = await prisma.workType.findUnique({ where: { code: 'CLEANING' } });
    const elecType = await prisma.workType.findUnique({ where: { code: 'PREVENTIVE' } });
    const plumbType = await prisma.workType.findUnique({ where: { code: 'MINOR_REPAIR' } });
    const hvacType = await prisma.workType.findUnique({ where: { code: 'INSPECTION' } });

    const lobbyLoc = await prisma.location.findFirst({ where: { name: 'Lobby' } });
    const acUnitLoc = await prisma.location.findFirst({ where: { name: 'AC Unit 101' } });
    const pumpLoc = await prisma.location.findFirst({ where: { name: 'Water Pump A' } });
    const rackLoc = await prisma.location.findFirst({ where: { name: 'Server Rack 1' } });

    const cleanTeam = await prisma.team.findFirst({ where: { name: 'In-house Cleaning Team' } });
    const elecTeam = await prisma.team.findFirst({ where: { name: 'In-house Electrical Team' } });
    const plumbTeam = await prisma.team.findFirst({ where: { name: 'In-house Plumbing Team' } });
    const hvacTeam = await prisma.team.findFirst({ where: { name: 'External HVAC Services Ltd' } });

    if (cleanType && elecType && plumbType && hvacType && lobbyLoc && acUnitLoc && pumpLoc && rackLoc && cleanTeam && elecTeam && plumbTeam && hvacTeam) {
      // 1. Monthly Lobby Deep Cleaning
      const e1 = await prisma.workEvent.create({
        data: {
          title: 'Monthly Lobby Deep Cleaning',
          description: 'Perform standard monthly deep cleaning in the main lobby, including window washing, carpet vacuuming, and sanitization of high-touch surfaces.',
          workTypeId: cleanType.id,
          locationId: lobbyLoc.id,
          scheduleType: 'scheduled',
          structureType: 'structured',
          executionType: 'internal',
          priority: 'medium',
          status: 'completed',
          assignedTeamId: cleanTeam.id,
          checklist: JSON.stringify([
            { id: 1, text: 'Vacuum carpet area', done: true },
            { id: 2, text: 'Wash main glass doors', done: true },
            { id: 3, text: 'Sanitize reception counter', done: true },
            { id: 4, text: 'Dust lobby lighting fixtures', done: true }
          ]),
        },
      });

      // Seeding result for lobby cleaning
      await prisma.workResult.create({
        data: {
          workEventId: e1.id,
          completionDetails: 'All checklist items completed successfully. Lobby looks clean and sanitization logs have been updated.',
          findings: 'No issues. Minor wear on reception counter carpet noticed, should be cleaned again in 2 weeks.',
          materialsUsed: JSON.stringify([
            { material: 'Sanitizer fluid (L)', cost: 12.50, quantity: 2 },
            { material: 'Microfiber cloths', cost: 2.00, quantity: 4 }
          ]),
          laborHours: 3.5,
          cost: 33.00,
          attachments: JSON.stringify(['lobby_clean_after.jpg']),
        },
      });

      // 2. AC Unit Bi-Annual Maintenance
      await prisma.workEvent.create({
        data: {
          title: 'AC Unit 101 Bi-Annual Maintenance',
          description: 'Inspect condenser coils, clean filter, and check coolant pressure levels.',
          workTypeId: hvacType.id,
          locationId: acUnitLoc.id,
          scheduleType: 'scheduled',
          structureType: 'semi-structured',
          executionType: 'external',
          priority: 'high',
          status: 'in_progress',
          assignedTeamId: hvacTeam.id,
          checklist: JSON.stringify([
            { id: 1, text: 'Clean air filters', done: true },
            { id: 2, text: 'Inspect refrigerant levels', done: false },
            { id: 3, text: 'Check thermostat operation', done: false }
          ]),
        },
      });

      // 3. Water Pump Leak
      await prisma.workEvent.create({
        data: {
          title: 'Water Pump Leak in Room 102',
          description: 'Water observed pooling near the main water pump connector. Emergency repair requested.',
          workTypeId: plumbType.id,
          locationId: pumpLoc.id,
          scheduleType: 'unscheduled',
          structureType: 'unstructured',
          executionType: 'internal',
          priority: 'critical',
          status: 'assigned',
          assignedTeamId: plumbTeam.id,
        },
      });

      // 4. Server Room Power Inspection
      await prisma.workEvent.create({
        data: {
          title: 'Bi-Weekly Server Room Power Inspection',
          description: 'Check electrical loads, UPS batteries status, and backup generator transfer switch.',
          workTypeId: elecType.id,
          locationId: rackLoc.id,
          scheduleType: 'scheduled',
          structureType: 'structured',
          executionType: 'internal',
          priority: 'high',
          status: 'created',
          assignedTeamId: elecTeam.id,
          checklist: JSON.stringify([
            { id: 1, text: 'Record battery voltages of UPS units', done: false },
            { id: 2, text: 'Verify fan operation on main breaker panel', done: false },
            { id: 3, text: 'Measure current on primary circuit breaker', done: false }
          ]),
        },
      });

      console.log('Sample work events and results seeded.');
    }
  }

  console.log('Demo data seeding finished.');
}

async function main() {
  await seedMasterData();
  await seedDemoData();
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
