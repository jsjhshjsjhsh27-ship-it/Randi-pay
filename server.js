const express = require('express');
const path = require('path');
const app = express();

// यह आपके फोल्डर की सभी फाइल्स को एक्सेस देगा
app.use(express.static(__dirname)); 

// यह आपके index.html को डिफ़ॉल्ट होम पेज बना देगा
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Render के लिए पोर्ट सेट करना (यह अपने आप सही पोर्ट उठा लेगा)
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('सर्वर यहाँ चल रहा है: http://localhost:' + port);
});