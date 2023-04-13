export async function GetUser() {
    const response = await fetch("/user");
    if (response.status == 200)
        return await response.json();
    else
        throw await response.text();
}

export async function AddProductToList(product) {
    const fetchOptions = {
        method: "PUT",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(product)
    };
    const response = await fetch("/user/add/product", fetchOptions);
    if (response.status != 200)
        throw await response.text();
    else
        return await response.json();
}

export async function RemoveProductFromList(productId) {
    const fetchOptions = {
        method: "DELETE",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ productId })
    };
    const response = await fetch("/user/delete/product", fetchOptions);
    if (response.status != 200)
        throw await response.text();
}