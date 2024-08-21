//
API_URL = "https://lacrimae.serveo.net"
// Modal handling
const loginModal = document.getElementById('loginModal');
const signUpModal = document.getElementById('signUpModal');
const openSignUp = document.getElementById('openSignUp')
const scheduleModal = document.getElementById('scheduleModal');
const scheduledSurveysModal = document.getElementById('scheduledSurveysModal');
const moodModal = document.getElementById('moodModal');
const moodAlert = document.getElementById('moodAlert');

// const modelIframe = document.getElementById("iframe")
// console.log(modelIframe)

document.getElementById('openSignUp').addEventListener('click', () => {
  signUpModal.classList.remove('hidden');
});

document.getElementById('loginButton').addEventListener('click', () => {
  loginModal.classList.remove('hidden');
});

document.getElementById('scheduleButton').addEventListener('click', () => {
  scheduleModal.classList.remove('hidden');
});

document.getElementById('closeLoginModal').addEventListener('click', () => {
  loginModal.classList.add('hidden');
});

document.getElementById('closeSignupModal').addEventListener('click', () => {
  signUpModal.classList.add('hidden');
});

document.getElementById('closeScheduleModal').addEventListener('click', () => {
  scheduleModal.classList.add('hidden');
});

document.getElementById("scheduleList").addEventListener('click', () => {
  scheduledSurveysModal.classList.remove('hidden');
  scheduleModal.classList.add('hidden');
})



// Errors
moodNotSetError = false;

// Mood form handling
const moodButtons = document.querySelectorAll('.moodButton');
moodButtons.forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('mood').value = button.getAttribute('data-mood');
    moodButtons.forEach(btn => btn.classList.remove('bg-gray-200'));
    button.classList.add('bg-gray-200');
    button.classList.add('rounded-lg');
    button.classList.add('p-2');
  });
});

document.getElementById('moodForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const mood = document.getElementById('mood').value;
  const note = document.getElementById('note').value;
  const dayOfWeek = getCurrentDayOfWeek(); // Automatically set current day of the week
  const timeOfDay = getCurrentTimeOfDay(); // Automatically set current time of day

  const data = {
    mood: mood,
    note: note,
    day_of_week: dayOfWeek,
    time_of_day: timeOfDay,
  };

  if (mood === '') {
    moodAlert.style.display = 'block';
    return;
  } else {
    moodAlert.style.display = 'none';
  }


  try {
    const response = await fetch(`${API_URL}/moodlogs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Success:', result);
    alert('Mood logged successfully');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to log mood');
  }
});


// Signup form handling
document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email2').value;
  // const country = document.getElementById('country').value;
  const company = document.getElementById('company').value;
  const gender = document.getElementById('gender').value;
  const position = document.getElementById('position').value;
  const password = document.getElementById('password2').value;

  // Create an object to hold the data
  const formData = {
    name: name,
    email: email,
    country: 'None',
    company: company,
    gender: gender,
    position: position,
    password: password
  };

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    login(email, password)
    console.log('Success:', result);
    alert('Signup successful');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to signup');
  } finally {
    signUpModal.classList.add('hidden');
  }
});


// Login form handling
document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const data = {
    email: email,
    password: password,
  };

  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    localStorage.setItem('token', result.access_token);
    console.log('Success:', result);
    alert('Login successful');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to login');
  } finally {
    loginModal.classList.add('hidden');
  }
});

// Schedule form handling
document.getElementById('scheduleForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  

  const dayOfWeekElements = document.querySelectorAll('.dayOfWeek');
  const timeOfDayElements = document.querySelectorAll('.timeOfDay');

  const schedules = [];
  for (let i = 0; i < dayOfWeekElements.length; i++) {
    schedules.push({
      day_of_week: parseInt(dayOfWeekElements[i].value == 7 ? 6 : dayOfWeekElements[i].value),
      time_of_day: timeOfDayElements[i].value,
    });
  }

  try {
    const response = await fetch(`${API_URL}/schedules/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(schedules)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Success:', result);
    alert('Survey scheduled successfully');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to schedule survey');
  } finally {
    scheduleModal.classList.add('hidden');
  }
});

// Add new schedule item
document.getElementById('addSchedule').addEventListener('click', () => {
  const scheduleContainer = document.getElementById('scheduleContainer');
  const newScheduleItem = document.createElement('div');
  newScheduleItem.className = 'scheduleItem mt-4';
  newScheduleItem.innerHTML = `
       <div class="header flex flex-row mt-3">
        <label for="dayOfWeek" class="block text-sm font-medium text-gray-700">Day of the Week</label>
        <div class="icon-container cursor-pointer" style="margin-left: auto;">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-700 transition-transform duration-300 ease-in-out icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m5 0H7m6 0h3" />
        </svg>
          </div>
      </div>
    <select class="dayOfWeek mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      <option value="1">Monday</option>
      <option value="2">Tuesday</option>
      <option value="3">Wednesday</option>
      <option value="4">Thursday</option>
      <option value="5">Friday</option>
      <option value="6">Saturday</option>
      <option value="7">Sunday</option>
    </select>
    <label for="timeOfDay" class="block text-sm font-medium text-gray-700">Time of Day</label>
    <input type="time" class="timeOfDay mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
  `;
  scheduleContainer.appendChild(newScheduleItem);
  // scheduleContainer.style.maxHeight = "300px";
  scheduleContainer.style.overflow = "scroll";
  removeChild(4)
});


function removeChild(id) {
  const icons = document.querySelectorAll(".icon");
  icons.forEach((icon, index) => {
    icon.addEventListener("click", () => {
      icon.parentElement.parentElement.parentElement.remove()
    })
  })
}



//UTILS

async function check_if_authenticated() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // if (!response.ok) {
    //   throw new Error('Network response was not ok');
    // }

    const result = await response.json();
    try {
      if (result.detail === 'Could not validate credentials') {
        //  alert("Please login")
        document.getElementById('loginButton').click();
      }
    }
    catch {
      console.log('Success:', result);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}
// Function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  let month = (now.getMonth() + 1).toString().padStart(2, '0');
  let day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to get current day of the week (1 for Monday, 7 for Sunday)
function getCurrentDayOfWeek() {
  const now = new Date();
  return now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday (0) to 7
}

// Function to get current time of day in HH:MM format
function getCurrentTimeOfDay() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  const strHours = hours.toString().padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
}


function closeIframe() {
  const scheduledModel = document.getElementById('scheduledSurveysModal');
  // Alternatively, you can hide the iframe
  scheduledModel.classList.add('hidden')
}

// check_if_authenticated()

async function login(email, password){
  try {
    const data = {
      email: email,
      password: password,
    };
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    localStorage.setItem('token', result.access_token);
  } catch {

  } finally {
    loginModal.classList.add('hidden');
  }
}


document.addEventListener("DOMContentLoaded", function() {
  // Existing JavaScript code
  
  // Event listener for analyticsButton
  const analyticsButton = document.getElementById('analyticsButton');
  if (analyticsButton) {
      analyticsButton.addEventListener('click', function() {
          window.location.href = 'dashboard.html';
      });
  }
});


document.getElementById('calender')?.addEventListener('click', () => {
  window.location = 'calender/calender.html';
});
