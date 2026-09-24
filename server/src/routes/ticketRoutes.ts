import { Router } from 'express';
import { 
  createTicket, 
  getTickets, 
  getTicketById, 
  updateTicket, 
  addComment 
} from '../controllers/ticketController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.route('/')
  .post(protect, authorize('STUDENT', 'STAFF', 'MANAGER'), createTicket)
  .get(protect, getTickets);

router.route('/:id')
  .get(protect, getTicketById)
  .patch(protect, authorize('STAFF', 'MANAGER'), updateTicket);

router.post('/:id/comments', protect, addComment);

export default router;