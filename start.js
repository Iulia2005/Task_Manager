const themeBtn = document.getElementById('theme-btn');
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  document.body.classList.add('dark-theme');
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  let theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

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

closeTaskModal.addEventListener('click', () => { addTaskModal.style.display = 'none'; });
closeViewModal.addEventListener('click', () => { viewTaskModal.style.display = 'none'; });

window.addEventListener('click', (event) => {
  if (event.target === addTaskModal) addTaskModal.style.display = 'none';
  if (event.target === viewTaskModal) viewTaskModal.style.display = 'none';
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

renderTasks();
