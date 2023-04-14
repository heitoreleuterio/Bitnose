import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCountry, removeCountry } from "../redux/reducers/searchReducer";

export default function CountryContainer(props) {

    const searchInfo = useSelector(state => state);
    const dispatch = useDispatch();
    const lowercaseName = props.country.name.toLowerCase();

    function countrySelected() {
        if (!(props.selected ?? false))
            dispatch(addCountry(props.country.iso3));
        else
            dispatch(removeCountry(props.country.iso3));
    }

    return (
        <div className="country-checkbox-container" style={{ display: !props.display ? "none" : "block" }}>
            <input
                id={`checkbox-${lowercaseName}`}
                type="checkbox"
                name="countries"
                value={props.country.iso3}
                checked={props.selected ?? false}
                onChange={countrySelected} />
            <label htmlFor={`checkbox-${lowercaseName}`}>{`${props.country.emoji + " " + props.country.name}`}</label>
        </div>
    );
}