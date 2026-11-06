/**
 * Comprehensive End-to-End Real-World Scenario Test Suite for BookLoop
 * Covers all 4 Scenarios from Section 20 + Password Reset + Moderation & Suspension
 */

const assert = require('assert');
const app = require('../app');
const connectDB = require('../config/db');

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

const runAllScenarios = async () => {
  await connectDB();
  console.log('================================================================');
  console.log(' BOOKLOOP FULL END-TO-END SCENARIO & WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

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

  const timestamp = Date.now();
  const userAEmail = `usera_${timestamp}@university.edu`;
  const userBEmail = `userb_${timestamp}@university.edu`;
  const userCPasswordResetEmail = `userc_reset_${timestamp}@university.edu`;
  let userAToken = '';
  let userBToken = '';
  let userCToken = '';
  let userAId = '';
  let userBId = '';
  let userCId = '';
  let adminToken = '';

  let javaBookId = '';
  let exchangeBookAId = '';
  let exchangeBookBId = '';
  let donateBookId = '';
  let purchaseReqId = '';
  let exchangeReqId = '';
  let reportId = '';
  let resetPasswordToken = '';

  // -------------------------------------------------------------------------
  // SCENARIO 1: BOOK PURCHASE, NOTIFICATIONS, MESSAGING & VERIFIED REVIEW
  // -------------------------------------------------------------------------
  console.log('--- SCENARIO 1: User A & User B Purchase Flow & Reviews ---');

  await test('1.1: Register User A (Seller)', async () => {
    const res = await makeRequest(app, { method: 'POST', url: '/api/auth/register' }, {
      name: 'Alice Cooper',
      email: userAEmail,
      password: 'Password123!',
      phone: '+1 555-0101',
      college: 'MIT School of Engineering',
      location: 'Cambridge, MA'
    });
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert(res.body.token, 'Token expected');
    userAToken = res.body.token;
    userAId = res.body.user._id || res.body.user.id;
  });

  await test('1.2: Register User B (Buyer)', async () => {
    const res = await makeRequest(app, { method: 'POST', url: '/api/auth/register' }, {
      name: 'Bob Martin',
      email: userBEmail,
      password: 'Password123!',
      phone: '+1 555-0202',
      college: 'MIT School of Engineering',
      location: 'Cambridge, MA'
    });
    assert.strictEqual(res.status, 201);
    assert(res.body.token);
    userBToken = res.body.token;
    userBId = res.body.user._id || res.body.user.id;
  });

  await test('1.3: User A uploads Java Programming textbook', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/books',
        headers: { authorization: `Bearer ${userAToken}` }
      },
      {
        title: 'Effective Java Programming 3rd Edition',
        author: 'Joshua Bloch',
        category: 'Programming',
        description: 'Complete best practices guide for Java developers. Crisp condition.',
        condition: 'Like New',
        listingType: 'Sell',
        price: 32,
        originalPrice: 55,
        edition: '3rd',
        subject: 'Object-Oriented Programming',
        campusPickupLocation: 'Stata Center Lobby',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c']
      }
    );
    assert.strictEqual(res.status, 201);
    assert(res.body.book._id);
    javaBookId = res.body.book._id;
  });

  await test('1.4: User B searches for "Java", finds the book, and verifies details', async () => {
    const res = await makeRequest(app, {
      method: 'GET',
      url: `/api/books?search=Java&page=1&limit=10`
    });
    assert.strictEqual(res.status, 200);
    const found = res.body.books.find((b) => b._id.toString() === javaBookId.toString());
    assert(found, 'Java book must appear in search results');
    assert.strictEqual(found.title, 'Effective Java Programming 3rd Edition');
  });

  await test('1.5: User B saves Java book to Wishlist', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: `/api/wishlist/${javaBookId}`,
        headers: { authorization: `Bearer ${userBToken}` }
      }
    );
    assert([200, 201].includes(res.status), `Expected 200 or 201, got ${res.status}`);
    assert.strictEqual(res.body.isSaved, true);
  });

  await test('1.6: User B sends Purchase Request to User A', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/purchases',
        headers: { authorization: `Bearer ${userBToken}` }
      },
      {
        bookId: javaBookId,
        offeredPrice: 30,
        message: 'Hi Alice, can we meet at Stata Center tomorrow at 3pm for $30?'
      }
    );
    assert.strictEqual(res.status, 201);
    assert(res.body.purchase._id);
    purchaseReqId = res.body.purchase._id;
  });

  await test('1.7: User B sends real-time chat message to User A', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/messages',
        headers: { authorization: `Bearer ${userBToken}` }
      },
      {
        receiverId: userAId,
        bookId: javaBookId,
        content: 'Hey Alice! I just sent you a purchase request for Effective Java.'
      }
    );
    assert.strictEqual(res.status, 201);
    const msgText = res.body.message.message || res.body.message.content;
    assert.strictEqual(msgText, 'Hey Alice! I just sent you a purchase request for Effective Java.');
  });

  await test('1.8: User A checks Notifications and receives purchase alert', async () => {
    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/notifications',
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert(res.body.notifications.length > 0, 'User A must have received notifications');
    const notif = res.body.notifications[0];
    assert(notif._id, 'Notification must have ID');

    // Mark notification as read
    const readRes = await makeRequest(app, {
      method: 'PUT',
      url: `/api/notifications/${notif._id}/read`,
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert.strictEqual(readRes.status, 200);
  });

  await test('1.9: User A accepts Purchase Request (marks book in-transaction)', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/purchases/${purchaseReqId}/status`,
        headers: { authorization: `Bearer ${userAToken}` }
      },
      { status: 'accepted' }
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.purchase.status, 'accepted');

    // Verify book is marked in-transaction
    const bookCheck = await makeRequest(app, { method: 'GET', url: `/api/books/${javaBookId}` });
    assert.strictEqual(bookCheck.body.book.availability, 'in-transaction');
  });

  await test('1.10: User A replies to User B in chat', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/messages',
        headers: { authorization: `Bearer ${userAToken}` }
      },
      {
        receiverId: userBId,
        bookId: javaBookId,
        content: 'Deal! See you at 3pm tomorrow by the coffee shop in Stata Center.'
      }
    );
    assert.strictEqual(res.status, 201);
  });

  await test('1.11: User A marks transaction as Completed (marks book sold)', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/purchases/${purchaseReqId}/status`,
        headers: { authorization: `Bearer ${userAToken}` }
      },
      { status: 'completed' }
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.purchase.status, 'completed');

    // Verify book is now marked sold
    const bookCheck = await makeRequest(app, { method: 'GET', url: `/api/books/${javaBookId}` });
    assert.strictEqual(bookCheck.body.book.availability, 'sold');
  });

  await test('1.12: User B submits verified 5-star Review for User A', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/reviews',
        headers: { authorization: `Bearer ${userBToken}` }
      },
      {
        reviewedUser: userAId,
        bookId: javaBookId,
        transactionId: purchaseReqId,
        transactionType: 'Purchase',
        rating: 5,
        comment: 'Book was in pristine condition, Alice was punctual and courteous!'
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.review.rating, 5);

    // Verify User A reviews list
    const revCheck = await makeRequest(app, {
      method: 'GET',
      url: `/api/reviews/user/${userAId}`
    });
    assert.strictEqual(revCheck.status, 200);
    assert.strictEqual(revCheck.body.count, 1);
    assert.strictEqual(revCheck.body.averageRating, 5);
  });

  // -------------------------------------------------------------------------
  // SCENARIO 2: BOOK EXCHANGE WORKFLOW
  // -------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Peer-to-Peer Book Exchange Flow ---');

  await test('2.1: User A lists Algorithms book for Exchange', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/books',
        headers: { authorization: `Bearer ${userAToken}` }
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Cormen, Leiserson, Rivest, Stein',
        category: 'Data Structures and Algorithms',
        description: 'Hardcover edition. Great condition.',
        condition: 'Good',
        listingType: 'Exchange',
        price: 0,
        subject: 'Algorithms',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c']
      }
    );
    assert.strictEqual(res.status, 201);
    exchangeBookAId = res.body.book._id;
  });

  await test('2.2: User B lists Artificial Intelligence book to offer for trade', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/books',
        headers: { authorization: `Bearer ${userBToken}` }
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        category: 'Artificial Intelligence',
        description: '4th Edition. Excellent condition.',
        condition: 'Like New',
        listingType: 'Exchange',
        price: 0,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c']
      }
    );
    assert.strictEqual(res.status, 201);
    exchangeBookBId = res.body.book._id;
  });

  await test('2.3: User B proposes exchange: Book B for Book A', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/exchanges',
        headers: { authorization: `Bearer ${userBToken}` }
      },
      {
        bookRequestedId: exchangeBookAId,
        bookOfferedId: exchangeBookBId,
        message: 'Would you be interested in trading your CLRS for my AI Modern Approach?'
      }
    );
    assert.strictEqual(res.status, 201);
    assert(res.body.exchange._id);
    exchangeReqId = res.body.exchange._id;
  });

  await test('2.4: User A reviews and accepts the exchange proposal', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/exchanges/${exchangeReqId}/status`,
        headers: { authorization: `Bearer ${userAToken}` }
      },
      { status: 'accepted' }
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.exchange.status, 'accepted');
  });

  await test('2.5: User A marks exchange as Completed (both books marked exchanged)', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/exchanges/${exchangeReqId}/status`,
        headers: { authorization: `Bearer ${userAToken}` }
      },
      { status: 'completed' }
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.exchange.status, 'completed');

    // Both books should now be marked exchanged
    const checkA = await makeRequest(app, { method: 'GET', url: `/api/books/${exchangeBookAId}` });
    const checkB = await makeRequest(app, { method: 'GET', url: `/api/books/${exchangeBookBId}` });
    assert.strictEqual(checkA.body.book.availability, 'exchanged');
    assert.strictEqual(checkB.body.book.availability, 'exchanged');
  });

  // -------------------------------------------------------------------------
  // SCENARIO 3: FREE BOOK DONATION WORKFLOW
  // -------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Free Book Donation System ---');

  await test('3.1: User A lists Calculus textbook for Free Donation', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/books',
        headers: { authorization: `Bearer ${userAToken}` }
      },
      {
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        category: 'Mathematics',
        description: 'Free to any student in need of Calculus reference.',
        condition: 'Acceptable',
        listingType: 'Donate',
        price: 0,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c']
      }
    );
    assert.strictEqual(res.status, 201);
    donateBookId = res.body.book._id;
  });

  await test('3.2: User B submits donation request explaining their need', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/donations/request',
        headers: { authorization: `Bearer ${userBToken}` }
      },
      {
        bookId: donateBookId,
        purpose: 'I am taking Multivariable Calculus this semester on financial aid and would appreciate this textbook!'
      }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
  });

  // -------------------------------------------------------------------------
  // SCENARIO 4: COMMUNITY SAFETY, REPORTING, ADMIN MODERATION & SUSPENSION
  // -------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Community Safety, Reporting & Admin Moderation ---');

  await test('4.1: Login as Administrator', async () => {
    const res = await makeRequest(app, { method: 'POST', url: '/api/auth/login' }, {
      email: 'admin@bookloop.org',
      password: 'password123'
    });
    assert.strictEqual(res.status, 200);
    assert(res.body.token);
    adminToken = res.body.token;
  });

  await test('4.2: User B submits community safety report on suspicious book/user', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'POST',
        url: '/api/reports',
        headers: { authorization: `Bearer ${userBToken}` }
      },
      {
        reportedBookId: javaBookId,
        reportedUserId: userAId,
        reason: 'counterfeit',
        details: 'Checking moderation reporting pipeline - test report.'
      }
    );
    assert.strictEqual(res.status, 201);
    assert(res.body.report._id);
    reportId = res.body.report._id;
  });

  await test('4.3: Admin inspects reports queue and resolves the report', async () => {
    const listRes = await makeRequest(app, {
      method: 'GET',
      url: '/api/reports',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(listRes.status, 200);
    assert(listRes.body.reports.length > 0);

    const resolveRes = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/reports/${reportId}/status`,
        headers: { authorization: `Bearer ${adminToken}` }
      },
      {
        status: 'resolved',
        resolutionNotes: 'Reviewed by administrator and resolved.'
      }
    );
    assert.strictEqual(resolveRes.status, 200);
    assert.strictEqual(resolveRes.body.report.status, 'resolved');
  });

  await test('4.4: Admin toggles user suspension (blocks login when suspended)', async () => {
    // Suspend User A
    const suspendRes = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/admin/users/${userAId}/suspend`,
        headers: { authorization: `Bearer ${adminToken}` }
      }
    );
    assert.strictEqual(suspendRes.status, 200);
    assert.strictEqual(suspendRes.body.isSuspended, true);

    // User A attempts to login -> must receive 403 Forbidden
    const loginAttempt = await makeRequest(app, { method: 'POST', url: '/api/auth/login' }, {
      email: userAEmail,
      password: 'Password123!'
    });
    assert.strictEqual(loginAttempt.status, 403, 'Suspended user must be blocked from logging in');

    // Reactivate User A
    const unsuspendRes = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/admin/users/${userAId}/suspend`,
        headers: { authorization: `Bearer ${adminToken}` }
      }
    );
    assert.strictEqual(unsuspendRes.status, 200);
    assert.strictEqual(unsuspendRes.body.isSuspended, false);

    // Verify User A can login again
    const loginSuccess = await makeRequest(app, { method: 'POST', url: '/api/auth/login' }, {
      email: userAEmail,
      password: 'Password123!'
    });
    assert.strictEqual(loginSuccess.status, 200);
  });

  // -------------------------------------------------------------------------
  // SCENARIO 5: PASSWORD RESET FLOW
  // -------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Password Recovery & Reset Lifecycle ---');

  await test('5.1: Register User C for password reset test', async () => {
    const res = await makeRequest(app, { method: 'POST', url: '/api/auth/register' }, {
      name: 'Charlie Davis',
      email: userCPasswordResetEmail,
      password: 'OldPassword123!',
      phone: '+1 555-0303',
      college: 'Harvard University',
      location: 'Cambridge, MA'
    });
    assert.strictEqual(res.status, 201);
  });

  await test('5.2: User C requests Forgot Password', async () => {
    const res = await makeRequest(app, { method: 'POST', url: '/api/auth/forgotpassword' }, {
      email: userCPasswordResetEmail
    });
    assert.strictEqual(res.status, 200);
    assert(res.body.resetToken, 'Must generate reset token');
    resetPasswordToken = res.body.resetToken;
  });

  await test('5.3: User C resets password with token', async () => {
    const res = await makeRequest(
      app,
      {
        method: 'PUT',
        url: `/api/auth/resetpassword/${resetPasswordToken}`
      },
      {
        password: 'NewStrongPassword456!',
        confirmPassword: 'NewStrongPassword456!'
      }
    );
    assert.strictEqual(res.status, 200);
    assert(res.body.token, 'Must return new JWT token on password reset');
  });

  await test('5.4: User C logs in with the newly updated password', async () => {
    // Old password must fail
    const failRes = await makeRequest(app, { method: 'POST', url: '/api/auth/login' }, {
      email: userCPasswordResetEmail,
      password: 'OldPassword123!'
    });
    assert.strictEqual(failRes.status, 401);

    // New password must succeed
    const successRes = await makeRequest(app, { method: 'POST', url: '/api/auth/login' }, {
      email: userCPasswordResetEmail,
      password: 'NewStrongPassword456!'
    });
    assert.strictEqual(successRes.status, 200);
    assert(successRes.body.token);
  });

  console.log('\n================================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runAllScenarios().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
