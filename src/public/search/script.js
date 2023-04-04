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
            itemImage.setAttribute("referrerpolicy", "no-referrer");
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
    const params = new URLSearchParams(window.location.search);

    let searchQuery = params.get("search_query");
    let page = params.get("page");

    let baseURL = `${window.location.protocol}//${window.location.host}/search`;

    fetch(`${baseURL}/content?` + new URLSearchParams({
        search_query: searchQuery,
        page
    }))
        .then(res => {
            if (res.redirected) {
                console.log(res.url.substring(res.url.indexOf("?")))
                const newParams = new URLSearchParams(res.url.substring(res.url.indexOf("?")));

                let newSearchQuery = newParams.get("search_query");
                let newPage = newParams.get("page");
                let newURL = `${baseURL}?` + new URLSearchParams({
                    search_query: newSearchQuery,
                    page: newPage
                });
                window.history.pushState({ path: newURL }, '', newURL);
            }
            return res.json();
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