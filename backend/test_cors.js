// fetch is native

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/clients', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:4200',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization'
      }
    });
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
  } catch (err) {
    console.error(err);
  }
}
test();
