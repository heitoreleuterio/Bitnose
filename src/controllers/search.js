import Store from "../models/store.js"
import { SearchSession } from "../models/search-session.js";
import { SearchResult } from "../models/search-result.js";
import { StoreSessionState } from "../models/store-session-state.js";
import JSONfn from "json-fn"
import { getOnlyUniqueResults } from "../functions/search-session-functions.js"

import puppeteer from "puppeteer";

const activeSearchs = [

];

export async function Search(req, res, next) {
    let { search_query: searchQuery, page } = req.query;

    await deleteTimeoutSessions();
    await waitForActiveSearchEnd(searchQuery);

    if (page != 'null' && page != null)
        page = Number(page);
    else
        page = 1;

    const stores = await Store.find();
    let resultsLockPromise = {
        promise: null
    };
    let results = [];
    let promises = [];
    let searchSession = await getSearchSessionByItsQuery(searchQuery);
    let mainSearchPromise = new Promise(async (resolve, reject) => {
        if (searchSession != null) {
            if (page > searchSession.resultsPerPage.length + 1) {
                res.redirect(`./content?search_query=${searchQuery}&page=${searchSession.resultsPerPage.length}`);
                next();
                resolve();
                return;
            }
            results.push(searchSession.getPageResults(page));

            const resultsTotal = results
                .map(site => site.length)
                .reduce((a1, a2) => a1 + a2, 0);
            if (resultsTotal < 20) {
                const notFinishedStores = searchSession.StoresSessionState
                    .filter(storeSessionState => !storeSessionState.finished);

                if (notFinishedStores.length != 0) {
                    for (let storeSessionState of notFinishedStores) {
                        const store = await Store.findById(storeSessionState.storeIdentifier);
                        if (store == null)
                            continue;
                        createStorePromise(promises, res, store, results, searchSession, storeSessionState._id, resultsLockPromise, storeSessionState.currentPage);
                    }
                }
            }
            else {
                res.json({ results });
                resolve();
                return;
            }
        }
        else {
            if (page != 1) {
                res.redirect(`./content?search_query=${searchQuery}&page=1`);
                next();
                resolve();
                return;
            }
            searchSession = new SearchSession({ search: searchQuery });
            searchSession.acceptedCountries.push("United States of America");
            for (let store of stores) {
                const storeSessionState = new StoreSessionState({ storeIdentifier: store._id });
                searchSession.StoresSessionState.push(storeSessionState);
                createStorePromise(promises, res, store, results, searchSession, storeSessionState._id, resultsLockPromise);
            }
        }
        await Promise.all(promises);
        if (!res.headersSent)
            res.json({ results });

        const resultsTotal = results.some(() => true) ? results.map(site => site.length).reduce((a1, a2) => a1 + a2, 0) : 0;
        if (resultsTotal != 0 && searchSession.resultsPerPage.length < page)
            searchSession.addResultsToNewPage(results);
        await searchSession.save();

        console.log("Busca finalizada");
        resolve();
    });
    let activeSearchIndex = activeSearchs.length;
    activeSearchs.push({
        search_query: searchQuery,
        promise: mainSearchPromise
    });
    await mainSearchPromise;
    activeSearchs.splice(activeSearchIndex, 1);
}

function deleteTimeoutSessions() {
    return new Promise(async (resolve, reject) => {
        try {
            const sessions = await SearchSession.find();
            const deletePromises = [];
            for (let session of sessions) {
                if (Math.abs((new Date() - session.startDate)) > process.env.SESSION_TIMEOUT_MILLISECONDS)
                    deletePromises.push(SearchSession.findByIdAndDelete(session._id));
            }
            await Promise.all(deletePromises);
            resolve();
        }
        catch (error) {
            reject(error);
        }
    });
}

function waitForActiveSearchEnd(searchQuery) {
    return new Promise(async (resolve, reject) => {
        let currentActiveSearch = activeSearchs.filter(activeSearch => activeSearch.search_query == searchQuery)[0];
        if (currentActiveSearch != null)
            await currentActiveSearch.promise;
        resolve();
    });
}

async function getSearchSessionByItsQuery(searchQuery) {
    const sessions = await SearchSession.find({ search: searchQuery });
    return sessions[0];
}

function createStorePromise(promises, res, store, results, searchSession, storeSessionStateId, resultsLockPromise, page = 1) {
    promises.push(new Promise(async (resolve, reject) => {
        const storeSessionState =
            (await searchSession.StoresSessionState.filter(state => state._id.equals(storeSessionStateId)))[0];
        await awaitStorePageResult(res, store, results, searchSession, storeSessionState, resultsLockPromise, page);
        resolve();
    }));
}

async function awaitStorePageResult(res, store, results, searchSession, storeSessionState, resultsLockPromise, page) {
    let timeoutId;
    let alreadyHandledPromise = false;
    return new Promise(async (resolve, reject) => {
        const parsedSearchFunction = JSONfn.parse(store.searchFunction);
        timeoutId = setTimeout(() => {
            alreadyHandledPromise = true;
            storeSessionState.finished = true;
            resolve();
        }, process.env.SITE_TIMEOUT_MILLISECONDS);
        try {
            const storeResult = await parsedSearchFunction(searchSession.search, page, puppeteer, SearchResult, searchSession.acceptedCountries);
            if (!alreadyHandledPromise) {
                storeSessionState.currentPage++;
                clearTimeout(timeoutId);
                alreadyHandledPromise = true;
                if (resultsLockPromise.promise != null)
                    await resultsLockPromise.promise;
                const nextPagePromise = {
                    promise: null
                };
                resultsLockPromise.promise = addStoreResultToResultsAndVerifyClientResult(res, store, results, searchSession, storeSessionState, storeResult, resultsLockPromise, page, nextPagePromise);
                await resultsLockPromise.promise;
                resultsLockPromise.promise = null;
                if (nextPagePromise.promise != null)
                    await nextPagePromise.promise;

                resolve();
            }
        }
        catch (error) {
            clearTimeout(timeoutId);
            alreadyHandledPromise = true;
            storeSessionState.finished = true;
            resolve();
        }
    });

}

function addStoreResultToResultsAndVerifyClientResult(res, store, results, searchSession, storeSessionState, storeResult, resultsLockPromise, page, nextPagePromise) {
    return new Promise(async (resolve, reject) => {
        storeResult = getOnlyUniqueResults(searchSession, [storeResult])[0];
        results.push(storeResult);
        let resultsOneArray = [].concat.apply([], results);
        if (resultsOneArray.length >= 20) {
            let leftoverItems = [...storeResult].filter(item => resultsOneArray.indexOf(item) >= 20);
            let storeIndex = results.indexOf(storeResult);
            results[storeIndex] = [...storeResult].filter(item => resultsOneArray.indexOf(item) < 20);
            if (!res.headersSent)
                res.json({ results });

            searchSession.addResultsToNewPage(results);
            results.length = 0;
            results.push([...leftoverItems]);
            let resultTotalAtual = results.map(site => site.length).reduce((a1, a2) => a1 + a2, 0);
            while (resultTotalAtual >= 20) {
                const originalLeftOverItems = [...leftoverItems];
                leftoverItems = [...leftoverItems].filter((item, index) => index >= 20);
                results[0] = [...originalLeftOverItems].filter((item, index) => index < 20);
                searchSession.addResultsToNewPage(results);
                results.length = 0;
                results.push([...leftoverItems]);
                resultTotalAtual = results.map(site => site.length).reduce((a1, a2) => a1 + a2, 0);
            }
            if (resultTotalAtual != 0) {
                searchSession.addResultsToNewPage(results);
                results.length = 0;
            }
            resolve();
        }
        else if (storeResult.length != 0) {
            if (!res.headersSent)
                nextPagePromise.promise = awaitStorePageResult(res, store, results, searchSession, storeSessionState, resultsLockPromise, page + 1);
            else
                searchSession.addResultsToNewPage(results);
            resolve();
        }
        else {
            storeSessionState.finished = true;
            resolve();
        }
    });
}
