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
        // Sort notes by timestamp
        const sortedNotes = [...notes].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        const notesList = document.createElement('div');
        notesList.className = 'notes-list';
        notesList.id = 'notes-list';

        sortedNotes.forEach((note, index) => {
            const originalIndex = notes.findIndex(n => n === note);
            notesList.appendChild(createNoteCard(note, originalIndex));
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

// --- IMPROVED DROPDOWN FUNCTIONALITY ---

// Add a visibility change listener to reset dropdown states when the page becomes visible again
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Reset all dropdown states when the page becomes visible again
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });
    }
});

// Add a focus/blur listener to reset dropdown states when the user interacts with the page again
window.addEventListener('focus', function() {
    // Reset all dropdown states when the window gains focus
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('active');
    });
});

// Function to close dropdowns using class-based approach
function closeDropdown(navItem) {
    navItem.classList.remove('active');
    
    // Ensure the dropdown is properly hidden after the transition completes
    setTimeout(() => {
        const dropdown = navItem.querySelector('.dropdown');
        if (dropdown && !navItem.classList.contains('active')) {
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
        }
    }, 500); // Slightly longer than the transition duration
}

// Improved dropdown system using class-based approach
document.querySelectorAll('.nav-item').forEach(navItem => {
    const navLink = navItem.querySelector('.nav-link');

    // Add mouseenter event for desktop
    navItem.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
            navItem.classList.add('active');
        }
    });

    // Add mouseleave event for desktop
    navItem.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            navItem.classList.remove('active');
        }
    });

    // Toggle dropdown on click for mobile
    navLink.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const isOpen = navItem.classList.contains('active');

            // Close all other dropdowns first
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item !== navItem) {
                    item.classList.remove('active');
                }
            });

            if (!isOpen) {
                navItem.classList.add('active');
                hapticFeedback();
            } else {
                navItem.classList.remove('active');
            }
        }
    });
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item')) {
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });
    }
});

// Keyboard navigation for dropdown menus
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const navItem = this.parentElement;
            if (navItem) {
                navItem.classList.add('active');
                const firstItem = navItem.querySelector('.dropdown-item');
                if (firstItem) firstItem.focus();
            }
        }
    });
});

// Close dropdowns with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });
    }
});

// Add keyboard navigation for dropdown items
document.querySelectorAll('.dropdown-item').forEach((item, index, items) => {
    item.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextItem = items[index + 1];
            if (nextItem) nextItem.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevItem = items[index - 1];
            if (prevItem) prevItem.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            const navItem = this.closest('.nav-item');
            if (navItem) {
                navItem.classList.remove('active');
                const navLink = navItem.querySelector('.nav-link');
                if (navLink) navLink.focus();
            }
        }
    });
});

// Add interactive click feedback for dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Close the dropdown when clicking an item
        const navItem = this.closest('.nav-item');
        if (navItem) {
            closeDropdown(navItem);
        }

        // Provide haptic feedback on mobile
        if (window.innerWidth <= 768) {
            hapticFeedback();
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
