import { get, post } from "./api.js";
import { getUser, isEmpty } from "./utils.js";
import initListeners from "./listeners.js";
import route from "./router.js";
setInterval(function () {
    if (!isEmpty(getUser())) {
        get(`/user/ping`).then((val) => {
            console.log(val);
        });
    }
}, 60000);
initListeners();
console.log(cnf.google);
// Google login
try {
    google.accounts.id.initialize({
        client_id: cnf.google,
        callback: (user) => {
            post(`/user/tokensignin`, { token: user.credential }, { "Content-Type": "text/plain" }).then((val) => {
                if ("token" in val) {
                    localStorage.setItem("user", JSON.stringify(val));
                    window.location.href =
                        location.pathname == `/bye` ? `/` : location.pathname;
                }
            });
        },
    });
    google.accounts.id.renderButton(document.getElementById("login-link"), {
        type: "icon",
        size: "small",
        shape: "pill",
    });
}
catch {
    console.log("No internet");
}
// User login
const user = JSON.parse(localStorage.getItem("user") || "{}");
if (!isEmpty(user)) {
    $("#login-link").hidden = true;
    $("#username").innerHTML = `<span class="badge-small badge-red small-caps">${user.user.level.at(-1)}</span>`;
    $("#signedin").hidden = false;
}
route(location.pathname, false);
