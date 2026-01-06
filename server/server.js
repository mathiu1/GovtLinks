const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://thestatustamizha_db_user:Mathiu%40143@cluster0.1zvjsbp.mongodb.net/?appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.get('/api/ping', (req, res) => {
    res.send('API is running...');
});
require("./ping.js");
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist"), {
        maxAge: '1d', // Cache static assets for 1 day
        etag: false
    }));


    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
    });

}



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
