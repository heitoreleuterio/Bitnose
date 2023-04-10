const gadsdenSnake = document.querySelector("#gadsden-snake");

function gadsdenScaling() {
    let scaleY = innerHeight * 1 / 1011;
    gadsdenSnake.style.transform = `scale(${scaleY},${scaleY})`;
}

window.addEventListener("resize", () => {
    gadsdenScaling();
});

gadsdenScaling();

const itensContainer = document.querySelector(".itens-container");
const notFindMessage = document.querySelector("#not-find-message");
const bitnoseTitle = document.querySelector(".bitnose-title");
const pageTitle = document.querySelector("#current-page-title");
const currentSearchTitle = document.querySelector("#current-search-title");
const pageControlContainer = document.querySelector("#page-control-container");

function LoadItens(data) {
    itensContainer.innerHTML = "";
    notFindMessage.style.display = "none";
    bitnoseTitle.style.display = "none";
    pageTitle.style.display = "none";
    currentSearchTitle.style.display = "none";
    const results = data.results.filter(site => site instanceof Array);
    const resultsTotal = results.some(() => true) ? results.map(site => site.length).reduce((a1, a2) => a1 + a2) : 0;
    if (resultsTotal == 0) {
        notFindMessage.style.display = "block";
        return;
    }
    for (let site of results) {
        for (let item of site) {
            const itemContainer = document.createElement("div");
            itemContainer.className = "item-container";
            const itemImage = document.createElement("img");
            itemImage.className = "item-image";
            itemImage.src = item.imageSrc;
            itemImage.setAttribute("referrerpolicy", "no-referrer");
            itemContainer.appendChild(itemImage);
            const itemTitle = document.createElement("h3");
            itemTitle.className = "item-title";
            let titleText =
                [...item.title]
                    .filter((char, index) => index <= 175)
                    .reduce((str1, str2) => str1 + str2)
                + (item.title.length > 175 ? "..." : "");
            itemTitle.innerHTML = titleText;
            itemContainer.appendChild(itemTitle);
            const buyContainer = document.createElement("div");
            buyContainer.className = "buy-container";
            itemContainer.appendChild(buyContainer);
            const itemPrice = document.createElement("h4");
            itemPrice.className = "item-price";
            itemPrice.innerHTML = item.price != null
                ? item.currency + item.price.toLocaleString("pt-BR")
                : "See Website for Price";
            buyContainer.appendChild(itemPrice);
            const itemButton = document.createElement("a");
            itemButton.className = "item-button";
            itemButton.innerHTML = "Ir à loja";
            itemButton.href = item.url;
            itemButton.target = "_blank";
            buyContainer.appendChild(itemButton);
            itensContainer.appendChild(itemContainer);
        }
    }

    let params = new URLSearchParams(window.location.search);

    let currentPage = params.get("page") ?? '1';

    pageTitle.querySelector("b").innerHTML = currentPage;
    currentSearchTitle.querySelector("b").innerHTML = params.get("search_query");

    pageControlContainer.style.display = "block";
    bitnoseTitle.style.display = "block";
    pageTitle.style.display = "block";
    currentSearchTitle.style.display = "block";

}

function GetItensFromServer() {
    pageControlContainer.style.display = "none";
    document.querySelector("html").className = "loading";
    const params = new URLSearchParams(window.location.search);

    let searchQuery = params.get("search_query");
    let page = params.get("page");
    let countries = params.getAll("countries");

    let baseURL = `${window.location.protocol}//${window.location.host}/search`;

    fetch(`${baseURL}/content?` + new URLSearchParams({
        search_query: searchQuery,
        page,
        countries
    }))
        .then(async res => {
            if (res.status == 200) {
                if (res.redirected) {
                    console.log(res.url.substring(res.url.indexOf("?")))
                    const newParams = new URLSearchParams(res.url.substring(res.url.indexOf("?")));

                    let newSearchQuery = newParams.get("search_query");
                    let newPage = newParams.get("page");
                    let newCountries = newParams.getAll("countries");
                    let newURL = `${baseURL}?` + new URLSearchParams({
                        search_query: newSearchQuery,
                        page: newPage,
                        countries: newCountries
                    });
                    window.history.pushState({ path: newURL }, '', newURL);
                }
                return res.json();
            }
            throw await res.text();
        })
        .catch(error => {
            alert(error);
        })
        .then(data => {
            LoadItens(data);
            gadsdenSnake.setAttribute("class", "low-opacity");
            document.querySelector("html").className = "";
        })
        .catch(error => {
            console.log(error);
        });
}

function GoToNextPage() {
    var searchParams = new URLSearchParams(window.location.search);
    let currentPage = Number(searchParams.get("page"));
    currentPage = currentPage == 0 ? 1 : currentPage;
    searchParams.set("page", currentPage + 1);
    console.log(searchParams.toString());
    window.location.search = searchParams.toString();
}

function GoToPrevPage() {
    var searchParams = new URLSearchParams(window.location.search);
    let currentPage = Number(searchParams.get("page"));
    currentPage = currentPage == 0 ? 1 : currentPage;
    searchParams.set("page", currentPage == 1 ? 1 : currentPage - 1);
    window.location.search = searchParams.toString();
}

GetItensFromServer();