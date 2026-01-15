
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({}, 'username email role isAdmin');
        console.table(users.map(u => ({
            id: u._id.toString(),
            username: u.username,
            role: u.role,
            isAdmin: u.isAdmin
        })));
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
