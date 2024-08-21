API_URL = "https://lacrimae.serveo.net"
let schedules = [];
let selected_schedule;

document.addEventListener('DOMContentLoaded', function () {
    const schedulesContainer = document.getElementById('schedulesContainer');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const closeEditModal = document.getElementById('closeEditModal');
    const loader = document.getElementById('loader');
    let currentEditId = null;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Fetch and display schedules
    async function fetchSchedules() {
        loader.classList.remove('hidden');
        const response = await fetch(`${API_URL}/schedules/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        schedules = await response.json();

        try {
            if (schedules.detail == 'Could not validate credentials') {
                navigator.reload();
                const pageAlert = document.getElementById('pageAlert');
                pageAlert.style.display = 'block';
                document.getElementById('pageAlert').addEventListener('click', () => {
                    if (window.parent !== window) {
                        window.parent.closeIframe(); // Call function in parent window
                    }
                })
                loader.classList.add('hidden');
                return
            }
        }
        catch {
            const pageAlert = document.getElementById('pageAlert');
            pageAlert.style.display = 'none';
        }

        if(schedules.length>0){
            // Sort schedules by day_of_week and then by time_of_day
            schedules.sort((a, b) => {
                // First, sort by day_of_week
                if (a.day_of_week !== b.day_of_week) {
                    return a.day_of_week - b.day_of_week;
                }
                // If day_of_week is the same, then sort by time_of_day
                if (a.time_of_day < b.time_of_day) {
                    return -1;
                }
                if (a.time_of_day > b.time_of_day) {
                    return 1;
                }
                return 0;
            });
        }

        saveSchedulesToLocalStorage(schedules);
        schedulesContainer.innerHTML = '';
        schedules.forEach(schedule => {
            const scheduleElement = document.createElement('div');
            scheduleElement.className = 'bg-white p-4 rounded-lg shadow-md flex justify-between items-center';
            scheduleElement.innerHTML = `
          <div>
            <p class="text-lg font-semibold">${daysOfWeek[schedule.day_of_week == 7 ? 6 : schedule.day_of_week]}</p>
            <p class="text-gray-600">${convertTo12HourFormat(schedule.time_of_day)}</p>
          </div>
          <div class="space-x-2">
            <button class="edit-button bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none" data-id="${schedule.id}">Edit</button>
            <button class="delete-button bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none" data-id="${schedule.id}">Delete</button>
          </div>
        `;
            schedulesContainer.appendChild(scheduleElement);
        });

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', handleEditButtonClick);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteButtonClick);
        });

        loader.classList.add('hidden');
    }

    // Handle edit button click
    function handleEditButtonClick(event) {
        const id = Number(event.target.getAttribute('data-id'));
        selected_schedule = schedules.find(schedule => schedule.id === id);
        document.getElementById('editDayOfWeek').value = selected_schedule.day_of_week;
        document.getElementById('editTimeOfDay').value = selected_schedule.time_of_day;
        currentEditId = id;
        editModal.classList.remove('hidden');
    }

    // Handle delete button click
    async function handleDeleteButtonClick(event) {
        const id = Number(event.target.getAttribute('data-id'));
        await fetch(`${API_URL}/schedules/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ id })
        });
        fetchSchedules();
    }

    // Handle form submission for editing
    editForm.addEventListener('submit', async function (event) {
        event.preventDefault();
       

        selected_schedule.day_of_week = Number(document.getElementById('editDayOfWeek').value);
        selected_schedule.time_of_day = document.getElementById('editTimeOfDay').value;

        await fetch(`${API_URL}/schedules/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(selected_schedule),
        });
        fetchSchedules();
        editModal.classList.add('hidden');
    });

    // Close edit modal
    closeEditModal.addEventListener('click', function () {
        editModal.classList.add('hidden');
    });

    fetchSchedules();
});


// Convert 24-hour time to 12-hour format
function convertTo12HourFormat(time) {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'pm' : 'am';
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

const hideSchedule = document.getElementById('hideSchedule');
hideSchedule.addEventListener('click', () => {
    try {
        window.location.href = 'index.html';
        location.reload();
    }
    catch {

    }
})

document.getElementById('hideSchedule').addEventListener('click', () => {
    if (window.parent !== window) {
        window.parent.closeIframe(); // Call function in parent window
    }
})


function saveSchedulesToLocalStorage(schedules) {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }