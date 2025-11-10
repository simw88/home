// --- MOBILE ENHANCEMENTS ---

// Haptic Feedback Helper
function hapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50); // Vibrate for 50ms
    }
}

// Pull to Refresh
let startY = 0;
let isPulling = false;
const pullToRefresh = document.getElementById('pull-to-refresh');
const timeDisplay = document.getElementById('time-display');

document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
        isPulling = true;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;
    if (diff > 80) { // Threshold for showing refresh icon
        pullToRefresh.classList.add('show');
    }
});

document.addEventListener('touchend', () => {
    if (pullToRefresh.classList.contains('show')) {
        pullToRefresh.classList.remove('show');
        hapticFeedback();
        // Trigger refresh actions
        setDayBackground();
        updateTimeDisplay();
        setRandomSideImage();
    }
    isPulling = false;
});

// Back to Top Button
const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});
backToTopBtn.addEventListener('click', () => {
    hapticFeedback();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- ORIGINAL SCRIPT ---

// Theme management
const themeSwitcher = document.getElementById('theme-switcher');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeSwitcher.addEventListener('click', () => {
    hapticFeedback();
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeSwitcher.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Set background image based on day of week
function setDayBackground() {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const dayName = daysOfWeek[today.getDay()];
    const imagePath = `imgs/bgs/${dayName}.jpg`;
    const img = new Image();
    img.onload = function() {
        document.body.style.backgroundImage = `url('${imagePath}')`;
    };
    img.onerror = function() {
        console.log(`Background image for ${dayName} not found, using gradient fallback`);
    };
    img.src = imagePath;
}

// Enhanced image container with carousel and swipe
let currentImageIndex = 0;
let sideImages = [];
let imageInterval;
let touchStartX = 0;
let touchEndX = 0;
const imageHint = document.getElementById('image-hint');
const imageSpinner = document.getElementById('image-spinner');

function preloadImages() {
    for (let i = 1; i <= 12; i++) {
        const img = new Image();
        img.src = `imgs/side/img(${i}).png`;
        sideImages.push(img);
    }
}

function changeImage(direction) {
    hapticFeedback();
    currentImageIndex = (currentImageIndex + direction + sideImages.length) % sideImages.length;
    displayImage(currentImageIndex);
}

function displayImage(index) {
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = ''; // Clear previous content

    // Show spinner
    imageSpinner.style.display = 'block';

    const sideImage = document.createElement('img');
    sideImage.src = sideImages[index].src;
    sideImage.alt = `Image ${index + 1}`;
    sideImage.style.width = '100%';
    sideImage.style.height = '100%';
    sideImage.style.objectFit = 'cover';
    sideImage.style.borderRadius = '10px';
    sideImage.loading = 'lazy'; // Add lazy loading

    sideImage.onload = () => {
        imageSpinner.style.display = 'none'; // Hide spinner on load
    };
    sideImage.onerror = () => {
        imageSpinner.style.display = 'none'; // Also hide on error
        // Could try to load next image here
    };

    imageContainer.appendChild(sideImage);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'image-nav prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Previous Image');
    prevBtn.addEventListener('click', () => {
        clearInterval(imageInterval);
        changeImage(-1);
        startImageRotation();
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'image-nav next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Next Image');
    nextBtn.addEventListener('click', () => {
        clearInterval(imageInterval);
        changeImage(1);
        startImageRotation();
    });

    imageContainer.appendChild(prevBtn);
    imageContainer.appendChild(nextBtn);
    imageContainer.appendChild(imageHint.cloneNode(true)); // Re-add hint
}

// Swipe Gesture Handling
const imageContainerEl = document.getElementById('image-container');

imageContainerEl.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

imageContainerEl.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
});

function handleSwipeGesture() {
    if (touchEndX < touchStartX - 50) {
        clearInterval(imageInterval);
        changeImage(1); // Swipe left, next image
        startImageRotation();
    }
    if (touchEndX > touchStartX + 50) {
        clearInterval(imageInterval);
        changeImage(-1); // Swipe right, previous image
        startImageRotation();
    }
}

function startImageRotation() {
    imageInterval = setInterval(() => {
        changeImage(1);
    }, 60000);
}

function setRandomSideImage() {
    if (sideImages.length === 0) {
        preloadImages();
    }
    currentImageIndex = Math.floor(Math.random() * sideImages.length);
    displayImage(currentImageIndex);
    startImageRotation();
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

    const timeIconElement = document.getElementById('time-icon');
    timeIconElement.className = `fas ${timeIcon}`;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[now.getDay()];

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[now.getMonth()];

    const day = now.getDate();
    const dayWithSuffix = day + getOrdinalSuffix(day);

    let displayHours = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const formattedMinutes = now.getMinutes().toString().padStart(2, '0');
    const formattedSeconds = now.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${displayHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

    document.getElementById('greeting').textContent = `Good ${timeOfDay}.`;
    document.getElementById('date').textContent = `Today is ${dayOfWeek}, ${dayWithSuffix} of ${month}.`;
    document.getElementById('time').textContent = formattedTime;
}

// Initialize background, side image, and time on page load
setDayBackground();
setRandomSideImage();
updateTimeDisplay();
setInterval(updateTimeDisplay, 1000);

// Search engine selection
const googleBtn = document.getElementById('google-btn');
const nyaaBtn = document.getElementById('nyaa-btn');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');

let selectedEngine = 'google';
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

function setActiveSearchEngine(engine, button) {
    selectedEngine = engine;
    [googleBtn, nyaaBtn].forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    let placeholder = engine === 'google' ? 'Search Google...' : 'Search Nyaa...';
    searchInput.placeholder = placeholder;
    searchInput.focus();
}

googleBtn.addEventListener('click', () => setActiveSearchEngine('google', googleBtn));
nyaaBtn.addEventListener('click', () => setActiveSearchEngine('nyaa', nyaaBtn));

searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length > 2) {
        const filteredHistory = searchHistory.filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        if (filteredHistory.length > 0) {
            searchSuggestions.innerHTML = filteredHistory.map(item =>
            `<div class="suggestion-item">${item}</div>`
            ).join('');
            searchSuggestions.style.display = 'block';
        } else {
            searchSuggestions.style.display = 'none';
        }
    } else {
        searchSuggestions.style.display = 'none';
    }
});

searchSuggestions.addEventListener('click', function(e) {
    if (e.target.classList.contains('suggestion-item')) {
        searchInput.value = e.target.textContent;
        searchSuggestions.style.display = 'none';
        performSearch();
    }
});

document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.style.display = 'none';
    }
});

function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    if (!searchHistory.includes(query)) {
        searchHistory.unshift(query);
        if (searchHistory.length > 10) searchHistory.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
    let searchUrl = selectedEngine === 'google'
    ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
    : `https://nyaa.si/?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
    searchSuggestions.style.display = 'none';
}

searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Notes functionality with enhancements
const noteInput = document.getElementById('note-input');
const notesContainer = document.querySelector('.notes-container');
const addNoteFab = document.getElementById('add-note-fab');
const categoryToggles = document.querySelectorAll('.category-toggle');

let notes = [];
let draggedElement = null;
let draggedIndex = null;
let selectedCategory = 'personal';

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

function getCategoryColor(category) {
    const colors = {
        'personal': 'rgba(76, 175, 80, 0.2)',
        'work': 'rgba(33, 150, 243, 0.2)',
        'ideas': 'rgba(156, 39, 176, 0.2)',
        'todo': 'rgba(255, 152, 0, 0.2)'
    };
    return colors[category] || 'rgba(158, 158, 158, 0.2)';
}

// Simplified drag and drop handlers
function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    // Create a custom drag image with proper width constraints
    const dragImage = this.cloneNode(true);
    const rect = this.getBoundingClientRect();
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.width = rect.width + 'px'; // Set the width to match the original
    dragImage.style.maxWidth = rect.width + 'px'; // Ensure it doesn't exceed this width
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)'; // Add slight rotation for visual feedback
    dragImage.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)'; // Add shadow for depth
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, 20); // Center the drag image horizontally
    setTimeout(() => document.body.removeChild(dragImage), 0);

    console.log('Drag started from index:', draggedIndex);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    // Remove all drop zone indicators
    const allNotes = document.querySelectorAll('.note-card');
    allNotes.forEach(note => {
        note.classList.remove('drag-over', 'drop-above', 'drop-below');
    });

    draggedElement = null;
    draggedIndex = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    // Don't show drop indicators on the dragged element itself
    if (this === draggedElement) return false;

    // Determine if we should insert above or below
    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (e.clientY < midpoint) {
        // Insert above
        this.classList.remove('drop-below');
        this.classList.add('drop-above');
    } else {
        // Insert below
        this.classList.remove('drop-above');
        this.classList.add('drop-below');
    }

    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    // Check if the mouse has actually left the element
    const rect = this.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        this.classList.remove('drag-over', 'drop-above', 'drop-below');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const targetIndex = parseInt(this.dataset.index);

        // Determine if we should insert above or below
        const rect = this.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const insertAbove = e.clientY < midpoint;

        console.log('Drop event:', {
            draggedIndex: draggedIndex,
            targetIndex: targetIndex,
            insertAbove: insertAbove
        });

        // Get the dragged note
        const draggedNote = notes[draggedIndex];

        // Remove the dragged note from its original position
        notes.splice(draggedIndex, 1);

        // Calculate the new position
        let newIndex;
        if (draggedIndex < targetIndex) {
            // If dragging down, the target index shifts up by 1 after removal
            newIndex = insertAbove ? targetIndex - 1 : targetIndex;
        } else {
            // If dragging up, the target index stays the same
            newIndex = insertAbove ? targetIndex : targetIndex + 1;
        }

        // Insert the note at the new position
        notes.splice(newIndex, 0, draggedNote);

        console.log('New notes order:', notes.map(n => n.text));

        saveNotes();
        renderNotes();
    }

    return false;
}

function createNoteCard(note, index) {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.draggable = true;
    noteCard.dataset.index = index;

    const noteHeader = document.createElement('div');
    noteHeader.className = 'note-header';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'note-category';
    categoryBadge.textContent = note.category;
    categoryBadge.style.backgroundColor = getCategoryColor(note.category);

    const timestamp = document.createElement('div');
    timestamp.className = 'note-timestamp';
    timestamp.textContent = new Date(note.timestamp).toLocaleString();

    noteHeader.appendChild(categoryBadge);
    noteHeader.appendChild(timestamp);

    const noteContent = document.createElement('div');
    noteContent.textContent = note.text;

    const noteActions = document.createElement('div');
    noteActions.className = 'note-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'note-action-btn delete-note';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        deleteNote(index);
    };

    noteActions.appendChild(deleteBtn);

    noteCard.appendChild(noteHeader);
    noteCard.appendChild(noteContent);
    noteCard.appendChild(noteActions);

    // Drag and drop events
    noteCard.addEventListener('dragstart', handleDragStart);
    noteCard.addEventListener('dragend', handleDragEnd);
    noteCard.addEventListener('dragover', handleDragOver);
    noteCard.addEventListener('drop', handleDrop);
    noteCard.addEventListener('dragenter', handleDragEnter);
    noteCard.addEventListener('dragleave', handleDragLeave);

    // Swipe to delete
    let swipeStartX = 0;
    noteCard.addEventListener('touchstart', e => {
        swipeStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    noteCard.addEventListener('touchend', e => {
        const swipeEndX = e.changedTouches[0].screenX;
        if (swipeStartX - swipeEndX > 75) { // Swipe left threshold
            hapticFeedback();
            deleteNote(index);
        }
    }, { passive: true });

    return noteCard;
}

function renderNotes() {
    const existingNotesList = document.getElementById('notes-list');
    if (existingNotesList) {
        existingNotesList.remove();
    }

    if (notes.length > 0) {
        // Don't sort by timestamp - preserve the current order
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
        const note = {
            text: noteText,
            category: selectedCategory,
            timestamp: new Date().toISOString()
        };
        notes.push(note);
        saveNotes();
        renderNotes();
        noteInput.value = '';
        hapticFeedback();
    }
}

function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
    hapticFeedback();
}

// Event listeners for notes
noteInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        addNote();
    }
});

addNoteFab.addEventListener('click', addNote);

// Category toggle functionality
categoryToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
        hapticFeedback();
        categoryToggles.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        selectedCategory = this.getAttribute('data-category');
    });
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

// --- ROBUST DROPDOWN FUNCTIONALITY ---

// Track dropdown states and last activity
let dropdownStates = new Map();
let lastActivityTime = Date.now();
let heartbeatInterval;

// Function to force refresh all dropdown elements
function refreshDropdowns() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(navItem => {
        const dropdown = navItem.querySelector('.dropdown');
        if (dropdown) {
            // Force reflow by temporarily changing display
            const originalDisplay = dropdown.style.display;
            dropdown.style.display = 'none';
            void dropdown.offsetWidth; // Trigger reflow
            dropdown.style.display = originalDisplay || 'block';

            // Reset to hidden state
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            navItem.classList.remove('active');
        }
    });
}

// Function to show dropdown with multiple fallback methods
function showDropdown(navItem) {
    if (!navItem) return;

    const dropdown = navItem.querySelector('.dropdown');
    if (!dropdown) return;

    // Close all other dropdowns first
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item !== navItem) {
            item.classList.remove('active');
            const otherDropdown = item.querySelector('.dropdown');
            if (otherDropdown) {
                otherDropdown.style.opacity = '0';
                otherDropdown.style.visibility = 'hidden';
            }
        }
    });

    // Method 1: Class-based approach
    navItem.classList.add('active');

    // Method 2: Direct style manipulation (fallback)
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';

    // Method 3: Force reflow to ensure visibility
    dropdown.getBoundingClientRect();

    // Update activity timestamp
    lastActivityTime = Date.now();
    dropdownStates.set(navItem, { active: true, timestamp: lastActivityTime });

    // Provide haptic feedback on mobile
    if (window.innerWidth <= 768) {
        hapticFeedback();
    }
}

// Function to hide dropdown with multiple fallback methods
function hideDropdown(navItem) {
    if (!navItem) return;

    const dropdown = navItem.querySelector('.dropdown');
    if (!dropdown) return;

    // Method 1: Class-based approach
    navItem.classList.remove('active');

    // Method 2: Direct style manipulation (fallback)
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';

    // Update state tracking
    dropdownStates.set(navItem, { active: false, timestamp: Date.now() });
}

// Heartbeat function to keep dropdowns responsive
function heartbeat() {
    const now = Date.now();

    // If it's been more than 30 seconds since last activity, refresh dropdowns
    if (now - lastActivityTime > 30000) {
        refreshDropdowns();
    }

    // Check for stuck dropdowns and fix them
    dropdownStates.forEach((state, navItem) => {
        if (state.active && (now - state.timestamp > 5000)) {
            // If a dropdown has been active for more than 5 seconds without activity, close it
            hideDropdown(navItem);
        }
    });
}

// Initialize heartbeat
function startHeartbeat() {
    // Clear any existing interval
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }

    // Start new heartbeat interval
    heartbeatInterval = setInterval(heartbeat, 10000); // Check every 10 seconds
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible again, re-initialize the entire dropdown system
        console.log("Page is now visible, re-initializing dropdowns.");
        initializeDropdowns();
        lastActivityTime = Date.now();
    } else {
        // Page became hidden, clear heartbeat to save resources
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }
    }
});

// Handle window focus/blur
window.addEventListener('focus', function() {
    console.log("Window gained focus, re-initializing dropdowns.");
    initializeDropdowns();
    lastActivityTime = Date.now();
});

window.addEventListener('blur', function() {
    // Close all dropdowns when window loses focus
    document.querySelectorAll('.nav-item').forEach(navItem => {
        hideDropdown(navItem);
    });
});

// Use event delegation for dropdown interactions
document.addEventListener('mouseover', function(e) {
    if (window.innerWidth > 768) {
        const navItem = e.target.closest('.nav-item');
        if (navItem && !navItem.classList.contains('active')) {
            showDropdown(navItem);
        }
    }
});

document.addEventListener('mouseout', function(e) {
    if (window.innerWidth > 768) {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.classList.contains('active')) {
            // Check if mouse really left the nav item
            const relatedTarget = e.relatedTarget;
            if (!navItem.contains(relatedTarget)) {
                hideDropdown(navItem);
            }
        }
    }
});

// Handle click events for mobile and desktop
document.addEventListener('click', function(e) {
    const navItem = e.target.closest('.nav-item');

    if (navItem) {
        const navLink = navItem.querySelector('.nav-link');
        const dropdownItem = e.target.closest('.dropdown-item');

        if (dropdownItem) {
            // Click on dropdown item
            hideDropdown(navItem);

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
            const rect = dropdownItem.getBoundingClientRect();
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            dropdownItem.style.position = 'relative';
            dropdownItem.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        } else if (navLink && window.innerWidth <= 768) {
            // Click on nav link in mobile mode
            e.preventDefault();
            const isActive = navItem.classList.contains('active');

            if (isActive) {
                hideDropdown(navItem);
            } else {
                showDropdown(navItem);
            }
        }
    } else {
        // Click outside dropdowns, close all
        document.querySelectorAll('.nav-item').forEach(navItem => {
            hideDropdown(navItem);
        });
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.nav-item').forEach(navItem => {
            hideDropdown(navItem);
        });
    }
});

// Initialize dropdown system
function initializeDropdowns() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(navItem => {
        dropdownStates.set(navItem, { active: false, timestamp: Date.now() });
    });

    // Start heartbeat
    startHeartbeat();

    // Initial refresh
    refreshDropdowns();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDropdowns);
} else {
    initializeDropdowns();
}
