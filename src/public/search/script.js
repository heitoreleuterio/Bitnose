const itensContainer = document.querySelector(".itens-container");
const gadsdenSnake = document.querySelector("#gadsden-snake");
const notFindMessage = document.querySelector("#not-find-message");
const pageControlContainer = document.querySelector("#page-control-container");

function LoadItens(data) {
    itensContainer.innerHTML = "";
    notFindMessage.style.display = "none";
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
            itemContainer.appendChild(itemImage);
            const itemTitle = document.createElement("h3");
            itemTitle.className = "item-title";
            let titleText =
                [...item.title]
                    .filter((char, index) => index <= 140)
                    .reduce((str1, str2) => str1 + str2)
                + (item.title.length > 140 ? "..." : "");
            itemTitle.innerHTML = titleText;
            itemContainer.appendChild(itemTitle);
            const buyContainer = document.createElement("div");
            buyContainer.className = "buy-container";
            itemContainer.appendChild(buyContainer);
            const itemPrice = document.createElement("h4");
            itemPrice.className = "item-price";
            itemPrice.innerHTML = item.currency + item.price.toLocaleString("pt-BR");
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

    pageControlContainer.style.display = "block";

}

function GetItensFromServer() {
    pageControlContainer.style.display = "none";
    document.querySelector("html").className = "loading";
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop)
    });

    let searchQuery = params["search_query"];
    let page = params["page"];

    fetch("http://localhost:6013/search/content?" + new URLSearchParams({
        search_query: searchQuery,
        page
    }))
        .then(res => res.json())
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