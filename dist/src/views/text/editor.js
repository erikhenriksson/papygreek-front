import { get, post } from "../../api.js";
import { buttonDone, debounce } from "../../utils.js";
const XMLParser = window.XMLParser;
const atts = [
    "orig_form",
    "orig_lemma",
    "orig_postag",
    "orig_relation",
    "orig_head",
    "reg_form",
    "reg_lemma",
    "reg_postag",
    "reg_relation",
    "reg_head",
    "n",
    "insertion_id",
    "artificial",
];
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
});
const attMap = [
    ["orig_lemma", "lemma_orig", "lemma"],
    ["reg_lemma", "lemma_reg", "lemma"],
    ["orig_postag", "postag_orig", "postag"],
    ["reg_postag", "postag_reg", "postag"],
    ["orig_relation", "relation_orig", "relation"],
    ["reg_relation", "relation_reg", "relation"],
    ["orig_head", "head_orig", "head"],
    ["reg_head", "head_reg", "head"],
];
const artificialAttMap = attMap.concat([
    ["orig_form", "form_orig", "form"],
    ["reg_form", "form_reg", "form"],
    ["n", "id"],
    ["insertion_id"],
    ["artificial"],
]);
const artificialAttMapper = (artificial, att) => {
    for (let k of artificialAttMap) {
        if (att == k[0]) {
            for (let y of k) {
                if (y in artificial) {
                    return artificial[y];
                }
            }
        }
    }
    return "";
};
const changeAtt = (target, targetAtt, newVal, getNewVal = false) => {
    let t = target.querySelector(`td[data-att="${targetAtt}"]`);
    t.innerText = getNewVal
        ? target
            .querySelector(`td[data-att="${newVal}"]`)
            ?.innerText.trim()
        : newVal.trim();
    if (t.innerText != t.dataset.original) {
        t.classList.add("modified");
    }
    else {
        t.classList.remove("modified");
    }
};
export const listeners = {
    click: [
        {
            selector: ".save-sentence",
            callback: (t) => {
                const card = t.closest(".card");
                const tableContainer = card?.querySelector(".card-content");
                const rows = card?.querySelectorAll("tr.token-row");
                let jsonData = [];
                let toDelete = [];
                let toAdd = [];
                const sentenceN = card?.dataset.sentencen;
                const textId = card?.dataset.textid;
                const saveBtn = t;
                for (let row of rows || []) {
                    let data = {};
                    let wid = row.dataset.word_id;
                    for (let token of row.querySelectorAll("td.token-editable")) {
                        if (token.innerText.trim() !== token.dataset.original) {
                            data[token.dataset.att] = token.innerText.trim();
                        }
                    }
                    if (Object.keys(data).length &&
                        !row.classList.contains("new-artificial")) {
                        jsonData.push({ token_id: wid, data: data });
                    }
                    if (row.classList.contains("delete")) {
                        toDelete.push(wid);
                    }
                    if (row.classList.contains("new-artificial")) {
                        toAdd.push({ data: data });
                    }
                }
                if (jsonData.length || toDelete.length || toAdd.length) {
                    post(`/annotation/edit`, {
                        text_id: textId,
                        sentence_n: sentenceN,
                        edit: jsonData,
                        delete: toDelete,
                        add: toAdd,
                    }).then((data) => {
                        if (data && data.ok) {
                            tableContainer.innerHTML = sentenceToTable(data.result);
                            saveBtn.innerHTML = "Saved!";
                            setTimeout(() => {
                                saveBtn.innerHTML = "Save";
                            }, 500);
                        }
                    });
                }
                else {
                    saveBtn.innerHTML = "Saved!";
                    setTimeout(() => {
                        saveBtn.innerHTML = "Save";
                    }, 500);
                }
            },
        },
        {
            selector: ".copy-one, .copy-all",
            callback: (t) => {
                const card = t.closest(".card");
                const source = t.closest("th")?.dataset.layer;
                const rows = card.querySelectorAll("tr.token-row");
                let copyAtts = ["lemma", "postag", "relation", "head"];
                if (t.classList.contains("copy-one")) {
                    copyAtts = [t.dataset.att];
                }
                for (let row of rows) {
                    for (let att of copyAtts) {
                        changeAtt(row, `${source == "orig" ? "reg" : "orig"}_${att}`, `${source == "orig" ? "orig" : "reg"}_${att}`, true);
                    }
                }
                buttonDone(t, "Copied!");
            },
        },
        {
            selector: ".delete-artificial",
            callback: (t) => {
                const art = t.closest("tr");
                if (t.closest("tr")?.classList.contains("new-artificial")) {
                    art?.closest("tbody")?.removeChild(art);
                }
                else {
                    art?.classList.toggle("delete");
                }
            },
        },
        {
            selector: ".revert-sentence",
            callback: (t) => {
                const card = t.closest(".card");
                const rows = card?.querySelectorAll("tr.token-row") || [];
                for (let row of rows) {
                    if (row.classList.contains("new-artificial")) {
                        row?.closest("tbody")?.removeChild(row);
                    }
                    else {
                        row.classList.remove("delete");
                        for (let token of row.querySelectorAll("td.token-editable")) {
                            token.innerText = (token.dataset.original || "")
                                .toString()
                                .trim();
                            token.classList.remove("modified");
                        }
                    }
                }
            },
        },
        {
            selector: ".import-sentence",
            callback: (t) => {
                const card = t.closest(".card");
                card?.querySelector(".import-area")?.classList.toggle("d-none");
            },
        },
        {
            selector: ".try-import-xml, .try-import-xml-force",
            callback: (t) => {
                const force = t.classList.contains("try-import-xml-force");
                const card = t.closest(".card");
                const xml = card?.querySelector(".import-xml")?.textContent;
                const rows = card?.querySelectorAll("tr.token-row");
                const artificialRows = card?.querySelectorAll("tr.token-row.artificial");
                let newSentence;
                try {
                    newSentence = parser.parse(xml);
                }
                catch {
                    alert("Could not parse XML.");
                    return;
                }
                let importedTokens = [];
                let importedArtificials = [];
                try {
                    for (let token of newSentence.sentence.word) {
                        if ("artificial" in token && token["artificial"] == "elliptic") {
                            importedArtificials.push(token);
                        }
                        else {
                            importedTokens.push(token);
                        }
                    }
                }
                catch {
                    alert("Could not parse XML.");
                    return;
                }
                if (!force &&
                    importedTokens.length != rows.length - artificialRows.length) {
                    alert("Token number mismatch.");
                    return;
                }
                let tokenI = 0;
                for (let token of importedTokens) {
                    let row = rows[tokenI];
                    for (let key in token) {
                        for (let k of attMap) {
                            if (k.includes(key)) {
                                changeAtt(row, k[0], token[key]);
                                break;
                            }
                        }
                    }
                    tokenI += 1;
                }
                for (let a of artificialRows) {
                    a.classList.add("delete");
                }
                let artificialI = 0;
                for (let artificial of importedArtificials) {
                    if (artificialI < artificialRows.length) {
                        let aRow = artificialRows[artificialI];
                        for (let key in artificial) {
                            for (let k of artificialAttMap) {
                                if (k.includes(key)) {
                                    changeAtt(aRow, k[0], artificial[key]);
                                    break;
                                }
                            }
                        }
                        aRow.classList.remove("delete");
                    }
                    else {
                        let newArtificial = `
                      <tr class="token-row artificial new-artificial" >
                          ${atts
                            .map((att) => {
                            return `
                                  <td class="token-editable noenter" data-original="_______" 
                                      data-att="${att}" 
                                      contenteditable="true">
                                      ${artificialAttMapper(artificial, att)}
                                  </td>`;
                        })
                            .join("")}
                          <td><span style="color:red; font-weight:bold;" class="delete-artificial">✕</span></td>
                      </tr>`;
                        card.querySelector("table tbody").innerHTML += newArtificial;
                    }
                    artificialI += 1;
                }
                card?.querySelector(".import-area")?.classList.add("d-none");
            },
        },
    ],
    input: [
        {
            selector: ".token-editable",
            callback: (t) => {
                debounce(() => {
                    if (t.innerText.trim() != t.dataset.original) {
                        t.classList.add("modified");
                    }
                    else {
                        t.classList.remove("modified");
                    }
                }, 300)();
            },
        },
    ],
};
export const sentenceToTable = (sentence) => {
    return `
    <table id="editor" data-sentencen="${sentence[0].sentence_n}">
        <tr class="layer-row">
            <th data-layer="reg" >Original <span class="button button-small copy-all">Copy from reg</span> <span class="button button-small button-plain copy-one" data-att="lemma">L</span> <span class="button button-plain copy-one" data-att="postag">P</span> <span class="button button-plain copy-one" data-att="relation">R</span> <span class="button button-plain copy-one" data-att="head">H</span></th>
            <th/>
            <th/>
            <th/>
            <th/>
            <th data-layer="orig">Regularized <span class="button button-small copy-all">Copy from orig</span> <span class="button button-small button-plain copy-one" data-att="lemma">L</span> <span class="button button-plain copy-one" data-att="postag">P</span> <span class="button button-plain copy-one" data-att="relation">R</span> <span class="button button-plain copy-one" data-att="head">H</span></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
        </tr>
        <tr data-layer="reg" class="header-row">
            <th class="">Form</th>
            <th class="">Lemma</th>
            <th class="">Postag</th>
            <th class="">Relation</th>
            <th class="">Head</th>
            <th class="">Form</th>
            <th class="">Lemma</th>
            <th class="">Postag</th>
            <th class="">Relation</th>
            <th class="">Head</th>
            <th class="">n</th>
            <th class="">Insertion ID</th>
            <th class="">Artificial</th>
            <th class=""></th>
        </tr>
        ${sentence
        .map((word) => {
        return `
            <tr class="token-row ${word["artificial"] == "elliptic" ? "artificial" : ""}" data-word_id="${word.id}">
                ${atts
            .map((att) => {
            let diffClass = "";
            let attBits = att.split("_");
            let form = (word[att] || "").toString().trim();
            if (attBits[0] == "orig") {
                diffClass =
                    form != (word["reg_" + attBits.pop()] || "").trim()
                        ? "different"
                        : "";
            }
            else if (attBits[0] == "reg") {
                diffClass =
                    form != (word["orig_" + attBits.pop()] || "").trim()
                        ? "different"
                        : "";
            }
            return `
                        <td class="token-editable noenter ${diffClass}" data-original="${form}" 
                            data-att="${att}" 
                            ${["orig_form", "reg_form"].includes(att)
                ? ""
                : `contenteditable="true"`}>
                            ${form}
                        </td>`;
        })
            .join("")}
                <td>${word["artificial"] == "elliptic"
            ? `<span style="color:red; font-weight:bold;" class="delete-artificial">✕</span>`
            : ""}</td>
            </tr>
        `;
    })
        .join("")}
    </table>
    `;
};
const editor = (tokens, textId) => {
    const sentences = tokens.reduce(function (r, a) {
        r[a.sentence_n] = r[a.sentence_n] || [];
        r[a.sentence_n].push(a);
        return r;
    }, Object.create(null));
    let sentLen = 0;
    for (let _s in sentences) {
        sentLen += 1;
    }
    let retHtml = `
        <div class="info"> ${sentLen} sentences</div>
    `;
    for (let s in sentences) {
        retHtml += `
      <div class="card card-full" data-textid="${textId}" data-sentencen="${s}">
          <div class="card-header">
              <div class="card-title">
                  Sentence ${s}
                  <span class="button button-small save-sentence">Save</span><span class="button button-small import-sentence">Import XML</span><span class="button button-small revert-sentence">Revert</span>
              </div>
          </div>
          <div class="d-none import-area">
              <div style="min-height: 20px;
              border: 1px dashed gray;
              margin: 10px;
              font-size: 11px;
              font-family: monospace;
              padding: 10px;
              line-height: 17px;" class="import-xml"  data-placeholder="Paste sentence XML here" contenteditable="true">
              </div>
              <div class="centered"> <span class="button button-small try-import-xml">Confirm</span> <span class="button button-muted button-small try-import-xml-force">Confirm (ignore token number)</span></div>
          </div>
          <div class="card-content">
              ${sentenceToTable(sentences[s])}
          </div>
      </div>
  `;
    }
    retHtml += "";
    return retHtml;
};
export default async (doc) => {
    const data = await get(`/text/${doc.id}/tokens`);
    if (data && data.ok && data.result.length) {
        return editor(data.result, doc.id);
    }
    else {
        return '<p class="centered">No tokens.</p>';
    }
};
