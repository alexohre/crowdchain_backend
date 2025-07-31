// Test setup file
import 'jest';

// Global test configuration
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001'; // Use different port for tests
});

afterAll(() => {
  // Cleanup after all tests
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCreatorApplication(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidCreatorApplication(received) {
    const requiredFields = ['walletAddress', 'fullName', 'email', 'status', 'submittedAt'];
    const hasAllFields = requiredFields.every(field => received.hasOwnProperty(field));
    
    const validStatuses = ['pending', 'approved', 'rejected'];
    const hasValidStatus = validStatuses.includes(received.status);
    
    const hasValidDate = received.submittedAt instanceof Date || 
                        (typeof received.submittedAt === 'string' && !isNaN(Date.parse(received.submittedAt)));

    if (hasAllFields && hasValidStatus && hasValidDate) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid creator application`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid creator application with required fields: ${requiredFields.join(', ')} and valid status/date`,
        pass: false,
      };
    }
  },
});
