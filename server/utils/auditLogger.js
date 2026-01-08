const AuditLog = require('../models/AuditLog');

const logAction = async (action, req, details = {}) => {
    try {
        // Extract user info if available from request (assuming auth middleware ran)
        const userId = req.user ? req.user.id : null;
        const username = req.user ? req.user.username : (req.body.username || 'Anonymous');

        const newLog = new AuditLog({
            action,
            userId,
            username,
            details,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.get('User-Agent')
        });

        await newLog.save();
    } catch (error) {
        console.error("Audit Log Failure:", error);
        // Fail silently so we don't block the main flow, but log error
    }
};

module.exports = { logAction };
