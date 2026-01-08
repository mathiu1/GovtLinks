const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['LOGIN', 'REGISTER', 'LOGOUT', 'CREATE_ITEM', 'UPDATE_ITEM', 'DELETE_ITEM', 'UPDATE_USER_ROLE', 'DELETE_USER', 'VIEW_ADMIN_DASHBOARD']
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String }, // redundant but easier for quick logs
    details: { type: mongoose.Schema.Types.Mixed },
    ip: String,
    userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
