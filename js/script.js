// ===== UTILITY FUNCTIONS =====
function hapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function safeLocalStorageGet(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error(`Error reading localStorage key "${key}":`, e);
        return defaultValue;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error(`Error writing localStorage key "${key}":`, e);
        return false;
    }
}

// ===== MOBILE ENHANCEMENTS =====
const mobileEnhancements = {
    init() {
        this.pullToRefresh();
        this.backToTop();
    },

    pullToRefresh() {
        let startY = 0;
        let isPulling = false;
        const pullToRefresh = document.getElementById('pull-to-refresh');
        const timeDisplay = document.getElementById('time-display');

        const handleTouchStart = (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        };

        const handleTouchMove = (e) => {
            if (!isPulling) return;
            const currentY = e.touches[0].pageY;
            const diff = currentY - startY;
            if (diff > 80) {
                pullToRefresh.classList.add('show');
            }
        };

        const handleTouchEnd = () => {
            if (pullToRefresh.classList.contains('show')) {
                pullToRefresh.classList.remove('show');
                hapticFeedback();
                timeModule.update();
                imageModule.setRandomImage();
            }
            isPulling = false;
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    },

    backToTop() {
        const backToTopBtn = document.getElementById('back-to-top');

        const handleScroll = debounce(() => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, 100);

        backToTopBtn.addEventListener('click', () => {
            hapticFeedback();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
};

// ===== THEME MANAGEMENT =====
const themeModule = {
    init() {
        this.themeSwitcher = document.getElementById('theme-switcher');
        this.htmlElement = document.documentElement;

        const savedTheme = safeLocalStorageGet('theme', 'light');
        this.setTheme(savedTheme);

        this.themeSwitcher.addEventListener('click', () => this.toggleTheme());
    },

    setTheme(theme) {
        this.htmlElement.setAttribute('data-theme', theme);
        this.updateIcon(theme);
    },

    toggleTheme() {
        hapticFeedback();
        const currentTheme = this.htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        this.setTheme(newTheme);
        safeLocalStorageSet('theme', newTheme);
    },

    updateIcon(theme) {
        const icon = this.themeSwitcher.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
};

// ===== TIME DISPLAY =====
const timeModule = {
    init() {
        this.update();
        setInterval(() => this.update(), 1000);
    },

    update() {
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
        const dayWithSuffix = day + this.getOrdinalSuffix(day);

        let displayHours = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        const formattedMinutes = now.getMinutes().toString().padStart(2, '0');
        const formattedSeconds = now.getSeconds().toString().padStart(2, '0');
        const formattedTime = `${displayHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

        document.getElementById('greeting').textContent = `Good ${timeOfDay}.`;
        document.getElementById('date').textContent = `Today is ${dayOfWeek}, ${dayWithSuffix} of ${month}.`;
        document.getElementById('time').textContent = formattedTime;
    },

    getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }
};

// ===== BACKGROUND MANAGEMENT =====
const backgroundModule = {
    init() {
        this.setDayBackground();
    },

    setDayBackground() {
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = new Date();
        const dayName = daysOfWeek[today.getDay()];
        const imagePath = `imgs/bgs/${dayName}.jpg`;
        const img = new Image();

        img.onload = () => {
            document.body.style.backgroundImage = `url('${imagePath}')`;
        };

        // FIX (Logic): More robust fallback handling
        img.onerror = () => {
            console.warn(`Background image for ${dayName} not found, using gradient fallback.`);
            // Ensure gradient is explicitly set if image fails, though CSS handles this initially.
            // This ensures if a previous JS set an image, we revert cleanly if needed dynamically.
            document.body.style.backgroundImage = ''; 
        };

        img.src = imagePath;
    }
};

// ===== IMAGE CAROUSEL =====
const imageModule = {
    currentImageIndex: 0,
    sideImages: [],
    imageInterval: null,
    touchStartX: 0,
    touchEndX: 0,
    loadedImages: new Set(),

    init() {
        this.container = document.getElementById('image-container');
        this.imageHint = document.getElementById('image-hint');
        this.imageSpinner = document.getElementById('image-spinner');

        this.setupSwipeGestures();
        this.setRandomImage();
    },

    setupSwipeGestures() {
        this.container.addEventListener('touchstart', e => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.container.addEventListener('touchend', e => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipeGesture();
        }, { passive: true });
    },

    handleSwipeGesture() {
        if (this.touchEndX < this.touchStartX - 50) {
            this.changeImage(1);
        }
        if (this.touchEndX > this.touchStartX + 50) {
            this.changeImage(-1);
        }
    },

    loadImage(index) {
        return new Promise((resolve, reject) => {
            if (this.loadedImages.has(index)) {
                resolve(this.sideImages[index]);
                return;
            }

            const img = new Image();
            img.src = `imgs/side/img(${index + 1}).png`;

            img.onload = () => {
                this.sideImages[index] = img;
                this.loadedImages.add(index);
                resolve(img);
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image ${index + 1}`));
            };
        });
    },

    async changeImage(direction) {
        hapticFeedback();

        if (this.sideImages.length === 0) {
            for (let i = 0; i < 12; i++) {
                this.sideImages.push(null);
            }
        }

        this.currentImageIndex = (this.currentImageIndex + direction + 12) % 12;

        try {
            await this.displayImage(this.currentImageIndex);
            this.startRotation();
        } catch (error) {
            console.error('Error changing image:', error);
        }
    },

    async displayImage(index) {
        this.container.innerHTML = '';
        this.imageSpinner.style.display = 'block';

        try {
            const img = await this.loadImage(index);

            const sideImage = document.createElement('img');
            sideImage.src = img.src;
            sideImage.alt = `Image ${index + 1}`;
            sideImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px;
            `;
            sideImage.loading = 'lazy';

            sideImage.onload = () => {
                this.imageSpinner.style.display = 'none';
            };

            this.container.appendChild(sideImage);
            this.addNavigationButtons();
            this.container.appendChild(this.imageHint.cloneNode(true));
        } catch (error) {
            this.imageSpinner.style.display = 'none';
            console.error('Error displaying image:', error);
        }
    },

    addNavigationButtons() {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'image-nav prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Previous Image');
        prevBtn.addEventListener('click', () => {
            clearInterval(this.imageInterval);
            this.changeImage(-1);
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'image-nav next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Next Image');
        nextBtn.addEventListener('click', () => {
            clearInterval(this.imageInterval);
            this.changeImage(1);
        });

        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
    },

    startRotation() {
        clearInterval(this.imageInterval);
        this.imageInterval = setInterval(() => {
            this.changeImage(1);
        }, 60000);
    },

    setRandomImage() {
        this.currentImageIndex = Math.floor(Math.random() * 12);
        this.displayImage(this.currentImageIndex);
        this.startRotation();
    }
};

// ===== SEARCH FUNCTIONALITY =====
const searchModule = {
    selectedEngine: 'google',
    searchHistory: [],

    init() {
        this.googleBtn = document.getElementById('google-btn');
        this.nyaaBtn = document.getElementById('nyaa-btn');
        this.searchInput = document.getElementById('search-input');
        this.searchSuggestions = document.getElementById('search-suggestions');

        this.searchHistory = safeLocalStorageGet('searchHistory', []);

        this.setupEventListeners();
    },

    setupEventListeners() {
        this.googleBtn.addEventListener('click', () => this.setActiveEngine('google', this.googleBtn));
        this.nyaaBtn.addEventListener('click', () => this.setActiveEngine('nyaa', this.nyaaBtn));

        this.searchInput.addEventListener('input', debounce(() => this.handleInput(), 300));
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

            this.searchSuggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('suggestion-item')) {
                    this.searchInput.value = e.target.textContent;
                    this.searchSuggestions.style.display = 'none';
                    this.performSearch();
                }
            });

            document.addEventListener('click', (e) => {
                if (!this.searchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
                    this.searchSuggestions.style.display = 'none';
                }
            });
    },

    setActiveEngine(engine, button) {
        this.selectedEngine = engine;
        [this.googleBtn, this.nyaaBtn].forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.searchInput.placeholder = engine === 'google' ? 'Search Google...' : 'Search Nyaa...';
        this.searchInput.focus();
    },

    handleInput() {
        const query = this.searchInput.value.trim();
        if (query.length > 2) {
            const filteredHistory = this.searchHistory
            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);

            if (filteredHistory.length > 0) {
                // FIX (Security): Prevent XSS by using textContent instead of innerHTML
                this.searchSuggestions.innerHTML = '';
                filteredHistory.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = item; // Safe text injection
                    this.searchSuggestions.appendChild(div);
                });
                this.searchSuggestions.style.display = 'block';
            } else {
                this.searchSuggestions.style.display = 'none';
            }
        } else {
            this.searchSuggestions.style.display = 'none';
        }
    },

    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > 10) this.searchHistory.pop();
            safeLocalStorageSet('searchHistory', this.searchHistory);
        }

        const searchUrl = this.selectedEngine === 'google'
        ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
        : `https://nyaa.si/?q=${encodeURIComponent(query)}`;

        window.location.href = searchUrl;
        this.searchSuggestions.style.display = 'none';
    }
};

// ===== NOTES FUNCTIONALITY =====
const notesModule = {
    notes: [],
    draggedElement: null,
    draggedIndex: null,
    selectedCategory: 'personal',

    init() {
        this.noteInput = document.getElementById('note-input');
        this.notesContainer = document.getElementById('notes-container');
        this.addNoteFab = document.getElementById('add-note-fab');
        this.categoryToggles = document.querySelectorAll('.category-toggle');

        this.notes = safeLocalStorageGet('liquidGlassNotes', []);

        this.setupEventListeners();
        this.renderNotes();
    },

    setupEventListeners() {
        this.noteInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.addNote();
        });

            this.addNoteFab.addEventListener('click', () => this.addNote());

            this.categoryToggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    hapticFeedback();
                    this.categoryToggles.forEach(t => t.classList.remove('active'));
                    toggle.classList.add('active');
                    this.selectedCategory = toggle.getAttribute('data-category');
                });
            });
    },

    getCategoryColor(category) {
        const colors = {
            'personal': 'rgba(76, 175, 80, 0.2)',
            'work': 'rgba(33, 150, 243, 0.2)',
            'ideas': 'rgba(156, 39, 176, 0.2)',
            'todo': 'rgba(255, 152, 0, 0.2)'
        };
        return colors[category] || 'rgba(158, 158, 158, 0.2)';
    },

    addNote() {
        const noteText = this.noteInput.value.trim();
        if (noteText) {
            const note = {
                text: noteText,
                category: this.selectedCategory,
                timestamp: new Date().toISOString()
            };
            this.notes.unshift(note);
            this.saveNotes();
            this.renderNotes();
            this.noteInput.value = '';
            hapticFeedback();
        }
    },

    deleteNote(index) {
        this.notes.splice(index, 1);
        this.saveNotes();
        this.renderNotes();
        hapticFeedback();
    },

    saveNotes() {
        safeLocalStorageSet('liquidGlassNotes', this.notes);
    },

    createNoteCard(note, index) {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.draggable = true;
        noteCard.dataset.index = index;

        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';

        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'note-category';
        categoryBadge.textContent = note.category;
        categoryBadge.style.backgroundColor = this.getCategoryColor(note.category);

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
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteNote(index);
        };

        noteActions.appendChild(deleteBtn);

        noteCard.appendChild(noteHeader);
        noteCard.appendChild(noteContent);
        noteCard.appendChild(noteActions);

        this.setupDragAndDrop(noteCard, index);
        this.setupSwipeToDelete(noteCard, index);

        return noteCard;
    },

    setupDragAndDrop(noteCard, index) {
        noteCard.addEventListener('dragstart', (e) => {
            this.draggedElement = noteCard;
            this.draggedIndex = index;
            noteCard.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        noteCard.addEventListener('dragend', () => {
            noteCard.classList.remove('dragging');
            document.querySelectorAll('.note-card').forEach(note => {
                note.classList.remove('drag-over', 'drop-above', 'drop-below');
            });
            this.draggedElement = null;
            this.draggedIndex = null;
        });

        noteCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedElement === noteCard) return;

            const rect = noteCard.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;

            if (e.clientY < midpoint) {
                noteCard.classList.remove('drop-below');
                noteCard.classList.add('drop-above');
            } else {
                noteCard.classList.remove('drop-above');
                noteCard.classList.add('drop-below');
            }
        });

        noteCard.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.draggedElement !== noteCard) {
                const targetIndex = parseInt(noteCard.dataset.index);
                const rect = noteCard.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const insertAbove = e.clientY < midpoint;

                // FIX (Logic): Correctly calculate new index accounting for array shift
                const draggedNote = this.notes[this.draggedIndex];
                
                // Remove the item first
                this.notes.splice(this.draggedIndex, 1);

                // Calculate insertion point
                // If we dragged from above the target, the target's index has shifted down by 1
                let insertionIndex = targetIndex;
                if (this.draggedIndex < targetIndex) {
                    insertionIndex = targetIndex - 1;
                }

                // If dropping below, increment index
                if (!insertAbove) {
                    insertionIndex += 1;
                }

                // Insert at new position
                this.notes.splice(insertionIndex, 0, draggedNote);
                
                this.saveNotes();
                this.renderNotes();
            }
        });
    },

    setupSwipeToDelete(noteCard, index) {
        let swipeStartX = 0;

        noteCard.addEventListener('touchstart', e => {
            swipeStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        noteCard.addEventListener('touchend', e => {
            const swipeEndX = e.changedTouches[0].screenX;
            if (swipeStartX - swipeEndX > 75) {
                hapticFeedback();
                this.deleteNote(index);
            }
        }, { passive: true });
    },

    renderNotes() {
        const existingNotesList = document.getElementById('notes-list');
        if (existingNotesList) {
            existingNotesList.remove();
        }

        if (this.notes.length > 0) {
            const notesList = document.createElement('div');
            notesList.className = 'notes-list';
            notesList.id = 'notes-list';

            this.notes.forEach((note, index) => {
                notesList.appendChild(this.createNoteCard(note, index));
            });

            this.notesContainer.appendChild(notesList);
        }
    }
};

// ===== DROPDOWN FUNCTIONALITY =====
const dropdownModule = {
    activeDropdown: null,

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.addEventListener('mouseover', (e) => {
            if (window.innerWidth > 768) {
                const navItem = e.target.closest('.nav-item');
                if (navItem && !navItem.classList.contains('active')) {
                    this.showDropdown(navItem);
                }
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (window.innerWidth > 768) {
                const navItem = e.target.closest('.nav-item');
                if (navItem && navItem.classList.contains('active')) {
                    const relatedTarget = e.relatedTarget;
                    if (!navItem.contains(relatedTarget)) {
                        this.hideDropdown(navItem);
                    }
                }
            }
        });

        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');

            if (navItem) {
                const navLink = navItem.querySelector('.nav-link');
                const dropdownItem = e.target.closest('.dropdown-item');

                if (dropdownItem) {
                    this.hideDropdown(navItem);
                } else if (navLink && window.innerWidth <= 768) {
                    e.preventDefault();
                    const isActive = navItem.classList.contains('active');

                    if (isActive) {
                        this.hideDropdown(navItem);
                    } else {
                        this.showDropdown(navItem);
                    }
                }
            } else {
                this.closeAllDropdowns();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    },

    showDropdown(navItem) {
        if (!navItem) return;

        this.closeAllDropdowns();

        const dropdown = navItem.querySelector('.dropdown');
        if (!dropdown) return;

        navItem.classList.add('active');
        this.activeDropdown = navItem;

        if (window.innerWidth <= 768) {
            hapticFeedback();
        }
    },

    hideDropdown(navItem) {
        if (!navItem) return;

        navItem.classList.remove('active');

        if (this.activeDropdown === navItem) {
            this.activeDropdown = null;
        }
    },

    closeAllDropdowns() {
        document.querySelectorAll('.nav-item').forEach(navItem => {
            this.hideDropdown(navItem);
        });
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    mobileEnhancements.init();
    themeModule.init();
    timeModule.init();
    backgroundModule.init();
    imageModule.init();
    searchModule.init();
    notesModule.init();
    dropdownModule.init();

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
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    clearInterval(imageModule.imageInterval);
});
