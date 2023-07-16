import { get, post } from "../../api.js";
import { buttonDone, isEmpty } from "../../utils.js";
export const listeners = {
    click: [
        {
            selector: ".layer-button",
            callback: (t) => {
                const dataContainer = t.closest(".status-buttons");
                const textId = dataContainer?.dataset.textid;
                const layer = dataContainer?.dataset.layer;
                const status = t.dataset.status;
                post(`/text/${textId}/update_status`, {
                    text_id: textId,
                    status: status,
                    layer: layer,
                }).then((data) => {
                    if (data && data.ok) {
                        buttonDone(t, "Saved!");
                        location.reload();
                    }
                    else {
                        alert("Some error happened.");
                    }
                });
            },
        },
    ],
};
const getStatus = (status) => {
    if (status == "3") {
        return '<span class="badge-small badge-green">Finalized</span>';
    }
    else if (status == "2") {
        return '<span class="badge-small badge-red">Rejected</span>';
    }
    else if (status == "8") {
        return '<span class="badge-small badge-orange">Migrated</span>';
    }
    else if (status == "6") {
        return '<span class="badge-small badge-blue">Submitted</span>';
    }
    else if (status == "1") {
        return '<span class="badge-small badge-grey">In progress</span>';
    }
    else if (status == "0") {
        return '<span class="badge-small badge-white">Not yet annotated</span>';
    }
    return "";
};
const getButtons = (textId, user, layer, status) => {
    if (isEmpty(user) || !user.user["level"].includes("editor")) {
        return "";
    }
    const admin = user.user["level"].includes("admin");
    let buttons = `<div data-layer="${layer}" data-textid="${textId}" class="status-buttons centered" style="margin:5px 0">`;
    if (![6, 3, 0].includes(status)) {
        buttons +=
            '<span data-status="6" class="button button-small layer-button">Submit</span>';
    }
    if (admin) {
        if (![3, 0].includes(status)) {
            buttons +=
                '<span data-status="3" class="button button-small layer-button">Approve</span>';
        }
        if (![2, 0].includes(status)) {
            buttons +=
                '<span data-status="2" class="button button-small layer-button">Reject</span>';
        }
    }
    buttons += "</div>";
    return buttons;
};
const getHeader = (header, status) => {
    let approved = "";
    let annotated = "";
    if (header["annotated (previously)"].length || header["annotated"].length) {
        annotated +=
            '<div style="font-weight:600; font-size:14px; margin-bottom:2px">Annotated by</div>';
    }
    if (header["approved"].length && status == "3") {
        approved += `<div style="font-weight:600; font-size:14px; margin-bottom:2px">Approved by</div><div style="margin-bottom:8px;"> <span class="bold">${header["approved"][0]["who"]}</span> on <span class="grey">${header["approved"][0]["when"]}</span></div>`;
    }
    if (header["annotated"].length) {
        for (let a of header["annotated"]) {
            annotated += `<span class="bold">${a["who"]}</span> on <span class="grey">${a["when"]}</span><br>`;
        }
    }
    if (header["annotated (previously)"].length) {
        for (let a of header["annotated (previously)"]) {
            annotated += `<span class="bold">${a["who"]}</span> on <span class="grey">${a["when"]}</span><br>`;
        }
    }
    return `
        <div class="centered" style="font-size:12px;">
            <div>${approved}</div>
            <div>${annotated}</div>
        </div>
    `;
};
export default async (doc, user) => {
    return get(`/text/${doc.id}/workflow`).then((data) => {
        if (data && data.ok) {
            return `
        <div class="grid">
            <div class="g-6">
                <div id="orig-workflow" class="card parent-card card-full">
                    <div class="card-header">
                        <div class="card-title">
                        Original ${getStatus(data.result["orig_status"])}
                        </div>
                        ${getButtons(doc.id, user, "orig", data.result["orig_status"])}
                    </div>
                    <div class="card-content">
                        ${getHeader(data.result["orig_header"], data.result["orig_status"])}
                    </div>
                </div>
            </div>
            <div class="g-6">

                <div id="reg-workflow" class="card parent-card card-full">
                    <div class="card-header">
                        <div class="card-title">
                        Regularized ${getStatus(data.result["reg_status"])}
                        </div>
                        ${getButtons(doc.id, user, "reg", data.result["reg_status"])}
                    </div>
                    <div class="card-content">
                        ${getHeader(data.result["reg_header"], data.result["reg_status"])}
                    </div>
                </div>
            </div>
        </div>
    `;
        }
    });
};
