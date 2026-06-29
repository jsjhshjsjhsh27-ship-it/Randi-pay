const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// जरूरी मिडलवेयर (डेटा पढ़ने के लिए)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB कनेक्शन
const dbURI = 'mongodb+srv://jsjhshjsjhsh27_db_user:fqLd5i9wF6TTIpjR@cluster0.jkpmhai.mongodb.net/RandipayDB?retryWrites=true&w=majority';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB कनेक्टेड!'))
    .catch(err => console.log('DB Error:', err));

// यूजर का ढांचा (Schema)
const userSchema = new mongoose.Schema({
    mobile: String,
    pass: String,
    referral: String,
    userID: String
});
const User = mongoose.model('User', userSchema);

// राउट्स
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/team', (req, res) => res.sendFile(path.join(__dirname, 'team.html')));
app.get('/regist', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

// रजिस्टर करने का राउट (यहाँ डेटा सेव होगा)
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, pass, referral } = req.body;
        // यूनिक ID बनाना: USER + मोबाइल के आखिरी 4 अंक + समय
        const uniqueID = "USER" + mobile.slice(-4) + Date.now().toString().slice(-4);
        
        const newUser = new User({ mobile, pass, referral, userID: uniqueID });
        await newUser.save();
        
        res.json({ success: true, userID: uniqueID });
    } catch (err) {
        res.status(500).json({ success: false, message: "डेटा सेव नहीं हुआ" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('सर्वर चालू है: http://localhost:' + port));