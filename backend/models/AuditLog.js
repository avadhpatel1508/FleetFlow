import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: [true, 'Please add an action type'],
        enum: ['Create', 'Update', 'Delete', 'StatusChange']
    },
    entityType: {
        type: String,
        required: [true, 'Please add the entity type'],
        enum: ['Vehicle', 'Driver', 'Trip', 'Maintenance']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide the entity ID']
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide the user who performed this action']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
