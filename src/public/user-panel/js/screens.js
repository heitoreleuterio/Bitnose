import { RemoveProductFromList } from "../../requests.js";

const FILL_HEART_SVG = await fetch("/svg/fill-heart.svg").then(res => res.text());

export function Account(user) {
    const accountInputs = document.createElement("div");
    accountInputs.id = "account-inputs";
    accountInputs.innerHTML = String.raw`
        <div>
            <input type="email" placeholder="email" value="${user.email}">
            <br></br>
            <input type="password" placeholder="password">
        </div>
        <input type="button" value="edit">
    `;
    const requestAdminInput = document.createElement("input");
    requestAdminInput.id = "request-admin-button";
    requestAdminInput.type = "button";
    requestAdminInput.value = "request admin";
    return [accountInputs, requestAdminInput];
}

export function Products(products) {
    const productsListContainer = document.createElement("div");
    productsListContainer.id = "products-list-container";
    for (let c in products) {
        let item = products[c];
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
        itemContainer.innerHTML += FILL_HEART_SVG.replace("svg", 'svg class="item-heart-icon"');
        let heartSvg = itemContainer.querySelector("svg");
        heartSvg.onclick = async () => {
            try {
                await RemoveProductFromList(item._id);
                productsListContainer.removeChild(itemContainer);
                products.splice(c, 1);
            }
            catch (error) {
                console.log(error);
            }
        };
        productsListContainer.appendChild(itemContainer);
    }
    return [productsListContainer];
}