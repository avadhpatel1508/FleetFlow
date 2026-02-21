import http from 'http';

const data = JSON.stringify({
    name: "Test Driver 1",
    email: "driver5@example.com",
    password: "password123",
    role: "Driver",
    licenseExpiryDate: "2028-01-01",
    allowedVehicleType: ["Car"]
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
