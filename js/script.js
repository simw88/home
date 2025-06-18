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

    // Load hidden states from localStorage on page load
    let boardsTabHidden = JSON.parse(localStorage.getItem('boardsTabHidden')) || false;
    let pandaSearchHidden = JSON.parse(localStorage.getItem('pandaSearchHidden')) || false;
    // State variable for current image directory - also load from localStorage
    let currentImageDir = localStorage.getItem('currentImageDir') || 'imgs/side';

    // Variables for drag and drop
    let draggedNoteIndex = null;
    let dragOverNoteIndex = null;

    // Variables for tap detection
    let lastClickTime = 0;
    let clickCount = 0;
    const TAP_TIMEOUT = 300; // milliseconds to differentiate taps

    // Helper function to determine if it's mobile mode
    const isMobileMode = () => window.innerWidth <= 1000;

    // Function to apply initial hidden states on page load
    function applyInitialHiddenStates() {
        const boardsTab = Array.from(tabs).find(tab => tab.textContent.trim() === 'Boards');
        const pandaSearchBtn = Array.from(searchButtons).find(btn => btn.dataset.engine === 'panda');

        // Apply saved "Boards" tab visibility state
        if (boardsTab && boardsTabHidden) {
            boardsTab.classList.add('hidden');
        }

        // Apply saved "Panda" search option visibility state
        if (pandaSearchBtn && pandaSearchHidden) {
            pandaSearchBtn.classList.add('hidden');
            // If "Panda" was active but is now hidden, switch to Google
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
    }

    // Function to save hidden states to localStorage
    function saveHiddenStates() {
        localStorage.setItem('boardsTabHidden', JSON.stringify(boardsTabHidden));
        localStorage.setItem('pandaSearchHidden', JSON.stringify(pandaSearchHidden));
        localStorage.setItem('currentImageDir', currentImageDir);
    }

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
                    hideDropdownImmediate(); // Hide dropdown if the tab is hidden
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

        // Toggle image source directory and load new image
        currentImageDir = (currentImageDir === 'imgs/side') ? 'imgs/rep' : 'imgs/side';
        loadRandomSideImage(); // Call the function to load image from the new directory

        // Save the updated states to localStorage
        saveHiddenStates();
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
                // Make each note item draggable and assign a data-index
                noteItem.setAttribute('draggable', 'true');
                noteItem.dataset.index = index; // Store the original index for drag/drop
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
            notes.unshift(noteText); // Changed from push to unshift to add to the top
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

    // Function to move note up
    function moveNoteUp(index) {
        if (index > 0) {
            const [noteToMove] = notes.splice(index, 1);
            notes.splice(index - 1, 0, noteToMove);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
        }
    }

    // Function to move note down
    function moveNoteDown(index) {
        if (index < notes.length - 1) {
            const [noteToMove] = notes.splice(index, 1);
            notes.splice(index + 1, 0, noteToMove);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
        }
    }

    noteInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addNote();
        }
    });

    notesList.addEventListener('click', (event) => {
        // Handle delete button click first
        if (event.target.classList.contains('note-delete')) {
            const index = parseInt(event.target.dataset.index);
            deleteNote(index);
        } else {
            // Handle tap events for moving notes
            const targetNoteItem = event.target.closest('.note-item');
            if (targetNoteItem) {
                const currentTime = new Date().getTime();
                
                if (currentTime - lastClickTime < TAP_TIMEOUT) {
                    clickCount++;
                } else {
                    clickCount = 1;
                }
                lastClickTime = currentTime;

                // Use a timeout to determine if it's a single or double tap
                // This setTimeout is crucial because we need to wait a bit to see if
                // another click happens within the TAP_TIMEOUT window.
                setTimeout(() => {
                    // Only process if clickCount is still valid for this tap sequence
                    if (clickCount > 0) { // Ensure it's not reset by a later dragend or click outside
                        if (clickCount === 1) { // Single tap
                            const index = parseInt(targetNoteItem.dataset.index);
                            moveNoteUp(index);
                        } else if (clickCount === 2) { // Double tap
                            const index = parseInt(targetNoteItem.dataset.index);
                            moveNoteDown(index);
                        }
                    }
                    clickCount = 0; // Reset click count after processing
                }, TAP_TIMEOUT);
            }
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

    // --- Drag and Drop functionality for Notes ---

    notesList.addEventListener('dragstart', (e) => {
        const targetItem = e.target.closest('.note-item');
        if (targetItem) {
            draggedNoteIndex = parseInt(targetItem.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', draggedNoteIndex); // Set data (useful for external drops, but also for internal tracking)
            targetItem.classList.add('dragging'); // Add a class for styling the dragged item
        }
    });

    notesList.addEventListener('dragover', (e) => {
        e.preventDefault(); // Crucial: Allows a drop
        e.dataTransfer.dropEffect = 'move';

        const targetItem = e.target.closest('.note-item');
        if (targetItem && draggedNoteIndex !== null) {
            const currentOverIndex = parseInt(targetItem.dataset.index);

            if (currentOverIndex === draggedNoteIndex) {
                // Dragging over itself, no visual change
                notesList.querySelectorAll('.note-item').forEach(item => item.classList.remove('drag-over-top', 'drag-over-bottom'));
                return;
            }

            // Determine if dragging above or below the current item
            const rect = targetItem.getBoundingClientRect();
            const midpoint = rect.y + rect.height / 2;

            notesList.querySelectorAll('.note-item').forEach(item => item.classList.remove('drag-over-top', 'drag-over-bottom'));

            if (e.clientY < midpoint) {
                // Dragging to insert above
                targetItem.classList.add('drag-over-top');
                dragOverNoteIndex = currentOverIndex;
            } else {
                // Dragging to insert below
                targetItem.classList.add('drag-over-bottom');
                dragOverNoteIndex = currentOverIndex + 1; // Insert after this item
            }
        } else if (!targetItem && notes.length === 0 && draggedNoteIndex !== null) {
            // Special case: dragging over an empty list
            notesList.classList.add('drag-over-empty');
            dragOverNoteIndex = 0; // Insert at the beginning of the empty list
        }
    });

    notesList.addEventListener('dragleave', (e) => {
        // Clear all drag-over classes when leaving the list or an item
        notesList.querySelectorAll('.note-item').forEach(item => item.classList.remove('drag-over-top', 'drag-over-bottom'));
        notesList.classList.remove('drag-over-empty');
    });


    notesList.addEventListener('drop', (e) => {
        e.preventDefault(); // Prevent default browser drop behavior (e.g., opening dropped text)

        // Clear all drag-over classes
        notesList.querySelectorAll('.note-item').forEach(item => item.classList.remove('drag-over-top', 'drag-over-bottom'));
        notesList.classList.remove('drag-over-empty');

        if (draggedNoteIndex !== null && dragOverNoteIndex !== null) {
            if (draggedNoteIndex === dragOverNoteIndex || (draggedNoteIndex + 1 === dragOverNoteIndex && draggedNoteIndex < dragOverNoteIndex)) {
                // Dropped at the same position or just below itself, no change needed
                draggedNoteIndex = null;
                dragOverNoteIndex = null;
                renderNotes(); // Re-render to clear any potential lingering styles
                return;
            }

            const [movedNote] = notes.splice(draggedNoteIndex, 1); // Remove the dragged note

            // Adjust dragOverNoteIndex if we removed an item *before* the target drop position
            if (draggedNoteIndex < dragOverNoteIndex) {
                dragOverNoteIndex--;
            }

            notes.splice(dragOverNoteIndex, 0, movedNote); // Insert the note at the new position

            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes(); // Re-render the notes to reflect the new order
        }
        draggedNoteIndex = null; // Reset
        dragOverNoteIndex = null; // Reset
    });

    notesList.addEventListener('dragend', (e) => {
        // This event fires after the drag operation has finished (drop or cancel)
        notesList.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom');
        });
        notesList.classList.remove('drag-over-empty');
        draggedNoteIndex = null;
        dragOverNoteIndex = null;
    });

    // --- Dropdown Functionality ---
    function showDropdown(tabElement) {
        // Clear any existing timeout to prevent accidental hiding
        clearTimeout(hideDropdownTimeout);

        // If a different tab is already active, hide its dropdown first
        if (activeTab && activeTab !== tabElement) {
            hideDropdownImmediate(); // Use an immediate hide for other dropdowns
        }
        activeTab = tabElement; // Store the newly active tab

        // Add 'tab-active' class to the currently active tab
        activeTab.classList.add('tab-active');

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

        // Ensure display is block for measurement, but keep other visual properties for smooth transition
        globalDropdown.style.display = 'block';
        globalDropdown.style.visibility = 'visible'; // Keep visible from now on if we are showing it
        globalDropdown.style.pointerEvents = 'auto'; // Enable interactions

        positionDropdown(); // Call positionDropdown after content is loaded and element is visible

        // Now apply final opacity and transform for animation
        globalDropdown.style.opacity = '1';
        globalDropdown.style.transform = 'translateY(0px)';
		globalDropdown.style.transform = 'translatex(-8px)';
    }

    // New helper function for immediate hiding (for other dropdowns)
    function hideDropdownImmediate() {
        clearTimeout(hideDropdownTimeout); // Clear any pending hide
        globalDropdown.style.opacity = '0';
        globalDropdown.style.pointerEvents = 'none';
        globalDropdown.style.transform = 'translateY(-10px)';
        globalDropdown.style.visibility = 'hidden';
        globalDropdown.style.display = 'none';
        
        // Remove 'tab-active' class from the tab that was active
        if (activeTab) {
            activeTab.classList.remove('tab-active');
        }
        activeTab = null;
    }

    function hideDropdown() {
        // Use a timeout to allow for quick re-display without flickering
        clearTimeout(hideDropdownTimeout); // Clear any pending hide
        hideDropdownTimeout = setTimeout(() => {
            globalDropdown.style.opacity = '0';
            globalDropdown.style.pointerEvents = 'none';
            globalDropdown.style.transform = 'translateY(-13px)';			// Animate slightly upwards
			globalDropdown.style.transform = 'translatex(-8px)';
            globalDropdown.style.visibility = 'hidden';
            // After animation, hide it fully
            setTimeout(() => {
                globalDropdown.style.display = 'none';
            }, 200); // Match CSS transition duration
            
            // Remove 'tab-active' class from the tab that was active
            if (activeTab) {
                activeTab.classList.remove('tab-active');
            }
            activeTab = null;
        }, 100); // Short delay to allow quick re-entry or click on dropdown items
    }

    function positionDropdown() {
        if (!activeTab || !globalDropdown) return;

        const tabRect = activeTab.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Reset any previous inline styles that might interfere with measurement
        globalDropdown.style.width = '';
        globalDropdown.style.left = '';
        globalDropdown.style.top = '';
        globalDropdown.style.transform = 'none'; // Ensure no conflicting transforms

        let targetLeft;
        let targetTop;

        // Calculate top position first: always directly below the tab, plus a small gap
        targetTop = tabRect.bottom + window.scrollY + 5; // 5px gap below the tab

        // First, set the dropdown's width to match the tab for both modes
        // This ensures dropdownRect.width is accurate for centering calculations
        globalDropdown.style.width = `${tabRect.width}px`;

        // Now, get dropdown dimensions *after* setting its width
        let dropdownRect = globalDropdown.getBoundingClientRect();

        // Calculate targetLeft to center the dropdown with the tab
        // tabRect.left + tabRect.width / 2 gives the horizontal center of the tab
        // Then subtract half of the dropdown's width to get its new left position
        targetLeft = tabRect.left + (tabRect.width / 2) - (dropdownRect.width / 2);

        // Add boundary checks
        const leftEdgeBuffer = 10;
        const rightEdgeBuffer = 10;

        // Ensure it doesn't go off the screen on the left
        if (targetLeft < leftEdgeBuffer) {
            targetLeft = leftEdgeBuffer;
        }

        // Ensure it doesn't go off the screen on the right
        if (targetLeft + dropdownRect.width > viewportWidth - rightEdgeBuffer) {
            targetLeft = viewportWidth - dropdownRect.width - rightEdgeBuffer;
            // If even after shifting right, it still overlaps left, shrink it
            if (targetLeft < leftEdgeBuffer) {
                targetLeft = leftEdgeBuffer;
                globalDropdown.style.width = `${viewportWidth - (leftEdgeBuffer + rightEdgeBuffer)}px`;
                // IMPORTANT: Re-measure dropdownRect after potential width change
                dropdownRect = globalDropdown.getBoundingClientRect();
            }
        }

        // Apply calculated positions
        globalDropdown.style.left = `${targetLeft}px`;
        globalDropdown.style.top = `${targetTop}px`;

        // At this point, it's already visible, it will be made fully visible by showDropdown.
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
        const hoveredDropdown = event.target.closest('#globalDropdown');

        // Only show if hovering over a tab and it's not the currently active one
        // and if the mouse is not already over the dropdown itself
        if (hoveredTab && hoveredTab !== activeTab && !hoveredDropdown) {
            showDropdown(hoveredTab);
        } else if (hoveredTab && hoveredTab === activeTab) {
            // If re-hovering the active tab, clear any pending hide
            clearTimeout(hideDropdownTimeout);
        } else if (hoveredDropdown) {
            // If hovering over the dropdown itself, clear any pending hide
            clearTimeout(hideDropdownTimeout);
        }
    });

    document.addEventListener('mouseout', (event) => {
        if (isMobileMode()) return;

        clearTimeout(hideDropdownTimeout); // Clear any pending hide just in case

        // Check if the mouse is moving FROM a tab or the dropdown TO somewhere else
        const fromTab = event.target.closest('.tab');
        const fromDropdown = event.target.closest('#globalDropdown');
        const toTab = event.relatedTarget ? event.relatedTarget.closest('.tab') : null;
        const toDropdown = event.relatedTarget ? event.relatedTarget.closest('#globalDropdown') : null;

        // If leaving a tab AND not entering another tab or the dropdown
        if (fromTab && !toTab && !toDropdown) {
            hideDropdown();
        }
        // If leaving the dropdown AND not entering a tab
        else if (fromDropdown && !toTab) {
            hideDropdown();
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.tab') && !globalDropdown.contains(event.target)) {
            hideDropdown();
        }
    });

    // --- IMPORTANT: Add an event listener for window resize/orientation change ---
    // This will ensure the dropdown repositions if it's open during a screen rotation
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (globalDropdown.style.display === 'block' && activeTab) {
                // Only reposition if the dropdown is currently visible and a tab is active
                showDropdown(activeTab); // Re-show and re-position the dropdown
            }
        }, 200); // Debounce the resize event to prevent excessive calls
    });

    // --- WebKit-compatible background image setter ---
    function setBackgroundImageWebKitSafe(element, imageUrl) {
        // Create absolute URL to avoid WebKit relative path issues
        const absoluteUrl = new URL(imageUrl, window.location.href).href;
        
        // Set background image with proper quotes (WebKit can be picky about this)
        element.style.backgroundImage = `url('${absoluteUrl}')`;
        
        // Force a style recalculation in WebKit
        element.offsetHeight;
        
        // Alternative approach: try without quotes as well
        if (!element.style.backgroundImage || element.style.backgroundImage === 'none') {
            element.style.backgroundImage = `url(${absoluteUrl})`;
        }
        
        // Ensure other background properties are set
        if (!element.style.backgroundSize) element.style.backgroundSize = 'cover';
        if (!element.style.backgroundPosition) element.style.backgroundPosition = 'center';
        if (!element.style.backgroundRepeat) element.style.backgroundRepeat = 'no-repeat';
        
        // Try to force a repaint
        element.style.transform = 'translateZ(0)';
    }

    // --- Dynamic Daily Background Image (for body) ---
    function setDailyBackgroundImage() {
        const d = new Date();
        const day = d.getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const imageName = days[day] + '.jpg';
        const imageUrl = `imgs/bgs/${imageName}`;

        setBackgroundImageWebKitSafe(document.body, imageUrl);
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
        // Use currentImageDir for the path
        const imageUrl = `${currentImageDir}/${randomImageName}`;

        setBackgroundImageWebKitSafe(imageContainer, imageUrl);
    }

    loadRandomSideImage(); // Initial load

    // Add click listener to the imageContainer to load a new random image
    imageContainer.addEventListener('click', loadRandomSideImage);

    // Apply the initial hidden states when the page loads
    applyInitialHiddenStates();
});
