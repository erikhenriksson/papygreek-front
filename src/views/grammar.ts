import {
  setTitle,
  loader,
  buttonDone,
  buttonWait,
  haveEditor,
  formatTrees,
} from "../utils.js";
import { get, post } from "../api.js";
import { Listeners } from "../types.js";
window.cys = {};
let menuCache: Array<any> = [];

const userIsEditor = haveEditor();

export const listeners: Listeners = {
  click: [
    {
      selector: ".open-citation-modal",
      callback: () => {
        $<HTMLElement>("#citation-modal")!.classList.remove("d-none");
      },
    },
    {
      selector: ".chapter-link",
      callback: (t: HTMLElement) => {
        const chapterId = t.dataset.chapterid || "";
        getChapter(chapterId);
        history.pushState(null, "", `/grammar/${chapterId}`);
      },
    },
    {
      selector: ".chapter-edit",
      callback: (_t: HTMLElement) => {
        $<HTMLElement>("#md")!.classList.remove("hidden");
        document
          .querySelector<HTMLElement>("#chapter")!
          .classList.add("hidden");
        $<HTMLElement>("#md")!.focus();
      },
    },
    {
      selector: "#save-chapter",
      callback: (_t: HTMLElement) => {
        saveChapter();
      },
    },
    {
      selector: "#add-chapter",
      callback: (_t: HTMLElement) => {
        let saveBtn = $("#add-chapter") as HTMLElement;
        get(`/chapter/add`).then((val) => {
          if (val["ok"]) {
            buttonDone(saveBtn, "Wait...");
            window.location.href = `/grammar/${val.result}`;
          }
        });
      },
    },
    {
      selector: "#delete-chapter",
      callback: (t: HTMLElement) => {
        if (t.classList.contains("confirm")) {
          buttonWait(t);
          post(`/chapter/delete`, { id: t.dataset.chapterid }).then((val) => {
            if (val["ok"]) {
              buttonDone(t, "Wait...");
              window.location.href = `/grammar`;
            } else {
              alert(
                "This chapter has subchapters. Remove them before deleting."
              );
              buttonDone(t, "Delete", "Delete");
              t.classList.remove("confirm");
            }
          });
        } else {
          t.innerHTML = "Really?";
          t.classList.add("confirm");
        }
      },
    },
    {
      selector: "#publish-release",
      callback: (t: HTMLElement) => {
        buttonWait(t);
        const versionNumber = $<HTMLInputElement>(
          "#new-release-version"
        )!.value;
        post(`/chapter/release`, {
          version: versionNumber,
        }).then((val) => {
          if (val["ok"]) {
            buttonDone(t, "Published!");
          } else {
            alert(val);
          }
        });
      },
    },
  ],
  blur: [
    {
      selector: ".md-edit",
      callback: (_t: HTMLElement) => {
        let md = $<HTMLElement>("#md")!;
        let chapter = $<HTMLElement>("#chapter")!;
        let chapterId = $<HTMLElement>("#title")!.dataset.chapterid;
        let path = $<HTMLElement>("#path")!.innerHTML;
        md.classList.add("wait");
        post(`/chapter/mdtohtml`, {
          md: md.innerHTML,
          chapter_id: chapterId,
          path: path,
        }).then((val) => {
          chapter.innerHTML = val["html"];
          md.classList.add("hidden");
          md.classList.remove("wait");
          chapter.classList.remove("hidden");
          saveChapter(0);
        });
      },
    },
    {
      selector: "#citation-text",
      callback: (_t: HTMLElement) => {
        let txt = $<HTMLElement>("#citation-text")!;
        post(`/chapter/update_citation_text`, {
          txt: txt.innerHTML,
        }).then((val) => {
          if (!val["ok"]) {
            alert(val);
          }
        });
      },
    },
  ],
};

const saveChapter = (reload = 1) => {
  window.cys = {};
  const title = $("#title") as HTMLElement;
  const chapterNumberContainer = $("#chapter-number") as HTMLInputElement;
  const chapterParentContainer = $("#chapter-parent") as HTMLInputElement;
  let saveBtn = $("#save-chapter") as HTMLElement;
  buttonWait(saveBtn);
  post(`/chapter/save`, {
    md: $("#md")!.innerHTML,
    html: $("#chapter")!.innerHTML,
    id: title.dataset.chapterid,
    title: title.innerHTML,
    seq: chapterNumberContainer ? chapterNumberContainer.value : null,
    parent_id: chapterParentContainer ? chapterParentContainer.value : null,
    author: $<HTMLInputElement>("#chapter-author")!.value,
  }).then((val) => {
    if (val["ok"]) {
      buttonDone(saveBtn);
      if (reload) {
        location.reload();
      } else {
        formatTrees();
      }
    }
  });
};

const getChapter = (chapterId: string) => {
  window.cys = {};
  post(`/chapter/${chapterId}`, { edit: userIsEditor }).then((data) => {
    if (data.ok) {
      setTitle(data["result"]["title"]);
      let main = $<HTMLElement>("#chapter-main");
      if (main) {
        main.innerHTML = `

        ${
          userIsEditor
            ? `<div><span class="badge badge-small badge-info">Note: this is a <strong>pre-release version</strong> of the grammar. <span style="text-decoration:underline;" class="logout">Sign out</span> to see the current release.</span></div>`
            : ""
        }
        <h1 style="position:relative; margin-top:4px; font-size:2rem; text-align:left;">        <span style="position:absolute; right:0; bottom:0;" class="button button-small button-outline open-citation-modal">❞ Cite</span><span id="path">${
          data["result"]["path"] ?? ""
        }</span> <span ${
          userIsEditor ? `contenteditable="true"` : ``
        } id="title" data-chapterid="${chapterId}">${
          data["result"]["title"] ?? "Coming soon!"
        }
        </h1>
        ${
          userIsEditor
            ? `<label for="chapter-parent">Parent chapter:</label>
        <div class="select"><select id="chapter-parent" name="parent"></select></div>
        <label for="chapter-number">Number:</label>
        <input name="chapter-number" id="chapter-number" type="text"></input>
        <p style="margin:10px 0"><label style="margin-right:2px" for="chapter-author">Main author(s):</label><input style="width:280px" name="chapter-author" id="chapter-author" type="text"></input></p>
        <p style="margin:10px 0;"><span class="button" id="save-chapter">Save</span>
        <span class="button" data-chapterid="${chapterId}" id="delete-chapter">Delete</span>
        <span class="button" id="add-chapter">New chapter</span></p>`
            : ``
        }
        <section style="margin-top:18px;position:relative;" id="chapter" class="${
          userIsEditor ? `chapter-edit` : ``
        }">
            ${data["result"]["html"] ?? ""}
        </section>
        <pre contenteditable="true" id="md" class="hidden ${
          userIsEditor ? `md-edit` : ``
        }" style="white-space:pre-wrap;word-wrap:break-word">${
          data["result"]["md"]
        }</pre>

        </section>
      `;
        if (userIsEditor) {
          let seq = data["result"]["seq"];
          let chapterN = $<HTMLInputElement>("#chapter-number");
          if (chapterN) {
            chapterN.value = seq;
          }

          $<HTMLInputElement>("#chapter-author")!.value =
            data["result"]["author"];
        }

        $$(".menu-span").forEach((itm) => {
          itm.closest(".main-level")!.classList.remove("current");
          itm.classList.remove("current");
        });

        let currentMenuItem = $<HTMLElement>(
          `.menu-span[data-chapterid="${chapterId}"]`
        );
        if (currentMenuItem) {
          currentMenuItem.closest(".main-level")!.classList.add("current");
          currentMenuItem.classList.add("current");
        }

        getParentSelector(chapterId, data["result"]["parent_id"]);

        formatTrees();
      }
    }
  });
};

const getParentSelector = (chapterId: string, parentId: string) => {
  let selectContainer = $("#chapter-parent");
  if (selectContainer !== null) {
    selectContainer.innerHTML += `
      <option value="" ${parentId ? `selected` : ""}>-</option>
    `;
    for (let parent of menuCache) {
      if (parent.id != chapterId) {
        selectContainer.innerHTML += `
                      <option value="${parent.id}" ${
          parentId == parent.id ? `selected` : ""
        }>${parent.path.slice(1)} ${parent.title}</option>
                  `;
      }
    }
  }
};

const getSidebarMenu = () => {
  return post(`/chapter/get_menu`, { edit: userIsEditor }).then((data) => {
    if (data["ok"]) {
      let htmlStr = "";
      menuCache = data["result"];
      let c = 0;
      menuCache.forEach((el) => {
        if (el.level == 1 || el.level == 0) {
          if (c > 0) {
            htmlStr += "</span>";
          }
          htmlStr += `<span class="main-level">`;
        }
        htmlStr += `<span data-chapterid="${el.id}" class="menu-span level-${
          el.level
        }" style="margin-left:${
          Math.max(el.level - 1, 0) * 20
        }px; margin-bottom:${
          el.level == 0 ? `0px` : ``
        }"><span class="chapter-link" data-chapterid="${el.id}">${
          el.parent_id ? el.path.slice(1) : ""
        } ${el.title}</span></span>`;
        c += 1;
      });
      let menu = $("#menu");
      if (menu) {
        menu.innerHTML = htmlStr;
      }
    }
  });
};

const getGrammarVersion = (chapterId: string) => {
  get(`/chapter/get_grammar_version/${chapterId}`).then((data) => {
    if (data && data["ok"]) {
      $$(".grammar-version").forEach((el) => {
        el.innerHTML = data["result"]["version"];
      });
      $$(".grammar-year").forEach((el) => {
        el.innerHTML = data["result"]["year"];
      });
      $$(".grammar-title").forEach((el) => {
        el.innerHTML = data["result"]["title"];
      });

      if (data["result"]["author"]) {
        $$(".grammar-author").forEach((el) => {
          el.innerHTML = data["result"]["author"];
        });
      } else {
        $<HTMLElement>(".chapter-p")!.innerHTML =
          "<span class='info'>This chapter lacks a unique reference; please cite the full book.</span>";
      }
    }
  });
};

export default (params: { [key: string]: string }) => {
  const dateObj = new Date();
  const curDate =
    dateObj.getUTCFullYear() +
    "-" +
    dateObj.getUTCDate() +
    "-" +
    (dateObj.getUTCMonth() + 1);
  const getHtml = () => {
    return `
      <section style="grid-column: span 3">
        <h3 style="margin-top:10px;">Table of contents</h3>
        <div id="menu">${loader()}</div>
        ${
          userIsEditor
            ? `<div style="padding:10px;margin-top:20px;" id="create-release" class="badge-info badge badge-small"><h3 style="margin-bottom:0px;text-align:left;">Publish this version</h3><input style="width:100px;" type="text" id="new-release-version" placeholder="Version n." />
            <span id="publish-release" style="margin-left:3px; margin-top:10px;" class="button-small button button-green">Publish</span>
            </div>`
            : ""
        }
      </section>
      <section id="chapter-main" style="padding: 0 40px; grid-column: 4 / span 10">
        ${loader()}
      </section>
      <svg id="svg-canvas"></svg>
      <div id="citation-modal" class="d-none modal">
          <div class="modal-content">
          <h3 class="centered bold">How to cite the grammar</h3><p></p>
            <div class="row">
              <div class="column chapter-column"><h3 class="centered">This chapter</h3><p></p>
              <p class="chapter-p" style="padding:10px; font-size:13px;"><span class="grammar-author"></span>. <span class="grammar-year"></span>. <span class="grammar-title"></span>. In: Vierros, Marja, Sonja Dahlgren, Erik Henriksson, Polina Yordanova, and Sari Kock (eds). Digital Grammar of Greek Documentary Papyri. (<span class="grammar-version"></span>). Zenodo. <span style="word-break:break-all">https://doi.org/10.5281/zenodo.XXXX (Available online at https://papygreek.com/grammar, Accessed on ${curDate})</span>.
              </p>
              </div>
              <div class="column work-column"><h3 class="centered">The general work</h3><p></p>
                <p style="padding:10px;font-size:13px;">Vierros, Marja, Sonja Dahlgren, Erik Henriksson, Polina Yordanova, and Sari Kock (eds). <span class="grammar-year"></span>. Digital Grammar of Greek Documentary Papyri. (<span class="grammar-version"></span>). Zenodo. <span style="word-break:break-all">https://doi.org/10.5281/zenodo.XXXX (Available online at https://papygreek.com/grammar, Accessed on ${curDate})</span>.
                </p>
              </div>
            </div>
            <span class="button button-grey button-small modal-close"></span>
          </div>
      </div>
  `;
  };

  const afterRender = () => {
    getSidebarMenu().then(() => {
      getChapter(params.id || "1");
      getGrammarVersion(params.id || "1");
    });
  };

  return {
    getHtml,
    afterRender,
  };
};
