document.addEventListener("DOMContentLoaded", () => {
    // 🖼️ Random .png image picker
    const IMAGE_LIST = [
        "imgs/img1.png", "imgs/img2.png", "imgs/img3.png",
        "imgs/img4.png", "imgs/img5.png", "imgs/img6.png",
        "imgs/img7.png", "imgs/img8.png", "imgs/img9.png",
        "imgs/img10.png", "imgs/img11.png", "imgs/img12.png",
    ];
    const randImg = document.getElementById("randImg");
    if (randImg) {
        randImg.src = IMAGE_LIST[Math.floor(Math.random() * IMAGE_LIST.length)];
    }

    // --- Remembering Textbox Logic & Auto-Resizing ---
    const rememberingTextbox = document.getElementById('todolist');
    const STORAGE_KEY = 'myTextboxContent';

    // Function to auto-resize the textarea
    function autoResizeTextarea(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto'; // Reset height to recalculate scrollHeight
        textarea.style.height = textarea.scrollHeight + 'px'; // Set height to content's scrollHeight
    }

    if (rememberingTextbox) {
        const savedContent = localStorage.getItem(STORAGE_KEY);
        if (savedContent) {
            rememberingTextbox.value = savedContent;
        }

        // Initial resize in case there's saved content
        autoResizeTextarea(rememberingTextbox);

        rememberingTextbox.addEventListener('input', () => {
            try {
                localStorage.setItem(STORAGE_KEY, rememberingTextbox.value);
            } catch (e) {
                console.error("Failed to save to local storage:", e);
                // Optionally inform the user or handle the error gracefully
            }
            toggleClearButtonVisibility(rememberingTextbox, clearTodolistBtn);
            autoResizeTextarea(rememberingTextbox); // Auto-resize on input
        });
    }
    // --- End of Remembering Textbox Logic & Auto-Resizing ---

    // 🔍 Update form action based on custom search engine dropdown
    const searchForm = document.getElementById("searchform");
    const searchEngineDropdown = document.getElementById("searchEngineDropdown");
    const selectedEngineDisplay = document.getElementById("selectedEngine");
    const searchBox = document.getElementById("searchbox");
    const dropdownOptionsList = searchEngineDropdown ? searchEngineDropdown.querySelector(".dropdown-options") : null;

    function updateSearchFormAction(url, name) {
        if (searchForm && searchBox) {
            searchForm.action = url;
            searchBox.name = name;
        }
    }

    if (searchEngineDropdown && selectedEngineDisplay && dropdownOptionsList && searchBox) {
        const initialOption = dropdownOptionsList.querySelector("li:first-child");
        if (initialOption) {
            selectedEngineDisplay.textContent = initialOption.textContent;
            updateSearchFormAction(initialOption.dataset.value, initialOption.dataset.name);
        }

        // Toggle custom dropdown on click of selected-engine display
        selectedEngineDisplay.addEventListener("click", (event) => {
            event.stopPropagation();
            searchEngineDropdown.classList.toggle("active");
        });

        // Event delegation for dropdown options
        dropdownOptionsList.addEventListener("click", (event) => {
            event.stopPropagation();
            const option = event.target.closest('li[data-value][data-name]');
            if (option) {
                const newValue = option.dataset.value;
                const newName = option.dataset.name;
                const newText = option.textContent;

                selectedEngineDisplay.textContent = newText;
                updateSearchFormAction(newValue, newName);
                searchBox.focus();
                searchEngineDropdown.classList.remove("active"); // Close dropdown after selection
            }
        });

        // Close custom dropdown when clicking outside it
        document.addEventListener("click", (event) => {
            if (searchEngineDropdown.classList.contains("active") && !searchEngineDropdown.contains(event.target)) {
                searchEngineDropdown.classList.remove("active");
            }
        });
    }

    // ⭐ Dark Mode Logic (Automatic Time-Based ONLY - NO USER INTERVENTION) ⭐
    // Define sunset and sunrise hours in 24-hour format
    const SUNSET_HOUR = 19; // Dark mode starts at 7:00 PM (19:00)
    const SUNRISE_HOUR = 4;  // Dark mode ends at 4:30 AM (04:30)

    // Function to get the current desired theme based on the hour and minute
    function getCurrentTimeBasedTheme() {
        const currentHour = new Date().getHours();
        const currentMinutes = new Date().getMinutes();

        if (currentHour > SUNSET_HOUR ||
            (currentHour === SUNSET_HOUR && currentMinutes >= 0) ||
            currentHour < SUNRISE_HOUR ||
            (currentHour === SUNRISE_HOUR && currentMinutes < 30)) {
            return 'dark';
        } else {
            return 'light';
        }
    }

    // Function to apply the theme to the body
    function applyThemeToBody(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Initial theme application
    applyThemeToBody(getCurrentTimeBasedTheme());

    // Update theme every minute
    setInterval(() => {
        applyThemeToBody(getCurrentTimeBasedTheme());
    }, 60000); // Check every minute
    // ⭐ END Dark Mode Logic ⭐

    // --- Clear Search and To-Do List Buttons ---
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const clearTodolistBtn = document.getElementById('clearTodolistBtn');

    // Function to toggle button visibility
    function toggleClearButtonVisibility(inputField, button) {
        if (inputField && button) {
            if (inputField.value.length > 0) {
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
            }
        }
    }

    if (clearSearchBtn && searchBox) {
        clearSearchBtn.addEventListener('click', () => {
            searchBox.value = '';
            toggleClearButtonVisibility(searchBox, clearSearchBtn);
            searchBox.focus();
        });
        searchBox.addEventListener('input', () => {
            toggleClearButtonVisibility(searchBox, clearSearchBtn);
        });
        toggleClearButtonVisibility(searchBox, clearSearchBtn); // Initial check on load
    }

    if (clearTodolistBtn && rememberingTextbox) {
        clearTodolistBtn.addEventListener('click', () => {
            rememberingTextbox.value = '';
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                console.error("Failed to clear from local storage:", e);
            }
            toggleClearButtonVisibility(rememberingTextbox, clearTodolistBtn);
            autoResizeTextarea(rememberingTextbox); // Resize after clearing
            rememberingTextbox.focus();
        });
        toggleClearButtonVisibility(rememberingTextbox, clearTodolistBtn); // Initial check on load
    }

    // Updated: Image replacement and 4chan dropdown toggle on clockbox click
    const clockbox = document.getElementById('clockbox');
    const randImgElement = document.getElementById("randImg"); // Get the image element
    let isFlowerImageDisplayed = false; // State variable for image toggle

    // More robust selector for 4chan dropdown - using the ID previously added.
    // If the ID was not used, fallback to existing logic.
    let fourChanDropdown = document.getElementById('fourchanDropdown');

    // Fallback logic if the ID is not present (e.g., if user reverts index.html)
    if (!fourChanDropdown) {
        fourChanDropdown = document.querySelector('.dropdown-menu li:nth-child(3)');
        if (!fourChanDropdown) {
            const dropdownItems = document.querySelectorAll('.dropdown-menu > li');
            fourChanDropdown = Array.from(dropdownItems).find(li => {
                const link = li.querySelector('a');
                return link && link.textContent.toLowerCase().includes('4chan');
            });
        }
        if (!fourChanDropdown) {
            const dropdownLinks = document.querySelectorAll('.dropdown-menu > li > a');
            const fourChanLink = Array.from(dropdownLinks).find(link =>
                link.href && link.href.includes('4chan')
            );
            if (fourChanLink) {
                fourChanDropdown = fourChanLink.parentElement;
            }
        }
    }


    if (clockbox && randImgElement) {
        clockbox.addEventListener('click', () => {
            if (isFlowerImageDisplayed) {
                // If flower is currently displayed, revert to random image
                randImgElement.src = IMAGE_LIST[Math.floor(Math.random() * IMAGE_LIST.length)];
                isFlowerImageDisplayed = false;
            } else {
                // If random image is displayed, change to flower.png
                randImgElement.src = "imgs/flower.png";
                isFlowerImageDisplayed = true;
            }

            // Toggle 4chan dropdown if found
            if (fourChanDropdown) {
                fourChanDropdown.classList.toggle('hidden');
                console.log('4chan dropdown toggled'); // For debugging
            } else {
                console.warn('4chan dropdown not found'); // For debugging
            }
        });
    }

    // --- Dropdown Logic (for both mobile click and desktop hover cleanup) ---
    const dropdownLabels = document.querySelectorAll('.dropdown-menu > li > a');
    const allDropdownLis = document.querySelectorAll('.dropdown-menu > li');

    // Function to close a specific submenu
    function closeSubmenu(parentLi) {
        if (parentLi) {
            parentLi.classList.remove('active');
            parentLi.style.zIndex = ''; // Reset z-index
            const submenu = parentLi.querySelector('ul');
            if (submenu) {
                submenu.style.maxHeight = '';
                submenu.style.opacity = '';
            }
        }
    }

    // Function to open a specific submenu
    function openSubmenu(parentLi) {
        if (parentLi) {
            // Set a higher z-index when opening to ensure it's on top
            parentLi.style.zIndex = '100'; // Higher than other elements
            parentLi.classList.add('active');
            const submenu = parentLi.querySelector('ul');
            if (submenu) {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
                submenu.style.opacity = '1';
            }
        }
    }

   // Event listener for dropdown labels
dropdownLabels.forEach(label => {
    label.addEventListener('click', function(event) {
        const parentLi = this.closest('li');
        const submenu = parentLi ? parentLi.querySelector('ul') : null;

        if (submenu) {
            // Prevent default link behavior if it's just a label placeholder
            if (this.getAttribute('href') === '#') {
                event.preventDefault();
            }

            // Crucial: Determine if we are on a mobile/touch device
            const isMobile = window.innerWidth <= 768 || window.matchMedia('(hover: none)').matches;

            if (isMobile) {
                event.preventDefault();
                event.stopPropagation();
                
                // Check if THIS specific dropdown is currently active
                const isThisActive = parentLi.classList.contains('active');
                
                // Close ALL dropdowns first
                allDropdownLis.forEach(li => {
                    closeSubmenu(li);
                });
                
                // If THIS dropdown was closed, open it
                if (!isThisActive) {
                    openSubmenu(parentLi);
                }
            }
        }
    });
});

    // Handle clicks outside the dropdown to retract it more robustly
    document.addEventListener('click', (event) => {
        allDropdownLis.forEach(parentLi => {
            // Only close if it's active AND the click was outside this specific dropdown
            if (parentLi.classList.contains('active') && !parentLi.contains(event.target)) {
                closeSubmenu(parentLi);
            }
        });
    });

    // Handle window resize to clean up inline styles and ensure proper state
    window.addEventListener('resize', () => {
        // On any resize (including orientation change), always close all dropdowns
        allDropdownLis.forEach(parentLi => {
            closeSubmenu(parentLi);
        });
    });
});


// 🕒 Live time updater (Kept outside DOMContentLoaded to match original structure)
const T_DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const T_MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function GetClock() {
    const d = new Date();
    let nday = d.getDay(),
        nmonth = d.getMonth(),
        ndate = d.getDate(),
        nyear = d.getFullYear(),
        nhour = d.getHours(),
        nmin = d.getMinutes(),
        nsec = d.getSeconds(),
        ap;

    if (nhour === 0) {
        ap = " AM";
        nhour = 12;
    } else if (nhour < 12) {
        ap = " AM";
    } else if (nhour === 12) {
        ap = " PM";
    } else {
        ap = " PM";
        nhour -= 12;
    }

    if (nmin <= 9) nmin = "0" + nmin;
    if (nsec <= 9) nsec = "0" + nsec;

    const clockbox = document.getElementById('clockbox');
    if (clockbox) {
        clockbox.innerHTML = `${T_DAY[nday]}, ${T_MONTH[nmonth]} ${ndate}, ${nyear} ${nhour}:${nmin}:${nsec}${ap}`;
    }
}

// Ensure GetClock runs initially and updates every second
window.onload = function () {
    GetClock();
    setInterval(GetClock, 1000);
}
