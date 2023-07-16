import { get } from "../../api.js";
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
    return get(`/text/${doc.id}/tokens`).then((data) => {
        if (data && data.ok && data.result.length) {
            return `<div style="text-align:center;"><div style="padding-left:60px; display: inline-block; text-align: left;">${formatTokens(data.result)}</div></div>`;
        }
        else {
            return '<p style="text-align:center;">No tokens.</p>';
        }
    });
};
