import express, { Request, Response } from 'express';
import prisma from '../db';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(ClerkExpressRequireAuth({}) as any);

router.get('/', async (req: any, res: Response) => {
  try {
    const userId = req.auth.userId;

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: true
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    res.json({
      savedJobs: savedJobs.map(sj => sj.job)
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req: any, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    // Check if the user exists in our database, if not, create them
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@placeholder.com`, // Fallback since email requires extra Clerk setup
      }
    });

    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      }
    });

    if (existingSavedJob) {
      // Unsave
      await prisma.savedJob.delete({
        where: { id: existingSavedJob.id }
      });
      res.json({ message: 'Job unsaved', saved: false });
    } else {
      // Save
      await prisma.savedJob.create({
        data: {
          userId,
          jobId
        }
      });
      res.json({ message: 'Job saved', saved: true });
    }
  } catch (error) {
    console.error('Error toggling saved job:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
