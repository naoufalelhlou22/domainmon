const mysql = require('mysql');

// MySQL database configuration
const dbConfig = {
    host: '#',
    user: '#',
    password: '#',
    database: '#'
};

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');

    // Call the processRecords function initially
    processRecords();

    // Set interval to run processRecords every 1 minute (1 * 60 * 1000 milliseconds)
    setInterval(processRecords, 1 * 60 * 1000);

    // You might want to handle process termination events to close the connection gracefully
    process.on('SIGINT', () => {
        console.log('Closing MySQL connection on app termination');
        connection.end();
        process.exit(0);
    });
});

// Calculate the time left dynamically (counting down)
function calculateTimeLeft(dateTimeString) {
    const currentTime = new Date();
    const targetTime = new Date(dateTimeString);

    // Adjust for time zone offset
    const timezoneOffset = targetTime.getTimezoneOffset();
    targetTime.setMinutes(targetTime.getMinutes() - timezoneOffset);

    const timeDifference = targetTime - currentTime;

    // Ensure the timer doesn't go negative
    const timeLeft = Math.max(0, timeDifference);

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, totalMinutes: days * 24 * 60 + hours * 60 + minutes };
}

// Function to calculate time left and delete records
function processRecord(record) {
    if (!record.domain_name || !record.time_left) {
        console.error('Invalid record:', record);
        return;
    }

    const timeLeft = calculateTimeLeft(record.time_left);

    // If time left is 0d0h0m, delete the record
    if (timeLeft.totalMinutes === 0) {
        const deleteQuery = 'DELETE FROM domain_monitoring WHERE domain_name = ?';
        connection.query(deleteQuery, [record.domain_name], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting record:', deleteErr);
            } else {
                console.log(`Record with domain_name ${record.domain_name} deleted.`);
            }
        });
    } else {
        // Calculate days, hours, and minutes left
        const daysLeft = timeLeft.days;
        const hoursLeft = timeLeft.hours;
        const minutesLeft = timeLeft.minutes;

        // Log the time left for the record
        console.log(`Record with domain_name ${record.domain_name} has ${daysLeft}d ${hoursLeft}h ${minutesLeft}m left.`);
    }
}

// Function to process all records
function processRecords() {
    // Query to retrieve records from the domain_monitoring table
    const query = 'SELECT * FROM domain_monitoring';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }

        if (results.length === 0) {
            console.log('No records found in the domain_monitoring table.');
            return;
        }

        // Iterate through the results and process each record
        results.forEach(processRecord);
    });
}
