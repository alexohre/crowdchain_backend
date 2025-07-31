import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { testConnection, initializeDatabase, closeDatabase } from './config/database';
import { CreatorService } from './services/creatorService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (store in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Database initialization
const initializeServer = async () => {
  try {
    console.log('🚀 Starting CrowdChain Backend Server...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your PostgreSQL configuration.');
      process.exit(1);
    }
    
    // Initialize database connection
    await initializeDatabase();
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

app.get('/', async (req: Request, res: Response) => {
  try {
    const stats = await CreatorService.getApplicationStats();
    
    res.json({ 
      message: 'CrowdChain Backend API', 
      status: 'running',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL connected',
      endpoints: {
        'GET /': 'API status and information',
        'POST /api/creator-application': 'Submit creator application',
        'GET /api/creator-applications': 'List all creator applications',
        'GET /api/creator-application/:walletAddress': 'Get creator application by wallet address',
        'PATCH /api/creator-application/:walletAddress/status': 'Update creator application status'
      },
      applicationStats: stats
    });
  } catch (error) {
    console.error('Error getting application stats:', error);
    res.json({ 
      message: 'CrowdChain Backend API', 
      status: 'running',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL connection error',
      endpoints: {
        'GET /': 'API status and information',
        'POST /api/creator-application': 'Submit creator application',
        'GET /api/creator-applications': 'List all creator applications',
        'GET /api/creator-application/:walletAddress': 'Get creator application by wallet address',
        'PATCH /api/creator-application/:walletAddress/status': 'Update creator application status'
      }
    });
  }
});

// Submit creator application with file uploads
app.post('/api/creator-application', upload.array('verificationDocs', 5), async (req: Request, res: Response) => {
  try {
    console.log('🔥 RECEIVED CREATOR APPLICATION:');
    console.log('📝 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('📎 Files:', req.files ? `${(req.files as Express.Multer.File[]).length} files uploaded` : 'No files');
    console.log('🌐 Headers:', req.headers);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    const { 
      walletAddress, 
      fullName, 
      email, 
      professionalTitle,
      linkedIn,
      website,
      // Backward compatibility fields
      bio, 
      experience, 
      portfolio 
    } = req.body;

    // Validate required fields
    if (!walletAddress || !fullName || !email || !professionalTitle) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletAddress, fullName, email, professionalTitle' 
      });
    }

    // Use new fields or fall back to old fields for backward compatibility
    const finalProfessionalTitle = professionalTitle || experience;
    const finalWebsite = website || portfolio;
    const finalLinkedIn = linkedIn;
    
    // Create a bio from professional title for backward compatibility
    const finalBio = bio || `Professional with expertise in ${finalProfessionalTitle}`;
    const finalProjectDescription = finalBio;

    // Check if application already exists for this wallet
    const existingApplication = await CreatorService.getApplicationByWallet(walletAddress);

    if (existingApplication) {
      return res.status(409).json({ 
        error: 'Application already exists for this wallet address' 
      });
    }

    // Process uploaded verification documents
    const files = req.files as Express.Multer.File[];
    const verificationDocsData: string[] = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        // Convert file to base64 for storage
        const base64Data = file.buffer.toString('base64');
        const fileData = `data:${file.mimetype};base64,${base64Data}`;
        verificationDocsData.push(fileData);
        
        console.log(`📄 File processed: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
      }
    }

    // Create new application in database using Prisma format
    const applicationData = {
      walletAddress: walletAddress.toLowerCase(),
      fullName: fullName,
      email,
      professionalTitle: finalProfessionalTitle,
      linkedinUrl: finalLinkedIn,
      websiteUrl: finalWebsite,
      verificationDocs: verificationDocsData,
      status: 'PENDING' as const
    };

    const newApplication = await CreatorService.createApplication(applicationData);
    
    console.log('✅ APPLICATION SAVED TO DATABASE:');
    console.log('📁 Saved Application:', JSON.stringify(newApplication, null, 2));
    
    // Get updated stats
    const stats = await CreatorService.getApplicationStats();
    console.log('📊 Application Stats:', stats);

    res.status(201).json({ 
      message: 'Creator application submitted successfully',
      applicationId: newApplication.id
    });
  } catch (error) {
    console.error('Error submitting creator application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all creator applications (admin only)
app.get('/api/creator-applications', async (req: Request, res: Response) => {
  try {
    const applications = await CreatorService.getAllApplications();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching creator applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get creator application by wallet address
app.get('/api/creator-application/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const application = await CreatorService.getApplicationByWallet(walletAddress);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching creator application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update application status (admin only)
app.patch('/api/creator-application/:walletAddress/status', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be PENDING, APPROVED, or REJECTED' });
    }

    const updatedApplication = await CreatorService.updateApplicationStatus(walletAddress, status);

    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ 
      message: 'Application status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server with database initialization
const startServer = async () => {
  await initializeServer();
  
  app.listen(PORT, () => {
    console.log(`🎉 CrowdChain Backend Server running on port ${PORT}`);
    console.log(`📊 API Status: http://localhost:${PORT}`);
    console.log(`📡 Creator Applications: http://localhost:${PORT}/api/creator-applications`);
  });
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down server gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down server gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
