const express = require('express');
const whatsAppClient = require('@green-api/whatsapp-api-client');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(__dirname));

// Replace with your GREEN API credentials
const idInstance = '7105217263';
const apiTokenInstance = 'e9897cac52f64553bb62434c7ab4f304de7a915f81994be383';

// Initialize the REST API client
const restAPI = whatsAppClient.restAPI({
  idInstance,
  apiTokenInstance,
});

// Function to generate bill details
function generateBillDetails(customerNumber) {
    return {
        customerId: customerNumber,
        amount: '₹1,000',
        dueDate: '2025-04-15',
        billNumber: Math.floor(Math.random() * 1000000)
    };
}

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to send bill notification
app.post('/send-notification', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber || phoneNumber.length < 10) {
        return res.json({ success: false, message: 'Please enter a valid phone number' });
    }

    try {
        const billDetails = generateBillDetails(phoneNumber);
        const message = `Dear Customer,\n\nYour bill details:\nBill Number: ${billDetails.billNumber}\nAmount: ${billDetails.amount}\nDue Date: ${billDetails.dueDate}\n\nPlease make the payment before the due date.\nThank you!`;
        
        const chatId = `${phoneNumber}@c.us`;
        const response = await restAPI.message.sendMessage(chatId, null, message);
        console.log('Bill notification sent successfully:', response);
        
        res.json({ success: true, message: 'Bill notification sent successfully!' });
    } catch (error) {
        console.error('Error sending bill notification:', error);
        res.json({ success: false, message: 'Failed to send bill notification' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});