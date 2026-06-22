const fs = require('fs');
const path = require('path');

const dbTsPath = path.join(__dirname, 'backend/lib/db.ts');
let content = fs.readFileSync(dbTsPath, 'utf8');

// 1. Replace service categories seed
const categoriesSeedRegex = /await connection\.query\(`\s*INSERT IGNORE INTO service_categories \(name, code\) VALUES[\s\S]*?`\);/m;
const newCategoriesSeed = `await connection.query(\`
      INSERT IGNORE INTO service_categories (name, code) VALUES
      ('Hard Services', 'HARD'),
      ('Soft Services', 'SOFT')
    \`);`;
content = content.replace(categoriesSeedRegex, newCategoriesSeed);

// 2. Replace the getCatId block
const getCatRegex = /const getCatId = async[\s\S]*?const assetId = await getCatId\('ASSET_MGMT'\);/m;
const newGetCat = `const getCatId = async (code: string) => {
      const [[res]] = await connection.query('SELECT id FROM service_categories WHERE code = ?', [code]) as any;
      return res?.id || null;
    };

    const hardId = await getCatId('HARD');
    const softId = await getCatId('SOFT');`;
content = content.replace(getCatRegex, newGetCat);

// 3. Replace work_types seed
const workTypesRegex = /await connection\.query\(`\s*INSERT INTO work_types \(name, code, service_category_id\) VALUES[\s\S]*?ON DUPLICATE KEY UPDATE service_category_id = VALUES\(service_category_id\)\s*`, \[[\s\S]*?\]\);/m;
const newWorkTypes = `await connection.query(\`
      INSERT INTO work_types (name, code, service_category_id) VALUES
      ('Electrical systems', 'ELEC_SYS', ?),
      ('HVAC (air conditioning, heating)', 'HVAC', ?),
      ('Plumbing', 'PLUMBING', ?),
      ('Fire safety systems', 'FIRE_SYS', ?),
      ('Building repairs', 'BLDG_REPAIRS', ?),
      ('Cleaning / housekeeping', 'CLEANING', ?),
      ('Waste management', 'WASTE_MGMT', ?),
      ('Pest control', 'PEST_CTRL', ?),
      ('Security', 'SECURITY', ?),
      ('Gardening / landscaping', 'GARDENING', ?)
      ON DUPLICATE KEY UPDATE service_category_id = VALUES(service_category_id)
    \`, [
      hardId, hardId, hardId, hardId, hardId,
      softId, softId, softId, softId, softId
    ]);`;
content = content.replace(workTypesRegex, newWorkTypes);

// 4. Update the seed for work_events
// Replace fetching
const fetchRegex1 = /const \[\[cleanCat\]\] = await connection\.query[\s\S]*?const \[\[emergType\]\] = await connection\.query[\s\S]*?'EMERGENCY'\)"\) as any\[\];/m;
const newFetch1 = `const [[softCat]] = await connection.query("SELECT id FROM service_categories WHERE code = 'SOFT'") as any[];
      const [[hardCat]] = await connection.query("SELECT id FROM service_categories WHERE code = 'HARD'") as any[];

      const [[cleanType]] = await connection.query("SELECT id FROM work_types WHERE code = 'CLEANING'") as any[];
      const [[elecType]] = await connection.query("SELECT id FROM work_types WHERE code = 'ELEC_SYS'") as any[];
      const [[plumbType]] = await connection.query("SELECT id FROM work_types WHERE code = 'PLUMBING'") as any[];
      const [[hvacType]] = await connection.query("SELECT id FROM work_types WHERE code = 'HVAC'") as any[];`;
content = content.replace(fetchRegex1, newFetch1);

// Replace usages in work_events seed
content = content.replace(/cleanCat\.id/g, 'softCat.id');
content = content.replace(/elecCat\.id/g, 'hardCat.id');
content = content.replace(/plumbCat\.id/g, 'hardCat.id');
content = content.replace(/hvacCat\.id/g, 'hardCat.id');

content = content.replace(/inspectType\.id/g, 'cleanType.id');
content = content.replace(/prevType\.id/g, 'elecType.id');
content = content.replace(/repairType\.id/g, 'plumbType.id');
content = content.replace(/emergType\.id/g, 'hvacType.id');

// 5. Update the seed for work_items
const fetchRegex2 = /const \[\[cleanCat\]\] = await connection\.query[\s\S]*?const \[\[prevType\]\] = await connection\.query[\s\S]*?'PREVENTIVE'\)"\) as any\[\];/m;
const newFetch2 = `const [[softCat]] = await connection.query("SELECT id FROM service_categories WHERE code = 'SOFT'") as any[];
      const [[hardCat]] = await connection.query("SELECT id FROM service_categories WHERE code = 'HARD'") as any[];
      const [[cleanType]] = await connection.query("SELECT id FROM work_types WHERE code = 'CLEANING'") as any[];
      const [[hvacType]] = await connection.query("SELECT id FROM work_types WHERE code = 'HVAC'") as any[];`;
content = content.replace(fetchRegex2, newFetch2);

fs.writeFileSync(dbTsPath, content);
console.log('db.ts updated successfully.');
