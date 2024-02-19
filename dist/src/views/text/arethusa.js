import { haveEditor } from "../../utils.js";
export const listeners = {
    click: [
        {
            selector: "#expand-arethusa",
            callback: (_t) => {
                $("#arethusa")?.classList.add("full");
                $("#collapse-arethusa")?.classList.remove("d-none");
            },
        },
        {
            selector: "#collapse-arethusa",
            callback: (_t) => {
                $("#arethusa")?.classList.remove("full");
                $("#collapse-arethusa")?.classList.add("d-none");
            },
        },
    ],
    change: [
        {
            selector: "[name='layer-arethusa']",
            callback: (t) => {
                const textId = $("h1")?.dataset.textid;
                const src = getArethusaUrl(textId || "", t.value, haveEditor());
                //console.log(src);
                $("#arethusa").src = src;
            },
        },
    ],
};
export const getArethusaUrl = (docId, layer, userIsEditor) => {
    let url;
    if (userIsEditor) {
        url = cnf.arethusaedit;
    }
    else {
        url = cnf.arethusaview;
    }
    return `${url}?doc=${docId}&layer=${layer}`;
};
export default async (doc, userIsEditor) => {
    return `
        <span class="button d-none" style="z-index:2; transform: translate(-50%, 0);left:50%;position:fixed;top:16px" id="collapse-arethusa">Return to normal view</span>
        <section style="text-align: center;margin-bottom:16px;">
            <input checked="" type="radio" id="orig-arethusa" name="layer-arethusa" value="orig"/>
            <label for="orig-arethusa">Original</label>
            <input type="radio" id="reg-arethusa" name="layer-arethusa" value="reg"/>
            <label for="reg-arethusa">Regularized</label>
        </section>
        <div style="text-align:center"><span class="button" id="expand-arethusa">Full screen</span></div>
        <iframe id="arethusa" src="${getArethusaUrl(doc.id, "orig", userIsEditor)}"/>
    `;
};
