import {
  setTitle,
  getUser,
  textTypes,
  aowRoles,
  buttonDone,
  buttonWait,
  isEmpty,
} from "../utils.js";
import { get, post } from "../api.js";
import { Dict, ApiResult, Listeners } from "../types.js";

import "https://cdn.jsdelivr.net/npm/simple-datatables@7";
import "https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.0/nouislider.min.js";

const sliderChange = (t: HTMLInputElement) => {
  const slider = document.getElementById("slider") as any;
  const handle = t.dataset.handle;
  slider.noUiSlider.setHandle(handle, t.value);
};

const changeVariationSearchMode = () => {
  let isVariationSearch = false;
  document.querySelectorAll<HTMLElement>(".node-text").forEach((e) => {
    if (e.innerText.includes("+") || e.innerText.includes("-")) {
      isVariationSearch = true;
    }
    document.querySelectorAll<HTMLElement>(".variant-search").forEach((e) => {
      if (isVariationSearch) {
        e.classList.remove("d-none");
      } else {
        e.classList.add("d-none");
      }
    });
  });
};

export const listeners: Listeners = {
  click: [
    {
      selector: ".show-tree",
      callback: (t: HTMLElement) => {
        let queryData = {
          layer: t.dataset.layer,
          text_id: t.dataset.textid,
          sentence_n: t.dataset.sentencen,
          token_id: t.dataset.tokenid,
        };
        post(`/search/get_sentence_tree`, queryData).then((data: ApiResult) => {
          if (data && data.ok) {
            /*
            let json = val["result"];
            let root = document.querySelector<HTMLElement>("#tf-tree2 > ul")!;
      
            root.innerHTML = jsonToHtml(json, "", t.dataset.tokenid || "");
            document
              .querySelector<HTMLElement>("#sentence-tree")!
              .classList.remove("d-none");
            */
          }
        });
      },
    },
    {
      selector: ".del-node",
      callback: (t: HTMLElement) => {
        let cont = $("#tf-tree > ul")!;
        if (cont.firstElementChild?.isSameNode(t.closest("li"))) {
          return;
        }
        let childCount = t.closest("ul")?.children.length;
        let parent = t.closest("ul");
        t.closest("li")?.remove();
        if (childCount == 1) {
          parent?.remove();
        }
      },
    },
    {
      selector: ".add-node",
      callback: (t: HTMLElement) => {
        let childUl = t.closest("li")!.getElementsByTagName("ul");
        if (childUl.length) {
          let li = createTreeLi();
          childUl[0].appendChild(li);
        } else {
          let ul = document.createElement("ul");
          ul.appendChild(createTreeLi());
          t.closest("li")!.appendChild(ul);
        }
      },
    },
    {
      selector: ".sl",
      callback: (t: HTMLElement) => {
        const el1 = t.closest<HTMLElement>("span.tf-nc")!;
        const el2 = (
          t.closest<HTMLElement>("li")!.previousSibling as HTMLElement
        ).firstElementChild! as HTMLElement;
        swapElements(el1, el2);
      },
    },
    {
      selector: ".sr",
      callback: (t: HTMLElement) => {
        const el1 = t.closest<HTMLElement>("span.tf-nc")!;
        const el2 = (t.closest<HTMLElement>("li")!.nextSibling as HTMLElement)
          .firstElementChild! as HTMLElement;
        swapElements(el1, el2);
      },
    },
    {
      selector: ".st",
      callback: (t: HTMLElement) => {
        const el1 = t.closest<HTMLElement>("span.tf-nc")!;
        const el2 = (t.closest<HTMLElement>("li")!.parentElement as HTMLElement)
          .firstElementChild! as HTMLElement;
        swapElements(el1, el2);
      },
    },
    {
      selector: "#save-search",
      callback: (t: HTMLElement) => {
        saveSearch(t);
      },
    },
    {
      selector: "#datebars #freq-buttons > span",
      callback: (t: HTMLElement) => {
        if (!t.classList.contains("bold")) {
          $$("#datebars .freq-graph")?.forEach((e) => {
            e.classList.add("d-none");
          });
          $(`#datebars #${t.dataset.freqgraph}`)?.classList.remove("d-none");
          $$("#datebars #freq-buttons > span")?.forEach((e) => {
            e.classList.remove("bold");
          });
          t.classList.add("bold");
        }
      },
    },
    {
      selector: "#download-freq-graph",
      callback: (t: HTMLElement) => {
        const graph = $(".freq-graph:not(.d-none)")!.innerHTML;
        const clonedGraph = <HTMLElement>$("#cloned-graph .freq-graph")!;
        clonedGraph.innerHTML = graph;
        // @ts-ignore
        domtoimage
          .toPng(clonedGraph, { height: 400, width: 1880, bgcolor: "white" })
          .then(function (dataUrl: string) {
            var link = document.createElement("a");
            link.download = "graph.png";
            link.href = dataUrl;
            link.click();
            buttonDone(t, "Done!");

            //var img = new Image();
            //img.src = dataUrl;
            //var w = window.open("");
            //w!.document.write(img.outerHTML);
          })
          .catch(function (error: any) {
            console.error("oops, something went wrong!", error);
          });
      },
    },
    {
      selector: "#tree-search",
      callback: () => {
        const getDateGraph = (
          dateFreq: Dict<any>,
          index: number,
          suffix: string
        ) => {
          const maxVal = Math.max(
            ...dateFreq.map((d: Dict<any>) => {
              return d[index];
            })
          );

          const decimals = index == 3 ? 4 : 0;

          console.log(dateFreq);
          console.log(maxVal);

          return `
          <div class="barchart-Wrapper">
            <div class="barchart-TimeCol">
            ${[1, 0.8, 0.6, 0.4, 0.2]
              .map((e) => {
                return `
                  <div class="barchart-Time">
                    <span class="barchart-TimeText">${parseFloat(
                      (maxVal * e).toFixed(decimals)
                    )}${suffix}</span>
                  </div>`;
              })
              .join("")}
            </div>
            <div class="barChart-Container">
              <div class="barchart">
                ${dateFreq
                  .map((d: any) => {
                    let percentage: number = (d[index] / (maxVal || 1)) * 100;
                    return `
                  <div class="barchart-Col">
                    ${
                      index == 2
                        ? `<div class="barchart-BarHeader">${Math.round(
                            d[index]
                          )}</div>`
                        : ""
                    }
                    <div class="barchart-Bar html-bar" style="height: ${percentage}%;"></div>
                    <div class="barchart-BarFooter">
                    <h3>${d[0]}<br>${d[1]}</h3>
                  </div>
                </div>
                  `;
                  })
                  .join("")}
              </div>
            </div>
          </div>
        `;
        };

        let msg = $("#msg")!;
        let btn = $("#tree-search")!;
        let info = $(".info")!;
        info.innerHTML = "";
        msg.innerHTML = "";
        btn.innerHTML = 'Searching <span class="loader-small"/>';
        window.datatable.search("");
        window.datatable.destroy();
        window.datatable.init(datatableOptions);
        let dt = $(".datatable-wrapper")!;
        dt.classList.add("d-none");
        dt.classList.remove("d-block");
        $("#datebars")?.classList.remove("d-none");
        post(`/search/`, getSearch()).then((data) => {
          let layer = $<HTMLInputElement>('input[name="layer"]:checked')!.value;
          const resultData = data.result.data;
          if (data && data.ok) {
            if (!resultData.length) {
              info.innerHTML = `No results`;
              $("#datebars")?.classList.add("d-none");
              return;
            }

            const dateFreq = data.result.date_frequencies;
            $<HTMLElement>("#relative-frequencies")!.innerHTML = getDateGraph(
              dateFreq,
              3,
              "%"
            );
            $<HTMLElement>("#absolute-frequencies")!.innerHTML = getDateGraph(
              dateFreq,
              2,
              ""
            );

            if (resultData.length > 10000) {
              info.innerHTML = `${resultData.length} tokens. (Upper limit for tabulation is 10000.)`;
            } else {
              let result = resultData.map((item: Dict<string>) => {
                console.log(item);
                return [
                  `<a data-link-newtab href="/text/${item.text_id}" target="_blank">${item.name}</a>`,
                  `<span data-sentencen="${item.sentence_n}" data-textid="${item.text_id}" data-layer="${layer}" data-tokenid="${item.id}" class="show-tree button button-plain button-small">${item.sentence_n}-${item.n}</span>`,
                  item.orig_form || "",
                  item.reg_form || "",
                  (item.rdgs || "")
                    .replace("$", "")
                    .split(",")
                    .filter((s) => s)
                    .join(", "),
                  item.orig_lemma || "",
                  item.orig_postag || "",
                  item.orig_relation || "",
                  item.reg_lemma || "",
                  item.reg_postag || "",
                  item.reg_relation || "",
                  item.date_not_before || "",
                  item.date_not_after || "",
                ];
              });
              dt.classList.add("d-block");
              dt.classList.remove("d-none");
              window.datatable.insert({ data: result });
            }
          } else {
            msg.innerHTML = data["detail"];
            msg.classList.remove("hidden");
            $("#datebars")?.classList.add("d-none");
          }
          btn.innerHTML = "Search";
        });
      },
    },
  ],
  keydown: [
    {
      selector: "#search-name",
      callback: (t: HTMLInputElement | HTMLElement, e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveSearch(t);
        }
      },
    },
  ],
  change: [
    {
      selector: ".slider-input",
      callback: sliderChange,
    },
  ],
  keyup: [
    {
      selector: ".node-text",
      callback: () => {
        changeVariationSearchMode();
      },
    },
  ],
};

const datatableOptions = {
  perPage: 1000,
  //perPageSelect: 0,
  fixedColumns: false,
  data: {
    headings: [
      "Text",
      "Pos",
      "Orig",
      "Reg",
      "Rdgs",
      "O Lemma",
      "O Postag",
      "O Rel",
      "R Lemma",
      "R Postag",
      "R Rel",
      "Y >",
      "< Y",
    ],
  },
  template: (options: Dict<any>, dom: Dict<any>) => `
    <div class='${options.classes.top}'>
      ${
        options.searchable
          ? `<div class='${options.classes.search}'>
              <input class='${options.classes.input}' placeholder='${
              options.labels.placeholder
            }' type='search' title='${options.labels.searchTitle}'${
              dom.id ? ` aria-controls="${dom.id}"` : ""
            }>
              </div>`
          : ""
      }
      ${options.paging ? `<div class='${options.classes.info}'></div>` : ""}
      <nav class='${options.classes.pagination}'></nav>
    </div>
    <div class='${options.classes.container}'${
    options.scrollY.length
      ? ` style='height: ${options.scrollY}; overflow-Y: auto;'`
      : ""
  }></div>
        <div class='${options.classes.bottom}'>
            ${
              options.paging
                ? `<div class='${options.classes.info}'></div>`
                : ""
            }
            <nav class='${options.classes.pagination}'></nav>
        </div>`,
  labels: {
    placeholder: "Filter...",
    perPage: "entries per page",
    noRows: "No tokens found",
    info: "{rows} tokens (showing {start}-{end})",
    noResults: "No results match your search query",
  },
};

const swapElements = (el1: HTMLElement, el2: HTMLElement) => {
  let el1Clone = el1.cloneNode(true);
  let el2Clone = el2.cloneNode(true);
  el2.parentNode!.replaceChild(el1Clone, el2);
  el1.parentNode!.replaceChild(el2Clone, el1);
};

const sliderInit = () => {
  const slider = document.getElementById("slider") as any;
  const input0 = document.getElementById("slider-dnb") as HTMLInputElement;
  const input1 = document.getElementById("slider-dna") as HTMLInputElement;
  const inputs = [input0, input1];
  // @ts-ignore
  noUiSlider.create(slider, {
    start: [-400, 1200],
    step: 1,
    connect: true,
    tooltips: false,
    animate: false,
    margin: 1,
    keyboardSupport: false,
    range: {
      min: -400,
      max: 1200,
    },
  });
  slider.noUiSlider.on("update", function (values: any, handle: any) {
    let val = Math.round(values[handle]);
    if (handle == 0) {
      if (val == -500) {
        inputs[handle]!.classList.add("disabled");
      } else {
        inputs[handle]!.classList.remove("disabled");
      }
    }
    if (handle == 1) {
      if (val == 1000) {
        inputs[handle]!.classList.add("disabled");
      } else {
        inputs[handle]!.classList.remove("disabled");
      }
    }
    inputs[handle].value = `${val}`;
  });
};

const createResultTreeLi = (txt: Dict<string>, active: boolean) => {
  return `
    <li>
      <span class="tf-nc ${active ? "active" : ""}">
        ${
          txt.relation
            ? `<div><span class="res-relation">${txt.relation}</span></div>`
            : ""
        }
        <span class="res-text">${txt.form}</span>
      </span>
    `;
};

const createTreeLi = (txt = "") => {
  const els = [
    ["node-text", txt],
    ["add-node", "+"],
    ["del-node", "✖"],
    ["st", "↑"],
    ["sr", "→"],
    ["sl", "←"],
  ];
  let li = document.createElement("li");
  let spancontainer = document.createElement("span");
  spancontainer.classList.add("tf-nc");

  for (let el of els) {
    let s = document.createElement("span");
    s.classList.add(el[0]);
    if (!["node-text"].includes(el[0])) {
      s.classList.add("tf-b");
    }
    let t = document.createTextNode(el[1]);
    s.appendChild(t);
    if (["node-text"].includes(el[0])) {
      s.contentEditable = "true";
      s.classList.add("noenter");
    }
    spancontainer.appendChild(s);
  }
  li.appendChild(spancontainer);
  return li;
};

const jsonToHtml = (json: Dict<any>, t: string, tokenId = 0) => {
  let li: string;
  if (tokenId) {
    li = createResultTreeLi(json["q"], tokenId == json["q"]["id"]);
  } else {
    li = createTreeLi(json["q"]).outerHTML.slice(0, -5);
  }

  t += li;
  if ("children" in json && json["children"].length) {
    t += "<ul>";
    for (let child of json["children"]) {
      t = jsonToHtml(child, t, tokenId);
    }
    t += "</ul>";
  }
  t += "</li>";
  return t;
};

const htmlToJson = (el: Element, t: string) => {
  if (el.tagName == "UL") {
    if (!t.endsWith("{")) {
      t += ",";
    }
    t += '"children":[';
  }
  if (el.tagName == "LI") {
    t += "{";
    let str = el
      .querySelector<HTMLElement>(".node-text")!
      .innerText.replace(/\s/g, "");
    t += `"q":"${str}"`;
  }
  for (let child of el.children) {
    t = htmlToJson(child, t);
  }
  if (el.tagName == "LI") {
    t += "}";
    if (el.nextSibling) {
      t += ",";
    }
  }
  if (el.tagName == "UL") {
    t += "]";
  }
  return t;
};

const getSearch = () => {
  let ul = $("#tf-tree > ul") as HTMLElement;
  let t = "{" + htmlToJson(ul, "").slice(1) + "}";
  let q = JSON.parse(t)["children"][0];
  return {
    q: q,
    layer: $<HTMLInputElement>('input[name="layer"]:checked')!.value,
    "series-type": $<HTMLInputElement>('input[name="series-type"]:checked')!
      .value,
    dna: $<HTMLInputElement>("input#slider-dna")!.value,
    dnb: $<HTMLInputElement>("input#slider-dnb")!.value,
    "text-type": $<HTMLInputElement>("#text-type")!.value,
    "place-name": $<HTMLInputElement>("#place-name")!.value,
    "text-status": $<HTMLInputElement>('input[name="text-status"]:checked')!
      .value,
    "person-role": $<HTMLInputElement>("#person-role")!.value,
    "person-id": $<HTMLInputElement>("#person-id")!.value,
    "person-certainty": $<HTMLInputElement>(
      'input[name="person-certainty"]:checked'
    )!.value,
    regularization: +$<HTMLInputElement>("#regularization")!.checked,
  };
};

const updateSearchBadge = (id: string, name: string) => {
  $<HTMLElement>("#saved-search-name")!.innerHTML = name;
  $<HTMLElement>("#saved-search-id")!.innerHTML = id;
  $<HTMLElement>("#saved-search-badge")!.classList.remove("d-none");
};

const saveSearch = (t: HTMLElement) => {
  buttonWait(t);
  post(`/search/save`, {
    q: getSearch(),
    name: $<HTMLElement>("#search-name")!.innerText,
    public: +$<HTMLInputElement>("#public")!.checked,
  }).then((data: ApiResult) => {
    if (data && data.ok) {
      if (data.result.new == 1) {
        history.pushState(null, "", `/search/${data.result.id}`);
        buttonDone(t, "Saved!");
      } else {
        buttonDone(t, "Updated!");
      }
      updateSearchBadge(
        data.result.id,
        $<HTMLElement>("#search-name")!.innerText
      );
    }
  });
};

export default (params: Dict<string>) => {
  setTitle("Search");
  let user = getUser();

  const dataTableInit = () => {
    // @ts-ignore
    return new simpleDatatables.DataTable("#datatable", datatableOptions);
  };

  const treeInit = () => {
    let root = $<HTMLElement>("#tf-tree > ul")!;
    if (params.id) {
      get(`/search/get_by_id/${params.id}`).then((data: ApiResult) => {
        if (data && data.ok && data.result.length) {
          let result = data.result[0];
          $<HTMLElement>("#search-name")!.innerText = result.name;
          if (result["public"]) {
            $<HTMLInputElement>("#public")!.checked = true;
          }

          let json = JSON.parse(result["query"]);

          root.innerHTML = jsonToHtml(json["q"], "");
          $<HTMLInputElement>("#" + json["layer"])!.checked = true;
          if ("series-type" in json) {
            $<HTMLInputElement>(
              "#series-type-" + json["series-type"]
            )!.checked = true;
          }
          if (json["regularization"]) {
            $<HTMLInputElement>("#regularization")!.checked = true;
          }
          $<HTMLInputElement>("#text-type")!.value = json["text-type"];
          $<HTMLInputElement>("#person-role")!.value = json["person-role"];
          $<HTMLInputElement>("#person-id")!.value = json["person-id"];
          $<HTMLInputElement>("#place-name")!.value = json["place-name"];
          $<HTMLInputElement>("#text-status-" + json["text-status"])!.checked =
            true;
          $<HTMLInputElement>(
            "#person-certainty-" + json["person-certainty"]
          )!.checked = true;
          const dna = $<HTMLInputElement>("#slider-dna")!;
          const dnb = $<HTMLInputElement>("#slider-dnb")!;
          dna.value = json["dna"];
          dnb.value = json["dnb"];
          sliderChange(dna);
          sliderChange(dnb);
          updateSearchBadge(result["id"], result["name"]);
          changeVariationSearchMode();
        } else {
          window.location.href = `/search`;
        }
      });
    }
    root.appendChild(createTreeLi());
  };

  const getHtml = () => {
    let userButtons = !isEmpty(user) ? `` : `hidden`;
    return `
      <h1>Search</h1>
      <section id="saved-search-badge" class="d-none centered">
        <span class="semi-bold">Saved search: </span><span id="saved-search-name" class="badge-small"></span> <span class="semi-bold" style="font-variant:small-caps">id: </span> <span class="badge-small badge-grey" id="saved-search-id"></span>
      </section>
      <section class="search">
        <div style="padding-bottom:20px;">
          <input checked type="radio" id="orig" name="layer" value="orig">
          <label for="orig">Original</label>
          <input type="radio" id="reg" name="layer" value="reg">
          <label for="reg">Regularized</label>
        </div>
        <div class="tf-tree tf-custom" id="tf-tree">
          <ul></ul>
        </div>
        <div style="padding:4px 0 0;" class="variant-search d-none">
          <input type="checkbox" id="regularization" name="regularization">
          <label style="margin-left:6px;" for="regularization">Only regularizations</label>
        </div>
        <div style="padding:20px 0 0;">
          <div style="font-weight:500; padding-bottom:8px;">Place</div>
          <input style="max-width:30%;" type="text" id="place-name"/>
        </div>
        <div style="padding:10px 0;">
          <div style="font-weight:500">Date</div>
          <div id="slider"></div>
          <div><input data-handle="0" class="slider-input" style="width:50px;" type="text" id="slider-dnb"/>
          <input data-handle="1" class="slider-input" style="width:50px;"  type="text" id="slider-dna"/></div>
        </div>
        <div style="padding:10px 0;">
          <label for="text-type"><span style="font-weight:500">Text type</span></label>
          <div class="select"><select name="text-type" id="text-type">
            <option value="">Any</option>
            ${textTypes()
              .map((t) => {
                return `<option value="${t[0]}">${t[1]}</option>`;
              })
              .join("")}
          </select></div>
          <span style="margin-left:10px;" class="semi-bold">Status: </span>
          <input checked="" type="radio" id="text-status-" name="text-status" value="">
          <label for="text-status-">Any</label>
          <input type="radio" id="text-status-0" name="text-status" value="0">
          <label for="text-status-0">Normal</label>
          <input type="radio" id="text-status-1" name="text-status" value="1">
          <label for="text-status-1">Draft</label>
          <input type="radio" id="text-status-2" name="text-status" value="2">
          <label for="text-status-2">Copy</label>
        </div>
        <div style="padding:10px 0;">
          <label for="person-id"><span style="font-weight:500">Person <span style="font-variant:small-caps">id</span></span></label>
          <input value="" style="width:50px;" type="text" id="person-id"/>
          <label style="margin-left:5px;" for="person-role"><span style="font-weight:500">Role</span></label>
          <div class="select"><select name="person-role" id="person-role">
              <option value="">Any</option>
          ${aowRoles()
            .map((t) => {
              return `<option value="${t[0]}">${t[1]}</option>`;
            })
            .join("")}
          </select></div>
          <span style="margin-left:10px;" class="semi-bold">Certainty: </span>
          <input checked="" type="radio" id="person-certainty-" name="person-certainty" value="">
          <label for="person-certainty-">Any</label>
          <input type="radio" id="person-certainty-0" name="person-certainty" value="0">
          <label for="person-certainty-0">Certain</label>
          <input type="radio" id="person-certainty-1" name="person-certainty" value="1">
          <label for="person-certainty-1">Uncertain</label>
        </div>
        <div style="padding:20px 0;">
          <input checked type="radio" id="series-type-documentary" name="series-type" value="documentary">
          <label for="series-type-documentary">Documentary papyri</label>
          <input type="radio" id="series-type-literary" name="series-type" value="literary">
          <label for="series-type-literary">Literary papyri</label>
          <input type="radio" id="series-type-inscription" name="series-type" value="inscription">
          <label for="series-type-inscription">Inscriptions</label>
          <input type="radio" id="series-type-" name="series-type" value="">
          <label for="series-type-">Any</label>
        </div>
        <div style="padding:30px 0;">
          <span id="tree-search" class="button">Search</span>
          <span class="userButtons ${userButtons}">
            <span id="save-search" class="button">Save</span>
            <span class="editable noenter" id="search-name" contenteditable="true"></span>
            <input type="checkbox" id="public" name="public">
            <label style="margin-left:6px;" for="public">Public</label>
          </span>
        </div>
        <div class="hidden" id="msg"></div>
        <div style="padding-bottom:20px;" class="info"></div>
        <div style="padding-bottom:20px;" id="datebars" class="d-none">
            <div id="freq-buttons" class="centered">
              <span data-freqgraph="relative-frequencies" class="button button-small button-plain bold">Relative frequencies</span>
              <span data-freqgraph="absolute-frequencies" class="button button-small button-plain">Absolute frequencies</span>
              <div style="border:1px solid silver; color:grey;" id="download-freq-graph" class="button button-small button-plain">↓</div>
            </div>
            <div class="freq-graph" id="relative-frequencies"></div>
            <div class="d-none freq-graph" id="absolute-frequencies"></div>
        </div>
        <div style="font-size:90%">
          <table id="datatable"></table>
        </div>
      </section>
      <div id="sentence-tree" class="modal d-none">
          <div class="tf-tree tf-result modal-content" id="tf-tree2">
            <a href="#" title="Close" class="modal-close"></a>
            <ul></ul>
          </div>
      </div>
      <div id="overlay" class="d-none"></div>
      <div id="cloned-graph" class="d-none"><div class="freq-graph"></div></div>
    `;
  };

  const afterRender = () => {
    window.datatable = dataTableInit();
    sliderInit();
    treeInit();
  };

  return {
    getHtml,
    afterRender,
  };
};
