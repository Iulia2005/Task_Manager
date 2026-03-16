const themeBtn = document.getElementById('theme-btn');
const themeDropdownBtn = document.getElementById('theme-dropdown-btn');
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  document.body.classList.add('dark-theme');
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  let theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

themeDropdownBtn.addEventListener('click', (event) => {
  event.preventDefault();
  dropdownMenu.classList.remove('show');
});

const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const loginLink = document.getElementById('login-link');
const loginModal = document.getElementById('login-modal');
const closeModal = document.getElementById('close-modal');
const showPasswordCheckbox = document.getElementById('show-password');
const passwordInput = document.getElementById('password');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let currentActiveTaskId = null;
let isEditing = false;
let currentFilter = 'all'; 

const filterBtn = document.getElementById('filter-btn');
const addNewBtn = document.getElementById('add-new-btn');
const taskList = document.getElementById('task-list');

const addTaskModal = document.getElementById('add-task-modal');
const closeTaskModal = document.getElementById('close-task-modal');
const addTaskModalTitle = document.getElementById('add-task-modal-title');
const taskNameInput = document.getElementById('task-name');
const taskDescInput = document.getElementById('task-desc');
const submitNewTaskBtn = document.getElementById('submit-new-task');

const viewTaskModal = document.getElementById('view-task-modal');
const closeViewModal = document.getElementById('close-view-modal');
const viewTaskTitle = document.getElementById('view-task-title');
const viewTaskDesc = document.getElementById('view-task-desc');
const editTaskBtn = document.getElementById('edit-task-btn');
const deleteTaskBtn = document.getElementById('delete-task-btn');
const toggleStatusBtn = document.getElementById('toggle-status-btn'); 

const diaryEntryInput = document.getElementById('diary-entry');
const saveDiaryBtn = document.getElementById('save-diary-btn');

const calendarMonthYear = document.getElementById('calendar-month-year');
const calendarGrid = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

const todayDate = new Date();
let currentDisplayedMonth = todayDate.getMonth();
let currentDisplayedYear = todayDate.getFullYear();

function saveTasks() {
  localStorage.setItem('myTasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  
  let filteredTasks = tasks;
  
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(task => task.completed);
  }
  
  const sortedTasks = [...filteredTasks].sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
  
  if(sortedTasks.length === 0) {
      taskList.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">No tasks found.</p>';
      return;
  }

  sortedTasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');
    if (task.completed) {
      taskItem.classList.add('completed');
    }

    const checkCircle = document.createElement('div');
    checkCircle.classList.add('task-check-circle');
    checkCircle.innerHTML = '<span class="checkmark">&#10003;</span>'; 

    checkCircle.addEventListener('click', (event) => {
      event.stopPropagation(); 
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });
    taskItem.appendChild(checkCircle);

    const taskContent = document.createElement('div');
    taskContent.classList.add('task-content');

    const taskTitle = document.createElement('h4');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = task.name;

    const taskDescription = document.createElement('p');
    taskDescription.classList.add('task-description');
    
    const maxDescLength = 80;
    if(task.desc.length > maxDescLength) {
        taskDescription.textContent = task.desc.substring(0, maxDescLength) + '...';
    } else {
        taskDescription.textContent = task.desc;
    }

    taskContent.appendChild(taskTitle);
    taskContent.appendChild(taskDescription);
    taskItem.appendChild(taskContent);
    
    const taskAffordance = document.createElement('div');
    taskAffordance.classList.add('task-click-affordance');
    taskAffordance.textContent = '>'; 
    taskItem.appendChild(taskAffordance);

    const timestamp = document.createElement('div');
    timestamp.classList.add('task-timestamp');
    const dateObj = new Date(task.id); 
    timestamp.textContent = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    taskItem.appendChild(timestamp);

    taskItem.addEventListener('click', () => {
      currentActiveTaskId = task.id;
      viewTaskTitle.textContent = task.name;
      viewTaskDesc.textContent = task.desc;
      
      if(task.completed) {
          toggleStatusBtn.textContent = 'Unmark as Completed';
          toggleStatusBtn.style.backgroundColor = '#b2a7b1'; 
          viewTaskTitle.style.textDecoration = "line-through";
      } else {
          toggleStatusBtn.textContent = 'Mark Completed';
          toggleStatusBtn.style.backgroundColor = '#8a81c7'; 
          viewTaskTitle.style.textDecoration = "none";
      }

      viewTaskModal.style.display = 'flex';
    });

    taskList.appendChild(taskItem);
  });
}

filterBtn.addEventListener('click', () => {
  if (currentFilter === 'all') {
    currentFilter = 'active';
    filterBtn.textContent = 'Show Active';
  } else if (currentFilter === 'active') {
    currentFilter = 'completed';
    filterBtn.textContent = 'Show Completed';
  } else {
    currentFilter = 'all';
    filterBtn.textContent = 'Show All';
  }
  renderTasks();
});

addNewBtn.addEventListener('click', () => {
  isEditing = false;
  addTaskModalTitle.textContent = 'Add New Task';
  submitNewTaskBtn.textContent = 'Save Task';
  taskNameInput.value = '';
  taskDescInput.value = '';
  addTaskModal.style.display = 'flex';
});

editTaskBtn.addEventListener('click', () => {
  isEditing = true;
  addTaskModalTitle.textContent = 'Edit Task';
  submitNewTaskBtn.textContent = 'Save Changes';
  
  const taskToEdit = tasks.find(t => t.id === currentActiveTaskId);
  if (taskToEdit) {
    taskNameInput.value = taskToEdit.name;
    taskDescInput.value = taskToEdit.desc;
  }
  
  viewTaskModal.style.display = 'none';
  addTaskModal.style.display = 'flex';
});

submitNewTaskBtn.addEventListener('click', () => {
  const taskName = taskNameInput.value.trim();
  const taskDesc = taskDescInput.value.trim();

  if (taskName !== '' && taskDesc !== '') {
    if (isEditing && currentActiveTaskId !== null) {
      const taskIndex = tasks.findIndex(t => t.id === currentActiveTaskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].name = taskName;
        tasks[taskIndex].desc = taskDesc;
      }
      isEditing = false;
      currentActiveTaskId = null;
    } else {
      const newTask = {
        id: Date.now(),
        name: taskName,
        desc: taskDesc,
        completed: false
      };
      tasks.push(newTask);
    }

    saveTasks();
    renderTasks();

    taskNameInput.value = '';
    taskDescInput.value = '';
    addTaskModal.style.display = 'none';
  }
});

deleteTaskBtn.addEventListener('click', () => {
  if (currentActiveTaskId !== null) {
    tasks = tasks.filter(t => t.id !== currentActiveTaskId);
    saveTasks();
    renderTasks();
    viewTaskModal.style.display = 'none';
    currentActiveTaskId = null;
  }
});

toggleStatusBtn.addEventListener('click', () => {
   if (currentActiveTaskId !== null) {
      const taskIndex = tasks.findIndex(t => t.id === currentActiveTaskId);
      if (taskIndex !== -1) {
          tasks[taskIndex].completed = !tasks[taskIndex].completed;
          saveTasks();
          renderTasks();
          viewTaskModal.style.display = 'none'; 
      }
   }
});

diaryEntryInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

const savedDiary = localStorage.getItem('myDiary');
if (savedDiary) {
  diaryEntryInput.value = savedDiary;
  setTimeout(() => {
    diaryEntryInput.style.height = diaryEntryInput.scrollHeight + 'px';
  }, 0);
}

saveDiaryBtn.addEventListener('click', () => {
  localStorage.setItem('myDiary', diaryEntryInput.value);
});


prevMonthBtn.addEventListener('click', () => {
  currentDisplayedMonth--;
  if (currentDisplayedMonth < 0) {
    currentDisplayedMonth = 11;
    currentDisplayedYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDisplayedMonth++;
  if (currentDisplayedMonth > 11) {
    currentDisplayedMonth = 0;
    currentDisplayedYear++;
  }
  renderCalendar();
});

function renderCalendar() {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  calendarMonthYear.textContent = `${monthNames[currentDisplayedMonth]} ${currentDisplayedYear}`;

  calendarGrid.innerHTML = `
    <span class="day-header">Su</span>
    <span class="day-header">Mo</span>
    <span class="day-header">Tu</span>
    <span class="day-header">We</span>
    <span class="day-header">Th</span>
    <span class="day-header">Fr</span>
    <span class="day-header">Sa</span>
  `;

  const firstDayOfMonth = new Date(currentDisplayedYear, currentDisplayedMonth, 1).getDay();
  const daysInMonth = new Date(currentDisplayedYear, currentDisplayedMonth + 1, 0).getDate();

  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptySpan = document.createElement('span');
    calendarGrid.appendChild(emptySpan);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const daySpan = document.createElement('span');
    daySpan.textContent = i;
    
    if (i === todayDate.getDate() && currentDisplayedMonth === todayDate.getMonth() && currentDisplayedYear === todayDate.getFullYear()) {
      daySpan.classList.add('today');
    }
    
    calendarGrid.appendChild(daySpan);
  }
}

menuBtn.addEventListener('click', () => {
  dropdownMenu.classList.toggle('show');
});

loginLink.addEventListener('click', (event) => {
  event.preventDefault();
  loginModal.style.display = 'flex';
  dropdownMenu.classList.remove('show');
});

closeModal.addEventListener('click', () => {
  loginModal.style.display = 'none';
});

closeTaskModal.addEventListener('click', () => { addTaskModal.style.display = 'none'; });
closeViewModal.addEventListener('click', () => { viewTaskModal.style.display = 'none'; });

window.addEventListener('click', (event) => {
  if (!event.target.matches('.hamburger') && dropdownMenu.classList.contains('show')) {
    dropdownMenu.classList.remove('show');
  }
  if (event.target === loginModal) loginModal.style.display = 'none';
  if (event.target === addTaskModal) addTaskModal.style.display = 'none';
  if (event.target === viewTaskModal) viewTaskModal.style.display = 'none';
});

showPasswordCheckbox.addEventListener('change', () => {
  if (showPasswordCheckbox.checked) {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
});


renderTasks();
renderCalendar();
