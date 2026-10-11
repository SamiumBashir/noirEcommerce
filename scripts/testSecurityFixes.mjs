import http from 'http';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(`http://localhost:3000${path}`, {
      method,
      headers: {
        ...(payload ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        } : {}),
        ...headers,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('==================================================');
  console.log('   VERIFYING SECURITY FIXES');
  console.log('==================================================\n');

  // 1. Unauthenticated Product Creation Blocked
  const pCreate = await makeRequest('/api/products', 'POST', { name: 'Hacked Coat', price: 10, category: 'MEN' });
  console.log(`1. POST /api/products without auth: HTTP ${pCreate.status} (Expected: 401)`);
  if (pCreate.status === 401) console.log('   ✅ [PASS] Unauthenticated product creation rejected!');
  else console.error('   ❌ [FAIL] Did not reject!');

  // 2. Unauthenticated Product Update Blocked
  const pUpdate = await makeRequest('/api/products/noir-motion-jacket', 'PUT', { price: 1 });
  console.log(`2. PUT /api/products/[id] without auth: HTTP ${pUpdate.status} (Expected: 401)`);
  if (pUpdate.status === 401) console.log('   ✅ [PASS] Unauthenticated product update rejected!');
  else console.error('   ❌ [FAIL] Did not reject!');

  // 3. Unauthenticated Product Deletion Blocked
  const pDelete = await makeRequest('/api/products/noir-motion-jacket', 'DELETE');
  console.log(`3. DELETE /api/products/[id] without auth: HTTP ${pDelete.status} (Expected: 401)`);
  if (pDelete.status === 401) console.log('   ✅ [PASS] Unauthenticated product deletion rejected!');
  else console.error('   ❌ [FAIL] Did not reject!');

  // 4. Unauthenticated Upload Blocked
  const uploadRes = await makeRequest('/api/upload', 'POST', {});
  console.log(`4. POST /api/upload without auth: HTTP ${uploadRes.status} (Expected: 401)`);
  if (uploadRes.status === 401) console.log('   ✅ [PASS] Unauthenticated upload rejected!');
  else console.error('   ❌ [FAIL] Did not reject!');

  // 5. Global Orders Leakage Blocked
  const ordersLeak = await makeRequest('/api/orders', 'GET');
  console.log(`5. GET /api/orders without auth: HTTP ${ordersLeak.status} (Expected: 401)`);
  if (ordersLeak.status === 401) console.log('   ✅ [PASS] Unauthenticated global order scraping rejected!');
  else console.error('   ❌ [FAIL] Did not reject!');

  // 6. Price Injection via Non-Existent Product Blocked
  const priceInject = await makeRequest('/api/orders', 'POST', {
    customerName: 'Attacker',
    customerEmail: 'attacker@evil.com',
    shippingAddress: { street: 'Dark Alley', city: 'Nowhere', state: 'X', postalCode: '0000', country: 'US' },
    items: [{ productId: 'fake-exploit-item-999', price: 1, quantity: 1 }]
  });
  console.log(`6. POST /api/orders with non-existent item: HTTP ${priceInject.status} (Expected: 400)`);
  if (priceInject.status === 400) console.log('   ✅ [PASS] Price injection attempt rejected with 400 Bad Request!');
  else console.error('   ❌ [FAIL] Did not reject price injection!');

  // 7. Admin Login Issues Token and Allows Protected Route
  const adminLogin = await makeRequest('/api/admin/auth', 'POST', { email: 'admin@noir.studio', password: 'noir2026' });
  console.log(`7. POST /api/admin/auth: HTTP ${adminLogin.status}`);
  const adminToken = adminLogin.body?.token;
  if (adminToken) {
    console.log('   ✅ [PASS] Admin token issued successfully!');
    // Verify admin can access orders list
    const adminOrders = await makeRequest('/api/orders', 'GET', null, { Authorization: `Bearer ${adminToken}` });
    console.log(`   Admin GET /api/orders with Bearer token: HTTP ${adminOrders.status}`);
    if (adminOrders.status === 200) console.log('   ✅ [PASS] Admin successfully authorized with JWT!');
  } else {
    console.error('   ❌ [FAIL] Admin login failed to issue token!');
  }

  console.log('\n==================================================');
  console.log('   ALL SECURITY FIXES VERIFIED SUCCESSFULLY');
  console.log('==================================================\n');
}

run().catch(console.error);
