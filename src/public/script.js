const scrollAlertArrow = document.querySelector("#scroll-alert-arrow");
const countriesContainer = document.querySelector(".countries-container");
const selectedCountriesContainer = document.querySelector(".selected-countries-container");
const countryFilterInput = document.querySelector(".country-filter-input");

function searchChanged(input) {
    if (input.value.trim() != '') {
        scrollAlertArrow.setAttribute("alert", "");
        document.body.setAttribute("scrollable", "");
    }
}


async function loadCountries() {
    const countries = await fetch("/countries.json").then(res => res.json());


    let selectedContainers = [];
    let selectedCountries = [];

    let randomValues = window.crypto.getRandomValues(new Uint8Array(32));

    let randomValuesString = randomValues
        .reduce((a1, a2) => a1.toString(32) + a2.toString(32))
        .toString()
        .substring(0, 32);

    fetch(`https://${randomValuesString}.edns.ip-api.com/json`)
        .then(res => res.json())
        .then(res => {
            const userCountry = res.dns.geo.split("-")[0].trim().toLowerCase();
            selectedCountries.push(countries.find(country => country.name.toLowerCase() == userCountry));
            updatedCountriesFunction(countries, countries);
        });

    const updatedCountriesFunction = (filteredCountries, totalCountries) => {
        countriesContainer.innerHTML = "";
        selectedCountriesContainer.innerHTML = "";
        for (let country of totalCountries) {
            if (!selectedCountries.some(actualCountry => actualCountry.id == country.id)) {
                if (filteredCountries.includes(country)) {
                    const container = loadCountry(country, filteredCountries, totalCountries, selectedCountries, updatedCountriesFunction);
                    countriesContainer.appendChild(container);
                }
            }
            else {
                const container = loadCountry(country, filteredCountries, totalCountries, selectedCountries, updatedCountriesFunction, true);
                selectedCountriesContainer.appendChild(container);
            }
        }
    };

    updatedCountriesFunction(countries, countries);



    countryFilterInput.oninput = () => {
        let filteredCountries;
        let input = countryFilterInput.value.toLowerCase();
        if (input.trim() != "")
            filteredCountries = countries
                .filter(
                    country =>
                        country.name.toLowerCase().includes(input) ||
                        country.iso3.toLowerCase().includes(input)
                );
        else
            filteredCountries = countries;


        updatedCountriesFunction(filteredCountries, countries);
    };
}

function loadCountry(country, filteredCountries, totalCountries, selectedCountries, updateCountriesFunction, checked = false) {
    const lowerCase = country.name.toLowerCase();
    const container = document.createElement("div");
    container.classList.add("country-checkbox-container");

    const input = document.createElement("input");
    input.id = `checkbox-${lowerCase}`;
    input.type = "checkbox";
    input.name = "countries";
    input.value = country.iso3;
    input.checked = checked;
    container.appendChild(input);

    const label = document.createElement("label");
    label.setAttribute("for", `checkbox-${lowerCase}`);
    label.innerHTML = `${country.emoji + " " + country.name}`;
    container.appendChild(label);

    input.addEventListener("change", () => {
        if (input.checked)
            selectedCountries.push(country);
        else {
            const index = selectedCountries.indexOf(country);
            selectedCountries.splice(index, 1);
        }
        updateCountriesFunction(filteredCountries, totalCountries);
    });

    return container;
}

loadCountries();

