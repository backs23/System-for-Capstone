  // Water Quality Chart
    const ctx = document.getElementById('waterQualityChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: {{ chart_data.labels | safe }},
            datasets: [{
                label: 'Temperature (°C)',
                data: {{ chart_data.temp_data | safe }},
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.1
            }, {
                label: 'Dissolved O2',
                data: {{ chart_data.do_data | safe }},
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Water Quality Parameters'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Auto-refresh data every 30 seconds
    setInterval(async function() {
        try {
            const response = await fetch('/api/sensor-data');
            const data = await response.json();
            
            // Update status cards
            // Add more update logic as needed
        } catch (error) {
            console.log('Failed to refresh data:', error);
        }
    }, 30000);
