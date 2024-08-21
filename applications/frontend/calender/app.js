let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = new Date().getDate();

function updateCalendar() {
  const monthYear = document.getElementById('month-year');
  monthYear.textContent = getMonthName(currentMonth) + ' ' + currentYear;

  const calendarDays = document.getElementById('calendar-days');
  calendarDays.innerHTML = '';

  const date = new Date(currentYear, currentMonth, 1);
  const firstDay = date.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const day = document.createElement('div');
    day.classList.add('col-span-1');
    calendarDays.appendChild(day);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.classList.add('col-span-1', 'bg-white', 'rounded-md', 'shadow', 'cursor-pointer', 'hover:bg-gray-200', 'p-2', 'text-center');
    if (i === selectedDay && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) {
      day.classList.add('current-day');
    }
    day.textContent = i;
    day.onclick = () => showPopup(currentYear, currentMonth, i);
    calendarDays.appendChild(day);
  }

  updateSidebar();
}

function getMonthName(monthIndex) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return monthNames[monthIndex];
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateCalendar();
}

function showPopup(year, month, day) {
  selectedDay = day;
  const popup = document.getElementById('popup');
  const popupDate = document.getElementById('popup-date');
  const todoList = document.getElementById('todo-list');
  const notesInput = document.getElementById('notes');

  const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const storedData = localStorage.getItem(key);
  if (storedData) {
    const { todos, notes } = JSON.parse(storedData);
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const todoItem = document.createElement('li');
      todoItem.classList.add('flex', 'justify-between', 'items-center', 'py-2');
      todoItem.innerHTML = `
        <span>${todo}</span>
        <div class="flex space-x-2">
          <button onclick="editTodoItem(this)" class="text-yellow-500 hover:text-yellow-600">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteTodoItem(this)" class="text-red-500 hover:text-red-600">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      todoList.appendChild(todoItem);
    });
    notesInput.value = notes;
  } else {
    todoList.innerHTML = '';
    notesInput.value = '';
  }

  popupDate.textContent = `${getMonthName(month)} ${day}, ${year}`;
  popup.classList.remove('hidden');
}

function addTodo() {
  const todoInput = document.getElementById('new-todo');
  const todoList = document.getElementById('todo-list');
  if (todoInput.value.trim()) {
    const newTodo = document.createElement('li');
    newTodo.classList.add('flex', 'justify-between', 'items-center', 'py-2');
    newTodo.innerHTML = `
      <span>${todoInput.value}</span>
      <div class="flex space-x-2">
        <button onclick="editTodoItem(this)" class="text-yellow-500 hover:text-yellow-600">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteTodoItem(this)" class="text-red-500 hover:text-red-600">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    todoList.appendChild(newTodo);
    todoInput.value = '';
    saveData(); // Save after adding
  }
}

function editTodoItem(button) {
  const todoItem = button.closest('li');
  const span = todoItem.querySelector('span');
  const newTodo = prompt('Edit todo:', span.textContent);
  if (newTodo !== null) {
    span.textContent = newTodo;
    saveData(); // Save after editing
  }
}

function deleteTodoItem(button) {
  const todoItem = button.closest('li');
  todoItem.remove();
  saveData(); // Save after deleting
}

function saveData() {
  const todoList = document.getElementById('todo-list');
  const notesInput = document.getElementById('notes');
  const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const todos = Array.from(todoList.children).map(li => li.querySelector('span').textContent);
  const notes = notesInput.value;
  if (todos.length > 0 || notes.trim()) {
    localStorage.setItem(key, JSON.stringify({ todos, notes }));
  } else {
    localStorage.removeItem(key); // Remove entry if no todos or notes
  }

  const saveIndicator = document.getElementById('save-indicator');
  saveIndicator.classList.remove('hidden');
  setTimeout(() => {
    saveIndicator.classList.add('hidden');
  }, 2000);
}

function closePopup() {
  document.getElementById('popup').classList.add('hidden');
}

// Sidebar
const sidebarContent = document.getElementById('sidebarContent');
let currentDate = new Date();
const todos = {};
const notes = {}

// Update the sidebar with today's todos and notes
function updateSidebar(date) {
  const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem(key));
  } catch {
    data = {};
  }
  sidebarContent.innerHTML = ''; // Clear sidebar content

  const todaysTodos = data.todos || [];
  const todaysNotes = [data.notes] || [];

  const todosHeading = document.createElement('h3');
  todosHeading.textContent = 'Todos';
  todosHeading.classList.add('font-semibold', 'text-lg');
  sidebarContent.appendChild(todosHeading);

  const todosList = document.createElement('ul');
  todosList.classList.add('list-disc', 'ml-5');
  todaysTodos.forEach(todo => {
    const li = document.createElement('li');
    li.textContent = todo;
    todosList.appendChild(li);
  });
  sidebarContent.appendChild(todosList);

  const notesHeading = document.createElement('h3');
  notesHeading.textContent = 'Notes';
  notesHeading.classList.add('font-semibold', 'text-lg', 'mt-4');
  sidebarContent.appendChild(notesHeading);

  const notesList = document.createElement('div');
  notesList.classList.add('list-none', 'ml-0');
  todaysNotes.forEach(note => {
    const li = document.createElement('p');
    li.textContent = note;
    notesList.appendChild(li);
  });
  sidebarContent.appendChild(notesList);
}



updateCalendar();