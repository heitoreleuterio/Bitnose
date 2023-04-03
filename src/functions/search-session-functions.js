import { SearchResult } from "../models/search-result.js";

export function getOnlyUniqueResults(searchSession, results) {
    let resultsNotAddedInPages = results
        .map(actualResults => actualResults
            .filter(result => !searchSession.resultsPerPage
                .some(actualPage => actualPage
                    .some(perPageResult => perPageResult.url == result.url))));
    let newResults = [];
    for (let actualResults of resultsNotAddedInPages) {
        for (let result of actualResults) {
            if (!newResults.some(newResult => newResult.url == result.url))
                newResults.push(result);
        }
    }
    return [newResults];
}

export function transformResultsIntoMongoDBResultsCollection(results) {
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