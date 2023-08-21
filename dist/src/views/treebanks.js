import { setTitle, centeredLoader, getUser, activateTab, isEmpty, buttonWait, buttonDone, downloadAsFile, } from "../utils.js";
import { get, getFile } from "../api.js";
let cache;
export const listeners = {
    click: [
        {
            selector: ".export-finalized",
            callback: (t) => {
                buttonWait(t);
                getFile(`/xml/release`).then((data) => {
                    downloadAsFile(data, "papygreek-treebanks.zip");
                    buttonDone(t, "Downloaded!");
                });
            },
        },
    ],
};
export default (params) => {
    const urlMap = {
        finalized: "3",
        submitted: "6",
        active: "1",
        migrated: "8",
        rejected: "2",
        update: "update",
        v1: "v1",
    };
    setTitle("Treebanks");
    let treebankType = "";
    if ("type" in params) {
        treebankType = params.type;
    }
    let user = getUser();
    const getTreebanks = () => {
        let container = $("#main");
        let resultHTML = "";
        const treebankTypeQuery = urlMap[treebankType || "finalized"];
        get(!isEmpty(user) ? `/texts/status/${treebankTypeQuery}` : `/texts/approved`).then((data) => {
            if (data && data.ok && data.result.length) {
                console.log(data);
                data.result.forEach((el) => {
                    let status = "";
                    let style = "";
                    if (!isEmpty(user)) {
                        if (treebankTypeQuery == "3") {
                            if (el.orig_status != 3) {
                                status = "O missing";
                            }
                            if (el.reg_status != 3) {
                                status += " R missing";
                            }
                            if (status) {
                                style = "color:red !important; font-weight:bold";
                            }
                        }
                        else {
                            if (treebankTypeQuery
                                .split(",")
                                .includes(el.orig_status ? el.orig_status.toString() : "0")) {
                                status = "O";
                            }
                            if (treebankTypeQuery
                                .split(",")
                                .includes(el.reg_status ? el.reg_status.toString() : "0")) {
                                status += " R";
                            }
                        }
                    }
                    let col = "CUSTOM";
                    if (el.series_type == "documentary") {
                        col = "DDBDP";
                    }
                    else if (el.series_type == "literary") {
                        col = "LITERARY";
                    }
                    else if (el.series_type == "inscription") {
                        col = "INSCRIPTION";
                    }
                    resultHTML += `<p class="tight"><a style="${style}" href="/text/${el.id}">${el.name}</a> <span class="badge-small">${col}</span> <span style="font-size:75%; color: grey">${status}</span></p>`;
                });
            }
            else {
                resultHTML = "No texts found.";
            }
            const containerVal = `
        <section class="info">${data.result.length} texts</section>
        ${!isEmpty(user) && treebankTypeQuery == "3"
                ? `<section class="centered"><span class="export-finalized button button-small">Export as XML</span></section>`
                : ""}
        <section id="treebanks" style="column-count: 3; padding-top:20px; margin:0 30px; text-align:center">${resultHTML}</section>
      `;
            container.innerHTML = containerVal;
            if (treebankTypeQuery == "3") {
                cache = containerVal;
            }
        });
    };
    const getHtml = () => {
        return `
      <h1>Treebanks</h1>
      <section class="tabs">
        <a data-tab="" href="/treebanks">Finalized</a>
        ${!isEmpty(user)
            ? `
              <a data-nocache="1" data-tab="submitted" href="/treebanks/submitted">Submitted</a>
              <a data-nocache="1" data-tab="active" href="/treebanks/active">Active</a>
              <a data-nocache="1" data-tab="migrated" href="/treebanks/migrated">Migrated</a>
              <a data-nocache="1" data-tab="rejected" href="/treebanks/rejected">Rejected</a>
              <a data-nocache="1" data-tab="update" href="/treebanks/update">Pending update</a>
              <a data-nocache="1" data-tab="v1" href="/treebanks/v1">v1</a>
            `
            : ""}
      </section>
      <section id="main">
        ${cache && !params.nocache ? cache : centeredLoader()}
      </section>
    `;
    };
    const afterRender = () => {
        activateTab(treebankType);
        if (!cache || params.nocache) {
            getTreebanks();
        }
    };
    return {
        getHtml,
        afterRender,
    };
};
