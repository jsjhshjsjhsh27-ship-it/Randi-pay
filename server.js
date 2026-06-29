const express = require('express');
const path = require('path');
const app = express();

// सभी फाइल्स को पब्लिक एक्सेस दें
app.use(express.static(__dirname)); 

// होम पेज
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// टीम पेज के लिए (बड़े 'T' और छोटे 't' दोनों का ध्यान रखा है)
app.get('/team', (req, res) => {
    res.sendFile(path.join(__dirname, 'team.html'));
});

// रजिस्ट्रेशन पेज के लिए
app.get('/regist', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Render के लिए पोर्ट
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('सर्वर यहाँ चल रहा है: http://localhost:' + port);
});