import { prisma } from '../config/database';
import { CreatorApplication, ApplicationStatus } from '@prisma/client';

// Type for creating new applications (without auto-generated fields)
export interface CreateCreatorApplicationData {
  walletAddress: string;
  fullName: string;
  email: string;
  professionalTitle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  verificationDocs?: string[];
  status?: ApplicationStatus;
}

// Type for updating applications
export interface UpdateCreatorApplicationData {
  status?: ApplicationStatus;
  professionalTitle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  verificationDocs?: string[];
}

export class CreatorService {
  // Create a new creator application
  static async createApplication(applicationData: CreateCreatorApplicationData): Promise<CreatorApplication> {
    try {
      const application = await prisma.creatorApplication.create({
        data: {
          walletAddress: applicationData.walletAddress,
          fullName: applicationData.fullName,
          email: applicationData.email,
          professionalTitle: applicationData.professionalTitle,
          linkedinUrl: applicationData.linkedinUrl,
          websiteUrl: applicationData.websiteUrl,
          verificationDocs: applicationData.verificationDocs || [],
          status: applicationData.status || ApplicationStatus.PENDING,
        },
      });
      
      console.log('✅ Creator application created:', application.walletAddress);
      return application;
    } catch (error) {
      console.error('❌ Error creating creator application:', error);
      throw error;
    }
  }

  // Get creator application by wallet address
  static async getApplicationByWallet(walletAddress: string): Promise<CreatorApplication | null> {
    try {
      const application = await prisma.creatorApplication.findUnique({
        where: {
          walletAddress: walletAddress,
        },
      });
      
      if (application) {
        console.log('✅ Creator application found:', walletAddress);
      }
      return application;
    } catch (error) {
      console.error('❌ Error fetching creator application:', error);
      throw error;
    }
  }

  // Get all creator applications
  static async getAllApplications(): Promise<CreatorApplication[]> {
    try {
      const applications = await prisma.creatorApplication.findMany({
        orderBy: {
          submittedAt: 'desc',
        },
      });
      
      console.log(`✅ Retrieved ${applications.length} creator applications`);
      return applications;
    } catch (error) {
      console.error('❌ Error fetching all creator applications:', error);
      throw error;
    }
  }

  // Update application status
  static async updateApplicationStatus(
    walletAddress: string, 
    status: ApplicationStatus
  ): Promise<CreatorApplication | null> {
    try {
      const application = await prisma.creatorApplication.update({
        where: {
          walletAddress: walletAddress,
        },
        data: {
          status: status,
          updatedAt: new Date(),
        },
      });
      
      console.log(`✅ Updated application status to ${status} for:`, walletAddress);
      return application;
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      throw error;
    }
  }

  // Update application data
  static async updateApplication(
    walletAddress: string, 
    updateData: UpdateCreatorApplicationData
  ): Promise<CreatorApplication | null> {
    try {
      const application = await prisma.creatorApplication.update({
        where: {
          walletAddress: walletAddress,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });
      
      console.log('✅ Updated application for:', walletAddress);
      return application;
    } catch (error) {
      console.error('❌ Error updating application:', error);
      throw error;
    }
  }

  // Get applications by status
  static async getApplicationsByStatus(status: ApplicationStatus): Promise<CreatorApplication[]> {
    try {
      const applications = await prisma.creatorApplication.findMany({
        where: {
          status: status,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });
      
      console.log(`✅ Retrieved ${applications.length} ${status} applications`);
      return applications;
    } catch (error) {
      console.error(`❌ Error fetching ${status} applications:`, error);
      throw error;
    }
  }

  // Get application statistics
  static async getApplicationStats(): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    try {
      const [total, pending, approved, rejected] = await Promise.all([
        prisma.creatorApplication.count(),
        prisma.creatorApplication.count({ where: { status: ApplicationStatus.PENDING } }),
        prisma.creatorApplication.count({ where: { status: ApplicationStatus.APPROVED } }),
        prisma.creatorApplication.count({ where: { status: ApplicationStatus.REJECTED } }),
      ]);
      
      const stats = { total, pending, approved, rejected };
      console.log('✅ Application statistics retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching application statistics:', error);
      throw error;
    }
  }

  // Delete application (for admin use)
  static async deleteApplication(walletAddress: string): Promise<boolean> {
    try {
      await prisma.creatorApplication.delete({
        where: {
          walletAddress: walletAddress,
        },
      });
      
      console.log('✅ Deleted application for:', walletAddress);
      return true;
    } catch (error) {
      console.error('❌ Error deleting application:', error);
      throw error;
    }
  }
}
