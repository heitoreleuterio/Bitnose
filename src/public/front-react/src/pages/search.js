import React, { useEffect, useState } from "react";
import "../styles/search.css";
import BitnoseHeaderTitle from "../components/BitnoseHeaderTitle";
import LoadingSnake from "../components/LoadingSnake";
import ResultsContainer from "../components/ResultsContainer";
import { useLocation, useNavigate } from "react-router-dom";

export default function Search() {

    const [results, setResults] = useState([]);
    const [alreadyFetch, setAlreadyFetch] = useState(false);
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const navigate = useNavigate();

    useEffect(() => {
        setResults([]);
        setAlreadyFetch(false);
        fetchItemsFromServer();
    }, [location]);

    function fetchItemsFromServer() {
        let searchQuery = query.get("search_query");
        let page = query.get("page");
        let countries = query.getAll("countries");

        fetch("/search/content?" + new URLSearchParams({
            search_query: searchQuery,
            page,
            countries
        }))
            .then(async res => {
                setAlreadyFetch(true);
                if (res.status == 200) {
                    if (res.redirected) {
                        const newParams = new URLSearchParams(res.url.substring(res.url.indexOf("?")));

                        let newSearchQuery = newParams.get("search_query");
                        let newPage = newParams.get("page");
                        let newCountries = newParams.getAll("countries");
                        let newURL = `/search?` + new URLSearchParams({
                            search_query: newSearchQuery,
                            countries: newCountries,
                            page: newPage
                        });
                        console.log(res.url);
                        navigate(newURL, { replace: true })
                    }
                    return res.json();
                }
                throw await res.text();
            }).catch(error => {
                console.log(error);
            })
            .then(data => {
                setResults(data.results);
            })
            .catch(error => {
                console.log(error);
            });

    }

    function goToNextPage() {
        var searchParams = new URLSearchParams(window.location.search);
        let currentPage = Number(searchParams.get("page"));
        currentPage = currentPage == 0 ? 1 : currentPage;
        searchParams.set("page", currentPage + 1);
        navigate("/search?" + searchParams.toString());
    }

    function goToPrevPage() {
        var searchParams = new URLSearchParams(window.location.search);
        let currentPage = Number(searchParams.get("page"));
        currentPage = currentPage == 0 ? 1 : currentPage;
        searchParams.set("page", currentPage == 1 ? 1 : currentPage - 1);
        navigate("/search?" + searchParams.toString());
    }

    useEffect(() => {
        document.title = "Bitnose Results";
    }, []);

    return (
        <div className="search-main-container">
            {alreadyFetch
                ? <BitnoseHeaderTitle />
                : null}
            {results.length > 0
                ? <div id="current-page-info-container">
                    <h4 id="current-page-title">Page: <b>{query.get("page") ?? "1"}</b></h4>
                    <h4 id="current-search-title">Search: <b>{query.get("search_query") ?? ""}</b></h4>
                </div>
                : <LoadingSnake />}

            {results.length <= 0 && alreadyFetch
                ? <h1 id="not-find-message">BITNOSE WAS NOT ABLE TO FIND ANY RESULT FOR YOUR SEARCH</h1>
                : null}
            <ResultsContainer results={results} />
            {results.length > 0
                ? <div id="page-control-container">
                    <img src="/svg/back-arrow.svg" className="page-control-button" onClick={goToPrevPage} />
                    <img src="/svg/forward-arrow.svg" className="page-control-button" onClick={goToNextPage} />
                </div>
                : null}

        </div>
    );
}