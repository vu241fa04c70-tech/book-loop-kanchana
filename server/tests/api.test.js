// Full End-to-End API Automated Verification Test Suite
const assert = require('assert');
const app = require('../app');

const makeRequest = (app, options, body = null) => {
  return new Promise((resolve) => {
    const mockSocket = {
      remoteAddress: '127.0.0.1',
      encrypted: false,
      destroy: () => {}
    };

    const req = {
      method: options.method || 'GET',
      url: options.url,
      headers: options.headers || {},
      body: body || {},
      query: options.query || {},
      socket: mockSocket,
      connection: mockSocket
    };

    if (req.url.includes('?')) {
      const parts = req.url.split('?');
      req.url = parts[0];
      const params = new URLSearchParams(parts[1]);
      for (const [key, value] of params.entries()) {
        req.query[key] = value;
      }
    }

    const resHeaders = {};
    let responseData = '';

    const res = {
      statusCode: 200,
      setHeader: (name, value) => { resHeaders[name.toLowerCase()] = value; },
      getHeader: (name) => resHeaders[name.toLowerCase()],
      removeHeader: (name) => { delete resHeaders[name.toLowerCase()]; },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.setHeader('content-type', 'application/json');
        responseData = data;
        resolve({
          status: this.statusCode,
          headers: resHeaders,
          body: data
        });
      },
      send: function (data) {
        responseData = data;
        resolve({
          status: this.statusCode,
          headers: resHeaders,
          body: data
        });
      },
      end: function () {
        resolve({
          status: this.statusCode,
          headers: resHeaders,
          body: responseData
        });
      }
    };

    app.handle(req, res);
  });
};

const runTests = async () => {
  console.log('--- STARTING COMPREHENSIVE BOOKLOOP END-TO-END API TESTS ---\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  };

  let student1Token = '';
  let student2Token = '';
  let adminToken = '';
  let book1Id = '';
  let book2Id = '';
  let testExchangeId = '';
  let testPurchaseId = '';

  // 1. Health
  await test('GET /api/health returns online status', async () => {
    const res = await makeRequest(app, { method: 'GET', url: '/api/health' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'online');
  });

  // 2. Auth: Student 1 (Alex)
  await test('Login as Student 1 (Alex)', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'content-type': 'application/json' }
    }, { email: 'alex@student.edu', password: 'password123' });
    assert.strictEqual(res.status, 200);
    student1Token = res.body.token;
  });

  // 3. Auth: Student 2 (Samantha)
  await test('Login as Student 2 (Samantha)', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'content-type': 'application/json' }
    }, { email: 'samantha@student.edu', password: 'password123' });
    assert.strictEqual(res.status, 200);
    student2Token = res.body.token;
  });

  // 4. Auth: Admin
  await test('Login as Admin', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'content-type': 'application/json' }
    }, { email: 'admin@bookloop.org', password: 'password123' });
    assert.strictEqual(res.status, 200);
    adminToken = res.body.token;
  });

  // 5. Books retrieval
  await test('Retrieve books and identify listings for exchange', async () => {
    const res = await makeRequest(app, { method: 'GET', url: '/api/books?page=1&limit=20' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.books.length >= 2);
    // Find book by Alex and book by Samantha
    const alexBook = res.body.books.find(b => (b.seller._id || b.seller).toString() === '66a100000000000000000001');
    const samBook = res.body.books.find(b => (b.seller._id || b.seller).toString() === '66a100000000000000000002');
    assert.ok(alexBook, 'Alex book found');
    assert.ok(samBook, 'Samantha book found');
    book1Id = alexBook._id;
    book2Id = samBook._id;
  });

  // 6. Book Exchange Workflow: Request from Samantha for Alex book
  await test('POST /api/exchanges - Samantha requests exchange with Alex', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/exchanges',
      headers: {
        authorization: `Bearer ${student2Token}`,
        'content-type': 'application/json'
      }
    }, {
      bookRequestedId: book1Id,
      bookOfferedId: book2Id,
      message: 'Hi Alex! I would love to trade my book for your CLRS Algorithms.',
      meetingLocation: 'Tressider Student Union'
    });
    // May succeed or return 400 if active request already exists in seed
    assert.ok(res.status === 201 || (res.status === 400 && res.body.message.includes('already exists')));
  });

  // 7. Book Exchange: Alex views received exchanges
  await test('GET /api/exchanges/received - Alex checks received exchange proposals', async () => {
    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/exchanges/received',
      headers: { authorization: `Bearer ${student1Token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.exchanges));
    if (res.body.exchanges.length > 0) {
      testExchangeId = res.body.exchanges[0]._id;
    }
  });

  // 8. Book Exchange: Alex accepts request
  await test('PUT /api/exchanges/:id/status - Alex accepts exchange request', async () => {
    if (!testExchangeId) return;
    const res = await makeRequest(app, {
      method: 'PUT',
      url: `/api/exchanges/${testExchangeId}/status`,
      headers: {
        authorization: `Bearer ${student1Token}`,
        'content-type': 'application/json'
      }
    }, {
      status: 'accepted',
      meetingLocation: 'Campus Green Library Lobby'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.exchange.status, 'accepted');
  });

  // 9. Purchase Workflow: Samantha requests to purchase from Alex
  await test('POST /api/purchases - Samantha sends purchase request to Alex', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/purchases',
      headers: {
        authorization: `Bearer ${student2Token}`,
        'content-type': 'application/json'
      }
    }, {
      bookId: book1Id,
      offeredPrice: 42,
      message: 'Can pay in cash or campus card at the library meetup.'
    });
    assert.ok(res.status === 201 || (res.status === 400 && res.body.message.includes('already have')));
  });

  // 10. Purchase: Alex checks received purchases
  await test('GET /api/purchases/received - Alex views received purchase requests', async () => {
    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/purchases/received',
      headers: { authorization: `Bearer ${student1Token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.purchases));
    if (res.body.purchases.length > 0) {
      testPurchaseId = res.body.purchases[0]._id;
    }
  });

  // 11. Messaging: Send message from Samantha to Alex
  await test('POST /api/messages - Samantha messages Alex about meetup', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/messages',
      headers: {
        authorization: `Bearer ${student2Token}`,
        'content-type': 'application/json'
      }
    }, {
      receiverId: '66a100000000000000000001',
      message: 'See you at 3 PM at the Green Library stairs!',
      bookId: book1Id
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.message._id);
  });

  // 12. Messaging: Get user conversations
  await test('GET /api/messages/conversations/all - Alex retrieves conversation list', async () => {
    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/messages/conversations/all',
      headers: { authorization: `Bearer ${student1Token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.conversations));
  });

  // 13. Donations: Request a donated book
  await test('POST /api/donations/request - Student requests free donated textbook', async () => {
    const donationsRes = await makeRequest(app, { method: 'GET', url: '/api/donations' });
    assert.strictEqual(donationsRes.status, 200);
    const freeBook = donationsRes.body.books.find(b => (b.seller._id || b.seller).toString() !== '66a100000000000000000001');
    if (freeBook) {
      const res = await makeRequest(app, {
        method: 'POST',
        url: '/api/donations/request',
        headers: {
          authorization: `Bearer ${student1Token}`,
          'content-type': 'application/json'
        }
      }, {
        bookId: freeBook._id,
        purpose: 'Studying for upcoming midterms',
        message: 'Thank you so much for offering this free book!'
      });
      assert.ok(res.status === 201 || (res.status === 400 && res.body.message.includes('already')));
    }
  });

  // 14. Admin: Statistics & Transactions Oversight
  await test('GET /api/admin/statistics & /api/admin/transactions', async () => {
    const statsRes = await makeRequest(app, {
      method: 'GET',
      url: '/api/admin/statistics',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsRes.body.stats.estimatedTotalSavings > 0);

    const txRes = await makeRequest(app, {
      method: 'GET',
      url: '/api/admin/transactions',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(txRes.status, 200);
    assert.ok(Array.isArray(txRes.body.purchases));
    assert.ok(Array.isArray(txRes.body.exchanges));
  });

  console.log(`\n--- ALL END-TO-END TESTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
  else process.exit(0);
};

runTests();
