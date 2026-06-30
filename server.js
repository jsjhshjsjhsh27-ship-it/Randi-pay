const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto'); // 👈 यूनिक कोड जनरेट करने के लिए इन-बिल्ट मॉड्यूल जोड़ा
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

// यूजर का ढांचा (Schema) - इसमें बदलाव किया है भाई
const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true }, // मोबाइल भी यूनिक होना चाहिए
    pass: { type: String, required: true },
    referredBy: String, // 👈 जिसने इनवाइट किया (पुरानी referral फील्ड)
    myReferralCode: { type: String, unique: true, required: true }, // 👈 यूजर का खुद का परमानेंट रेफरल कोड
    userID: { type: String, unique: true, required: true } 
});
const User = mongoose.model('User', userSchema);

// राउट्स
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/team', (req, res) => res.sendFile(path.join(__dirname, 'team.html')));
app.get('/regist', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

// रजिस्टर करने का फाइनल राउट (फुल फिक्स और अपग्रेड)
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, pass, referral } = req.body; // referral में वो कोड आएगा जिससे बंदा जॉइन हो रहा है
        
        // 1. चेक करें कि नंबर पहले से है क्या
        const existingUser = await User.findOne({ mobile: mobile });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "यह नंबर पहले से रजिस्टर्ड है!" });
        }

        // 2. एकदम बुलेटप्रूफ यूनिक userID और खुद का रेफरल कोड जनरेट करना
        // crypto.randomBytes साला कभी भी सेम वैल्यू जनरेट नहीं कर सकता, दुनिया इधर की उधर हो जाए
        const uniqueID = "ID" + crypto.randomBytes(4).toString('hex').toUpperCase(); // जैसे: ID7A8B9C2E
        const uniqueRefCode = "REF" + crypto.randomBytes(3).toString('hex').toUpperCase(); // जैसे: REF4F8D

        const newUser = new User({ 
            mobile, 
            pass, 
            referredBy: referral || null, // अगर किसी के कोड से आया है तो वो, नहीं तो null
            myReferralCode: uniqueRefCode, // इस बंदे का अपना नया कोड
            userID: uniqueID 
        });

        await newUser.save();
        
        // फ्रंटएंड को रेस्पॉन्स में दोनों चीजें भेज रहे हैं
        res.json({ 
            success: true, 
            userID: uniqueID,
            myReferralCode: uniqueRefCode,
            message: "रजिस्ट्रेशन एकदम टकाटक हो गया!" 
        });

    } catch (err) {
        console.log("रजिस्टर एरर:", err);
        // अगर गलती से मंगोडीबी में कोई डुप्लीकेट एरर आता है (कोड 11000)
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "डेटाबेस में डुप्लीकेट एंट्री का लोचा, फिर से ट्राई मारो!" });
        }
        res.status(500).json({ success: false, message: "सर्वर एरर, फिर से कोशिश करें" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('सर्वर चालू है: http://localhost:' + port));