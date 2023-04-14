import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CountryContainer from "./CountryContainer";
import { addCountry } from "../redux/reducers/searchReducer";

export default function CountriesFilterContainer() {

    const searchInfo = useSelector(state => state);
    const dispatch = useDispatch();

    const [countries, setCountries] = useState([]);
    const [countryFilter, setCountryFilter] = useState("");

    useEffect(() => {
        fetch("/countries.json")
            .then(res => res.json())
            .then(json => {
                setCountries(json);

                let randomValues = window.crypto.getRandomValues(new Uint8Array(32));

                let randomValuesString = randomValues
                    .reduce((a1, a2) => a1.toString(32) + a2.toString(32))
                    .toString()
                    .substring(0, 32);

                fetch(`https://${randomValuesString}.edns.ip-api.com/json`)
                    .then(res => res.json())
                    .then(res => {
                        const userCountry = res.dns.geo.split("-")[0].trim().toLowerCase();
                        const userCountryIso = json.find(country => country.name.toLowerCase() == userCountry).iso3;
                        dispatch(addCountry(userCountryIso));

                    });
            });
    }, []);

    let filteredCountries;

    if (countryFilter.trim() != "")
        filteredCountries = countries
            .filter(
                country =>
                    country.name.toLowerCase().includes(countryFilter) ||
                    country.iso3.toLowerCase().includes(countryFilter)
            );
    else
        filteredCountries = countries;

    const nonSelectedCountries = countries.filter(country => !searchInfo.acceptedCountries.includes(country.iso3));
    const selectedCountries = countries.filter(country => searchInfo.acceptedCountries.includes(country.iso3));

    return (
        <div className="filtering-container general-countries-container" >
            <input
                onInput={(e) => { setCountryFilter(e.target.value.toLowerCase()) }}
                value={countryFilter}
                type="text"
                className="country-filter-input"
                placeholder="country" />
            <br />
            <div className="countries-container ">
                {nonSelectedCountries.map(country =>
                    <CountryContainer key={country.iso3} country={country} display={filteredCountries.includes(country)} />
                )}
            </div>
            <div className="selected-countries-container" >
                {selectedCountries.map(country =>
                    <CountryContainer key={country.iso3} country={country} selected={true} display={filteredCountries.includes(country)} />
                )}
            </div>
        </div>
    );
}