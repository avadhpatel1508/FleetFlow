import http from 'http';

const data = JSON.stringify({
    name: "Test User 4",
    email: "test14@example.com",
    password: "password123",
    role: "Dispatcher"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
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
