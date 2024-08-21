let data = [
    // { "mood": "negative", "note": "Stressful day at work", "day_of_week": 1, "time_of_day": "18:31", "id": 1, "date": "2024-06-17" },
    // { "mood": "neutral", "note": "Regular day", "day_of_week": 2, "time_of_day": "19:15", "id": 2, "date": "2024-06-18" },
    // { "mood": "positive", "note": "Great weather, went for a run", "day_of_week": 3, "time_of_day": "08:12", "id": 3, "date": "2024-06-19" },
    // { "mood": "positive", "note": "Productive day", "day_of_week": 4, "time_of_day": "21:00", "id": 4, "date": "2024-06-20" },
    // { "mood": "neutral", "note": "Nothing special", "day_of_week": 5, "time_of_day": "14:30", "id": 5, "date": "2024-06-21" },
    // { "mood": "positive", "note": "Weekend plans with friends", "day_of_week": 6, "time_of_day": "10:00", "id": 6, "date": "2024-06-22" },
    // { "mood": "positive", "note": "Relaxing Sunday", "day_of_week": 0, "time_of_day": "16:45", "id": 7, "date": "2024-06-23" }
];


API_URL = "https://lacrimae.serveo.net"

async function get_moodlogs() {
    try {
        const response = await fetch(`${API_URL}/moodlogs/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}



let moodChart, timelineChart, trendChart, correlationChart;
let currentGoal = 0;

function updateDashboard(filteredData) {
    // Update metrics
    document.getElementById('totalEntries').textContent = filteredData.length;

    const moodCounts = filteredData.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
    }, {});
    const commonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    document.getElementById('commonMood').textContent = commonMood;

    const latestEntry = filteredData.sort((a, b) => new Date(b.date + ' ' + b.time_of_day) - new Date(a.date + ' ' + a.time_of_day))[0];
    document.getElementById('latestEntry').textContent = latestEntry ? `${formatDate(latestEntry.date)} ${latestEntry.time_of_day}` : 'N/A';

    // Update mood streak
    const streak = calculateMoodStreak(filteredData);
    document.getElementById('moodStreak').textContent = `${streak} days`;

    // Update mood distribution chart
    moodChart.data.labels = Object.keys(moodCounts);
    moodChart.data.datasets[0].data = Object.values(moodCounts);
    moodChart.update();

    // Update mood timeline chart
    timelineChart.data.labels = filteredData.map(entry => formatDate(entry.date) + ' ' + entry.time_of_day);
    timelineChart.data.datasets[0].data = filteredData.map(entry => {
        switch (entry.mood) {
            case 'positive': return 3;
            case 'neutral': return 2;
            case 'negative': return 1;
            default: return 0;
        }
    });
    timelineChart.update();

    // Update trend chart
    updateTrendChart(filteredData);

    // Update correlation chart
    updateCorrelationChart(filteredData);

    // Generate and display insights
    generateInsights(filteredData);

    // Update goal progress
    updateGoalProgress(filteredData);
    moodByTimeOfDay(filteredData)
}

function initializeCharts() {
    // Mood distribution chart
    const moodCtx = document.getElementById('moodChart').getContext('2d');
    moodChart = new Chart(moodCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Mood Count',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Mood timeline chart
    const timelineCtx = document.getElementById('timelineChart').getContext('2d');
    timelineChart = new Chart(timelineCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Mood',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3,
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            switch (value) {
                                case 1: return 'Negative';
                                case 2: return 'Neutral';
                                case 3: return 'Positive';
                                default: return '';
                            }
                        }
                    }
                }
            }
        }
    });

    // Trend chart
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Mood Trend',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3,
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            switch (value) {
                                case 1: return 'Negative';
                                case 2: return 'Neutral';
                                case 3: return 'Positive';
                                default: return '';
                            }
                        }
                    }
                }
            }
        }
    });

    // Correlation chart
    const correlationCtx = document.getElementById('correlationChart').getContext('2d');
    correlationChart = new Chart(correlationCtx, {
        type: 'bar',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Average Mood by Day of Week',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3,
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            switch (value) {
                                case 1: return 'Negative';
                                case 2: return 'Neutral';
                                case 3: return 'Positive';
                                default: return '';
                            }
                        }
                    }
                }
            }
        }
    });
}

function calculateMoodStreak(data) {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].mood === 'positive') {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}


function updateTrendChart(data) {
    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    trendChart.data.labels = sortedData.map(entry => entry.date);
    trendChart.data.datasets[0].data = sortedData.map(entry => {
        switch (entry.mood) {
            case 'positive': return 3;
            case 'neutral': return 2;
            case 'negative': return 1;
            default: return 0;
        }
    });
    trendChart.update();
}

function updateCorrelationChart(data) {
    const moodByDay = [0, 0, 0, 0, 0, 0, 0];
    const countByDay = [0, 0, 0, 0, 0, 0, 0];

    data.forEach(entry => {
        const dayIndex = entry.day_of_week;
        const moodValue = entry.mood === 'positive' ? 3 : (entry.mood === 'neutral' ? 2 : 1);
        moodByDay[dayIndex] += moodValue;
        countByDay[dayIndex]++;
    });

    correlationChart.data.datasets[0].data = moodByDay.map((total, index) =>
        countByDay[index] ? total / countByDay[index] : 0
    );
    correlationChart.update();
}

function generateInsights(data) {
    const insights = [];
    const moodCounts = data.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
    }, {});

    const totalEntries = data.length;
    const positivePercentage = ((moodCounts.positive || 0) / totalEntries * 100).toFixed(1);
    const negativePercentage = ((moodCounts.negative || 0) / totalEntries * 100).toFixed(1);

    insights.push(`You've been positive ${positivePercentage}% of the time.`);
    insights.push(`You've experienced negative moods ${negativePercentage}% of the time.`);

    const streak = calculateMoodStreak(data);
    if (streak > 1) {
        insights.push(`You're on a ${streak}-day positive mood streak! Keep it up!`);
    }

    const insightsList = document.getElementById('moodInsights');
    insightsList.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
}

function updateGoalProgress(data) {
    if (currentGoal > 0) {
        const recentPositiveDays = data.slice(-7).filter(entry => entry.mood === 'positive').length;
        const progress = (recentPositiveDays / currentGoal) * 100;
        document.getElementById('goalProgress').innerHTML = `
            <p>Goal: ${currentGoal} positive days this week</p>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
            </div>
            <p class="mt-2">${recentPositiveDays} / ${currentGoal} days</p>
        `;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await get_moodlogs();
    initializeCharts();
    updateDashboard(data);

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    // document.getElementById('setGoal').addEventListener('click', () => {
    //     currentGoal = parseInt(document.getElementById('goalInput').value) || 0;
    //     updateGoalProgress(data);
    // });
});

// Existing applyFilters and clearFilters functions...
document.getElementById('clearFilters').addEventListener('click', clearFilters);

function applyFilters() {
    const moodFilter = document.getElementById('moodFilter').value;
    const dayFilter = document.getElementById('dayFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    const filteredData = data.filter(entry => {
        return (!moodFilter || entry.mood === moodFilter) &&
            (!dayFilter || entry.day_of_week.toString() === dayFilter) &&
            (!timeFilter || entry.time_of_day.startsWith(timeFilter)) &&
            (!dateFilter || entry.date === dateFilter);
    });


    updateDashboard(filteredData);
}



// Function to categorize time of day
function categorizeTimeOfDay(time) {
    let hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) {
        return 'Morning';
    } else if (hour >= 12 && hour < 17) {
        return 'Afternoon';
    } else if (hour >= 17 && hour < 21) {
        return 'Evening';
    } else {
        return 'Night';
    }
}


 // Initialize counts for each time category
 let timeCategories = {
    'Morning': { 'negative': 0, 'neutral': 0, 'positive': 0 },
    'Afternoon': { 'negative': 0, 'neutral': 0, 'positive': 0 },
    'Evening': { 'negative': 0, 'neutral': 0, 'positive': 0 },
    'Night': { 'negative': 0, 'neutral': 0, 'positive': 0 }
};


// Function to get the most dominant mood for a time category
function getMostDominantMood(category) {
    let moods = timeCategories[category];
    let mostDominant = 'neutral'; // default to neutral if no clear dominant mood
    if (moods['positive'] > moods['negative'] && moods['positive'] > moods['neutral']) {
        mostDominant = 'positive';
    } else if (moods['negative'] > moods['positive'] && moods['negative'] > moods['neutral']) {
        mostDominant = 'negative';
    }
    return mostDominant;
}


// Function to update UI with mood counts
function moodByTimeOfDay(data) {

   
    // Count moods by time of day
    data.forEach(entry => {
        let timeCategory = categorizeTimeOfDay(entry.time_of_day);
        timeCategories[timeCategory][entry.mood]++;
    });


    // Morning
    document.getElementById('morningNegative').textContent = timeCategories['Morning']['negative'];
    document.getElementById('morningNeutral').textContent = timeCategories['Morning']['neutral'];
    document.getElementById('morningPositive').textContent = timeCategories['Morning']['positive'];
    document.getElementById('morningEmoji').textContent = getEmojiForMood(getMostDominantMood('Morning'));

    // Afternoon
    document.getElementById('afternoonNegative').textContent = timeCategories['Afternoon']['negative'];
    document.getElementById('afternoonNeutral').textContent = timeCategories['Afternoon']['neutral'];
    document.getElementById('afternoonPositive').textContent = timeCategories['Afternoon']['positive'];
    document.getElementById('afternoonEmoji').textContent = getEmojiForMood(getMostDominantMood('Afternoon'));

    // Evening
    document.getElementById('eveningNegative').textContent = timeCategories['Evening']['negative'];
    document.getElementById('eveningNeutral').textContent = timeCategories['Evening']['neutral'];
    document.getElementById('eveningPositive').textContent = timeCategories['Evening']['positive'];
    document.getElementById('eveningEmoji').textContent = getEmojiForMood(getMostDominantMood('Evening'));

    // Night
    document.getElementById('nightNegative').textContent = timeCategories['Night']['negative'];
    document.getElementById('nightNeutral').textContent = timeCategories['Night']['neutral'];
    document.getElementById('nightPositive').textContent = timeCategories['Night']['positive'];
    document.getElementById('nightEmoji').textContent = getEmojiForMood(getMostDominantMood('Night'));

}


// Function to get emoji based on mood
function getEmojiForMood(mood) {
    switch (mood) {
        case 'positive':
            return '😄';
        case 'negative':
            return '😞';
        default:
            return '😐';
    }
}



function clearFilters() {
    document.getElementById('moodFilter').value = '';
    document.getElementById('dayFilter').value = '';
    document.getElementById('timeFilter').value = '';
    document.getElementById('dateFilter').value = '';

    updateDashboard(data);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}



