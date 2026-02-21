import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get all users the current user can chat with (excludes self)
// @route   GET /api/messages/users
// @access  Private
export const getChatUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('name email role')
            .sort('name');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        // Mark incoming messages as read
        await Message.updateMany(
            { senderId: userId, receiverId: myId, read: false },
            { read: true }
        );

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId }
            ]
        }).sort('createdAt');

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get unread message counts grouped by sender
// @route   GET /api/messages/unread
// @access  Private
export const getUnreadCounts = async (req, res) => {
    try {
        const counts = await Message.aggregate([
            { $match: { receiverId: req.user._id, read: false } },
            { $group: { _id: '$senderId', count: { $sum: 1 } } }
        ]);
        // Convert to { senderId: count } map
        const map = {};
        counts.forEach(c => { map[c._id.toString()] = c.count; });
        res.json(map);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

        const message = await Message.create({
            senderId: req.user._id,
            receiverId,
            content: content.trim()
        });

        const populated = await message.populate('senderId', 'name role');

        // Emit to receiver's socket if online
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets') || {};
        const receiverSocketId = userSockets[receiverId];
        if (io && receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', populated);
        }

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
