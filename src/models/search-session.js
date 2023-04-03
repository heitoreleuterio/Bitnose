import mongoose from "mongoose"
import { searchResultSchema } from "./search-result.js"
import { storeSessionStateSchema } from "./store-session-state.js"
import { getOnlyUniqueResults, transformResultsIntoMongoDBResultsCollection } from "../functions/search-session-functions.js"

export const searchSessionSchema = new mongoose.Schema({
    search: { type: String, required: true },
    resultsPerPage: { type: [[searchResultSchema]], default: new Array() },
    finished: { type: Boolean, default: false },
    startDate: { type: Date, default: new Date() },
    StoresSessionState: { type: [storeSessionStateSchema], default: new Array() },
    acceptedCountries: { type: [String], default: new Array() },
    acceptedCategories: { type: [String], default: new Array() }
});


searchSessionSchema.methods.getPageResults = function getPageResults(page) {
    let resultsPerPage = this.resultsPerPage[page - 1];
    if (resultsPerPage != null) {
        resultsPerPage = resultsPerPage.map(doc => {
            return {
                title: doc.title,
                price: doc.price,
                currency: doc.currency,
                imageSrc: doc.imageSrc,
                url: doc.url
            };
        });
        return resultsPerPage;
    }
    return [];
}

searchSessionSchema.methods.addResultsToNewPage = function (results) {
    const resultsToNewPage = getOnlyUniqueResults(
        this,
        putSurplusResultsOnIncompletePageAndReturnResultsToNextPage(this, results)
    );

    const resultsTotal = resultsToNewPage.map(site => site.length).reduce((a1, a2) => a1 + a2, 0);

    if (resultsTotal != 0)
        this.resultsPerPage.push(transformResultsIntoMongoDBResultsCollection(resultsToNewPage));
}

function putSurplusResultsOnIncompletePageAndReturnResultsToNextPage(searchSession, results) {
    if (searchSession.resultsPerPage.length != 0) {
        let lastPage = searchSession.resultsPerPage[searchSession.resultsPerPage.length - 1];
        if (lastPage.length < 20) {
            let numberOfMissingProducts = 20 - lastPage.length;
            let resultsToNewPage = getOnlyUniqueResults(searchSession, results);
            let resultsOneArray = [].concat.apply([], resultsToNewPage);
            let missingProducts = resultsOneArray.filter((item, index) => index < resultsOneArray.length && index >= (resultsOneArray.length - numberOfMissingProducts));

            for (let product of missingProducts) {
                let arrayWithProduct = resultsToNewPage.find(array => array.includes(product));
                if (arrayWithProduct != null) {
                    let indexOfProduct = arrayWithProduct.indexOf(product);
                    arrayWithProduct.splice(indexOfProduct, 1);
                }
                lastPage.push(product);
            }
            return resultsToNewPage;
        }
    }
    return [...results];
}

export const SearchSession = mongoose.model("SearchSession", searchSessionSchema);
