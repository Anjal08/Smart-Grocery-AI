
import fs from 'fs';
import fetch from 'node-fetch';

async function testUpload() {
    try {
        const imagePath = 'test_receipt.jpg';
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        console.log("Sending request to /api/receipt/process...");
        const response = await fetch('http://localhost:3000/api/receipt/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                base64Image: base64Image,
                mimeType: 'image/jpeg'
            })
        });

        const status = response.status;
        console.log("Status:", status);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testUpload();
