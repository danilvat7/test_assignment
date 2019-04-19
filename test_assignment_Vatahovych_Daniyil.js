const styleCss = `
    .panel_section--secondary {
        position: relative;
    }

    .previous-journeys {
        top: 25%;
        left: 103%;
        position: absolute;
        z-index: 1;
        background: rgba(255, 50, 104, .9);
        border-radius: .5rem;
        width: 360px;
    }

    .journeys-holder {
        position: relative;
        padding: 1rem;
    }

    .journeys-holder .close-btn {
        position: absolute;
        top: 5px;
        right: 15px;
        color: #fff;
        cursor: pointer;
    }

    .previous-journeys p {
        color: #fff;
    }

    .visible {
        visibility: visible;
        opacity: 1;
        transition: opacity .5s linear;
    }

    .hidden {
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s .5s, opacity .5s linear;
    }

    .previous-journeys ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .previous-journeys ul li {
        margin-bottom: .5em !important;
        color: #fff;
        font-size: .75rem;
        font-size: .75rem;
    }

    .previous-journeys ul li:hover {
        cursor: pointer;
        opacity: .9;
    }
`;

// Storage Controller
const StorageCtrl = (function () {
    return {
        storeJourney(journey) {
            let journeys;
            // Check if any journeys in ls
            if (localStorage.getItem('journeys') === null) {
                journeys = [];
                journeys.push(journey);
                localStorage.setItem('journeys', JSON.stringify(journeys));
            } else {
                // Get what is already in ls
                journeys = JSON.parse(localStorage.getItem('journeys'));

                // Sort Journeys by Date
                journeys.sort((a, b) => (a.date < b.date ? 1 : -1));

                if (journeys.length >= 3) {
                    journeys = journeys.splice(0, 2);
                }
                journeys.push(journey);

                localStorage.setItem('journeys', JSON.stringify(journeys));
            }
        },
        getJourneysFromStorage() {
            let journeys;

            // Check if journeys list is empty
            if (localStorage.getItem('journeys') === null) {
                journeys = [];
            } else {
                journeys = JSON.parse(localStorage.getItem('journeys'));
                // Sort Journeys by Date
                journeys.sort((a, b) => (a.date < b.date ? 1 : -1));
            }
            return journeys;
        }
    };
})();

// Search Form Controller
const SearchFormCtrl = (function () {
    // UI selectors
    const formSelectors = {
        form: '#desktop',
        departureStation: '#routeSelection_DepartureStation-input',
        arrivalStation: '#routeSelection_ArrivalStation-input'
    };

    return {
        getSelectors() {
            return formSelectors;
        },
        fillForm(journeyData) {
            // Set value for form fields
            document.querySelector(formSelectors.departureStation).value =
                journeyData.departureStation;
            document.querySelector(formSelectors.arrivalStation).value =
                journeyData.arrivalStation;
        },
        getFormData() {
            // Return data from form
            return {
                departureStation: document.querySelector(formSelectors.departureStation)
                    .value,
                arrivalStation: document.querySelector(formSelectors.arrivalStation)
                    .value,
                date: new Date().getTime()
            };
        }
    };
})();

// Searches UI Controller
const SearchesUICtrl = (function () {
    // Container for populate journeys
    const parentContainer = document.querySelectorAll(
        '#desktop section .panel_section '
    )[1];

    // UI selectors
    const searchesUISelectors = {
        container: '.previous-journeys',
        closeBtn: '.journeys-holder .close-btn',
        jorneysList: '.jorneys-list'
    };
    return {
        getSelectors() {
            return searchesUISelectors;
        },
        populateJourneysList(journeys, urlArr) {
            // Render journeys list
            let html = '';
            journeys.forEach(journey => {
                html += `
                    <li class="icon-animation-right journey-item" id="${
                      journey.date
                    }">
                    <span class="icon-font icon-next"></span>
                      ${journey.departureStation} -  ${journey.arrivalStation}
                    </li>
                `;
            });
            // Create container for journeys list
            const container = document.createElement('div');
            container.className = 'previous-journeys hidden';
            container.innerHTML = `
                <div class="journeys-holder">
                    <div class="close-btn">x</div>
                    <p>${!!~urlArr.indexOf('nl-NL') ? 'Uw recente zoekopdrachten' :'Your recent searches:'}</p>  
                    <ul class="jorneys-list">
                        ${html}
                    </ul>;
                </div>
            `;

            // Append journeys to parent
            parentContainer.appendChild(container);
        },
        // Init additional styles 
        initStyle() {
            const style = document.createElement('style');
            style.appendChild(document.createTextNode(styleCss));
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    };
})();

const App = (function (StorageCtrl, SearchFormCtrl) {
    // Window url
    const urlArr = window.location.pathname.split('/');
    // Get form ui selectors
    const formSelectors = SearchFormCtrl.getSelectors();
    // Get searches block ui selectors
    const searchesSelectors = SearchesUICtrl.getSelectors();
    // Get journeys from ls
    const journeys = StorageCtrl.getJourneysFromStorage();

    // Check all app requirements
    const checkRequirements = () => {
        switch (true) {
            // Check language
            case !~urlArr.indexOf('en-NL') && !~urlArr.indexOf('nl-NL'):
                console.log('Please use the site version en-nl or nl-nl!');
                return;

                // Check if home page
            case !~urlArr.indexOf('home'):
                console.log('Please use Home page!');
                return;

                // Check min screen size
            case window.innerWidth < 768:
                console.log('Please use a screen width of more than 768px!');
                return;
        }
        return true;
    };

    // Load listeners
    const loadEventListeners = () => {
        // Listener for form submit
        document
            .querySelector(formSelectors.form)
            .addEventListener('submit', formSubmit);

        // Listener for select journey  
        document
            .querySelector(searchesSelectors.jorneysList)
            .addEventListener('click', fillForm);

        // Listener for cloce list btn
        document
            .querySelector(searchesSelectors.closeBtn)
            .addEventListener('click', hideJourneysElement);
    };

    // Form submit handler
    const formSubmit = () => {
        StorageCtrl.storeJourney(SearchFormCtrl.getFormData());
    };


    // Click close handler
    const hideJourneysElement = () => {
        const container = document.querySelector(searchesSelectors.container);
        if (container.classList.contains('visible')) {
            container.classList.remove('visible');
            container.classList.add('hidden');
        }
    };

    // Select journey handler
    const fillForm = e => {
        const journey = journeys.find(value => value.date == e.target.id)
        SearchFormCtrl.fillForm(journey);
    };


    // Show journeys
    const showJourneysElement = () => {
        const container = document.querySelector(searchesSelectors.container);
        if (container.classList.contains('hidden')) {
            container.classList.remove('hidden');
            container.classList.add('visible');
        }
    };

    return {
        // Init App
        init() {
            if (!checkRequirements()) {
                return;
            }
            SearchesUICtrl.initStyle();

            if (journeys && journeys.length) {
                SearchesUICtrl.populateJourneysList(journeys, urlArr);
                showJourneysElement();

            } else {
                SearchesUICtrl.populateJourneysList([], urlArr);
            }

            loadEventListeners();
        }
    };
})(StorageCtrl, SearchFormCtrl);

App.init();