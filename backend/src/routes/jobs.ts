import express, { Request, Response } from 'express';
import prisma from '../db';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, remote, page = '1', limit = '20' } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (remote === 'true') {
      whereClause.remote_status = true;
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNumber
      }),
      prisma.job.count({
        where: whereClause
      })
    ]);

    res.json({
      jobs,
      totalCount,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalCount / limitNumber)
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
