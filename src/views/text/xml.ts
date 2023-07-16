import { debounce, isEmpty, buttonWait } from "../../utils.js";
import { post } from "../../api.js";
import { Listeners, ApiResult, Dict } from "../../types.js";

import "https://cdn.jsdelivr.net/npm/diff@5.1.0/dist/diff.min.js";

export const listeners: Listeners = {
  click: [
    {
      selector: ".import-sentence-toggle",
      callback: (t: HTMLElement) => {
        t.classList.toggle("badge-green");
        t.classList.toggle("badge-red");
        let closestSentence = t.closest<HTMLElement>("div.sentence");
        if (closestSentence?.dataset.import == "1") {
          closestSentence!.dataset.import = "0";
        } else {
          closestSentence!.dataset.import = "1";
        }
        if (t.textContent == "Yes") {
          t.textContent = "No";
        } else {
          t.textContent = "Yes";
        }
      },
    },
    {
      selector: ".confirm-tokenization",
      callback: (t: HTMLElement) => {
        buttonWait(t);
        let importList: string[] = [];
        const sentences = $$<HTMLElement>(".sentence");
        sentences.forEach((s) => {
          importList.push(s.dataset.import || "");
        });
        const textId = $("h1")?.dataset.textid;
        post(`/text/${textId}/confirm_tokenization`, {
          xml: $("#editable-xml")?.innerHTML,
          import: importList,
        }).then((data: ApiResult) => {
          if (data && data.ok) {
            location.reload();
          } else {
            alert(`Error: ${data.result}`);
          }
        });
      },
    },
    {
      selector: "#save-xml",
      callback: (_t: HTMLElement) => {
        const textId = $("h1")?.dataset.textid;
        post(`/text/${textId}/request_tokenization`, {
          xml: $("#editable-xml")?.innerHTML,
        }).then((data: ApiResult) => {
          if (data && data.ok) {
            const modal = document.querySelector("#confirm-tokenization-modal");
            const annotationStatus = data.result["annotated"];
            const matches = data.result["matches"];
            let modalContainer = modal!.querySelector("#tokenization-changes");
            if (!annotationStatus) {
              modalContainer!.innerHTML =
                "Are you sure you wish create a new tokenization?";
            } else {
              modalContainer!.innerHTML = matches
                .map((r: any, i: number) => {
                  let sHtml = `<div class="sentence" data-import="${
                    r.will_import
                  }" data-sentenceid="${i}"><h4 class="bold" style="margin-bottom:2px;">Sentence ${
                    i + 1
                  }</h4>`;

                  if (r.score == 1) {
                    if (r.old_sentence == i) {
                      sHtml += `<p class="info">Ok</p>`;
                    } else {
                      sHtml += `<p class="info">Matches Sentence ${
                        r.old_sentence + 1
                      }</p>`;
                    }
                  } else {
                    if (r.score < 0.9) {
                      sHtml += `<p class="red"><strong>Cannot import annotation</strong> (no good match)</p>`;
                    } else {
                      const score = Math.floor(r.score * 100);
                      sHtml += `<p class="red" style="margin-bottom:4px;"><strong>${score}%</strong> match with <strong>Sentence ${
                        r.old_sentence + 1
                      }</strong></p>`;
                      for (let diff of r.diffs) {
                        for (let v of ["orig", "reg"]) {
                          if (diff[v].length) {
                            console.log(diff[v]);
                            sHtml += `
                                <span class="bold">${v}: </span>
                                <span class="red">${diff[v][1]}</span> → <span class="green">${diff[v][0]}</span>
                                <br>
                            `;
                          }
                        }
                      }
                      sHtml += `
                                    <p class="info" style="cursor:pointer; margin-top:10px;">Import despite errors: <span data-import="1" class="badge-small badge-green import-sentence-toggle">Yes</span></p>
                                `;
                    }
                  }
                  sHtml += "</div>";
                  return sHtml;
                })
                .join("");
            }

            modal!.classList.remove("d-none");
          }
        });
      },
    },
  ],
  input: [
    {
      selector: "#editable-xml",
      callback: (t: HTMLElement) => {
        debounce(() => {
          const edited = t.innerHTML;
          const original = $("#original")?.innerHTML;
          if (edited != original) {
            $("#save-xml")?.classList.remove("d-none");
          } else {
            $("#save-xml")?.classList.add("d-none");
          }
        }, 300)();
      },
    },
  ],
};

const getDiffHtml = (edited: string, original: string) => {
  // @ts-ignore
  const diffs = Diff.diffChars(edited, original);
  let diffHtml: string;

  if (diffs.length == 1) {
    diffHtml = '<div style="text-align:center;">No changes</div>';
  } else {
    diffHtml = diffs
      .map((part: Dict<any>) => {
        let op = Object.entries(part)
          .map(([k, v]) => (v == 1 && k != "count" ? k : ""))
          .join("");
        return `<span class="${op}"><xmp>${part.value}</xmp></span>`;
      })
      .join("\n");
  }

  return `<div class="card-content diff">${diffHtml}</div>`;
};

export default async (doc: any, user: any) => {
  return `${
    !isEmpty(user)
      ? `
        ${
          doc.current
            ? `<p class="centered info">Up to date as of ${doc.checked}</p>`
            : `
        <p class="centered red">This document has an updated source XML.</p>
            <div class="card">
                <div class="card-header"><div class="card-title">New XML <span id="save-new-xml" class="button button-small"><span>Try to import</span></div></div>
                <div class="card-content xml"><xmp contenteditable="true">${doc.xml_papygreek}</xmp></div>
                <xmp id="original" class="d-none" contenteditable="true">${doc.xml_papygreek}</xmp>
            </div>
        `
        }`
      : ""
  }
        <div class="card">
            <div class="card-header"><div class="card-title">Source XML (PapyGreek) ${
              !isEmpty(user)
                ? `<span id="save-xml" class="button button-small d-none"><span>Save</span>`
                : ""
            }</div></div>
            <div class="card-content xml"><xmp id="editable-xml" ${
              !isEmpty(user) ? `contenteditable="true"` : ""
            }>${doc.xml_papygreek}</xmp></div>
            <xmp id="original" class="d-none" contenteditable="true">${
              doc.xml_papygreek
            }</xmp>
        </div>
        <div class="card">
            <div class="card-header"><div class="card-title">Source XML (Original)</div></div>
           <div id="diffcontainer">${getDiffHtml(
             doc.xml_papygreek,
             doc.xml_original
           )}</div>
        </div>
        <div id="confirm-tokenization-modal" class="d-none modal centered">
            <div class="modal-content">
                <h3>Confirm changes</h3>
                <div style="padding-bottom:10px;" id="tokenization-changes"></div>
                <span class="button button-red button-small confirm-tokenization">Confirm</span>
                <span class="button button-grey button-small modal-cancel">Cancel</span>
            </div>
        </div>
    `;
};
