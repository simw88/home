document.addEventListener("DOMContentLoaded", () => {
    // 🖼️ Random .png image picker (keep as is)
    const imageList = [
        "imgs/img1.png",
        "imgs/img2.png",
        "imgs/img3.png",
        "imgs/img4.png",
        "imgs/img5.png",
        "imgs/img6.png",
        "imgs/img7.png",
        "imgs/img8.png",
        "imgs/img9.png",
        "imgs/img10.png",
        "imgs/img11.png",
        "imgs/img12.png",
    ];
    const randImg = document.getElementById("randImg");
    if (randImg) { // Check if element exists before trying to set its source
        randImg.src = imageList[Math.floor(Math.random() * imageList.length)];
    }

    // --- Remembering Textbox Logic --- (keep as is)
    const rememberingTextbox = document.getElementById('todolist');
    const storageKey = 'myTextboxContent';

    if (rememberingTextbox) { // Check if the textbox exists on the page
        const savedContent = localStorage.getItem(storageKey);
        if (savedContent) {
            rememberingTextbox.value = savedContent;
        }

        rememberingTextbox.addEventListener('input', () => {
            localStorage.setItem(storageKey, rememberingTextbox.value);
        });
    }
    // --- End of Remembering Textbox Logic ---

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

        dropdownOptionsList.querySelectorAll("li").forEach(option => {
            option.addEventListener("click", () => {
                const newValue = option.dataset.value;
                const newName = option.dataset.name;
                const newText = option.textContent;

                selectedEngineDisplay.textContent = newText;
                updateSearchFormAction(newValue, newName);
            });
        });
    }

    // ⭐ Dark Mode Logic (Modified for Time-Based) ⭐
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const themeKey = 'themePreference'; // Stores 'light', 'dark', or 'auto'

    // Define sunrise/sunset hours (adjust these as needed for your location/preference)
    const SUNSET_HOUR = 19; // 7 PM (19:00)
    const SUNRISE_HOUR = 7;  // 7 AM (07:00)

    // Function to get the automatic theme based on the current hour
    function getAutomaticTheme() {
        const currentHour = new Date().getHours();
        if (currentHour >= SUNSET_HOUR || currentHour < SUNRISE_HOUR) {
            return 'dark'; // It's night time
        } else {
            return 'light'; // It's day time
        }
    }

    // Function to apply the theme to the body and update the toggle button icon
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️'; // Sun icon for light mode
            darkModeToggle.setAttribute('aria-label', 'Switch to Light Mode');
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.textContent = '🌙'; // Moon icon for dark mode
            darkModeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
        }
    }

    // Function to handle theme changes (manual or automatic) and save preference
    function setTheme(themeMode) {
        if (themeMode === 'auto') {
            applyTheme(getAutomaticTheme());
        } else {
            applyTheme(themeMode);
        }
        localStorage.setItem(themeKey, themeMode); // Save the user's choice ('light', 'dark', or 'auto')
    }

    // Initial theme setting on page load
    const savedThemePreference = localStorage.getItem(themeKey);

    if (savedThemePreference) {
        // If a preference is saved (manual override or 'auto'), use it
        setTheme(savedThemePreference);
    } else if (prefersDarkScheme.matches) {
        // If no preference saved, but system prefers dark, initialize with dark and set preference to 'auto'
        setTheme('dark'); // Apply dark
        localStorage.setItem(themeKey, 'auto'); // But save preference as auto
    } else {
        // Default to 'auto' (time-based) if no preference or system preference is light
        setTheme('auto');
    }

    // Listener for system preference changes (only relevant if current preference is 'auto')
    prefersDarkScheme.addEventListener('change', (event) => {
        const currentSavedPreference = localStorage.getItem(themeKey);
        if (!currentSavedPreference || currentSavedPreference === 'auto') {
            // If theme is 'auto' or not explicitly set, re-evaluate based on time (which includes system check indirectly)
            setTheme('auto');
        }
    });

    // Toggle button click listener
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentSavedPreference = localStorage.getItem(themeKey);
            let newPreference;

            if (currentSavedPreference === 'dark') {
                newPreference = 'light';
            } else if (currentSavedPreference === 'light') {
                // If currently light (manual), switch to auto (which will apply dark if night)
                newPreference = 'auto';
            } else { // currentSavedPreference is 'auto' or null (not set)
                // If auto (or not set), switch to dark mode manually
                newPreference = 'dark';
            }
            setTheme(newPreference);
        });
    }

    // Optional: Periodically check time to update theme if it's 'auto'
    setInterval(() => {
        const currentSavedPreference = localStorage.getItem(themeKey);
        if (currentSavedPreference === 'auto') {
            applyTheme(getAutomaticTheme()); // Only apply, don't re-save 'auto'
        }
    }, 60000); // Check every minute (adjust as needed for precision vs performance)

});


// 🕒 Live time updater (keep as is)
const tday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const tmonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
    if (clockbox) { // Ensure clockbox exists before updating
        clockbox.innerHTML = `${tday[nday]}, ${tmonth[nmonth]} ${ndate}, ${nyear} ${nhour}:${nmin}:${nsec}${ap}`;
    }
}

// The window.onload will ensure GetClock is called once the page is fully loaded,
// and then set the interval for subsequent updates.
window.onload = function () {
    GetClock();
    setInterval(GetClock, 1000);
}
