const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.set('view engine', 'ejs');

// MySQL Connection
const db = mysql.createConnection({
    host: 'sql10.freemysqlhosting.net',
    user: 'sql10680817',
    password: 'KgeD46wZT9',
    database: 'sql10680817' // Assuming the database name is the same as the username, but you might need to confirm this
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'naoufalelhlou@gmail.com', // Replace with your email
        pass: 'ylhj tsjv gkos izsv' // Replace with your email password or an app-specific password
    }
});
// Function to format time as hh:mm
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Function to send email alert
function sendEmailAlert(domainName, timeLeft, timeLeftInMinutes) {
    const hoursLeft = (timeLeftInMinutes / 60).toFixed(2);

    // Format the current time as hh:mm
    const currentTime = formatTime(new Date());

    const mailOptions = {
        from: 'naoufalelhlou@gmail.com', // Replace with your email
        to: 'naoufalelhlou@gmail.com', // Replace with the recipient's email
        subject: `Urgent: ${domainName} Expiring Soon!`,
        text: `The domain ${domainName} has less than ${hoursLeft} hour left. Current time: ${currentTime}. Expiry time: ${timeLeft}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve Dashboard HTML
app.get('/dashboard', (req, res) => {
    const selectQuery = 'SELECT * FROM domain_monitoring';

    db.query(selectQuery, (err, result) => {
        if (err) {
            console.error('Error fetching data from MySQL:', err);
            res.status(500).json({ error: 'Error fetching data from MySQL' });
        } else {
            const data = result;
            res.json(data);
        }
    });
});

// Handle form submission
app.post('/submit', express.urlencoded({ extended: true }), (req, res) => {
    const { domainName, estValue, place, dateLeft, timeLeft } = req.body;

    // Parse the date and time strings
    const combinedDateTime = new Date(dateLeft + ' ' + timeLeft);

    // Format the datetime as a string in MySQL-friendly format
    const formattedDateTime = combinedDateTime.toISOString().slice(0, 19).replace('T', ' ');

    const insertQuery = 'INSERT INTO domain_monitoring (domain_name, est_value, place, time_left, time_left_only) VALUES (?, ?, ?, ?, ?)';
    const values = [domainName, estValue, place, formattedDateTime, timeLeft];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
            res.status(500).json({ error: 'Error inserting data into MySQL' });
        } else {
            console.log('Data inserted successfully');

            // Check if time left is less than 1 hour and send email alert
            const timeLeftInMinutes = Math.floor((combinedDateTime - new Date()) / (1000 * 60));
            if (timeLeftInMinutes < 360) {
                sendEmailAlert(domainName, timeLeft, timeLeftInMinutes);
            }

            else if (timeLeftInMinutes < 180) {
                sendEmailAlert(domainName, timeLeft, timeLeftInMinutes);
            }

            else if (timeLeftInMinutes < 60) {
                sendEmailAlert(domainName, timeLeft, timeLeftInMinutes);
            }
            res.status(200).json({ success: 'Data inserted successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
