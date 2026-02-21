import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search, Circle } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const ROLE_COLORS = {
    'Fleet Manager': 'bg-indigo-500/20 text-indigo-400',
    'Dispatcher': 'bg-blue-500/20 text-blue-400',
    'Safety Officer': 'bg-rose-500/20 text-rose-400',
    'Financial Analyst': 'bg-emerald-500/20 text-emerald-400',
    'Driver': 'bg-amber-500/20 text-amber-400',
};

const Avatar = ({ name, role }) => {
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const color = ROLE_COLORS[role] || 'bg-slate-600/30 text-slate-300';
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${color}`}>
            {initials}
        </div>
    );
};

const Chat = () => {
    usePageTitle('Chat');
    const { user } = useAuth();
    const socket = useSocket();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [unreadMap, setUnreadMap] = useState({});
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch all chat users
    const { data: users = [] } = useQuery({
        queryKey: ['chat-users'],
        queryFn: async () => { const { data } = await api.get('/messages/users'); return data; }
    });

    // Fetch messages for selected user
    const { data: messages = [] } = useQuery({
        queryKey: ['messages', selectedUser?._id],
        queryFn: async () => {
            const { data } = await api.get(`/messages/${selectedUser._id}`);
            // Remove unread badge once opened
            setUnreadMap(prev => { const n = { ...prev }; delete n[selectedUser._id]; return n; });
            return data;
        },
        enabled: !!selectedUser,
        refetchInterval: false,
    });

    // Fetch unread counts
    const { data: unreadCounts = {} } = useQuery({
        queryKey: ['unread-counts'],
        queryFn: async () => { const { data } = await api.get('/messages/unread'); return data; },
        refetchInterval: 10000,
    });

    useEffect(() => { setUnreadMap(unreadCounts); }, [unreadCounts]);

    // Real-time message reception
    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (msg) => {
            // If we're in the conversation with the sender, append message
            if (selectedUser && msg.senderId._id === selectedUser._id) {
                queryClient.setQueryData(['messages', selectedUser._id], old => [...(old || []), msg]);
                // Mark as read immediately
                api.get(`/messages/${selectedUser._id}`).catch(() => { });
            } else {
                // Show unread badge
                setUnreadMap(prev => ({ ...prev, [msg.senderId._id]: (prev[msg.senderId._id] || 0) + 1 }));
            }
        };
        socket.on('newMessage', handleNewMessage);
        return () => socket.off('newMessage', handleNewMessage);
    }, [socket, selectedUser, queryClient]);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMutation = useMutation({
        mutationFn: async (content) => {
            const { data } = await api.post('/messages', { receiverId: selectedUser._id, content });
            return data;
        },
        onSuccess: (newMsg) => {
            queryClient.setQueryData(['messages', selectedUser._id], old => [...(old || []), newMsg]);
            setMessage('');
            inputRef.current?.focus();
        }
    });

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedUser || sendMutation.isPending) return;
        sendMutation.mutate(message.trim());
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Today';
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const key = new Date(msg.createdAt).toDateString();
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
        return groups;
    }, {});

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-[var(--bg-dark)] rounded-xl border border-slate-800 overflow-hidden">

            {/* Left: User list */}
            <div className="w-80 flex-shrink-0 border-r border-slate-800 flex flex-col bg-[var(--bg-panel)]">
                <div className="p-4 border-b border-slate-800">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5 text-indigo-400" /> Messages
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search people..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    {filteredUsers.map(u => {
                        const unread = unreadMap[u._id] || 0;
                        const isActive = selectedUser?._id === u._id;
                        return (
                            <button
                                key={u._id}
                                onClick={() => setSelectedUser(u)}
                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/40 transition-colors text-left ${isActive ? 'bg-indigo-500/10 border-r-2 border-indigo-500' : ''}`}
                            >
                                <div className="relative">
                                    <Avatar name={u.name} role={u.role} />
                                    <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-emerald-400 text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                                        {unread > 0 && (
                                            <span className="ml-2 bg-indigo-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{u.role}</p>
                                </div>
                            </button>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <p className="text-slate-500 text-sm text-center p-8">No users found.</p>
                    )}
                </div>
            </div>

            {/* Right: Chat area */}
            {selectedUser ? (
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3 bg-[var(--bg-panel)]">
                        <Avatar name={selectedUser.name} role={selectedUser.role} />
                        <div>
                            <p className="font-bold text-white">{selectedUser.name}</p>
                            <p className="text-xs text-slate-400">{selectedUser.role}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                            <div key={dateKey}>
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px bg-slate-800" />
                                    <span className="text-xs text-slate-500 px-2">{formatDate(msgs[0].createdAt)}</span>
                                    <div className="flex-1 h-px bg-slate-800" />
                                </div>
                                {msgs.map(msg => {
                                    const isMine = msg.senderId === user._id || msg.senderId?._id === user._id;
                                    return (
                                        <motion.div
                                            key={msg._id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
                                        >
                                            <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMine
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-xs text-slate-600 mt-1 px-1">
                                                    {formatTime(msg.createdAt)}
                                                    {isMine && <span className="ml-1">{msg.read ? ' ✓✓' : ' ✓'}</span>}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                <p>No messages yet. Say hello!</p>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="px-4 py-4 border-t border-slate-800 bg-[var(--bg-panel)] flex items-center gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder={`Message ${selectedUser.name}...`}
                            className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || sendMutation.isPending}
                            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-colors disabled:opacity-40"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 opacity-30" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-400">Select a conversation</p>
                        <p className="text-sm">Choose a person from the left to start chatting.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
