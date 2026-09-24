import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Ticket } from '../models/Ticket';
import { Comment } from '../models/Comment';
import { Activity } from '../models/Activity';
import mongoose from 'mongoose';

// Helper to calculate SLA due date based on priority
const calculateDueAt = (priority: string): Date => {
  const date = new Date();
  switch (priority) {
    case 'Critical': date.setHours(date.getHours() + 4); break;
    case 'High': date.setHours(date.getHours() + 12); break;
    case 'Medium': date.setHours(date.getHours() + 24); break;
    case 'Low': default: date.setHours(date.getHours() + 48); break;
  }
  return date;
};

// @desc    Create a new ticket
// @route   POST /api/tickets
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, description, category, priority } = req.body;
    
    if (!subject || !description || !category) {
      res.status(400).json({ message: 'Please provide subject, description, and category' });
      return;
    }

    const count = await Ticket.countDocuments();
    const ticketNumber = `EDU-${1001 + count}`;

    const ticketPriority = priority || 'Medium';
    const dueAt = calculateDueAt(ticketPriority);
    const userId = req.user?.id as string;

    const ticket = await Ticket.create({
      ticketNumber,
      student: userId,
      subject,
      description,
      category,
      priority: ticketPriority,
      status: 'OPEN',
      dueAt,
    });

    await Activity.create({
      ticket: ticket._id,
      actor: userId,
      action: 'Ticket Created',
      newValue: 'OPEN',
    });

    res.status(201).json(ticket);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: Record<string, any> = {};
    if (req.user?.role === 'STUDENT') {
      query.student = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate('student', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(tickets);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// @desc    Get single ticket with comments and activities
// @route   GET /api/tickets/:id
export const getTicketById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      res.status(400).json({ message: 'Invalid ticket ID format' });
      return;
    }

    const ticket = await Ticket.findById(ticketId)
      .populate('student', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    const studentObj = ticket.student as unknown as { _id: mongoose.Types.ObjectId };
    if (req.user?.role === 'STUDENT' && studentObj?._id?.toString() !== req.user.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const [comments, activities] = await Promise.all([
      Comment.find({ ticket: ticketId })
        .populate('author', 'name email role')
        .sort({ createdAt: 1 })
        .lean(),
      Activity.find({ ticket: ticketId })
        .populate('actor', 'name role')
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    res.status(200).json({ ticket, comments, activities });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// @desc    Update ticket status, priority, or assignment
// @route   PATCH /api/tickets/:id
export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const { status, priority, assignedTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      res.status(400).json({ message: 'Invalid ticket ID format' });
      return;
    }

    if (req.user?.role === 'STUDENT') {
      res.status(403).json({ message: 'Students cannot update ticket workflow' });
      return;
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    const actorId = req.user?.id as string;

    if (status && status !== ticket.status) {
      await Activity.create({
        ticket: ticket._id,
        actor: actorId,
        action: 'Status Changed',
        oldValue: ticket.status,
        newValue: status,
      });
      ticket.status = status;
    }

    if (priority && priority !== ticket.priority) {
      await Activity.create({
        ticket: ticket._id,
        actor: actorId,
        action: 'Priority Changed',
        oldValue: ticket.priority,
        newValue: priority,
      });
      ticket.priority = priority;
      ticket.dueAt = calculateDueAt(priority);
    }

    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
      await Activity.create({
        ticket: ticket._id,
        actor: actorId,
        action: 'Assigned Staff',
        oldValue: ticket.assignedTo ? ticket.assignedTo.toString() : 'Unassigned',
        newValue: assignedTo,
      });
      ticket.assignedTo = assignedTo;
      if (ticket.status === 'OPEN') {
        ticket.status = 'ASSIGNED';
      }
    }

    await ticket.save();
    res.status(200).json(ticket);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const ticketId = req.params.id as string;

    if (!message) {
      res.status(400).json({ message: 'Comment message cannot be empty' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      res.status(400).json({ message: 'Invalid ticket ID format' });
      return;
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    const userId = req.user?.id as string;

    if (req.user?.role === 'STUDENT' && ticket.student.toString() !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const comment = await Comment.create({
      ticket: ticketId,
      author: userId,
      message,
    });

    await Activity.create({
      ticket: ticketId,
      actor: userId,
      action: 'Added Comment',
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email role')
      .lean();

    res.status(201).json(populatedComment);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};