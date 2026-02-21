import express from 'express';
import { getChatUsers, getMessages, sendMessage, getUnreadCounts } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/users', getChatUsers);
router.get('/unread', getUnreadCounts);
router.get('/:userId', getMessages);
router.post('/', sendMessage);

export default router;
