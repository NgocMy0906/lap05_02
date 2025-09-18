require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.js');

const app = express();
app.use(express.json());
app.use(cookieParser()); // đọc cookie từ client

// Session config: lưu session vào cookie
app.use(session({
    name: 'sid', // tên cookie
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
        httpOnly: true, // ngăn JS truy cập cookie
        secure: false, // true nếu dùng HTTPS
        maxAge: 1000 * 60 * 60 // 1 giờ
    }
}));

// Routes
app.use('/auth', authRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
        });
    })
    .catch(err => console.error('❌ MongoDB error:', err));