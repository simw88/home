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
            // Reset count if clicks are too slow
            if (imageClickCount < IMAGE_CLICK_THRESHOLD) {
                imageClickCount = 0;
            }
        }, IMAGE_CLICK_RESET_DELAY);

        if (imageClickCount === IMAGE_CLICK_THRESHOLD) {
            document.body.classList.toggle('dark-mode');
            imageClickCount = 0; // Reset count after toggling
        }
    });

    // 2. Date and Time Display
    const datetimeDisplay = document.getElementById('datetimeDisplay');

    function updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const formattedDateTime = now.toLocaleDateString('en-US', options);
        datetimeDisplay.textContent = formattedDateTime;
    }

    // Update every second
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call to display immediately

    // 3. Search Engine Dropdown
    const searchEngineLabel = document.getElementById('searchEngine');
    const searchEngineDropdown = searchEngineLabel.nextElementSibling;
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    let currentSearchAction = "https://www.google.com/search";
    let currentSearchParam = "q";

    searchEngineLabel.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the document click from immediately closing it
        searchEngineDropdown.classList.toggle('show');
    });

    searchEngineDropdown.querySelectorAll('.search-engine-option').forEach(option => {
        option.addEventListener('click', () => {
            currentSearchAction = option.dataset.value;
            currentSearchParam = option.dataset.name;
            searchEngineLabel.textContent = option.textContent; // Update label text
            searchForm.action = currentSearchAction; // Update form action
            searchInput.name = currentSearchParam; // Update input name for parameter
            searchEngineDropdown.classList.remove('show'); // Hide dropdown
            searchInput.focus(); // Focus on search input after selection
        });
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', (event) => {
        if (!searchEngineLabel.contains(event.target) && !searchEngineDropdown.contains(event.target)) {
            searchEngineDropdown.classList.remove('show');
        }
    });

    // Set initial search form action and input name
    searchForm.action = currentSearchAction;
    searchInput.name = currentSearchParam;

    // 4. Todo List Functionality
    const todoInput = document.getElementById('todoInput');
    const todoClearButton = document.querySelector('.todo-section .clear-button');

    // Load saved todo content on page load
    const savedTodoContent = localStorage.getItem('todoListContent');
    if (savedTodoContent) {
        todoInput.value = savedTodoContent;
    }

    todoInput.addEventListener('input', () => {
        localStorage.setItem('todoListContent', todoInput.value);
        toggleClearButton(todoInput, todoClearButton);
    });

    todoClearButton.addEventListener('click', () => {
        todoInput.value = '';
        localStorage.removeItem('todoListContent');
        toggleClearButton(todoInput, todoClearButton);
        todoInput.focus();
    });

    // Clear Button Functionality (for both search and todo)
    const clearButtons = document.querySelectorAll('.clear-button');

    function toggleClearButton(inputElement, buttonElement) {
        if (inputElement.value.length > 0) {
            buttonElement.style.display = 'block';
        } else {
            buttonElement.style.display = 'none';
        }
    }

    clearButtons.forEach(button => {
        const targetId = button.dataset.target;
        const inputElement = document.getElementById(targetId);

        if (inputElement) {
            // Initial check for clear button visibility
            toggleClearButton(inputElement, button);

            // Event listener for input changes
            inputElement.addEventListener('input', () => {
                toggleClearButton(inputElement, button);
            });

            // Event listener for clear button click
            button.addEventListener('click', () => {
                inputElement.value = '';
                // If it's the search input, trigger input event to hide button
                if (inputElement.id === 'searchInput') {
                    inputElement.dispatchEvent(new Event('input'));
                }
                // If it's the todo input, the todoInput.addEventListener 'input' already handles it
                inputElement.focus();
            });
        }
    });

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
        "(✿◠ᴗ◠)", "•⩊•", "₍^. .^₎⟆", "ᶠᶸᶜᵏᵧₒᵤ!", "(,,•᷄ࡇ•᷅ ,,)?", "(ง'̀-'́)ง", "ʕ •̀ o •́ ʔ", "ಠ_ಠ", "(づ￣ ³￣)づ", "(´・ω・`)", "(´∀｀)♡", "o(｀ω´ )o", "ᕕ( ᐛ )ᕗ", "(´｡• ᵕ •｡`) ♡", "(ง ͡ʘ ͜ʖ ͡ʘ)ง"
    ]; // Added more kaomojis for variety!

    const kaomojiDisplay = document.getElementById('kaomojiDisplay'); // Get the kaomoji display element

    // Function to set a random kaomoji
    function setRandomKaomoji() {
        const randomIndex = Math.floor(Math.random() * kaomojis.length);
        kaomojiDisplay.textContent = kaomojis[randomIndex];
    }

    // Set an initial random kaomoji when the page loads
    setRandomKaomoji();

    // Add click event listener to change kaomoji on tap
    kaomojiDisplay.addEventListener('click', setRandomKaomoji);
});
