import {
  setTitle,
  loader,
  getUser,
  buttonDone,
  buttonWait,
  isEmpty,
} from "../utils.js";
import { get, post } from "../api.js";
import { Listeners, Dict } from "../types.js";

let menuCache: Array<any> = [];
let cys: Dict<any> = {};

const user = getUser();

const resizeCy = (cy: string) => {
  cys[cy].ready(() => {
    cys[cy].animate({
      fit: {
        padding: 30,
      },
      easing: "ease-in-out-quad",
      duration: 500,
    });
  });
};

export const listeners: Listeners = {
  click: [
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
      selector: ".enlarge-button.maximize",
      callback: (t: HTMLElement) => {
        const cont = t.closest<HTMLElement>(".sentence-tree")!;
        cont.classList.add("enlarged");
        t.classList.add("d-none");
        cont.querySelector(".minimize")?.classList.remove("d-none");
        setTimeout(() => {
          resizeCy(cont.dataset.treeid || "");
        }, 300);
      },
    },

    {
      selector: ".enlarge-button.minimize",
      callback: (t: HTMLElement) => {
        const cont = t.closest<HTMLElement>(".sentence-tree")!;
        cont.classList.remove("enlarged");
        t.classList.add("d-none");
        cont.querySelector(".maximize")?.classList.remove("d-none");
        setTimeout(() => {
          resizeCy(cont.dataset.treeid || "");
        }, 300);
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
  ],
};

const formatTrees = () => {
  const classMapper = (postag: string) => {
    const colorMap: { [key: string]: string } = {
      l: "article",
      n: "noun",
      a: "adjective",
      p: "pronoun",
      v: "verb",
      d: "adverb",
      r: "preposition",
      c: "conjunction",
      i: "interjection",
      u: "punctuation",
      x: "irregular",
    };
    try {
      return colorMap[postag[0]];
    } catch {
      return "black";
    }
  };

  $$<HTMLElement>(".sentence-tree").forEach((itm) => {
    const treeId = itm.dataset.treeid!;
    itm.innerHTML =
      "<span class='enlarge-button maximize'></span><span class='enlarge-button minimize d-none'></span><div style='height:100%;width:100%;overflow:hidden;' class='tree-container'></div>";
    let treeCont = itm.querySelector<HTMLElement>(".tree-container")!;
    const error = "<span class='info'>[Failed to load sentence tree]</span>";
    let json = itm.dataset.json;
    if (json) {
      const q = JSON.parse(window.atob(json));

      let elements: { [key: string]: any } = [
        {
          data: { id: "node0", label: "" },
          classes: "parent",
        },
        {
          data: { id: "lab0", label: "[ROOT]", parent: "node0" },
          classes: "child",
        },
      ];
      for (let n of q["result"]) {
        // Parent node shows the relation
        elements.push({
          data: {
            id: "node" + n["n"],
            label: n["relation"],
          },
          classes: "parent",
        });
        // Child node shows the form
        elements.push({
          data: {
            id: "lab" + n["n"],
            parent: "node" + n["n"],
            label: n["form"],
          },
          classes: [classMapper(n["postag"]), "child"],
        });
      }

      for (let n of q["result"]) {
        let head = !n["head"] ? "0" : n["head"];
        elements.push({
          data: {
            id: `edge${head},${n["n"]}`,
            source: "node" + head,
            target: "node" + n["n"],
            label: n["relation"],
          },
        });
      }

      const layout = {
        name: "elk",
        elk: {
          algorithm: "layered",
          "elk.direction": "DOWN",
          "elk.layered.crossingMinimization.forceNodeModelOrder": true,
        },
        nodeDimensionsIncludeLabels: true,
        spacingFactor: 0.9,
      };
      // @ts-ignore
      cys[treeId] = cytoscape({
        container: treeCont,
        autoungrabify: true,
        autounselectify: true,
        panningEnabled: true,
        elements: elements,
        pixelRatio: "auto",
        zoom: 1,
        fit: true,
        padding: 30,
        layout: layout,
        style: [
          {
            selector: ".parent",
            css: {
              color: "#555",
              content: "data(label)",
              "text-valign": "top",
              "text-halign": "center",
              "border-color": "#fff",
              "background-color": "#fff",
              "text-border-style": "solid",
              "text-border-opacity": 1,
              "text-border-width": "3px",
              "text-border-color": "#fff",
              "background-opacity": "1",
              "border-opacity": "0",
              "text-outline-color": "#fff",
              "text-background-opacity": 1,
              "text-background-color": "#ffffff",
              "padding-top": "0px",
              "padding-bottom": "0px",
              "padding-left": "0px",
              "padding-right": "0px",
              "font-size": "11px",
              shape: "roundrectangle",
              "z-index": 1,
              "z-compound-depth": "top",
            },
          },
          {
            selector: ".child",
            css: {
              content: "data(label)",
              "text-valign": "center",
              "text-halign": "center",
              "background-opacity": "0",
              "z-index": 2,
              "z-compound-depth": "top",
              "padding-top": "0px",
              "padding-bottom": "0px",
              "padding-left": "0px",
              "padding-right": "0px",
            },
          },
          {
            selector: "edge",
            css: {
              width: 1,
              "line-color": "#333",
              "curve-style": "unbundled-bezier",
              "control-point-distances": (edge: any) =>
                edge.data("distances") || [0, 0],
              "control-point-weights": [0.25, 0.75],
              "z-index": 9,
            },
          },
          {
            selector: ".verb",
            css: {
              color: "red",
            },
          },
          {
            selector: ".pronoun",
            css: {
              color: "purple",
            },
          },
          {
            selector: ".adverb",
            css: {
              color: "darkorange",
            },
          },
          {
            selector: ".preposition",
            css: {
              color: "green",
            },
          },
          {
            selector: ".conjunction",
            css: {
              color: "deeppink",
            },
          },
          {
            selector: ".interjection",
            css: {
              color: "gold",
            },
          },
          {
            selector: ".irregular",
            css: {
              color: "gray",
            },
          },
          {
            selector: ".adjective",
            css: {
              color: "blue",
            },
          },
          {
            selector: ".article",
            css: {
              color: "lightblue",
            },
          },
          {
            selector: ".noun",
            css: {
              color: "#2b727c",
            },
          },
          {
            selector: ".hl-node",
            style: { "background-color": "silver" },
          },
          {
            selector: ".hl-node",
            style: {
              "text-margin-y": "-2px",
              "padding-top": "1px",
              "padding-bottom": "1px",
              "padding-left": "5px",
              "padding-right": "5px",
            },
          },
          {
            selector: ".hl-edge",
            style: { width: 3 },
          },
        ],
      });

      const adjustEdgeCurve = function (edge: any) {
        const { x: x0, y: y0 } = edge.source().position();
        const { x: x1, y: y1 } = edge.target().position();
        const x = x1 - x0;
        const y = y1 - y0;
        const z = Math.sqrt(x * x + y * y);
        const costheta = x / z;

        edge.style("control-point-distances", [-0.1 * y * costheta]);
        edge.style("control-point-weights", [0.5]);
      };

      cys[treeId].ready(() => {
        cys[treeId].edges().forEach(adjustEdgeCurve);
      });

      /*
      cy.on("mouseover", "node", function (e: any) {
        var sel = e.target!;
        cy.elements()
          .difference(sel.outgoers())
          .not(sel)
          .addClass("semitransp");
        sel.addClass("highlight").outgoers().addClass("highlight");
      });
      */
      //cy.edges("[id='edge17']").addClass("highlight");

      for (let id of q["highlight_nodes"].split(",")) {
        cys[treeId].nodes(`[id='node${id}']`).addClass("hl-node");
      }
      for (let id of q["highlight_edges"].split(",")) {
        let ids = id.split("/");
        cys[treeId].edges(`[id='edge${ids[0]},${ids[1]}']`).addClass("hl-edge");
      }
    } else {
      itm.innerHTML = error;
    }
  });
};

const saveChapter = (reload = 1) => {
  const title = $("#title") as HTMLElement;
  const chapterNumberContainer = $("#chapter-number") as HTMLInputElement;
  const chapterParentContainer = $("#chapter-parent") as HTMLInputElement;
  let saveBtn = $("#save-chapter") as HTMLElement;

  post(`/chapter/save`, {
    md: $("#md")!.innerHTML,
    html: $("#chapter")!.innerHTML,
    id: title.dataset.chapterid,
    title: title.innerHTML,
    seq: chapterNumberContainer ? chapterNumberContainer.value : null,
    parent_id: chapterParentContainer ? chapterParentContainer.value : null,
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
  get(`/chapter/${chapterId}`).then((data) => {
    if (data.ok) {
      setTitle(data["result"]["title"]);
      let main = $<HTMLElement>("#chapter-main");
      if (main) {
        main.innerHTML = `
        <h1 style="margin-top:4px; font-size:2rem; text-align:left;"><span id="path">${
          data["result"]["path"]
        }</span> <span ${
          !isEmpty(user) ? `contenteditable="true"` : ``
        } id="title" data-chapterid="${chapterId}">${data["result"]["title"]}
        </h1>
        ${
          !isEmpty(user)
            ? `<label for="chapter-parent">Parent chapter:</label>
        <div class="select"><select id="chapter-parent" name="parent"></select></div>
        <label for="chapter-number">Number:</label>
        <input name="chapter-number" id="chapter-number" type="text"></input>
        <p style="margin:10px 0;"><span class="button" id="save-chapter">Save</span>
        <span class="button" data-chapterid="${chapterId}" id="delete-chapter">Delete</span>
        <span class="button" id="add-chapter">New chapter</span></p>`
            : ``
        }
        <section style="margin-top:18px;" id="chapter" class="${
          !isEmpty(user) ? `chapter-edit` : ``
        }">
            ${data["result"]["html"]}
        </section>
        <pre contenteditable="true" id="md" class="hidden ${
          !isEmpty(user) ? `md-edit` : ``
        }" style="white-space:pre-wrap;word-wrap:break-word">${
          data["result"]["md"]
        }</pre>
        </section>
      `;
        if (!isEmpty(user)) {
          let seq = data["result"]["seq"];
          let chapterN = $<HTMLInputElement>("#chapter-number");
          if (chapterN) {
            chapterN.value = seq;
          }
        }

        $$(".menu-span").forEach((itm) => {
          itm.classList.remove("current");
        });

        let currentMenuItem = $<HTMLElement>(
          `.menu-span[data-chapterid="${chapterId}"]`
        );
        if (currentMenuItem) {
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
  return get(`/chapter/get_menu`).then((data) => {
    if (data["ok"]) {
      let htmlStr = "";
      menuCache = data["result"];
      menuCache.forEach((el) => {
        htmlStr += `<span data-chapterid="${
          el.id
        }" class="menu-span" style="display:block; margin-left:${
          Math.max(el.level - 1, 0) * 20
        }px; margin-bottom:${
          el.level == 0 ? `0px` : ``
        }"><span class="chapter-link" data-chapterid="${el.id}">${
          el.parent_id ? el.path.slice(1) : ""
        } ${el.title}</span></span>`;
      });
      let menu = $("#menu");
      if (menu) {
        menu.innerHTML = htmlStr;
      }
    }
  });
};

export default (params: { [key: string]: string }) => {
  const getHtml = () => {
    if (!isEmpty(user)) {
      return `
      <section style="grid-column: span 3">
        <h3 style="margin-top:10px;">Chapters</h3>
        <div id="menu">${loader()}</div>
      </section>
      <section id="chapter-main" style="padding: 0 40px; grid-column: 4 / span 10">
        ${loader()}
      </section>
      <svg id="svg-canvas"></svg>
  `;
    } else {
      return `<section style="text-align:center;">Coming soon!</section>`;
    }
  };

  const afterRender = () => {
    getSidebarMenu().then(() => {
      getChapter(params.id || "1");
    });
  };

  return {
    getHtml,
    afterRender,
  };
};
