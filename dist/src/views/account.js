import { setTitle, getUser, buttonDone, buttonWait } from "../utils.js";
import { get } from "../api.js";
export const listeners = {
    click: [
        {
            selector: ".logout",
            callback: (_t) => {
                localStorage.removeItem("user");
                window.location.href = "/bye";
            },
        },
        {
            selector: ".update-zotero",
            callback: (t) => {
                buttonWait(t);
                get(`/zotero/update_library`).then((data) => {
                    if (!data || !data.ok) {
                        alert("An error happened. Sorry!");
                    }
                    else {
                        buttonDone(t);
                    }
                });
            },
        },
    ],
};
export default (_params = {}) => {
    const user = getUser().user;
    setTitle(user.name);
    const getHtml = () => {
        return `
    <section>
      <h1>${user.name}</h1>
      <div class="centered g-14">
        <span class="badge-small">ID: ${user.id}</span> 
        <span class="badge-small">${user.email}</span> 
        <span class="badge-small">${user.level.at(-1)}</span>
      </div>
      <div class="centered g-14">
      ${user.level.includes("editor")
            ? `<span class="button button-small update-zotero">Update Zotero library</span>`
            : ``}
      </div>
      <div class="centered" style="margin-top:30px;">
        <span class="logout">Sign out</span>
      </div>
    </section>
    `;
    };
    const afterRender = () => { };
    return {
        getHtml,
        afterRender,
    };
};
