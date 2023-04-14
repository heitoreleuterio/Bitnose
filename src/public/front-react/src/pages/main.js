import React, { useEffect } from "react";
import "../styles/main.css";
import { Link, useNavigate } from "react-router-dom";
import FormsFiltering from "../components/FormsFiltering";
import CountriesFilterContainer from "../components/CountriesFilterContainer";
import SearchBar from "../components/SearchBar";

export default function Main(props) {

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Bitnose - Search for stores that accept bitcoin";
    }, []);

    function formSubmitted(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = new URLSearchParams(formData).toString();
        navigate("/search?" + query);
    }

    return (
        <div id="main-container">
            <form id="form-container" autoComplete="off" onSubmit={formSubmitted}>
                <Link>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960" id="user-symbol">
                        <path d="M480 616q-66 0-113-47t-47-113V316q0-25 17.5-42.5T380 256q15 0 28.5 7t21.5 20q8-13 21.5-20t28.5-7q15 0 28.5 7t21.5 20q8-13 21.5-20t28.5-7q25 0 42.5 17.5T640 316v140q0 66-47 113t-113 47Zm0-60q42 0 71-29t29-71V336H380v120q0 42 29 71t71 29ZM160 936v-94q0-38 19-65t49-41q67-30 128.5-45T480 676q62 0 123 15.5t127.921 44.694q31.301 14.126 50.19 40.966Q800 804 800 842v94H160Zm60-60h520v-34q0-16-9.5-30.5T707 790q-64-31-117-42.5T480 736q-57 0-111 11.5T252 790q-14 7-23 21.5t-9 30.5v34Zm260 0Zm0-540Z" />
                    </svg>
                </Link>
                <img src="/svg/gadsden_snake_main.svg" id="gadsden-snake" />
                <SearchBar />
                <FormsFiltering>
                    <CountriesFilterContainer />
                </FormsFiltering>
            </form>
            <img src="/svg/drop-down-arrow.svg" id="scroll-alert-arrow" />
        </div>
    );
};