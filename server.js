const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// जरूरी मिडलवेयर
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB कनेक्शन
const dbURI = 'mongodb+srv://jsjhshjsjhsh27_db_user:fqLd5i9wF6TTIpjR@cluster0.jkpmhai.mongodb.net/RandipayDB?retryWrites=true&w=majority';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB कनेक्टेड!'))
    .catch(err => console.log('DB Error:', err));

// यूजर का ढांचा (Schema) - यहाँ unique: true डाल दिया है
const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true },
    pass: { type: String, required: true },
    referral: String,
    userID: { type: String, unique: true } 
});
const User = mongoose.model('User', userSchema);

// राउट्स
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/team', (req, res) => res.sendFile(path.join(__dirname, 'team.html')));
app.get('/regist', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

// रजिस्टर करने का फाइनल राउट
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, pass, referral } = req.body;
        
        // चेक करें कि नंबर पहले से है क्या
        const existingUser = await User.findOne({ mobile: mobile });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "यह नंबर पहले से रजिस्टर्ड है!" });
        }

        // यूनिक ID: रैंडम नंबर + टाइम का हिस्सा
        const uniqueID = "USER" + Math.floor(10000 + Math.random() * 90000);
        
        const newUser = new User({ mobile, pass, referral, userID: uniqueID });
        await newUser.save();
        
        res.json({ success: true, userID: uniqueID });
    } catch (err) {
        res.status(500).json({ success: false, message: "सर्वर एरर, फिर से कोशिश करें" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('सर्वर चालू है: http://localhost:' + port));