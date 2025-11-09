// Set background image based on day of the week
function setDayBackground() {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const dayName = daysOfWeek[today.getDay()];

    // Create image path
    const imagePath = `imgs/bgs/${dayName}.jpg`;

    // Create a new Image object to preload and check if the image exists
    const img = new Image();

    img.onload = function() {
        // Image loaded successfully, set it as background
        document.body.style.backgroundImage = `url('${imagePath}')`;
    };

    img.onerror = function() {
        // Image failed to load, keep the gradient fallback
        console.log(`Background image for ${dayName} not found, using gradient fallback`);
        // The gradient is already set in CSS as a fallback
    };

    // Start loading the image
    img.src = imagePath;
}

// Set random image in the image container
function setRandomSideImage() {
    const imageContainer = document.querySelector('.image-container');

    // Generate a random number between 1 and 12
    const randomImageNumber = Math.floor(Math.random() * 12) + 1;

    // Create the image path
    const imagePath = `imgs/side/img(${randomImageNumber}).png`;

    // Create a new Image object to preload and check if the image exists
    const img = new Image();

    img.onload = function() {
        // Image loaded successfully, replace placeholder with the image
        imageContainer.innerHTML = '';

        // Create the image element
        const sideImage = document.createElement('img');
        sideImage.src = imagePath;
        sideImage.alt = `Random image ${randomImageNumber}`;
        sideImage.style.width = '100%';
        sideImage.style.height = '100%';
        sideImage.style.objectFit = 'cover';
        sideImage.style.borderRadius = '10px';

        // Add the image to the container
        imageContainer.appendChild(sideImage);
    };

    img.onerror = function() {
        // Image failed to load, keep the placeholder
        console.log(`Side image ${randomImageNumber} not found, keeping placeholder`);
    };

    // Start loading the image
    img.src = imagePath;
}

// Function to get ordinal suffix for numbers
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Function to update time display
function updateTimeDisplay() {
    const now = new Date();

    // Determine time of day
    const hours = now.getHours();
    let timeOfDay;
    let timeIcon;

    if (hours >= 0 && hours < 12) {
        timeOfDay = 'Morning';
        timeIcon = 'fa-sun';
    } else if (hours >= 12 && hours < 17) {
        timeOfDay = 'Afternoon';
        timeIcon = 'fa-cloud-sun';
    } else {
        timeOfDay = 'Evening';
        timeIcon = 'fa-moon';
    }

    // Update time icon
    const timeIconElement = document.getElementById('time-icon');
    timeIconElement.className = `fas ${timeIcon}`;

    // Get day of week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[now.getDay()];

    // Get month
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[now.getMonth()];

    // Get day with ordinal suffix
    const day = now.getDate();
    const dayWithSuffix = day + getOrdinalSuffix(day);

    // Format time (12-hour format)
    let displayHours = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const formattedMinutes = now.getMinutes().toString().padStart(2, '0');
    const formattedSeconds = now.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${displayHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

    // Update DOM elements
    document.getElementById('greeting').textContent = `Good ${timeOfDay}.`;
    document.getElementById('date').textContent = `Today is ${dayOfWeek}, ${dayWithSuffix} of ${month}.`;
    document.getElementById('time').textContent = formattedTime;
}

// Initialize background, side image, and time on page load
setDayBackground();
setRandomSideImage();
updateTimeDisplay();

// Update time every second
setInterval(updateTimeDisplay, 1000);

// Search engine selection
const googleBtn = document.getElementById('google-btn');
const nyaaBtn = document.getElementById('nyaa-btn');
const searchInput = document.getElementById('search-input');
// Get the new form element
const searchForm = document.getElementById('search-form');

let selectedEngine = 'google';

// Set up button click handlers
function setActiveSearchEngine(engine, button) {
    selectedEngine = engine;

    // Remove active class from all buttons
    [googleBtn, nyaaBtn].forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to selected button
    button.classList.add('active');

    // Update placeholder
    let placeholder;
    switch (engine) {
        case 'google':
            placeholder = 'Search Google...';
            break;
        case 'nyaa':
            placeholder = 'Search Nyaa...';
            break;
        default:
            placeholder = 'Search...';
    }
    searchInput.placeholder = placeholder;
}

googleBtn.addEventListener('click', () => setActiveSearchEngine('google', googleBtn));
nyaaBtn.addEventListener('click', () => setActiveSearchEngine('nyaa', nyaaBtn));

// Handle search submission
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    let searchUrl;
    switch (selectedEngine) {
        case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'nyaa':
            searchUrl = `https://nyaa.si/?q=${encodeURIComponent(query)}`;
            break;
        default:
            return;
    }

    window.open(searchUrl, '_blank');
}

// Listen for the form's submit event
searchForm.addEventListener('submit', function(e) {
    // Prevent the default form submission (which reloads the page)
    e.preventDefault();
    performSearch();
});

// Notes functionality with error handling
const noteInput = document.getElementById('note-input');
const notesContainer = document.querySelector('.notes-container');

let notes = [];
let draggedElement = null;

// Initialize notes with error handling
try {
    const savedNotes = localStorage.getItem('liquidGlassNotes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
} catch (e) {
    console.error('Error loading notes from localStorage:', e);
    notes = [];
}

function saveNotes() {
    try {
        localStorage.setItem('liquidGlassNotes', JSON.stringify(notes));
    } catch (e) {
        console.error('Error saving notes to localStorage:', e);
    }
}

function createNoteCard(noteText, index) {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.draggable = true;
    noteCard.dataset.index = index;

    const noteContent = document.createElement('div');
    noteContent.textContent = noteText;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-note';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        deleteNote(index);
    };

    noteCard.appendChild(noteContent);
    noteCard.appendChild(deleteBtn);

    // Drag and drop events
    noteCard.addEventListener('dragstart', handleDragStart);
    noteCard.addEventListener('dragend', handleDragEnd);
    noteCard.addEventListener('dragover', handleDragOver);
    noteCard.addEventListener('drop', handleDrop);
    noteCard.addEventListener('dragenter', handleDragEnter);
    noteCard.addEventListener('dragleave', handleDragLeave);

    return noteCard;
}

function renderNotes() {
    // Remove existing notes list if it exists
    const existingNotesList = document.getElementById('notes-list');
    if (existingNotesList) {
        existingNotesList.remove();
    }

    // Only create notes list if there are notes
    if (notes.length > 0) {
        const notesList = document.createElement('div');
        notesList.className = 'notes-list';
        notesList.id = 'notes-list';

        notes.forEach((note, index) => {
            notesList.appendChild(createNoteCard(note, index));
        });

        notesContainer.appendChild(notesList);
    }
}

function addNote() {
    const noteText = noteInput.value.trim();
    if (noteText) {
        notes.push(noteText);
        saveNotes();
        renderNotes();
        noteInput.value = '';
    }
}

function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
}

// Drag and drop handlers
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    const allNotes = document.querySelectorAll('.note-card');
    allNotes.forEach(note => {
        note.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        // Swap notes in array
        const draggedNote = notes[draggedIndex];
        notes.splice(draggedIndex, 1);
        notes.splice(targetIndex, 0, draggedNote);

        saveNotes();
        renderNotes();
    }

    return false;
}

// Event listeners for notes
noteInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        addNote();
    }
});

// Initial render
renderNotes();

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add interactive click feedback
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Only prevent default for non-external links
        if (!this.getAttribute('href').startsWith('http')) {
            e.preventDefault();
        }

        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(147, 51, 234, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s ease-out';

        const rect = this.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';

        this.style.position = 'relative';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
@keyframes ripple {
    to {
        width: 200px;
        height: 200px;
        opacity: 0;
    }
}
`;
document.head.appendChild(style);
