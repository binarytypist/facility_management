const http = require('http');

const routes = [
  '/api/locations',
  '/api/master-data',
  '/api/clients',
  '/api/agencies',
  '/api/work-events',
  '/api/dashboard/stats',
  '/api/work-items',
  '/api/facilities'
];

async function warmup() {
  for (const route of routes) {
    console.log(`Warming up ${route}...`);
    try {
      const res = await fetch(`http://127.0.0.1:3000${route}`, { method: 'OPTIONS' });
      console.log(`  OPTIONS: ${res.status}`);
      // Also warmup the GET compilation
      // But we need Authorization for GET, so it will return 401 but still compile the route!
      const getRes = await fetch(`http://127.0.0.1:3000${route}`, { method: 'GET' });
      console.log(`  GET: ${getRes.status}`);
    } catch (e) {
      console.error(`  Error:`, e.message);
    }
  }
  console.log('Warmup complete.');
}

warmup();
