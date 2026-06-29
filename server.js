const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// यह आपके उसी फोल्डर की सभी HTML फाइल्स को एक्सेस देगा
app.use(express.static(__dirname)); 

// सर्वर शुरू करें
app.listen(port, () => {
    console.log('सर्वर यहाँ चल रहा है: http://localhost:3000');
});