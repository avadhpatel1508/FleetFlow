import http from 'http';
import https from 'https';

const data = JSON.stringify({
    name: "Test User 5",
    email: "test15@example.com",
    password: "password123",
    role: "Dispatcher"
});

const options = {
    hostname: 'fleetflow-uldj.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    let result = '';
    res.on('data', d => {
        result += d;
    });
    res.on('end', () => {
        console.log("STATUS:", res.statusCode);
        console.log("RESPONSE:", result);
    });
});

req.on('error', error => {
    console.error("ERROR:", error);
});

req.write(data);
req.end();
