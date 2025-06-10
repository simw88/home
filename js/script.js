document.addEventListener('DOMContentLoaded', () => {
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

    imgElement.addEventListener('click', () => {
        // Change to a new random image on click
        imgElement.src = getRandomImage();
    });

    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const baseUrl = searchForm.action;
        const paramName = searchInput.name;

        if (searchInput.value.trim() !== '') {
            const query = encodeURIComponent(searchInput.value.trim());
            let finalUrl = baseUrl;
            if (paramName && query) {
                finalUrl += (baseUrl.includes('?') ? '&' : '?') + `${paramName}=${query}`;
            } else if (query && baseUrl.includes('nyaa.si')) {
                finalUrl += `?${query}`;
            }
            // Open in the same tab (default browser behavior if target is not _blank)
            window.location.href = finalUrl;
        }
        searchInput.value = '';
        toggleClearButton(searchInput, searchClearButton);
    });

    const datetimeDisplay = document.getElementById('datetimeDisplay');
    const fourChanLabel = document.getElementById('fourChan');
    const fourChanWrapper = fourChanLabel ? fourChanLabel.closest('.label-wrapper') : null;

    let isFlowerModeActive = false;

    function getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    function updateDateTime() {
        const now = new Date();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const dayName = weekdays[now.getDay()];
        const dayNumber = now.getDate();
        const ordinalSuffix = getOrdinalSuffix(dayNumber);
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();

        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds} ${ampm}`;
        datetimeDisplay.textContent = `Today is ${dayName}, the ${dayNumber}${ordinalSuffix} of ${monthName}. It's ${formattedTime}`;
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    datetimeDisplay.addEventListener('click', () => {
        if (isFlowerModeActive) {
            imgElement.src = getRandomImage();
            imgElement.alt = "Dynamic Background Image";

            if (fourChanWrapper) {
                fourChanWrapper.style.display = '';
            }
            isFlowerModeActive = false;
        } else {
            imgElement.src = 'imgs/flower.png';
            imgElement.alt = "Flower Image";

            if (fourChanWrapper) {
                fourChanWrapper.style.display = 'none';
            }
            isFlowerModeActive = true;
        }
    });

    document.querySelectorAll('.label-wrapper').forEach(wrapper => {
        const label = wrapper.querySelector('.label');
        const dropdownContent = wrapper.querySelector('.dropdown-content');

        if (label && dropdownContent) {
            label.addEventListener('click', (event) => {
                event.stopPropagation();
                document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
                    if (openDropdown !== dropdownContent) {
                        openDropdown.classList.remove('show');
                    }
                });
                dropdownContent.classList.toggle('show');
            });
        }
    });

    document.addEventListener('click', (event) => {
        document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
            const isClickInsideDropdown = openDropdown.contains(event.target);
            const isClickInsideLabel = openDropdown.previousElementSibling && openDropdown.previousElementSibling.contains(event.target);

            if (!isClickInsideDropdown && !isClickInsideLabel) {
                openDropdown.classList.remove('show');
            }
        });
    });

    document.querySelectorAll('.search-engine-option').forEach(option => {
        option.addEventListener('click', function() {
            const baseUrl = this.dataset.value;
            const paramName = this.dataset.name;
            searchForm.action = baseUrl;
            searchInput.name = paramName;
            document.querySelector('.search-input-group .label').textContent = this.textContent;
            document.querySelector('.search-input-group .dropdown-content').classList.remove('show');
            searchInput.focus();
        });
    });

    const defaultSearchOption = document.querySelector('.search-engine-option[data-value="https://www.google.com/search"]');
    if (defaultSearchOption) {
        searchForm.action = defaultSearchOption.dataset.value;
        searchInput.name = defaultSearchOption.dataset.name;
        document.querySelector('.search-input-group .label').textContent = defaultSearchOption.textContent;
    }

    const searchClearButton = document.querySelector('.clear-button[data-target="searchInput"]');
    const todoInput = document.getElementById('todoInput');
    const todoClearButton = document.querySelector('.clear-button[data-target="todoInput"]');

    function toggleClearButton(inputElement, clearButtonElement) {
        if (inputElement.value.length > 0) {
            clearButtonElement.style.display = 'block';
        } else {
            clearButtonElement.style.display = 'none';
        }
    }

    function clearInput(inputElement, clearButton) {
        inputElement.value = '';
        toggleClearButton(inputElement, clearButton);
        inputElement.focus();
        if (inputElement === todoInput) {
            localStorage.removeItem('todoListContent');
        }
    }

    searchInput.addEventListener('input', () => {
        toggleClearButton(searchInput, searchClearButton);
    });
    searchClearButton.addEventListener('click', () => {
        clearInput(searchInput, searchClearButton);
    });

    todoInput.addEventListener('input', () => {
        toggleClearButton(todoInput, todoClearButton);
        localStorage.setItem('todoListContent', todoInput.value);
    });
    todoClearButton.addEventListener('click', () => {
        clearInput(todoInput, todoClearButton);
    });

    toggleClearButton(searchInput, searchClearButton);

    const savedTodoContent = localStorage.getItem('todoListContent');
    if (savedTodoContent) {
        todoInput.value = savedTodoContent;
    }
    toggleClearButton(todoInput, todoClearButton);

    const kaomojis = [
        "(✿◠ᴗ◠)", "( ˶ˆ꒳ˆ˵ )", "(〃´𓎟`〃)", "ଘ(੭˃ᴗ˂)੭", "(˶‾᷄ ⁻̫ ‾᷅˵)"
    ];
    const kaomojiDisplay = document.getElementById('kaomojiDisplay');

    function displayRandomKaomoji() {
        if (kaomojiDisplay) {
            const randomIndex = Math.floor(Math.random() * kaomojis.length);
            kaomojiDisplay.textContent = kaomojis[randomIndex];
        }
    }

    displayRandomKaomoji();

    if (kaomojiDisplay) {
        kaomojiDisplay.addEventListener('click', displayRandomKaomoji);
    }
});
