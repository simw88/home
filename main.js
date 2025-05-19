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
    const searchEngineDropdown = document.getElementById("searchEngineDropdown"); // This now refers to the custom div
    const selectedEngineDisplay = document.getElementById("selectedEngine");     // This now refers to the div displaying selected engine
    const searchBox = document.getElementById("searchbox");
    const dropdownOptionsList = searchEngineDropdown ? searchEngineDropdown.querySelector(".dropdown-options") : null;

    // Function to update the form's action and input's name
    function updateSearchFormAction(url, name) {
        if (searchForm && searchBox) {
            searchForm.action = url;
            searchBox.name = name;
        }
    }

    if (searchEngineDropdown && selectedEngineDisplay && dropdownOptionsList && searchBox) {
        // Set initial state based on the first option in the dropdown list
        // Assuming the first <li> is the default (e.g., Google)
        const initialOption = dropdownOptionsList.querySelector("li:first-child");
        if (initialOption) {
            selectedEngineDisplay.textContent = initialOption.textContent;
            updateSearchFormAction(initialOption.dataset.value, initialOption.dataset.name);
        }

        // Add click listener to each option in the custom dropdown
        dropdownOptionsList.querySelectorAll("li").forEach(option => {
            option.addEventListener("click", () => {
                const newValue = option.dataset.value;
                const newName = option.dataset.name; // Get data-name from li element
                const newText = option.textContent;

                selectedEngineDisplay.textContent = newText; // Update displayed text
                updateSearchFormAction(newValue, newName); // Update form action and input name
            });
        });
    }
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