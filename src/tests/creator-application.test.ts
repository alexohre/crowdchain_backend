import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Mock the server setup similar to index.ts
const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for tests
let creatorApplications: Array<{
  walletAddress: string;
  fullName: string;
  email: string;
  bio?: string;
  experience?: string;
  portfolio?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}> = [];

// API endpoints for testing
app.post('/api/creator-application', (req, res) => {
  try {
    const { walletAddress, fullName, email, bio, experience, portfolio } = req.body;

    // Validate required fields
    if (!walletAddress || !fullName || !email) {
      return res.status(400).json({
        error: 'Missing required fields: walletAddress, fullName, email'
      });
    }

    // Check if application already exists
    const existingApplication = creatorApplications.find(
      app => app.walletAddress === walletAddress
    );

    if (existingApplication) {
      return res.status(409).json({
        error: 'Creator application already exists for this wallet address'
      });
    }

    // Create new application
    const newApplication = {
      walletAddress,
      fullName,
      email,
      bio: bio || '',
      experience: experience || '',
      portfolio: portfolio || '',
      status: 'pending' as const,
      submittedAt: new Date()
    };

    creatorApplications.push(newApplication);

    res.status(201).json({
      message: 'Creator application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Error submitting creator application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/creator-applications', (req, res) => {
  res.json({
    applications: creatorApplications,
    total: creatorApplications.length
  });
});

app.get('/api/creator-application/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  
  const application = creatorApplications.find(
    app => app.walletAddress === walletAddress
  );

  if (!application) {
    return res.status(404).json({
      error: 'Creator application not found'
    });
  }

  res.json({ application });
});

app.patch('/api/creator-application/:walletAddress/status', (req, res) => {
  const { walletAddress } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status. Must be: pending, approved, or rejected'
    });
  }

  const applicationIndex = creatorApplications.findIndex(
    app => app.walletAddress === walletAddress
  );

  if (applicationIndex === -1) {
    return res.status(404).json({
      error: 'Creator application not found'
    });
  }

  creatorApplications[applicationIndex].status = status;

  res.json({
    message: 'Application status updated successfully',
    application: creatorApplications[applicationIndex]
  });
});

describe('Creator Application API', () => {
  beforeEach(() => {
    // Clear applications before each test
    creatorApplications = [];
  });

  describe('POST /api/creator-application', () => {
    it('should create a new creator application successfully', async () => {
      const applicationData = {
        walletAddress: '0x1234567890abcdef',
        fullName: 'John Doe',
        email: 'john@example.com',
        bio: 'Experienced blockchain developer',
        experience: '5 years in Web3',
        portfolio: 'https://johndoe.dev'
      };

      const response = await request(app)
        .post('/api/creator-application')
        .send(applicationData)
        .expect(201);

      expect(response.body.message).toBe('Creator application submitted successfully');
      expect(response.body.application).toMatchObject({
        walletAddress: applicationData.walletAddress,
        fullName: applicationData.fullName,
        email: applicationData.email,
        bio: applicationData.bio,
        experience: applicationData.experience,
        portfolio: applicationData.portfolio,
        status: 'pending'
      });
      expect(response.body.application.submittedAt).toBeDefined();
    });

    it('should create application with minimal required fields', async () => {
      const applicationData = {
        walletAddress: '0x1234567890abcdef',
        fullName: 'Jane Doe',
        email: 'jane@example.com'
      };

      const response = await request(app)
        .post('/api/creator-application')
        .send(applicationData)
        .expect(201);

      expect(response.body.application).toMatchObject({
        walletAddress: applicationData.walletAddress,
        fullName: applicationData.fullName,
        email: applicationData.email,
        bio: '',
        experience: '',
        portfolio: '',
        status: 'pending'
      });
    });

    it('should reject application with missing required fields', async () => {
      const incompleteData = {
        walletAddress: '0x1234567890abcdef',
        fullName: 'John Doe'
        // Missing email
      };

      const response = await request(app)
        .post('/api/creator-application')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields: walletAddress, fullName, email');
    });

    it('should reject duplicate applications for same wallet', async () => {
      const applicationData = {
        walletAddress: '0x1234567890abcdef',
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      // Submit first application
      await request(app)
        .post('/api/creator-application')
        .send(applicationData)
        .expect(201);

      // Try to submit duplicate
      const response = await request(app)
        .post('/api/creator-application')
        .send({
          ...applicationData,
          fullName: 'Different Name',
          email: 'different@example.com'
        })
        .expect(409);

      expect(response.body.error).toBe('Creator application already exists for this wallet address');
    });

    it('should handle server errors gracefully', async () => {
      // Mock a server error by sending invalid JSON
      const response = await request(app)
        .post('/api/creator-application')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('GET /api/creator-applications', () => {
    it('should return empty list when no applications exist', async () => {
      const response = await request(app)
        .get('/api/creator-applications')
        .expect(200);

      expect(response.body.applications).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return all creator applications', async () => {
      // Create test applications
      const app1 = {
        walletAddress: '0x1111',
        fullName: 'Creator 1',
        email: 'creator1@example.com'
      };
      const app2 = {
        walletAddress: '0x2222',
        fullName: 'Creator 2',
        email: 'creator2@example.com'
      };

      await request(app).post('/api/creator-application').send(app1);
      await request(app).post('/api/creator-application').send(app2);

      const response = await request(app)
        .get('/api/creator-applications')
        .expect(200);

      expect(response.body.applications).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.applications[0].walletAddress).toBe(app1.walletAddress);
      expect(response.body.applications[1].walletAddress).toBe(app2.walletAddress);
    });
  });

  describe('GET /api/creator-application/:walletAddress', () => {
    it('should return specific creator application', async () => {
      const applicationData = {
        walletAddress: '0x1234567890abcdef',
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      await request(app)
        .post('/api/creator-application')
        .send(applicationData);

      const response = await request(app)
        .get(`/api/creator-application/${applicationData.walletAddress}`)
        .expect(200);

      expect(response.body.application.walletAddress).toBe(applicationData.walletAddress);
      expect(response.body.application.fullName).toBe(applicationData.fullName);
      expect(response.body.application.email).toBe(applicationData.email);
    });

    it('should return 404 for non-existent application', async () => {
      const response = await request(app)
        .get('/api/creator-application/0xnonexistent')
        .expect(404);

      expect(response.body.error).toBe('Creator application not found');
    });
  });

  describe('PATCH /api/creator-application/:walletAddress/status', () => {
    beforeEach(async () => {
      // Create a test application
      await request(app)
        .post('/api/creator-application')
        .send({
          walletAddress: '0x1234567890abcdef',
          fullName: 'John Doe',
          email: 'john@example.com'
        });
    });

    it('should update application status to approved', async () => {
      const response = await request(app)
        .patch('/api/creator-application/0x1234567890abcdef/status')
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body.message).toBe('Application status updated successfully');
      expect(response.body.application.status).toBe('approved');
    });

    it('should update application status to rejected', async () => {
      const response = await request(app)
        .patch('/api/creator-application/0x1234567890abcdef/status')
        .send({ status: 'rejected' })
        .expect(200);

      expect(response.body.application.status).toBe('rejected');
    });

    it('should reject invalid status values', async () => {
      const response = await request(app)
        .patch('/api/creator-application/0x1234567890abcdef/status')
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.error).toBe('Invalid status. Must be: pending, approved, or rejected');
    });

    it('should return 404 for non-existent application', async () => {
      const response = await request(app)
        .patch('/api/creator-application/0xnonexistent/status')
        .send({ status: 'approved' })
        .expect(404);

      expect(response.body.error).toBe('Creator application not found');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete creator application workflow', async () => {
      const applicationData = {
        walletAddress: '0x1234567890abcdef',
        fullName: 'Alice Smith',
        email: 'alice@example.com',
        bio: 'DeFi protocol developer',
        experience: '3 years in blockchain',
        portfolio: 'https://alice.dev'
      };

      // 1. Submit application
      const submitResponse = await request(app)
        .post('/api/creator-application')
        .send(applicationData)
        .expect(201);

      expect(submitResponse.body.application.status).toBe('pending');

      // 2. Retrieve application
      const getResponse = await request(app)
        .get(`/api/creator-application/${applicationData.walletAddress}`)
        .expect(200);

      expect(getResponse.body.application.status).toBe('pending');

      // 3. Approve application
      const approveResponse = await request(app)
        .patch(`/api/creator-application/${applicationData.walletAddress}/status`)
        .send({ status: 'approved' })
        .expect(200);

      expect(approveResponse.body.application.status).toBe('approved');

      // 4. Verify in list
      const listResponse = await request(app)
        .get('/api/creator-applications')
        .expect(200);

      expect(listResponse.body.applications).toHaveLength(1);
      expect(listResponse.body.applications[0].status).toBe('approved');
    });

    it('should handle multiple applications with different statuses', async () => {
      const applications = [
        {
          walletAddress: '0x1111',
          fullName: 'Creator 1',
          email: 'creator1@example.com'
        },
        {
          walletAddress: '0x2222',
          fullName: 'Creator 2',
          email: 'creator2@example.com'
        },
        {
          walletAddress: '0x3333',
          fullName: 'Creator 3',
          email: 'creator3@example.com'
        }
      ];

      // Submit all applications
      for (const application of applications) {
        await request(app).post('/api/creator-application').send(application);
      }

      // Update statuses
      await request(app)
        .patch('/api/creator-application/0x1111/status')
        .send({ status: 'approved' });

      await request(app)
        .patch('/api/creator-application/0x2222/status')
        .send({ status: 'rejected' });

      // 0x3333 remains pending

      // Verify final state
      const response = await request(app)
        .get('/api/creator-applications')
        .expect(200);

      expect(response.body.applications).toHaveLength(3);
      
      const statusCounts = response.body.applications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      expect(statusCounts.approved).toBe(1);
      expect(statusCounts.rejected).toBe(1);
      expect(statusCounts.pending).toBe(1);
    });
  });
});
