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
    referredBy: String, // जिसने इनवाइट किया
    myReferralCode: { type: String, unique: true, required: true }, // यूजर का खुद का परमानेंट रेफरल कोड
    userID: { type: String, unique: true, required: true } 
});
const User = mongoose.model('User', userSchema);

// राउट्स
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/team', (req, res) => res.sendFile(path.join(__dirname, 'team.html')));
app.get('/regist', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

// 1. रजिस्टर करने का राउट (Full Fixed)
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, pass, referral } = req.body; 
        
        const existingUser = await User.findOne({ mobile: mobile });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "यह नंबर पहले से रजिस्टर्ड है!" });
        }

        const uniqueID = "ID" + crypto.randomBytes(4).toString('hex').toUpperCase(); 
        const uniqueRefCode = "REF" + crypto.randomBytes(3).toString('hex').toUpperCase(); 

        const newUser = new User({ 
            mobile, 
            pass, 
            referredBy: referral || null, 
            myReferralCode: uniqueRefCode, 
            userID: uniqueID 
        });

        await newUser.save();
        
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

// 2. लॉगिन करने का लाइव API राउट (यह मिसिंग था भाई, अब जोड़ दिया है)
app.post('/api/login', async (req, res) => {
    try {
        const { mobile, pass } = req.body;

        // डेटाबेस में मोबाइल नंबर ढूंढो
        const user = await User.findOne({ mobile: mobile });
        if (!user) {
            return res.status(400).json({ success: false, message: "यह मोबाइल नंबर रजिस्टर्ड नहीं है!" });
        }

        // पासवर्ड चेक करो
        if (user.pass !== pass) {
            return res.status(400).json({ success: false, message: "गलत पासवर्ड! कृपया सही पासवर्ड डालें।" });
        }

        // सही होने पर यूजर की ID और उसका परमानेंट रेफरल कोड फ्रंटएंड को भेज दो
        res.json({
            success: true,
            userID: user.userID,
            myReferralCode: user.myReferralCode,
            message: "लॉगिन एकदम टकाटक हो गया!"
        });

    } catch (err) {
        console.log("लॉगिन एरर:", err);
        res.status(500).json({ success: false, message: "सर्वर एरर, फिर से कोशिश करें" });
    }
});

// 3. लाइव टीम डिटेल्स API राउट
app.get('/api/team-details', async (req, res) => {
    try {
        const { refCode } = req.query;

        if (!refCode) {
            return res.status(400).json({ success: false, message: "Referral code missing" });
        }

        // चेक करो कि किस-किस बंदे के 'referredBy' में इस यूजर का कोड है
        const members = await User.find({ referredBy: refCode });

        let totalCommission = 0;
        let teamRecharge = 0;

        const teamMembers = members.map(member => {
            const rechargeAmount = 0; // रिचार्ज गेटवे आने पर यह लाइव कनेक्ट होगा
            const commissionEarned = 0; 

            totalCommission += commissionEarned;
            teamRecharge += rechargeAmount;

            return {
                userID: member.userID,
                rechargeAmount: rechargeAmount,
                commissionEarned: commissionEarned
            };
        });

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