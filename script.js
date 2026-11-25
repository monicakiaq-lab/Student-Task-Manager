const API_URL = "https://jsonplaceholder.typicode.com/todos";



// HTML ELEMENTS


const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");

const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");

const searchInput = document.getElementById("search-input");

const allButton = document.getElementById("all-btn");
const pendingButton = document.getElementById("pending-btn");
const completedButton = document.getElementById("completed-btn");



// VARIABLES

let tasks = [];
let currentFilter = "all";



// GET - FETCH TASKS


async function getTasks() {

    statusMessage.textContent = "Loading tasks...";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        // Use only first 10 tasks
        tasks = data.slice(0, 10);

        statusMessage.textContent =
            `${tasks.length} tasks loaded successfully.`;

        displayTasks();

    } catch (error) {

        console.error("Error:", error);

        statusMessage.textContent =
            "Unable to load tasks. Please try again.";
    }
}



// DISPLAY TASKS


function displayTasks() {

    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();


    const filteredTasks = tasks.filter(task => {

        // Pending filter
        if (currentFilter === "pending" && task.completed) {
            return false;
        }

        // Completed filter
        if (currentFilter === "completed" && !task.completed) {
            return false;
        }

        // Search filter
        return task.title.toLowerCase().includes(searchText);
    });


    // No tasks found
    if (filteredTasks.length === 0) {

        taskList.innerHTML = "<p>No tasks found.</p>";

        return;
    }


    // Create task cards
    filteredTasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";


        taskCard.innerHTML = `
            <h3>${task.title}</h3>

            <p>
                Status:
                ${task.completed ? "Completed" : "Pending"}
            </p>

            <div class="task-actions">

                <button class="edit-btn" data-id="${task.id}">
                    Edit
                </button>

                <button class="complete-btn" data-id="${task.id}">
                    ${task.completed ? "Mark Pending" : "Complete"}
                </button>

                <button class="delete-btn" data-id="${task.id}">
                    Delete
                </button>

            </div>
        `;


        taskList.appendChild(taskCard);
    });
}


// POST - ADD NEW TASK
//

taskForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title = taskTitle.value.trim();


    if (title === "") {
        return;
    }


    try {

        statusMessage.textContent = "Adding task...";


        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title: title,

                completed: false,

                userId: 1
            })
        });


        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }


        const newTask = await response.json();


        // Add the new task to our local array
        tasks.unshift(newTask);


        // Clear input
        taskTitle.value = "";


        statusMessage.textContent =
            "Task added successfully.";


        displayTasks();


    } catch (error) {

        console.error("Error:", error);

        statusMessage.textContent =
            "Unable to add task.";
    }

});


// ALL BUTTON//


allButton.addEventListener("click", function () {

    currentFilter = "all";

    displayTasks();

});


// PENDING BUTTON


pendingButton.addEventListener("click", function () {

    currentFilter = "pending";

    displayTasks();

});


// COMPLETED BUTTON
// 

completedButton.addEventListener("click", function () {

    currentFilter = "completed";

    displayTasks();

});


// SEARCH
//
searchInput.addEventListener("input", function () {

    displayTasks();

});



// EDIT / COMPLETE / DELETE


taskList.addEventListener("click", async function (event) {

    const clickedButton = event.target;


    // Get task ID
    const taskId = Number(clickedButton.dataset.id);


    // If Edit button clicked
    if (clickedButton.classList.contains("edit-btn")) {

        await editTask(taskId);

    }


    // If Complete button clicked
    if (clickedButton.classList.contains("complete-btn")) {

        await updateTaskStatus(taskId);

    }


    // If Delete button clicked
    if (clickedButton.classList.contains("delete-btn")) {

        await deleteTask(taskId);

    }

});



// PUT - EDIT TASK//

async function editTask(taskId) {

    const task = tasks.find(task => task.id === taskId);


    if (!task) {
        return;
    }


    const newTitle = prompt(
        "Enter the new task title:",
        task.title
    );


    if (newTitle === null || newTitle.trim() === "") {
        return;
    }


    try {

        statusMessage.textContent = "Updating task...";


        const response = await fetch(
            `${API_URL}/${taskId}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    id: task.id,

                    title: newTitle.trim(),

                    completed: task.completed,

                    userId: task.userId
                })
            }
        );


        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }


        const updatedTask = await response.json();


        // Update local task
        const index = tasks.findIndex(
            task => task.id === taskId
        );


        tasks[index] = updatedTask;


        statusMessage.textContent =
            "Task updated successfully.";


        displayTasks();


    } catch (error) {

        console.error("Error:", error);

        statusMessage.textContent =
            "Unable to update task.";
    }

}


// PATCH - CHANGE TASK STATUS


async function updateTaskStatus(taskId) {

    const task = tasks.find(task => task.id === taskId);


    if (!task) {
        return;
    }


    try {

        statusMessage.textContent =
            "Updating task status...";


        const response = await fetch(
            `${API_URL}/${taskId}`,
            {

                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    completed: !task.completed
                })
            }
        );


        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }


        const updatedTask = await response.json();


        // Update local task status
        task.completed = updatedTask.completed;


        statusMessage.textContent =
            "Task status updated successfully.";


        displayTasks();


    } catch (error) {

        console.error("Error:", error);

        statusMessage.textContent =
            "Unable to update task status.";
    }

}



// DELETE - DELETE TASK


async function deleteTask(taskId) {

    const task = tasks.find(task => task.id === taskId);


    if (!task) {
        return;
    }


    const confirmDelete = confirm(
        `Do you want to delete "${task.title}"?`
    );


    if (!confirmDelete) {
        return;
    }


    try {

        statusMessage.textContent =
            "Deleting task...";


        const response = await fetch(
            `${API_URL}/${taskId}`,
            {

                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }


        // Remove task from local array
        tasks = tasks.filter(
            task => task.id !== taskId
        );


        statusMessage.textContent =
            "Task deleted successfully.";


        displayTasks();


    } catch (error) {

        console.error("Error:", error);

        statusMessage.textContent =
            "Unable to delete task.";
    }

}





getTasks();