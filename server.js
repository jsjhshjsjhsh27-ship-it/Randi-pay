const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto'); // यूनिक कोड जनरेट करने के लिए इन-बिल्ट मॉड्यूल जोड़ा
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

// यूजर का ढांचा (Schema)
const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true }, // मोबाइल भी यूनिक होना चाहिए
    pass: { type: String, required: true },
    referredBy: String, // जिसने इनवाइट किया (पुरानी referral फील्ड)
    myReferralCode: { type: String, unique: true, required: true }, // यूजर का खुद का परमानेंट रेफरल कोड
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
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "डेटाबेस में डुप्लीकेट एंट्री का लोचा, फिर से ट्राई मारो!" });
        }
        res.status(500).json({ success: false, message: "सर्वर एरर, फिर से कोशिश करें" });
    }
});

// 🔥 एमजे का लाइव टीम डिटेल्स API राउट (नया एडिशन)
app.get('/api/team-details', async (req, res) => {
    try {
        const { refCode } = req.query;

        if (!refCode) {
            return res.status(400).json({ success: false, message: "Referral code missing" });
        }

        // 1. डेटाबेस में ढूँढो कि किस-किस बंदे के 'referredBy' में इस यूजर का कोड है
        const members = await User.find({ referredBy: refCode });

        let totalCommission = 0;
        let teamRecharge = 0;

        // 2. हर एक मेंबर का डेटा सेट करो (अभी रीचार्ज सिस्टम पेंडिंग है तो डिफ़ॉल्ट 0 रख रहे हैं)
        const teamMembers = members.map(member => {
            const rechargeAmount = 0; // जब रीचार्ज गेटवे बनाओगे तो ये डेटाबेस से लाइव आएगा भाई
            const commissionEarned = 0; // कमीशन की कैलकुलेशन भी यहाँ जोड़ सकते हो

            totalCommission += commissionEarned;
            teamRecharge += rechargeAmount;

            return {
                userID: member.userID,
                rechargeAmount: rechargeAmount,
                commissionEarned: commissionEarned
            };
        });

        // 3. फ्रंटएंड को लाइव डेटा भेज दो
        res.json({
            success: true,
            totalCommission: totalCommission,
            teamRecharge: teamRecharge,
            teamMembers: teamMembers
        });

    } catch (err) {
        console.log("टीम API एरर:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('सर्वर चालू है: http://localhost:' + port));