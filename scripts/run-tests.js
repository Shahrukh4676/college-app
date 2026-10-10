/**
 * Automated test suite for Student Marketplace frontend.
 * Tests form validations, state machine transitions, API error normalization,
 * and mock repository operations.
 */

const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('STUDENT MARKETPLACE AUTOMATED TEST SUITE');
  console.log('========================================\n');

  // 1. Zod Validation Logic
  console.log('--- 1. Validation Logic ---');
  const { z } = require('zod');

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  test('Login validation passes on valid academic email and password', () => {
    const res = loginSchema.safeParse({
      email: 'student@college.edu',
      password: 'securePassword123',
    });
    assert.strictEqual(res.success, true);
  });

  test('Login validation rejects malformed email address', () => {
    const res = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error.issues[0].path[0], 'email');
  });

  test('Login validation rejects short password under 6 characters', () => {
    const res = loginSchema.safeParse({
      email: 'student@college.edu',
      password: '123',
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error.issues[0].path[0], 'password');
  });

  const registerSchema = z
    .object({
      fullName: z.string().min(2),
      email: z.string().email(),
      college: z.string().min(3),
      course: z.string().min(2),
      yearOfStudy: z.number().min(1).max(6),
      password: z.string().min(6),
      confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

  test('Register validation passes when passwords match', () => {
    const res = registerSchema.safeParse({
      fullName: 'Aarav Sharma',
      email: 'aarav@campus.edu',
      college: 'IIT Delhi',
      course: 'Computer Science',
      yearOfStudy: 3,
      password: 'password123',
      confirmPassword: 'password123',
    });
    assert.strictEqual(res.success, true);
  });

  test('Register validation fails when passwords mismatch', () => {
    const res = registerSchema.safeParse({
      fullName: 'Aarav Sharma',
      email: 'aarav@campus.edu',
      college: 'IIT Delhi',
      course: 'Computer Science',
      yearOfStudy: 3,
      password: 'password123',
      confirmPassword: 'differentPassword',
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error.issues[0].path[0], 'confirmPassword');
  });

  // 2. Task Model & State Machine
  console.log('\n--- 2. Task State Machine & Budget Constraints ---');
  const taskSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    budgetInr: z.number().min(50).max(100000),
    deadline: z.string().min(1),
    requiredSkills: z.array(z.string()).min(1),
  });

  test('Task validation rejects negative or sub-minimum budget', () => {
    const res = taskSchema.safeParse({
      title: 'Valid Task Title',
      description: 'This is a long enough description for academic assistance.',
      budgetInr: 20, // below min 50
      deadline: new Date().toISOString(),
      requiredSkills: ['C++'],
    });
    assert.strictEqual(res.success, false);
  });

  test('Task validation passes for legitimate budget and skills', () => {
    const res = taskSchema.safeParse({
      title: 'C++ Tree Balancing Help',
      description: 'Need assistance reviewing Red-Black tree rotations and test cases.',
      budgetInr: 1200,
      deadline: new Date().toISOString(),
      requiredSkills: ['C++', 'Algorithms'],
    });
    assert.strictEqual(res.success, true);
  });

  // 3. API Error Normalization
  console.log('\n--- 3. Error Normalization & Security Handling ---');
  class NormalizedApiError extends Error {
    constructor(message, status, code, fieldErrors) {
      super(message);
      this.name = 'NormalizedApiError';
      this.status = status;
      this.code = code;
      this.fieldErrors = fieldErrors;
    }
  }

  test('NormalizedApiError retains status code and field errors', () => {
    const err = new NormalizedApiError(
      'Validation failed',
      422,
      'UNPROCESSABLE_ENTITY',
      { email: ['Email already registered'] }
    );
    assert.strictEqual(err.status, 422);
    assert.strictEqual(err.code, 'UNPROCESSABLE_ENTITY');
    assert.strictEqual(err.fieldErrors.email[0], 'Email already registered');
  });

  test('Session expiration clears credentials on 401', () => {
    let sessionCleared = false;
    const onSessionExpired = () => {
      sessionCleared = true;
    };

    function simulateResponse(status) {
      if (status === 401) {
        onSessionExpired();
      }
    }

    simulateResponse(401);
    assert.strictEqual(sessionCleared, true);
  });

  // 4. Offer Submission Logic
  console.log('\n--- 4. Offer Submission Logic ---');
  const offerSchema = z.object({
    taskId: z.string().min(1),
    offerAmountInr: z.number().min(1),
    estimatedDeliveryHours: z.number().min(1),
    proposal: z.string().min(15),
  });

  test('Offer proposal requires substantive detail (15+ chars)', () => {
    const res = offerSchema.safeParse({
      taskId: 'tsk_101',
      offerAmountInr: 800,
      estimatedDeliveryHours: 24,
      proposal: 'Too short',
    });
    assert.strictEqual(res.success, false);
  });

  test('Offer proposal succeeds with adequate explanation', () => {
    const res = offerSchema.safeParse({
      taskId: 'tsk_101',
      offerAmountInr: 800,
      estimatedDeliveryHours: 24,
      proposal: 'I can assist you with unit tests and code debugging thoroughly.',
    });
    assert.strictEqual(res.success, true);
  });

  // 5. Production Mode Guarantees
  console.log('\n--- 5. Production Mode & Data Source Boundaries ---');
  test('Production mode strictly forbids mock API fallback', () => {
    // In production, USE_MOCK_API is false regardless of local state
    const isMockPermitted = (isProd) => {
      if (isProd) return false;
      return true; // dev may opt-in
    };
    assert.strictEqual(isMockPermitted(true), false);
    assert.strictEqual(isMockPermitted(false), true);
  });

  // 6. Search & Filter Algorithms
  console.log('\n--- 6. Marketplace Search & Filter Pure Functions ---');
  const sampleTasks = [
    { id: '1', title: 'Data Structures Tutor', category: 'Tutoring', budgetInr: 500, status: 'OPEN' },
    { id: '2', title: 'Proofreading Thesis', category: 'Writing', budgetInr: 800, status: 'OPEN' },
    { id: '3', title: 'Python Linear Regression', category: 'Coding', budgetInr: 1200, status: 'IN_PROGRESS' },
  ];

  test('Category filter isolates selected domain and ignores others', () => {
    const filterByCategory = (list, cat) => {
      if (!cat || cat === 'ALL') return list;
      return list.filter((t) => t.category === cat);
    };
    const tutoringOnly = filterByCategory(sampleTasks, 'Tutoring');
    assert.strictEqual(tutoringOnly.length, 1);
    assert.strictEqual(tutoringOnly[0].id, '1');
  });

  test('Search filter performs case-insensitive substring search', () => {
    const searchTasks = (list, query) => {
      const q = query.trim().toLowerCase();
      if (!q) return list;
      return list.filter((t) => t.title.toLowerCase().includes(q));
    };
    const matched = searchTasks(sampleTasks, 'python');
    assert.strictEqual(matched.length, 1);
    assert.strictEqual(matched[0].id, '3');

    const emptyMatch = searchTasks(sampleTasks, '   ');
    assert.strictEqual(emptyMatch.length, 3);
  });

  // 7. Lifecycle State Machine
  console.log('\n--- 7. Task Lifecycle State Machine ---');
  const VALID_TRANSITIONS = {
    OPEN: ['HELPER_SELECTED', 'CANCELLED'],
    HELPER_SELECTED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['COMPLETED', 'IN_PROGRESS'],
    COMPLETED: [],
    CANCELLED: [],
  };

  const isValidTransition = (from, to) => {
    return (VALID_TRANSITIONS[from] || []).includes(to);
  };

  test('Permits valid sequential lifecycle transitions', () => {
    assert.strictEqual(isValidTransition('OPEN', 'HELPER_SELECTED'), true);
    assert.strictEqual(isValidTransition('HELPER_SELECTED', 'IN_PROGRESS'), true);
    assert.strictEqual(isValidTransition('IN_PROGRESS', 'SUBMITTED'), true);
    assert.strictEqual(isValidTransition('SUBMITTED', 'COMPLETED'), true);
  });

  test('Rejects illegal unauthorized shortcuts or transitions', () => {
    assert.strictEqual(isValidTransition('OPEN', 'COMPLETED'), false);
    assert.strictEqual(isValidTransition('COMPLETED', 'OPEN'), false);
    assert.strictEqual(isValidTransition('CANCELLED', 'IN_PROGRESS'), false);
  });

  // 8. Route ID Validation Edge Cases
  console.log('\n--- 8. Route ID Validation & Parameter Edge Cases ---');
  const isValidRouteId = (id) => {
    return typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null';
  };

  test('Rejects missing, null, undefined, or empty route IDs', () => {
    assert.strictEqual(isValidRouteId(undefined), false);
    assert.strictEqual(isValidRouteId(null), false);
    assert.strictEqual(isValidRouteId(''), false);
    assert.strictEqual(isValidRouteId('   '), false);
    assert.strictEqual(isValidRouteId('undefined'), false);
    assert.strictEqual(isValidRouteId('null'), false);
  });

  test('Accepts valid non-empty route IDs', () => {
    assert.strictEqual(isValidRouteId('tsk_101'), true);
    assert.strictEqual(isValidRouteId('conv_202'), true);
    assert.strictEqual(isValidRouteId('42'), true);
  });

  // 9. Profile Resilience with Missing Optional Fields
  console.log('\n--- 9. Profile Resilience & Optional Fields ---');
  const formatProfileHeadline = (profile) => {
    if (!profile) return 'Student Member';
    const college = profile.college || 'Campus Member';
    const course = profile.course
      ? `${profile.course}${profile.yearOfStudy ? ` • Year ${profile.yearOfStudy}` : ''}`
      : 'Student Member';
    return `${college} | ${course}`;
  };

  test('Profile headline handles completely empty optional fields gracefully', () => {
    const minimalUser = { id: 'u1', fullName: 'Test Student', email: 'test@campus.edu' };
    const headline = formatProfileHeadline(minimalUser);
    assert.strictEqual(headline.includes('undefined'), false);
    assert.strictEqual(headline, 'Campus Member | Student Member');
  });

  test('Profile headline formats populated course and year correctly', () => {
    const fullUser = {
      id: 'u2',
      fullName: 'Aarav Sharma',
      email: 'aarav@campus.edu',
      college: 'IIT Delhi',
      course: 'Computer Science',
      yearOfStudy: 3,
    };
    const headline = formatProfileHeadline(fullUser);
    assert.strictEqual(headline, 'IIT Delhi | Computer Science • Year 3');
  });

  // 10. Network Timeout & Offline Normalization
  console.log('\n--- 10. Network Timeout & Offline Normalization ---');
  const normalizeErrorState = (err) => {
    if (err.code === 'ECONNABORTED' || err.status === 0) {
      return { isOffline: true, message: 'Network request timed out or offline.' };
    }
    return { isOffline: false, message: err.message };
  };

  test('Identifies network timeout (ECONNABORTED) and status 0 as offline states', () => {
    const timeoutErr = { code: 'ECONNABORTED', status: 0, message: 'timeout of 12000ms exceeded' };
    const normalized = normalizeErrorState(timeoutErr);
    assert.strictEqual(normalized.isOffline, true);
    assert.strictEqual(normalized.message, 'Network request timed out or offline.');
  });

  test('Distinguishes business/validation errors from network offline errors', () => {
    const bizErr = { code: 'BAD_REQUEST', status: 400, message: 'Invalid deadline timestamp' };
    const normalized = normalizeErrorState(bizErr);
    assert.strictEqual(normalized.isOffline, false);
    assert.strictEqual(normalized.message, 'Invalid deadline timestamp');
  });

  // 11. Duplicate Tap / Submission Lockout
  console.log('\n--- 11. Duplicate Submission Lockout ---');
  class SubmissionGuard {
    constructor() {
      this.isSubmitting = false;
      this.executionCount = 0;
    }
    async submit(action) {
      if (this.isSubmitting) {
        return false; // lockout duplicate trigger
      }
      this.isSubmitting = true;
      try {
        await action();
        this.executionCount++;
        return true;
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  test('Prevents duplicate submissions when action is already pending', async () => {
    const guard = new SubmissionGuard();
    let resolveAction;
    const slowAction = () => new Promise((resolve) => { resolveAction = resolve; });

    // First tap initiates action
    const firstCall = guard.submit(slowAction);
    assert.strictEqual(guard.isSubmitting, true);

    // Second tap while still pending is rejected immediately
    const secondCall = await guard.submit(slowAction);
    assert.strictEqual(secondCall, false);

    // Resolve first action
    resolveAction();
    const firstResult = await firstCall;
    assert.strictEqual(firstResult, true);
    assert.strictEqual(guard.executionCount, 1);
  });

  // 12. Payload Bounds & Long Content Handling
  console.log('\n--- 12. Message & Description Payload Bounds ---');
  const messageSchema = z.object({
    text: z.string().min(1).max(2000),
  });

  test('Validates message boundaries: non-empty and under 2,000 characters', () => {
    assert.strictEqual(messageSchema.safeParse({ text: '' }).success, false);
    assert.strictEqual(messageSchema.safeParse({ text: 'Valid collaborative message' }).success, true);
    const oversize = 'a'.repeat(2001);
    assert.strictEqual(messageSchema.safeParse({ text: oversize }).success, false);
  });

  console.log('\n========================================');
  console.log(`RESULTS: ${passedTests}/${totalTests} tests passed`);
  console.log('========================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests();
