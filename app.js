const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));

// Initialize the WhatsApp client with local authentication
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate and display the QR code for authentication
client.on('qr', (qr) => {
    console.log('Scan the QR code below to authenticate:');
    qrcode.generate(qr, { small: true });
});

// Confirm successful authentication
client.on('ready', () => {
    console.log('Client is ready!');
});

// Handle authentication failure
client.on('auth_failure', msg => {
    console.error('Authentication failure:', msg);
});

// Initialize the client
client.initialize();

// Mock function to generate bill details
function generateBill(customerId) {
    return {
        customerId: customerId,
        amount: '₹1,000',
        dueDate: '2025-04-15'
    };
}

// Function to send a WhatsApp message
async function sendBillNotification(customerNumber, billDetails) {
    const message = `Hida vanchaaa, your bill of ${billDetails.amount} is generated and is due by ${billDetails.dueDate}. Thank you.`;
    try {
        const chat = await client.getChatById(`${customerNumber}@c.us`);
        await chat.sendMessage(message);
        return true;
    } catch (error) {
        console.error(`Failed to send message to ${customerNumber}:`, error);
        return false;
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// New endpoint to handle notification requests
app.post('/send-notification', async (req, res) => {
    const { customerNumber } = req.body;
    
    if (!customerNumber) {
        return res.json({ success: false, message: 'Customer number is required' });
    }

    // Generate bill for the customer
    const billDetails = generateBill(customerNumber);
    
    try {
        const success = await sendBillNotification(customerNumber, billDetails);
        if (success) {
            res.json({ success: true, message: `Notification sent successfully to ${customerNumber}` });
        } else {
            res.json({ success: false, message: 'Failed to send notification' });
        }
    } catch (error) {
        res.json({ success: false, message: 'Error sending notification' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});