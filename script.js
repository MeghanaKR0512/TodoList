let todoItemsContainer = document.getElementById("todoItemsContainer");
let addTodoButton = document.getElementById("addTodoButton");
let saveTodoButton = document.getElementById("saveTodoButton");
let tasksCountElement = document.getElementById("tasksCount");
let toggleModeButton = document.getElementById("toggleModeButton");
let todoList = getTodoListFromLocalStorage();
let todosCount = todoList.length;

function getTodoListFromLocalStorage() {
  let data = localStorage.getItem("todoList");
  return data ? JSON.parse(data) : [];
}

function saveToLocalStorage() {
  localStorage.setItem("todoList", JSON.stringify(todoList));
}

function updateTasksCount() {
  tasksCountElement.textContent = "Total Tasks: " + todoList.length;
  let completedCount = todoList.filter(t => t.isChecked).length;
  let percent = todoList.length === 0 ? 0 : Math.round((completedCount / todoList.length) * 100);
  let progressBar = document.getElementById("taskProgressBar");
  progressBar.style.width = percent + "%";
  progressBar.textContent = percent + "%";
}

function onAddTodo() {
  let text = document.getElementById("todoUserInput").value.trim();
  let priority = document.getElementById("prioritySelect").value;
  let dueDate = document.getElementById("dueDateInput").value;
  if (text === "") {
    alert("Enter valid text.");
    return;
  }
  todosCount += 1;
  let newTodo = {
    text: text,
    uniqueNo: todosCount,
    isChecked: false,
    priority: priority,
    dueDate: dueDate
  };
  todoList.push(newTodo);
  createAndAppendTodo(newTodo);
  document.getElementById("todoUserInput").value = "";
  document.getElementById("dueDateInput").value = "";
  updateTasksCount();
}

addTodoButton.onclick = onAddTodo;
saveTodoButton.onclick = saveToLocalStorage;

function onTodoStatusChange(checkboxId, labelId, todoId) {
  let checkbox = document.getElementById(checkboxId);
  let label = document.getElementById(labelId);
  label.classList.toggle("checked");
  let index = todoList.findIndex(t => "todo" + t.uniqueNo === todoId);
  todoList[index].isChecked = checkbox.checked;
  updateTasksCount();
  saveToLocalStorage();

  let completedTasks = todoList.filter(t => t.isChecked).length;
  if (completedTasks === 5) {
    alert("🎉 Productivity Ninja! 5 tasks done!");
  } else if (completedTasks === 10) {
    alert("🏆 Task Master! 10 tasks crushed!");
  }
}

function onDeleteTodo(todoId) {
  if (confirm("Are you sure you want to delete this task?")) {
    document.getElementById(todoId).remove();
    todoList = todoList.filter(t => "todo" + t.uniqueNo !== todoId);
    updateTasksCount();
    saveToLocalStorage();
  }
}

function createAndAppendTodo(todo) {
  let todoId = "todo" + todo.uniqueNo;
  let checkboxId = "checkbox" + todo.uniqueNo;
  let labelId = "label" + todo.uniqueNo;

  let todoElement = document.createElement("li");
  todoElement.classList.add("todo-item-container", "d-flex", "flex-row");
  todoElement.id = todoId;
  todoItemsContainer.appendChild(todoElement);

  let input = document.createElement("input");
  input.type = "checkbox";
  input.id = checkboxId;
  input.checked = todo.isChecked;
  input.classList.add("checkbox-input");
  input.onclick = () => onTodoStatusChange(checkboxId, labelId, todoId);
  todoElement.appendChild(input);

  let labelContainer = document.createElement("div");
  labelContainer.classList.add("label-container", "flex-grow-1", "d-flex", "align-items-center");
  todoElement.appendChild(labelContainer);

  let label = document.createElement("label");
  label.setAttribute("for", checkboxId);
  label.id = labelId;
  label.classList.add("checkbox-label");
  label.textContent = todo.text;
  if (todo.isChecked) label.classList.add("checked");
  labelContainer.appendChild(label);

  let badge = document.createElement("span");
  badge.classList.add("priority-badge");
  badge.classList.add(`priority-${todo.priority.toLowerCase()}`);
  badge.textContent = todo.priority;
  labelContainer.appendChild(badge);

  if (todo.dueDate) {
    let meta = document.createElement("div");
    meta.classList.add("todo-meta");
    meta.textContent = `• Due: ${todo.dueDate}`;
    labelContainer.appendChild(meta);

    let today = new Date();
    let due = new Date(todo.dueDate);
    let diffTime = due - today;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1 && diffTime > 0) {
      todoElement.classList.add("due-soon");
    } else if (diffTime < 0) {
      todoElement.style.backgroundColor = "#ffdddd";
    }
  }

  let delIcon = document.createElement("i");
  delIcon.classList.add("fas", "fa-trash", "delete-icon", "ml-2");
  delIcon.onclick = () => onDeleteTodo(todoId);
  labelContainer.appendChild(delIcon);
}

for (let todo of todoList) createAndAppendTodo(todo);
updateTasksCount();

document.getElementById("showAllBtn").onclick = () => {
  todoItemsContainer.innerHTML = "";
  for (let todo of todoList) createAndAppendTodo(todo);
};

document.getElementById("showCompletedBtn").onclick = () => {
  todoItemsContainer.innerHTML = "";
  for (let todo of todoList.filter(t => t.isChecked)) createAndAppendTodo(todo);
};

document.getElementById("showPendingBtn").onclick = () => {
  todoItemsContainer.innerHTML = "";
  for (let todo of todoList.filter(t => !t.isChecked)) createAndAppendTodo(todo);
};

document.getElementById("sortPriorityBtn").onclick = () => {
  let priorityOrder = { High: 1, Medium: 2, Low: 3 };
  todoItemsContainer.innerHTML = "";
  let sorted = [...todoList].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  for (let todo of sorted) createAndAppendTodo(todo);
};

document.getElementById("sortDueDateBtn").onclick = () => {
  todoItemsContainer.innerHTML = "";
  let sorted = [...todoList].sort((a, b) => new Date(a.dueDate || "3000-12-31") - new Date(b.dueDate || "3000-12-31"));
  for (let todo of sorted) createAndAppendTodo(todo);
};

document.getElementById("checkStatusBtn").onclick = () => {
  let pendingTasks = todoList.filter(t => !t.isChecked);
  alert(pendingTasks.length > 0 ? `You still have ${pendingTasks.length} pending task(s)!` : "Awesome! No pending tasks.");
};

document.getElementById("clearAllButton").onclick = () => {
  if (confirm("Clear all tasks?")) {
    todoItemsContainer.innerHTML = "";
    todoList = [];
    saveToLocalStorage();
    updateTasksCount();
  }
};

document.getElementById("generateQRButton").onclick = () => {
  let textContent = todoList.map(t => {
    let status = t.isChecked ? "✅" : "❌";
    return `${status} ${t.text}`;
  }).join('\n');

  if (textContent.trim() === "") {
    alert("No tasks to generate QR.");
    return;
  }

  document.getElementById("qrcode").innerHTML = "";
  new QRCode(document.getElementById("qrcode"), {
    text: textContent,
    width: 200,
    height: 200
  });
};

document.getElementById("voiceInputButton").onclick = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice recognition not supported in this browser.");
    return;
  }

  let recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    let text = event.results[0][0].transcript;
    document.getElementById("todoUserInput").value = text;
  };
};

toggleModeButton.onclick = () => {
  document.body.classList.toggle("dark-mode");
  toggleModeButton.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
};

window.onload = function () {
  let quotes = [
    "Start where you are. Use what you have. Do what you can.",
    "Small steps every day lead to big results.",
    "Dream big. Work hard. Stay focused.",
    "Progress is progress, no matter how small.",
    "Believe you can, and you're halfway there.",
    "Great things never come from comfort zones.",
    "Don't watch the clock; do what it does — keep going."
  ];

  let quoteElement = document.getElementById("dailyQuote");
  let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteElement.textContent = `💡 "${randomQuote}"`;

  document.getElementById("getStartedButton").onclick = function () {
    document.getElementById("welcomePage").style.display = "none";
    document.getElementById("todoAppContainer").style.display = "block";

    let dueSoonTasks = todoList.filter(t => {
      if (t.dueDate && !t.isChecked) {
        let diff = new Date(t.dueDate) - new Date();
        return diff <= 86400000 && diff > 0;
      }
      return false;
    });
    if (dueSoonTasks.length > 0) {
      alert(`You have ${dueSoonTasks.length} task(s) due soon! 📅`);
    }
  };
};
