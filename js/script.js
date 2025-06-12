// Time Display
function updateTime() {
    const now = new Date();

    // Get day of the week
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Get day of the month and add ordinal suffix
    const dayOfMonth = now.getDate();
    let ordinalSuffix;
    if (dayOfMonth > 3 && dayOfMonth < 21) ordinalSuffix = 'th';
    else {
        switch (dayOfMonth % 10) {
            case 1: ordinalSuffix = 'st'; break;
            case 2: ordinalSuffix = 'nd'; break;
            case 3: ordinalSuffix = 'rd'; break;
            default: ordinalSuffix = 'th';
        }
    }

    // Get month
    const month = now.toLocaleDateString('en-US', { month: 'long' });

    // Get time in HH:MM:SS AM/PM format
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const timeString = now.toLocaleTimeString('en-US', timeOptions);

    // Construct the final string
    document.getElementById('current-time').textContent = `Today is ${dayOfWeek}, the ${dayOfMonth}${ordinalSuffix} of ${month}. It's ${timeString}`;
}

function toggleTimeDisplay() {
    // Check if the 'hide-panda-search' class is about to be added
    const willHidePanda = !document.body.classList.contains('hide-panda-search');

    document.body.classList.toggle('hide-boards-tab');
    document.body.classList.toggle('hide-panda-search');

    // If Panda is currently selected AND it's about to be hidden
    if (willHidePanda && currentEngine === 'Panda') {
        currentEngine = 'google'; // Default to Google
        // Update active class for search engines
        document.querySelectorAll('.search-engine').forEach(e => e.classList.remove('active'));
        document.querySelector('.search-engine[data-engine="google"]').classList.add('active');
    }

    // UPDATED: Toggle image between rep.png and random imgN.png
    const suzuImageElement = document.getElementById('suzuImage');
    if (suzuImageElement) {
        if (suzuImageElement.src.endsWith('rep.png')) {
            loadRandomSuzuImage(); // If rep.png is displayed, switch back to random
        } else {
            suzuImageElement.src = 'imgs/suzu/rep.png'; // If random is displayed, switch to rep.png
        }
    }
}

updateTime();
setInterval(updateTime, 1000);

// Search Engines
const searchEngines = {
    google: 'https://www.google.com/search?q=',
    Nyaa: 'https://nyaa.si/?q=',
    Panda: 'https://e-hentai.org/?f_search=',
    yandex: 'https://yandex.com/search/?text='
};

let currentEngine = 'google';

document.querySelectorAll('.search-engine').forEach(engine => {
    engine.addEventListener('click', function() {
        document.querySelectorAll('.search-engine').forEach(e => e.classList.remove('active'));
        this.classList.add('active');
        currentEngine = this.dataset.engine;
        document.getElementById('searchInput').focus();
    });
});

// Search Input and Clear Button Logic
const searchInput = document.getElementById('searchInput');
const clearSearchButton = document.getElementById('clearSearchButton');

searchInput.addEventListener('input', function() {
    // Show/hide clear button based on input value
    if (this.value.trim()) {
        clearSearchButton.classList.remove('hidden');
    } else {
        clearSearchButton.classList.add('hidden');
    }
});

clearSearchButton.addEventListener('click', function() {
    searchInput.value = '';
    searchInput.focus();
    this.classList.add('hidden');
});


searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
        const query = encodeURIComponent(this.value.trim());
        window.open(searchEngines[currentEngine] + query, '_blank');
        this.value = ''; // Clear search input after pressing Enter
        clearSearchButton.classList.add('hidden');
    }
});

// To-Do List with localStorage persistence
let todos = JSON.parse(localStorage.getItem('todos') || '[]');

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <span class="todo-text">${todo}</span>
            <button class="todo-delete" onclick="deleteTodo(${index})">×</button>
        `;
        todoList.appendChild(todoItem);
    });
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text) {
        todos.push(text);
        input.value = '';
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize
renderTodos();

// Dynamic background movement
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;

    const overlay = document.querySelector('.background-overlay');
    overlay.style.background = `
        radial-gradient(circle at ${20 + mouseX * 20}% ${80 - mouseY * 20}%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at ${80 - mouseX * 20}% ${20 + mouseY * 20}%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
    `;
});

// Global variable to store the last checked day of the week
let lastDayOfWeek = -1;

// Background logic: set background image based on the day of the week
function setWeekdayBackground() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayImage = `imgs/bgs/${dayNames[day]}.jpg`;

    document.body.style.background = `
        linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
        url('${todayImage}')
    `;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    lastDayOfWeek = day; // Update the last checked day after setting the background
}

// NEW FUNCTION: Check if the day has changed and update background
function checkAndSetDailyBackground() {
    const currentDay = new Date().getDay();
    // Only update if the day has actually changed
    if (currentDay !== lastDayOfWeek) {
        setWeekdayBackground();
    }
}

// Function to load a random Suzu image
function loadRandomSuzuImage() {
    const min = 1;
    const max = 12;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const imageUrl = `imgs/suzu/img${randomNumber}.png`;
    document.getElementById('suzuImage').src = imageUrl;
}

// Always focus search box, clear its content on page load, and set daily background
window.addEventListener('load', function() {
    searchInput.value = '';
    searchInput.focus();
    clearSearchButton.classList.add('hidden');

    // Initial call to set the background and store the current day
    setWeekdayBackground();
    // Set an interval to check for day change every minute (60 seconds * 1000 ms/s)
    setInterval(checkAndSetDailyBackground, 60 * 1000);

    loadRandomSuzuImage(); // Call this function on page load

    // UPDATED: Add event listener to the image for loading a new one on click, but only if not rep.png
    const suzuImageElement = document.getElementById('suzuImage');
    if (suzuImageElement) {
        suzuImageElement.addEventListener('click', function() {
            // Only load a new random image if the current image is not rep.png
            if (!this.src.endsWith('rep.png')) {
                loadRandomSuzuImage();
            }
            // If it is rep.png, do nothing.
        });
    }
});

// --- Dropdown Logic ---
const MOBILE_BREAKPOINT = 768; // Define a breakpoint for mobile mode

// Named event handler functions
const handleMobileClick = (e) => {
    e.stopPropagation();
    const dropdown = e.currentTarget.querySelector('.dropdown-menu'); // Get dropdown relative to clicked tab
    dropdown.classList.toggle('active-dropdown');
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdown && menu.classList.contains('active-dropdown')) {
            menu.classList.remove('active-dropdown');
        }
    });
};

const handleDesktopMouseEnter = (e) => {
    const tabContainer = e.currentTarget;
    const dropdown = tabContainer.querySelector('.dropdown-menu');
    // Clear any pending hide timeout associated with this tabContainer,
    // for simplicity here we rely on the `hideDropdownTimeout` closure.
    clearTimeout(tabContainer.__hideDropdownTimeout);

    document.querySelectorAll('.dropdown-menu.active-dropdown').forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('active-dropdown');
        }
    });
    dropdown.classList.add('active-dropdown');
};

const handleDesktopMouseLeave = (e) => {
    const tabContainer = e.currentTarget;
    const dropdown = tabContainer.querySelector('.dropdown-menu');
    tabContainer.__hideDropdownTimeout = setTimeout(() => {
        dropdown.classList.remove('active-dropdown');
    }, 150);
};

const handleDropdownMouseEnter = (e) => {
    const dropdown = e.currentTarget;
    const tabContainer = dropdown.closest('.tab-container'); // Find parent tabContainer
    clearTimeout(tabContainer.__hideDropdownTimeout);
};

const handleDropdownMouseLeave = (e) => {
    const dropdown = e.currentTarget;
    const tabContainer = dropdown.closest('.tab-container'); // Find parent tabContainer
    tabContainer.__hideDropdownTimeout = setTimeout(() => {
        dropdown.classList.remove('active-dropdown');
    }, 150);
};

// Function to attach/detach listeners based on mode
function setupDropdownListeners() {
    document.querySelectorAll('.tab-container').forEach(tabContainer => {
        const dropdown = tabContainer.querySelector('.dropdown-menu');

        // Clean up all existing listeners before attaching new ones
        tabContainer.removeEventListener('click', handleMobileClick);
        tabContainer.removeEventListener('mouseenter', handleDesktopMouseEnter);
        tabContainer.removeEventListener('mouseleave', handleDesktopMouseLeave);
        if (dropdown) { // Ensure dropdown exists before trying to remove its listeners
            dropdown.removeEventListener('mouseenter', handleDropdownMouseEnter);
            dropdown.removeEventListener('mouseleave', handleDropdownMouseLeave);
        }

        // Apply listeners based on current window width
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            tabContainer.addEventListener('click', handleMobileClick);
        } else {
            tabContainer.addEventListener('mouseenter', handleDesktopMouseEnter);
            tabContainer.addEventListener('mouseleave', handleDesktopMouseLeave);
            if (dropdown) { // Only add if dropdown exists
                dropdown.addEventListener('mouseenter', handleDropdownMouseEnter);
                dropdown.addEventListener('mouseleave', handleDropdownMouseLeave);
            }
        }
    });
}

// Initial setup on page load
setupDropdownListeners();

// Re-setup listeners on window resize
window.addEventListener('resize', setupDropdownListeners);

// Universal click outside listener to close dropdowns
document.addEventListener('click', (e) => {
    if (!e.target.closest('.tab-container')) {
        document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
            dropdown.classList.remove('active-dropdown');
        });
    }
});
