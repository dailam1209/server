const express = require("express");
const app = express();
const http = require('http');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Use the CORS middleware
app.use(cors());

app.post('/server', async (req, res) => {
    const { data, url, isFormData, token } = req.body;
    console.log(data, url, isFormData, token);
    // Define options for the HTTP request
    const options = {
        hostname: '103.138.113.142', 
        path: `/${url}`,
        port: 5140,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };

    // Make the HTTP request
    const request = await http.request({...options, timeout: 30000}, function(response) {
        let body = '';
        response.on('data', function(data) {
            body += data;
        });
        response.on('end', function() {
            // Check if the content type is JSON
            if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
                try {
                    res.send(JSON.parse(body));
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    res.status(500).json({ error: true, message: "Internal Server Error" });
                }
            } else {
                // If not JSON, send the raw body
                res.send(body);
            }
        });
    });

    request.on('error', function(e) {
        console.log('Problem with request: ' + e.message);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    });

    // Send data in the request body
    request.write(JSON.stringify(data));
    request.end();
});


app.listen(process.env.HOST, () => {
    console.log(`Server is running in port ${process.env.HOST}`);
})