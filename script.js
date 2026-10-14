console.log("ElderCare Planner JavaScript loaded!");
function saveName() {
    let name= document.getElementById("nameInput").value;
    if (name=="") {
        alert("Please enter your name");
        return;
    }
    localStorage.setItem("username",name);
    document.getElementById("welcomeMessage").innerText= "Welcome to your Health Planner, " + name + "!";
}

window.onload=function(){
    let savedName=localStorage.getItem("username");
    if (savedName != null) {
        document.getElementById("welcomeMessage").innerText= "Welcome to your Health Planner, " + savedName + "!";
    }
    resetTasksForNewDay();
    loadTasks();
}

function completeTask(button) {

    button.innerText = "Completed ✓";

    button.disabled = true;
    updateProgress();
    saveTasks();
}

function updateProgress(){
    let tasks= document.querySelectorAll(".task");
    let totalTasks= tasks.length;
    let completedTasks = document.querySelectorAll(".task button:disabled");
    let completed = completedTasks.length;
    document.getElementById("progressText").innerText= "Today's progress: " + completed + " of " + totalTasks + " tasks completed";
}


function addTask() {
    console.log("Add Task button clicked!");

    let taskName = document.getElementById("taskInput").value;
    let taskTime = document.getElementById("taskTime").value;
    let taskRepeat = document.getElementById("taskRepeat").value;
    let taskCategory = document.getElementById("taskCategory").value;

    if (taskName.trim() === "") {
        alert("Please enter a task.");
        return;
    }

    let taskList = document.getElementById("taskList");

    let newTask = document.createElement("div");
    newTask.className = "task";

    newTask.dataset.name = taskName;
    newTask.dataset.time = taskTime;
    newTask.dataset.repeat = taskRepeat;
    newTask.dataset.category = taskCategory;

    let taskText = document.createElement("span");
    taskText.textContent = taskTime
        ? `${taskName} — ${taskTime}`
        : taskName;

    let doneButton = document.createElement("button");
    doneButton.textContent = "Done";
    doneButton.onclick = function() {
        completeTask(doneButton);
    };

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.onclick = function() {
        deleteTask(this);
    };

    newTask.appendChild(taskText);
    newTask.appendChild(doneButton);
    newTask.appendChild(deleteButton);

    taskList.appendChild(newTask);

    document.getElementById("taskInput").value = "";
    document.getElementById("taskTime").value = "";

    sortTasksByTime();
    updateProgress();
    saveTasks();
}


function loadTasks() {
    let savedTasks = localStorage.getItem("tasks");

    if (savedTasks === null) {
        return;
    }

    let tasks = JSON.parse(savedTasks);
    let taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach(function(task) {
        let taskName = task.name || task.taskName || "";
        let taskTime = task.time || task.taskTime || "";

        if (taskName.includes(" — ") && !taskTime) {
            let separatorIndex = taskName.lastIndexOf(" — ");

            taskTime = taskName.slice(separatorIndex + 3);
            taskName = taskName.slice(0, separatorIndex);
        }

        let newTask = document.createElement("div");
        newTask.className = "task";
        newTask.dataset.name = taskName;
        newTask.dataset.time = taskTime;
        newTask.dataset.repeat = task.repeat || "once";
        newTask.dataset.category = task.category || "other";
        
        
        let taskText = document.createElement("span");

        let category = task.category || "other";
        let categoryLabel = category
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        taskText.innerText = taskTime
            ? `${taskName} — ${taskTime} | ${categoryLabel}`
            : `${taskName} | ${categoryLabel}`;

        let button = document.createElement("button");
        button.innerText = task.completed ? "Completed ✓" : "Done";
        button.disabled = Boolean(task.completed);

        button.onclick = function() {
            completeTask(this);
        };

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";

        deleteButton.onclick = function() {
        deleteTask(this);
        };

        newTask.appendChild(taskText);
        newTask.appendChild(button);
        newTask.appendChild(deleteButton);
        taskList.appendChild(newTask);
    });
    sortTasksByTime();
    updateProgress();
    saveTasks();
}

function deleteTask(button) {
    let task = button.parentElement;

    if (confirm("Are you sure you want to delete this task?")) {
        task.remove();
        updateProgress();
        saveTasks();
    }
}

function sortTasksByTime() {
    let taskList = document.getElementById("taskList");
    let tasks = Array.from(taskList.querySelectorAll(".task"));

    tasks.sort(function(a, b) {
        let timeA = a.dataset.time || "99:99";
        let timeB = b.dataset.time || "99:99";

        return timeA.localeCompare(timeB);
    });

    tasks.forEach(function(task) {
        taskList.appendChild(task);
    });
}


function resetTasksForNewDay() {
    let today = new Date().toLocaleDateString();
    let lastDate = localStorage.getItem("lastTaskDate");

    if (lastDate !== today) {
        let savedTasks = localStorage.getItem("tasks");

        if (savedTasks !== null) {
            let tasks = JSON.parse(savedTasks);

            tasks.forEach(function(task) {
                if (task.repeat === "daily") {
                    task.completed = false;
                }
            });

            localStorage.setItem("tasks", JSON.stringify(tasks));
        }

        localStorage.setItem("lastTaskDate", today);
    }
}


function saveTasks() {
    let tasks = [];

    document.querySelectorAll(".task").forEach(function(task) {
        let buttons = task.querySelectorAll("button");
        let doneButton = buttons[0];

        tasks.push({
            name: task.dataset.name || "",
            time: task.dataset.time || "",
            repeat: task.dataset.repeat || "once",
            category: task.dataset.category || "other",
            completed: doneButton.disabled
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}
