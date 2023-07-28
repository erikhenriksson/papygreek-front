import { get } from "../../api.js";
let tokenData = [];
export const listeners = {
    change: [
        {
            selector: "[name='view-type']",
            callback: (t) => {
                const container = $("#text-view");
                const result = t.value == "viewhtml"
                    ? `
          <div class="formatted-html">
            ${formatHtml(tokenData)}
          </div>
          `
                    : `
          <div class="formatted-tokens">
            ${formatTokens(tokenData)}
          </div>
          `;
                container.innerHTML = result;
            },
        },
    ],
};
const formatHtml = function (tokens) {
    let sentence = tokens[0].sentence_n;
    let line = tokens[0].line;
    let tokenHtml = `<span class="sentence"><span class="line-margin">${line}:</span>`;
    tokens.forEach((t) => {
        if (t.artificial) {
            return;
        }
        if (t.sentence_n != sentence) {
            sentence = t.sentence_n;
            tokenHtml += `</span><span class="sentence">`;
        }
        let innerLb = t.orig_html.includes("tag='lb'");
        let lineChanged = t.line && t.line != "None" && t.line.split("-")[0] != line;
        if (lineChanged && !innerLb) {
            line = t.line;
            tokenHtml += `<br><span class="line-margin">${line}:</span>`;
        }
        let tooltip = `
        <table>
            <tr>
                <th></th>
                <th>Original</th> 
                <th>Regularized</th>
            </tr>
            <tr>
                <td class="thh">Lemma</td>
                <td>${t.orig_lemma}</td>
                <td>${t.reg_lemma}</td>
            </tr>
            <tr>
                <td class="thh">Postag</td> 
                <td>${t.orig_postag}</td>
                <td>${t.reg_postag}</td>
            </tr>
                <td class="thh">Relation</td>
                <td>${t.orig_relation}</td>
                <td>${t.reg_relation}</td>
            </tr>
            <tr>
                <td class="thh">Head</td>
                <td>${t.orig_head}</td>
                <td>${t.reg_head}</td>
            </tr>
            <tr>
                <td class="thh">ID</td>
                <td colspan="2">${t.id}</td>
            </tr>
        </table>
        `;
        let lines = t.orig_html.includes("unit='line'") ? "line-gap" : "";
        let form = t.orig_form == t.reg_form
            ? t.orig_html
            : `<span class="token-orig">${t.orig_html}</span><span class="token-reg">${t.reg_html}</span>`;
        tokenHtml += `<span class="token ${lines}">${form}<span class="tooltip">${tooltip}</span></span>`;
        if (lineChanged && innerLb) {
            line = t.line;
            tokenHtml += `<br><span class="line-margin">${line}:</span>`;
        }
    });
    tokenHtml += "</span>";
    return tokenHtml;
};
const formatTokens = function (tokens) {
    let sentence = tokens[0].sentence_n;
    let line = tokens[0].line;
    let tokenHtml = `<span class="sentence"><span class="line-margin">${line}:</span>`;
    tokens.forEach((t) => {
        if (t.artificial) {
            return;
        }
        if (t.sentence_n != sentence) {
            sentence = t.sentence_n;
            tokenHtml += `</span><span class="sentence">`;
        }
        if (t.line && t.line != "None" && t.line.split("-")[0] != line) {
            line = t.line;
            tokenHtml += `<br><span class="line-margin">${line}:</span>`;
        }
        let tooltip = `
        <table>
            <tr>
                <th></th>
                <th>Original</th> 
                <th>Regularized</th>
            </tr>
            <tr>
                <td class="thh">Lemma</td>
                <td>${t.orig_lemma}</td>
                <td>${t.reg_lemma}</td>
            </tr>
            <tr>
                <td class="thh">Postag</td> 
                <td>${t.orig_postag}</td>
                <td>${t.reg_postag}</td>
            </tr>
                <td class="thh">Relation</td>
                <td>${t.orig_relation}</td>
                <td>${t.reg_relation}</td>
            </tr>
            <tr>
                <td class="thh">Head</td>
                <td>${t.orig_head}</td>
                <td>${t.reg_head}</td>
            </tr>
            <tr>
                <td class="thh">ID</td>
                <td colspan="2">${t.id}</td>
            </tr>
        </table>
        `;
        let form = t.orig_form == t.reg_form
            ? t.orig_form
            : `<span class="token-orig">${t.orig_form}</span><span class="token-reg">${t.reg_form}</span>`;
        tokenHtml += `<span class="token">${form}<span class="tooltip">${tooltip}</span></span>`;
    });
    tokenHtml += "</span>";
    return tokenHtml;
};
export default async (doc) => {
    return get(`/text/${doc.id}/tokens_html`).then((data) => {
        tokenData = data.result;
        if (data && data.ok && data.result.length) {
            return `
        <section class="centered" style="margin-bottom:16px;">
          <input checked="" type="radio" id="viewhtml" name="view-type" value="viewhtml"/>
          <label for="viewhtml">Formatted version</label>
          <input type="radio" id="viewpapygreek" name="view-type" value="viewpapygreek"/>
          <label for="viewpapygreek">Text version</label>
        </section>
        <section class="centered" id="text-view">
          <div class="formatted-html">
            ${formatHtml(tokenData)}
          </div>
        </section>
      `;
        }
        else {
            return '<p style="text-align:center;">No tokens.</p>';
        }
    });
};
