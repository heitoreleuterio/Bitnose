const emailField = document.querySelector("#email-field");
const passwordField = document.querySelector("#password-field");
const confirmPasswordField = document.querySelector("#confirm-password-field");
const changeModeButton = document.querySelector("#change-mode-button");
const executeActionButton = document.querySelector("#execute-action-button");

let isLogin = true;

function login() {
    const email = emailField.value;
    const password = passwordField.value;

    const authorizationContent = window.btoa(email + ":" + password);
    const authorizationMethod = "Basic";

    const fetchHeaders = new Headers();
    fetchHeaders.append("Authorization", `${authorizationMethod} ${authorizationContent}`);

    const fetchOptions = {
        method: "PUT",
        headers: fetchHeaders
    };

    fetch("/user/login", fetchOptions)
        .then(async res => {
            if (res.status != 200) {
                const msg = await res.text();
                alert(msg);
            }
            else
                location = "/user-panel/";
        });
}

function register() {
    const email = emailField.value;
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;

    if (password == confirmPassword) {
        const fetchBody = {
            email,
            password
        };

        const fetchOptions = {
            method: "POST",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(fetchBody)
        };

        fetch("/user/new", fetchOptions)
            .then(async res => {
                if (res.status != 201) {
                    const msg = await res.text();
                    alert(msg);
                }
                else
                    location = "/user-panel/";
            });
    }
    else
        alert("The password fields must have the same value");
}

function changeMode() {
    isLogin = !isLogin;

    if (isLogin) {
        confirmPasswordField.setAttribute("enabled", "false");
        changeModeButton.innerHTML = "Register";
        executeActionButton.onclick = login;
    }
    else {
        confirmPasswordField.setAttribute("enabled", "true");
        changeModeButton.innerHTML = "Login";
        executeActionButton.onclick = register;
    }
}