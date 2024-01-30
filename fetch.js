// Function to fetch data from the server
function fetchData() {
    fetch('http://localhost:3000/dashboard')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('dashboardBody');

            // Clear existing rows
            tbody.innerHTML = '';

            // Populate table with fetched data
            data.forEach(entry => {
                const row = document.createElement('tr');
                const timeLeft = calculateTimeLeft(entry.time_left);

                // Check if hours left is less than 1
                const isTimeLessThan1Hour = timeLeft.hours < 1;

                if (timeLeft.totalMinutes === 0) {
                    row.innerHTML = `
                        <td>${entry.domain_name}</td>
                        <td>${entry.est_value}</td>
                        <td>${entry.place}</td>
                        <td style="color: red; font-weight: bolder">End</td>
                    `;
                } else if (timeLeft.totalMinutes <= 60) {
                    row.innerHTML = `
                        <td>${entry.domain_name}</td>
                        <td>${entry.est_value}</td>
                        <td>${entry.place}</td>
                        <td style="color: yellow; font-weight: bolder">${formatTimeLeft(timeLeft)}</td>
                    `;
                } else {
                    row.innerHTML = `
                        <td>${entry.domain_name}</td>
                        <td>${entry.est_value}</td>
                        <td>${entry.place}</td>
                        <td>${formatTimeLeft(timeLeft)}</td>
                    `;
                }

                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

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

// Format time left for display
function formatTimeLeft(timeLeft) {
    if (timeLeft.totalMinutes === 0) {
        return '0d 0h 0m';
    }
    return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
}

// Fetch data when the page loads
document.addEventListener('DOMContentLoaded', fetchData);

// Fetch data periodically every 1 second
setInterval(fetchData, 1000);
