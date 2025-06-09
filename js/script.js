document.addEventListener('DOMContentLoaded', () => {
    // 1. Image Changing on Reload
    const leftPanel = document.querySelector('.left-panel');
    const images = [
        'imgs/img1.png', 'imgs/img2.png', 'imgs/img3.png', 'imgs/img4.png',
        'imgs/img5.png', 'imgs/img6.png', 'imgs/img7.png', 'imgs/img8.png',
        'imgs/img9.png', 'imgs/img10.png', 'imgs/img11.png', 'imgs/img12.png'
    ];

    function getRandomImage() {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }

    const imgElement = document.createElement('img');
    imgElement.src = getRandomImage();
    imgElement.alt = "Dynamic Background Image";
    leftPanel.appendChild(imgElement);

    // Dark Mode Manual Toggle Variables
    let imageClickCount = 0;
    let imageClickTimeout;
    const IMAGE_CLICK_THRESHOLD = 3;
    const IMAGE_CLICK_RESET_DELAY = 500; // milliseconds

    // Add event listener for triple-click on image to toggle dark mode
    imgElement.addEventListener('click', () => {
        imageClickCount++;

        clearTimeout(imageClickTimeout); // Clear any previous timeout

        imageClickTimeout = setTimeout(() => {
            // Reset count if clicks are too slow (not within the delay)
            imageClickCount = 0;
        }, IMAGE_CLICK_RESET_DELAY);

        if (imageClickCount === IMAGE_CLICK_THRESHOLD) {
            // Toggle dark mode based on current state
            if (document.body.classList.contains('dark-mode')) {
                removeDarkMode();
            } else {
                applyDarkMode();
            }
            imageClickCount = 0; // Reset count after successful toggle
            clearTimeout(imageClickTimeout); // Clear timeout immediately as action was taken
        }
    });

    // 2. Search Engine Functionality
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    // 3. Date and Time Display
    const datetimeDisplay = document.getElementById('datetimeDisplay');
    const fourChanLabel = document.getElementById('fourChan');
    // Get the label-wrapper for 4chan as well, so we can toggle its display
    const fourChanWrapper = fourChanLabel ? fourChanLabel.closest('.label-wrapper') : null;

    let isFlowerModeActive = false; // State variable to track if flower.png mode is active

    function updateDateTime() {
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };

        const formattedDate = now.toLocaleDateString(undefined, dateOptions);
        const formattedTime = now.toLocaleTimeString(undefined, timeOptions);

        datetimeDisplay.textContent = `${formattedDate} ${formattedTime}`;
    }

    // Update time every second
    setInterval(updateDateTime, 1000);
    // Initial call to display time immediately
    updateDateTime();

    // Event listener for tapping the time and date (toggle functionality)
    datetimeDisplay.addEventListener('click', () => {
        if (isFlowerModeActive) {
            // Revert to random image
            imgElement.src = getRandomImage();
            imgElement.alt = "Dynamic Background Image";

            // Make the 4chan label appear again
            if (fourChanWrapper) {
                fourChanWrapper.style.display = ''; // Revert to default display (e.g., 'block' or 'flex' depending on CSS)
            }
            isFlowerModeActive = false;
        } else {
            // Change to flower.png
            imgElement.src = 'imgs/flower.png';
            imgElement.alt = "Flower Image";

            // Hide the 4chan label
            if (fourChanWrapper) {
                fourChanWrapper.style.display = 'none';
            }
            isFlowerModeActive = true;
        }
    });


    // 4. Dropdown functionality for labels (Email, News, 4chan, etc.)
    document.querySelectorAll('.label-wrapper').forEach(wrapper => {
        const label = wrapper.querySelector('.label');
        const dropdownContent = wrapper.querySelector('.dropdown-content');

        if (label && dropdownContent) {
            // Toggle dropdown visibility on label click
            label.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click from propagating to document
                // Close other open dropdowns
                document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
                    if (openDropdown !== dropdownContent) {
                        openDropdown.classList.remove('show');
                    }
                });
                dropdownContent.classList.toggle('show');
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
            // Check if the click is outside the dropdown and its parent label-wrapper
            const isClickInsideDropdown = openDropdown.contains(event.target);
            const isClickInsideLabel = openDropdown.previousElementSibling && openDropdown.previousElementSibling.contains(event.target);

            if (!isClickInsideDropdown && !isClickInsideLabel) {
                openDropdown.classList.remove('show');
            }
        });
    });


    // 5. Search Engine Selection Logic
    document.querySelectorAll('.search-engine-option').forEach(option => {
        option.addEventListener('click', function() {
            const baseUrl = this.dataset.value;
            const paramName = this.dataset.name;
            searchForm.action = baseUrl; // Set the form's action URL
            searchInput.name = paramName; // Set the search input's name attribute
            document.querySelector('.search-input-group .label').textContent = this.textContent; // Update button text
            document.querySelector('.search-input-group .dropdown-content').classList.remove('show'); // Hide dropdown
            searchInput.focus(); // Keep focus on the search input
        });
    });

    // 6. Clear Input Button Functionality
    const searchClearButton = document.querySelector('.clear-button[data-target="searchInput"]');
    const todoInput = document.getElementById('todoInput');
    const todoClearButton = document.querySelector('.clear-button[data-target="todoInput"]');

    // Function to show/hide clear button based on input content
    function toggleClearButton(inputElement, clearButtonElement) {
        if (inputElement.value.length > 0) {
            clearButtonElement.style.display = 'block'; // Show the button
        } else {
            clearButtonElement.style.display = 'none'; // Hide the button
        }
    }

    // Function to clear the input field
    function clearInput(inputElement, clearButton) {
        inputElement.value = '';
        toggleClearButton(inputElement, clearButton); // Hide button after clearing
        inputElement.focus(); // Keep focus for user convenience
        // Clear from localStorage as well
        if (inputElement === todoInput) {
            localStorage.removeItem('todoListContent');
        }
    }

    // Event listeners for search input
    searchInput.addEventListener('input', () => {
        toggleClearButton(searchInput, searchClearButton);
    });
    searchClearButton.addEventListener('click', () => {
        clearInput(searchInput, searchClearButton);
    });

    // Event listeners for todo input
    todoInput.addEventListener('input', () => {
        toggleClearButton(todoInput, todoClearButton);
        // Save todo list content to localStorage on every input change
        localStorage.setItem('todoListContent', todoInput.value);
    });
    todoClearButton.addEventListener('click', () => {
        clearInput(todoInput, todoClearButton);
    });

    // Initial check on page load in case fields are pre-filled (e.g., from browser restore)
    toggleClearButton(searchInput, searchClearButton);

    // Load todo list content from localStorage on page load
    const savedTodoContent = localStorage.getItem('todoListContent');
    if (savedTodoContent) {
        todoInput.value = savedTodoContent;
    }
    toggleClearButton(todoInput, todoClearButton); // Check visibility for loaded content


    // --- Automatic Dark Mode Functionality ---
    function applyDarkMode() {
        document.body.classList.add('dark-mode');
    }

    function removeDarkMode() {
        document.body.classList.remove('dark-mode');
    }

    function checkTimeForDarkMode() {
        const now = new Date();
        const hour = now.getHours(); // 0-23

        // Dark mode from 7 PM (19) to 5 AM (before 5)
        if (hour >= 19 || hour < 5) {
            applyDarkMode();
        } else {
            removeDarkMode();
        }
    }

    // Initial check when the page loads
    checkTimeForDarkMode();

    // Check every minute to automatically switch themes
    setInterval(checkTimeForDarkMode, 60 * 1000); // Check every 60 seconds

    // --- Kaomoji Display Functionality (NEW) ---
    const kaomojis = [
        "(✿◠ᴗ◠)", "(•w•)", "(^. .^>)⟆", "("^w^")"
    ];
    const kaomojiDisplay = document.getElementById('kaomojiDisplay');

    function displayRandomKaomoji() {
        if (kaomojiDisplay) {
            const randomIndex = Math.floor(Math.random() * kaomojis.length);
            kaomojiDisplay.textContent = kaomojis[randomIndex];
        }
    }

    // Call this function on page load to set an initial kaomoji
    displayRandomKaomoji();

    // Add click event listener to change kaomoji on tap (THIS IS THE ADDED LINE)
    if (kaomojiDisplay) {
        kaomojiDisplay.addEventListener('click', displayRandomKaomoji);
    }
});
