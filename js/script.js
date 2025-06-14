// Immediate focus attempt
window.addEventListener('load', () => {
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }, 50);
});

document.addEventListener('DOMContentLoaded', () => {
    const clockDisplay = document.getElementById('clockDisplay');
    const searchInput = document.getElementById('searchInput');
    const searchButtons = document.querySelectorAll('.search-btn');
    const notesList = document.getElementById('notesList');
    const noteInput = document.getElementById('noteInput');
    const clearInputButton = document.getElementById('clearInputButton');
    const emptyState = document.getElementById('emptyState');
    const tabs = document.querySelectorAll('.tab');
    const globalDropdown = document.getElementById('globalDropdown');
    const imageContainer = document.querySelector('.image-container');

    let activeEngine = 'google';
    let activeTab = null;
    let hideDropdownTimeout;

    let boardsTabHidden = false;
    let pandaSearchHidden = false;
    // NEW: State variable for current image directory
    let currentImageDir = 'imgs/side'; 

    // Helper function to determine if it's mobile mode
    const isMobileMode = () => window.innerWidth <= 1000;

    // --- Time and Date ---
    function updateClock() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        const dayOfMonth = now.getDate();
        const month = now.toLocaleDateString('en-US', { month: 'long' });

        let greeting;
        if (hour >= 0 && hour < 12) {
            greeting = "Morning";
        } else if (hour >= 12 && hour < 17) {
            greeting = "Afternoon";
        } else {
            greeting = "Evening";
        }

        function getOrdinalSuffix(n) {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            const exceptions = [11, 12, 13];
            return n + (exceptions.includes(v) ? "th" : s[(v - 20) % 10] || s[v] || s[0]);
        }

        const formattedTime = `${hour % 12 || 12}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const ordinalDayOfMonth = getOrdinalSuffix(dayOfMonth);

        clockDisplay.textContent = `Good ${greeting}. Today is ${dayOfWeek}, the ${ordinalDayOfMonth} of ${month}. It's ${formattedTime} ${ampm}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // --- Toggle Clock click functionality ---
    clockDisplay.addEventListener('click', () => {
        const boardsTab = Array.from(tabs).find(tab => tab.textContent.trim() === 'Boards');
        const pandaSearchBtn = Array.from(searchButtons).find(btn => btn.dataset.engine === 'panda');

        // Toggle "Boards" tab visibility
        if (boardsTab) {
            if (boardsTabHidden) {
                boardsTab.classList.remove('hidden');
            } else {
                boardsTab.classList.add('hidden');
                if (activeTab === boardsTab) {
                    hideDropdown(); // Hide dropdown if the tab is hidden
                }
            }
            boardsTabHidden = !boardsTabHidden; // Invert state
        }

        // Toggle "Panda" search option visibility
        if (pandaSearchBtn) {
            if (pandaSearchHidden) {
                pandaSearchBtn.classList.remove('hidden');
            } else {
                pandaSearchBtn.classList.add('hidden');
                // If "Panda" was active, switch to Google when hidden
                if (activeEngine === 'panda') {
                    activeEngine = 'google';
                    searchButtons.forEach(btn => {
                        if (btn.dataset.engine === 'google') {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
            }
            pandaSearchHidden = !pandaSearchHidden; // Invert state
        }

        // NEW: Toggle image source directory and load new image
        currentImageDir = (currentImageDir === 'imgs/side') ? 'imgs/rep' : 'imgs/side';
        loadRandomSideImage(); // Call the function to load image from the new directory
    });

    // --- Search Functionality ---
    searchButtons.forEach(button => {
        button.addEventListener('click', () => {
            searchButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeEngine = button.dataset.engine;
            searchInput.focus();
        });
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            let searchUrl;
            switch (activeEngine) {
                case 'google':
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'nyaa':
                    searchUrl = `https://nyaa.si/?q=${encodeURIComponent(query)}`;
                    break;
                case 'yandex':
                    searchUrl = `https://yandex.com/search/?text=${encodeURIComponent(query)}`;
                    break;
                case 'panda':
                    searchUrl = `https://e-hentai.org/?f_search=${encodeURIComponent(query)}`;
                    break;
                default:
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
            window.open(searchUrl, '_blank');
            searchInput.value = '';
        }
    }

    // --- Notes App ---
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    function renderNotes() {
        notesList.innerHTML = '';
        if (notes.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            notes.forEach((note, index) => {
                const noteItem = document.createElement('div');
                noteItem.classList.add('note-item');
                noteItem.innerHTML = `
                    <span class="note-text">${note}</span>
                    <button class="note-delete" data-index="${index}">×</button>
                `;
                notesList.appendChild(noteItem);
            });
        }
    }

    function addNote() {
        const noteText = noteInput.value.trim();
        if (noteText) {
            notes.push(noteText);
            localStorage.setItem('notes', JSON.stringify(notes));
            noteInput.value = '';
            renderNotes();
            updateClearButtonVisibility();
        }
    }

    function deleteNote(index) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        updateClearButtonVisibility();
    }

    noteInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addNote();
        }
    });

    notesList.addEventListener('click', (event) => {
        if (event.target.classList.contains('note-delete')) {
            const index = parseInt(event.target.dataset.index);
            deleteNote(index);
        }
    });

    noteInput.addEventListener('input', updateClearButtonVisibility);

    clearInputButton.addEventListener('click', () => {
        noteInput.value = '';
        updateClearButtonVisibility();
        noteInput.focus();
    });

    function updateClearButtonVisibility() {
        if (noteInput.value.length > 0) {
            clearInputButton.classList.remove('hidden');
        } else {
            clearInputButton.classList.add('hidden');
        }
    }

    renderNotes();
    updateClearButtonVisibility();

    // --- Dropdown Functionality ---
    function showDropdown(tabElement) {
        clearTimeout(hideDropdownTimeout);
        if (activeTab && activeTab !== tabElement) {
            hideDropdown();
        }
        activeTab = tabElement;
        const dropdownContent = JSON.parse(activeTab.dataset.dropdownContent);
        globalDropdown.innerHTML = '';

        dropdownContent.forEach(item => {
            const dropdownItem = document.createElement('a');
            dropdownItem.href = item.link;
            dropdownItem.textContent = item.text;
            dropdownItem.classList.add('dropdown-item');
            dropdownItem.target = '_blank';
            globalDropdown.appendChild(dropdownItem);
        });

        globalDropdown.style.opacity = '1';
        globalDropdown.style.visibility = 'visible';
        positionDropdown();
    }

    function hideDropdown() {
        globalDropdown.style.opacity = '0';
        globalDropdown.style.visibility = 'hidden';
        activeTab = null;
    }

    function positionDropdown() {
        if (activeTab) {
            const tabRect = activeTab.getBoundingClientRect();
            let dropdownRect;

            if (isMobileMode()) {
                globalDropdown.style.width = tabRect.width + 'px';
                globalDropdown.style.left = '17px';
                globalDropdown.style.transform = 'none';
                dropdownRect = globalDropdown.getBoundingClientRect();
            } else {
                globalDropdown.style.width = tabRect.width + 'px';
                globalDropdown.style.transform = 'none';
                dropdownRect = globalDropdown.getBoundingClientRect();

                let desktopDropdownLeft = tabRect.left + (tabRect.width / 2) - (dropdownRect.width / 2);

                const viewportWidth = window.innerWidth;
                const desktopHorizontalPadding = 10;
                if (desktopDropdownLeft < desktopHorizontalPadding) {
                    globalDropdown.style.left = `${desktopHorizontalPadding}px`;
                } else if (desktopDropdownLeft + dropdownRect.width > viewportWidth - desktopHorizontalPadding) {
                    globalDropdown.style.left = `${viewportWidth - dropdownRect.width - desktopHorizontalPadding}px`;
                } else {
                    globalDropdown.style.left = `${desktopDropdownLeft}px`;
                }
            }

            let dropdownTop = tabRect.bottom + 2;

            const viewportHeight = window.innerHeight;
            const verticalPadding = 10;
            if (dropdownTop + dropdownRect.height > viewportHeight - verticalPadding) {
                dropdownTop = tabRect.top - dropdownRect.height - 10;
                if (dropdownTop < verticalPadding) {
                    dropdownTop = verticalPadding;
                }
            }
            globalDropdown.style.top = `${dropdownTop}px`;
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            event.stopPropagation();
            if (activeTab === tab) {
                hideDropdown();
            } else {
                showDropdown(tab);
            }
        });
    });

    document.addEventListener('mouseover', (event) => {
        if (isMobileMode()) return;

        const hoveredTab = event.target.closest('.tab');
        if (hoveredTab && hoveredTab !== activeTab) {
            showDropdown(hoveredTab);
        }
    });

    document.addEventListener('mouseout', (event) => {
        if (isMobileMode()) return;

        clearTimeout(hideDropdownTimeout);

        if (!globalDropdown.contains(event.relatedTarget) && (!activeTab || !activeTab.contains(event.relatedTarget))) {
            hideDropdownTimeout = setTimeout(hideDropdown, 100);
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.tab') && !globalDropdown.contains(event.target)) {
            hideDropdown();
        }
    });

    // --- Dynamic Daily Background Image (for body) ---
    function setDailyBackgroundImage() {
        const d = new Date();
        const day = d.getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const imageName = days[day] + '.jpg';
        const imageUrl = `imgs/bgs/${imageName}`;

        document.body.style.backgroundImage = `url('${imageUrl}')`;
    }

    setDailyBackgroundImage();

    // --- Dynamic Side Image Loader (for .image-container) ---
    const sideImages = [];
    for (let i = 1; i <= 12; i++) {
        sideImages.push(`img(${i}).png`);
    }

    function loadRandomSideImage() {
        if (sideImages.length === 0) {
            console.warn("No images defined in sideImages array for .image-container.");
            return;
        }
        const randomIndex = Math.floor(Math.random() * sideImages.length);
        const randomImageName = sideImages[randomIndex];
        // MODIFIED: Use currentImageDir for the path
        const imageUrl = `${currentImageDir}/${randomImageName}`;

        imageContainer.style.backgroundImage = `url('${imageUrl}')`;
    }

    loadRandomSideImage(); // Initial load

    // Add click listener to the imageContainer to load a new random image
    imageContainer.addEventListener('click', loadRandomSideImage);
});
