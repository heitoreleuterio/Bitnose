import Store from "../models/store.js"
import JSONfn from "json-fn"
import { SearchSession } from "../models/search-session.js";
import { SearchResult } from "../models/search-result.js";
import { StoreSessionState } from "../models/store-session-state.js";

const activeSearchs = [

];

export async function Search(req, res) {
    const sessions = await SearchSession.find();
    const deletePromises = [];
    for (let session of sessions) {
        if (Math.abs((new Date() - session.startDate)) > 420000)
            deletePromises.push(SearchSession.findByIdAndDelete(session._id));
    }
    await Promise.all(deletePromises);
    let { search_query: searchQuery, page } = req.query;
    let currentActiveSearch = activeSearchs.filter(activeSearch => activeSearch.search_query == searchQuery)[0];
    if (currentActiveSearch != null)
        await currentActiveSearch.promise;
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
    let searchSession = (await SearchSession.find({ search: searchQuery }))[0];
    let mainSearchPromise = new Promise(async (resolve, reject) => {
        if (searchSession != null) {
            let resultsPerPage = searchSession.resultsPerPage[page - 1];
            if (resultsPerPage != null) {
                resultsPerPage = resultsPerPage.map(doc => {
                    return { title: doc.title, price: doc.price, currency: doc.currency, imageSrc: doc.imageSrc, url: doc.url };
                });
                results = resultsPerPage;
            }
            else
                results = [];
            if (results.length < 20) {
                const notFinishedStores = searchSession.StoresSessionState.filter(storeSessionState => !storeSessionState.finished);

                if (notFinishedStores.length != 0) {
                    for (let storeSessionState of notFinishedStores) {
                        const store = await Store.findById(storeSessionState.storeIdentifier);
                        if (store == null)
                            continue;
                        createStorePromise(promises, res, store, searchSession.search, results, searchSession, storeSessionState._id, resultsLockPromise, storeSessionState.currentPage);
                    }
                }
                else
                    results = [results];
            }
            else {
                results = [results];
                res.json({ results });
                resolve();
                return;
            }
        }
        else {
            searchSession = new SearchSession({ search: searchQuery });
            for (let store of stores) {
                const storeSessionState = new StoreSessionState({ storeIdentifier: store._id });
                searchSession.StoresSessionState.push(storeSessionState);
                createStorePromise(promises, res, store, searchQuery, results, searchSession, storeSessionState._id, resultsLockPromise);
            }
        }
        await Promise.all(promises);
        if (!res.headersSent)
            res.json({ results });

        const resultsTotal = results.some(() => true) ? results.map(site => site.length).reduce((a1, a2) => a1 + a2) : 0;
        if (resultsTotal != 0 && searchSession.resultsPerPage.length < page)
            searchSession.resultsPerPage.push(transformIntoMongoDBResultsCollection(results));
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

function createStorePromise(promises, res, store, searchQuery, results, searchSession, storeSessionStateId, resultsLockPromise, page = 1) {
    promises.push(new Promise(async (resolve, reject) => {
        const storeSessionState =
            (await searchSession.StoresSessionState.filter(state => state._id.equals(storeSessionStateId)))[0];
        await awaitStorePageResult(res, store, searchQuery, results, searchSession, storeSessionState, resultsLockPromise, page);
        resolve();
    }));

}

async function awaitStorePageResult(res, store, searchQuery, results, searchSession, storeSessionState, resultsLockPromise, page) {
    return new Promise(async (resolve, reject) => {
        const parsedSearchFunction = JSONfn.parse(store.searchFunction);
        let alreadyHandledPromise = false;
        const timeoutId = setTimeout(async () => {
            alreadyHandledPromise = true;
            storeSessionState.finished = true;
            resolve();
        }, 10000);
        try {
            const storeResult = await parsedSearchFunction(searchQuery, page);
            if (!alreadyHandledPromise) {
                storeSessionState.currentPage++;
                clearTimeout(timeoutId);
                alreadyHandledPromise = true;
                if (resultsLockPromise.promise != null)
                    await resultsLockPromise.promise;
                const nextPagePromise = {
                    promise: null
                };
                resultsLockPromise.promise = addStoreResultToResultsAndVerifyClientResult(res, store, searchQuery, results, searchSession, storeSessionState, storeResult, resultsLockPromise, page, nextPagePromise);
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

function addStoreResultToResultsAndVerifyClientResult(res, store, searchQuery, results, searchSession, storeSessionState, storeResult, resultsLockPromise, page, nextPagePromise) {
    return new Promise(async (resolve, reject) => {
        results.push(storeResult);
        const resultsTotal = results.map(site => site.length).reduce((a1, a2) => a1 + a2);
        if (resultsTotal >= 20) {
            let leftoverItems = [...storeResult].filter((item, index) => index >= 20);
            let storeIndex = results.indexOf(storeResult);
            results[storeIndex] = [...storeResult].filter((item, index) => index < 20);
            if (!res.headersSent)
                res.json({ results });
            searchSession.resultsPerPage.push(transformIntoMongoDBResultsCollection(results));
            results.length = 0;
            results.push([...leftoverItems]);
            let resultTotalAtual = results.map(site => site.length).reduce((a1, a2) => a1 + a2);
            while (resultTotalAtual >= 20) {
                const originalLeftOverItems = [...leftoverItems];
                leftoverItems = [...leftoverItems].filter((item, index) => index >= 20);
                results[0] = [...originalLeftOverItems].filter((item, index) => index < 20);
                searchSession.resultsPerPage.push(transformIntoMongoDBResultsCollection(results));
                results.length = 0;
                results.push([...leftoverItems]);
                resultTotalAtual = results.map(site => site.length).reduce((a1, a2) => a1 + a2);
            }
            resolve();
        }
        else if (storeResult.length != 0) {
            resolve();
            nextPagePromise.promise = awaitStorePageResult(res, store, searchQuery, results, searchSession, storeSessionState, resultsLockPromise, page + 1);
        }
        else {
            storeSessionState.finished = true;
            resolve();
        }
    });
}

function transformIntoMongoDBResultsCollection(results) {
    let mongodbResults = [];
    for (let site of results) {
        for (let result of site) {
            mongodbResults.push(new SearchResult({
                imageSrc: result.imageSrc,
                url: result.url,
                price: result.price,
                title: result.title,
                currency: result.currency
            }));
        }
    }
    return mongodbResults;
}