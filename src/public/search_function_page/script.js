const textarea = document.querySelector("textarea");
const storeIdentifierInput = document.querySelector("#store-identifier-input");
const actualStoreTitle = document.querySelector("#actual-store-title");
let actualStore;

function EnviarNovaFuncao() {
    if (actualStore != null) {
        let searchFunction;
        let code = 'searchFunction = async () => {' + textarea.value + '}';
        eval(code);
        const searchFunctionStringfy = JSONfn.stringify(searchFunction);
        const fetchHeaders = new Headers();
        fetchHeaders.append("Content-Type", "application/json");
        const fetchBody = {
            identifier: actualStore.identifier,
            searchFunction: searchFunctionStringfy
        };
        const fetchOptions = {
            method: "POST",
            headers: fetchHeaders,
            body: JSON.stringify(fetchBody)
        };

        fetch("/store/update/search/function", fetchOptions)
            .then(async (res) => {
                console.log(await res.text());
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

function SelecionarFazenda() {
    actualStoreTitle.innerHTML = "";
    actualStore = null;
    let identifier = storeIdentifierInput.value;
    fetch("/store/" + identifier)
        .then(async res => {
            const obj = await res.json();
            if (res.status == "200") {
                actualStore = obj;
                actualStoreTitle.innerHTML = obj.name;
            }
            else
                alert(obj.message);
        })
        .catch(error => {
            alert(error);
        })
}