import AuditLog from '../models/AuditLog.js';

/**
 * Log an action to the AuditLog collection
 * @param {Object} req - Express request object (contains user and io)
 * @param {String} action - 'Create', 'Update', 'Delete', 'StatusChange'
 * @param {String} entityType - 'Vehicle', 'Driver', 'Trip', 'Maintenance'
 * @param {String} entityId - The ID of the affected document
 * @param {Object} details - Additional contextual info
 */
export const logAction = async (req, action, entityType, entityId, details = {}) => {
    try {
        if (!req.user || !req.user._id) {
            console.warn('AuditLog: Could not log action due to missing req.user');
            return;
        }

        const log = await AuditLog.create({
            action,
            entityType,
            entityId,
            performedBy: req.user._id,
            details
        });

        // Optionally emit to sockets if a live audit feed is desired later
        // req.app.get('io').emit('newAuditLog', log);

        return log;
    } catch (error) {
        console.error('AuditLog Error:', error);
    }
};
