document.addEventListener("DOMContentLoaded", () => {
    // 🖼️ Random .png image picker
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

    // --- Remembering Textbox Logic ---
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
                searchBox.focus(); // Added this line to focus the search box
            });
        });
    }

    // ⭐ Dark Mode Logic (Automatic Time-Based ONLY - NO USER INTERVENTION) ⭐
    // Define sunset and sunrise hours in 24-hour format
    const SUNSET_HOUR = 19; // Dark mode starts at 7:00 PM (19:00)
    const SUNRISE_HOUR = 4;  // Dark mode ends at 4:30 AM (04:30)

    // Function to get the current desired theme based on the hour and minute
    function getCurrentTimeBasedTheme() {
        const currentHour = new Date().getHours(); // Gets the hour in 0-23 format
        const currentMinutes = new Date().getMinutes(); // Gets the minutes in 0-59 format

        // Dark mode condition:
        // Either it's after the sunset hour (e.g., 20:00, 21:00, etc.)
        // OR it's the sunset hour (19:00) or later
        // OR it's before the sunrise hour (e.g., 00:00, 01:00, 02:00, 03:00)
        // OR it's the sunrise hour (04:00) but before 04:30
        if (currentHour > SUNSET_HOUR || // After 7 PM
            (currentHour === SUNSET_HOUR && currentMinutes >= 0) || // Exactly 7 PM or later minutes in 7 PM hour
            currentHour < SUNRISE_HOUR || // Before 4 AM
            (currentHour === SUNRISE_HOUR && currentMinutes < 30)) { // Exactly 4 AM but before 4:30 AM
            return 'dark'; // It's "night time" for your desired dark mode period
        } else {
            return 'light'; // It's "day time"
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

    // Immediately apply the correct theme on page load
    applyThemeToBody(getCurrentTimeBasedTheme());

    // Set an interval to periodically check and update the theme
    setInterval(() => {
        applyThemeToBody(getCurrentTimeBasedTheme());
    }, 60000); // Check every minute (60000 milliseconds)

});


// 🕒 Live time updater
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
