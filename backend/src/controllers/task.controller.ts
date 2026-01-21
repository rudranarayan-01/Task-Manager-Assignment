import { Response } from 'express';
import { prisma } from '../lib/client';
import { AuthRequest } from '../middleware/auth.middleware';


// GET /tasks

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const { status, search, page = '1', limit = '10' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const searchString = typeof search === 'string' ? search : undefined;
        
        // FIX: Only set statusString if status is a non-empty string
        const statusString = (typeof status === 'string' && status !== "") ? status : undefined;

        console.log("Fetching tasks for User ID:", req.user?.userId, "| Status Filter:", statusString);

        const tasks = await prisma.task.findMany({
            where: {
                userId: req.user?.userId,
                // If statusString is undefined, Prisma ignores this filter and shows ALL
                status: statusString, 
                title: searchString ? { contains: searchString } : undefined,
            },
            take: take,
            skip: skip,
            orderBy: { createdAt: 'desc' },
        });

        console.log(`Found ${tasks.length} tasks`);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
};

// CREATE TASK
export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body;
        
        // Creating task associated with authenticated user
        const task = await prisma.task.create({
            data: {
                title,
                description,
                userId: req.user!.userId,
                status: "TODO"
            }
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: "Task creation failed" });
    }
};


// PATCH /tasks/:id
export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const updatedTask = await prisma.task.update({
            where: {
                id: id as string,
                userId: req.user?.userId
            },
            data: req.body,
        });

        res.json(updatedTask);
    } catch (error) {
        res.status(404).json({ message: "Task not found or unauthorized" });
    }
};


// DELETE /tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.task.delete({
            where: {
                id: id as string,
                userId: req.user?.userId
            },
        });

        res.status(204).send();
    } catch (error) {
        res.status(404).json({ message: "Task not found or unauthorized" });
    }
};


//  PATCH /tasks/:id/toggle
export const toggleTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Find task and ensure ownership
        const task = await prisma.task.findFirst({
            where: { id: id as string, userId: req.user?.userId },
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const newStatus = task.status === "DONE" ? "TODO" : "DONE";

        const updatedTask = await prisma.task.update({
            where: { id: task.id },
            data: { status: newStatus },
        });

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Toggle operation failed" });
    }
};