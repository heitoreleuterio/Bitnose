import { Account, Products } from "./screens.js";
import { GetUser } from "../../requests.js";

(async () => {
    let user;
    let productsList = [];
    try {
        user = await GetUser();
        productsList = user.productsList;
    }
    catch (error) {
        location = "/login-page/";
    }

    const contentContainer = document.querySelector(".content-container");
    const menuBar = document.querySelector(".menu-bar ul");

    const Screens = {
        "account": function () { return Account(user) },
        "products": function () { return Products(productsList) }
    };

    function getCurrentMenu() {
        return [...menuBar.children].find(menu => menu.getAttribute("selected") == "true");
    }

    function changeScreenTo(name) {
        const screenFunction = Screens[name];
        contentContainer.innerHTML = "";
        if (screenFunction != null) {
            const screenElements = screenFunction();
            for (let element of screenElements) {
                contentContainer.appendChild(element);
            }
        }
    }

    menuBar.addEventListener("click", (e) => {
        if (e.target.nodeName == "LI") {
            getCurrentMenu().removeAttribute("selected");
            changeScreenTo(e.target.dataset.item);
            e.target.setAttribute("selected", "true");
        }
    });

    changeScreenTo("account");
})();
