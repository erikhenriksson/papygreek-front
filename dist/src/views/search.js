import { setTitle, getUser, textTypes, aowRoles, buttonDone, buttonWait, isEmpty, formatTrees, } from "../utils.js";
import { get, post } from "../api.js";
import "https://cdn.jsdelivr.net/npm/simple-datatables@7";
import "https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.0/nouislider.min.js";
window.cys = {};
const sliderChange = (t) => {
    const slider = document.getElementById("slider");
    const handle = t.dataset.handle;
    slider.noUiSlider.setHandle(handle, t.value);
};
const getColor = (value) => {
    //value from 0 to 1
    var hue = ((value / 100) * 120).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
};
const percentageCircle = (val) => {
    if (!val || !val.length) {
        return "";
    }
    else {
        const perc = Math.round(val * 100);
        const color = perc == 100 ? "dodgerblue" : getColor(perc);
        return perc != 100
            ? `<span class="p-bar"><span class="p-bar-bar" style='color:transparent;background-color:${color};width:${perc}%'>-</span><span style="color: black" class="p-bar-text">${perc}%</span></span> `
            : `<span class="p-bar"><span class="p-bar-bar" style="background:lightgrey; font-variant:small-caps;font-size:9px;text-align:center;">manual</span></span>`;
    }
};
/*
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
*/
export const listeners = {
    click: [
        {
            selector: "#export-csv",
            callback: (_t) => {
                // @ts-ignore
                const data = simpleDatatables.exportCSV(window.datatable, {
                    lineDelimiter: "\n",
                    columnDelimiter: ";",
                });
                const blob = new Blob([data], {
                    type: "text/plain;charset=utf8", // or whatever your Content-Type is
                });
                const aElement = document.createElement("a");
                aElement.setAttribute("download", "PG-search-results.csv");
                const href = URL.createObjectURL(blob);
                aElement.href = href;
                aElement.setAttribute("target", "_blank");
                aElement.click();
                URL.revokeObjectURL(href);
            },
        },
        {
            selector: ".show-tree",
            callback: (t) => {
                let queryData = {
                    layer: t.dataset.layer,
                    text_id: t.dataset.textid,
                    sentence_n: t.dataset.sentencen,
                    token_id: t.dataset.tokenid,
                };
                post(`/search/get_sentence_tree`, queryData).then((data) => {
                    if (data && data.ok) {
                        const cont = document.querySelector("#sentence-tree");
                        const contInner = document.querySelector("#sentence-tree-content");
                        console.log(data);
                        contInner.innerHTML = data["result"];
                        cont.classList.remove("d-none");
                        formatTrees();
                    }
                });
            },
        },
        {
            selector: ".del-node",
            callback: (t) => {
                let cont = $("#tf-tree > ul");
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
            callback: (t) => {
                let childUl = t.closest("li").getElementsByTagName("ul");
                if (childUl.length) {
                    let li = createTreeLi();
                    childUl[0].appendChild(li);
                }
                else {
                    let ul = document.createElement("ul");
                    ul.appendChild(createTreeLi());
                    t.closest("li").appendChild(ul);
                }
            },
        },
        {
            selector: ".sl",
            callback: (t) => {
                const el1 = t.closest("span.tf-nc");
                const el2 = t.closest("li").previousSibling.firstElementChild;
                swapElements(el1, el2);
            },
        },
        {
            selector: ".sr",
            callback: (t) => {
                const el1 = t.closest("span.tf-nc");
                const el2 = t.closest("li").nextSibling
                    .firstElementChild;
                swapElements(el1, el2);
            },
        },
        {
            selector: ".st",
            callback: (t) => {
                const el1 = t.closest("span.tf-nc");
                const el2 = t.closest("li").parentElement
                    .firstElementChild;
                swapElements(el1, el2);
            },
        },
        {
            selector: "#save-search",
            callback: (t) => {
                saveSearch(t);
            },
        },
        {
            selector: "#delete-search",
            callback: (t) => {
                if (confirm("Do you wish to delete this search?") == true) {
                    post(`/search/delete`, { id: t.dataset.searchid }).then((data) => {
                        if (data && data.ok) {
                            window.location.href = `/search`;
                        }
                        else {
                            alert("An unknown error happened. Sorry about that.");
                        }
                    });
                }
            },
        },
        {
            selector: "#datebars #freq-buttons > span",
            callback: (t) => {
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
            callback: (t) => {
                const graph = $(".freq-graph:not(.d-none)").innerHTML;
                const clonedGraph = $("#cloned-graph .freq-graph");
                clonedGraph.innerHTML = graph;
                // @ts-ignore
                domtoimage
                    .toPng(clonedGraph, { height: 400, width: 1880, bgcolor: "white" })
                    .then(function (dataUrl) {
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
                    .catch(function (error) {
                    console.error("oops, something went wrong!", error);
                });
            },
        },
        {
            selector: "#tree-search",
            callback: () => {
                window.cys = {};
                const getDateGraph = (dateFreq, index, suffix) => {
                    const maxVal = Math.max(...dateFreq.map((d) => {
                        return d[index];
                    }));
                    const decimals = index == 3 ? 4 : 0;
                    //console.log(dateFreq);
                    //console.log(maxVal);
                    return `
          <div class="barchart-Wrapper">
            <div class="barchart-TimeCol">
            ${[1, 0.8, 0.6, 0.4, 0.2]
                        .map((e) => {
                        return `
                  <div class="barchart-Time">
                    <span class="barchart-TimeText">${parseFloat((maxVal * e).toFixed(decimals))}${suffix}</span>
                  </div>`;
                    })
                        .join("")}
            </div>
            <div class="barChart-Container">
              <div class="barchart">
                ${dateFreq
                        .map((d) => {
                        let percentage = (d[index] / (maxVal || 1)) * 100;
                        return `
                  <div class="barchart-Col">
                    ${index == 2
                            ? `<div class="barchart-BarHeader">${Math.round(d[index])}</div>`
                            : ""}
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
                let msg = $("#msg");
                let btn = $("#tree-search");
                let info = $(".info");
                info.innerHTML = "";
                msg.innerHTML = "";
                btn.innerHTML = 'Searching <span class="loader-white-small"/>';
                window.datatable.search("");
                window.datatable.destroy();
                window.datatable.init(datatableOptions);
                let dt = $(".datatable-wrapper");
                dt.classList.add("d-none");
                dt.classList.remove("d-block");
                $("#datebars")?.classList.add("d-none");
                post(`/search/`, getSearch()).then((data) => {
                    let layer = $('input[name="layer"]:checked').value;
                    if (data && data.ok) {
                        const resultData = data.result.data;
                        if (!resultData.length) {
                            info.innerHTML = `No results`;
                            btn.innerHTML = "Search";
                            return;
                        }
                        const dateFreq = data.result.date_frequencies;
                        $("#relative-frequencies").innerHTML = getDateGraph(dateFreq, 3, "%");
                        $("#absolute-frequencies").innerHTML = getDateGraph(dateFreq, 2, "");
                        $("#datebars")?.classList.remove("d-none");
                        if (resultData.length > 10000) {
                            info.innerHTML = `${resultData.length} tokens. (Upper limit for tabulation is 10000.)`;
                        }
                        else {
                            let result = resultData.map((item) => {
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
                                    percentageCircle(item.orig_postag_confidence) || "",
                                    item.orig_relation || "",
                                    item.reg_lemma || "",
                                    item.reg_postag || "",
                                    percentageCircle(item.reg_postag_confidence) || "",
                                    item.reg_relation || "",
                                    item.date_not_before || "",
                                    item.date_not_after || "",
                                    item.place_name || "",
                                    //item.regularization || "",
                                ];
                            });
                            dt.classList.add("d-block");
                            dt.classList.remove("d-none");
                            window.datatable.insert({ data: result });
                        }
                    }
                    else {
                        msg.innerHTML = data;
                        msg.classList.remove("hidden");
                        $("#datebars")?.classList.add("d-none");
                    }
                    btn.innerHTML = "Search";
                });
            },
        },
        {
            selector: "#help, .help-link",
            callback: () => {
                $("#instructions-modal").classList.remove("d-none");
            },
        },
        {
            selector: "#search-list",
            callback: () => {
                get(`/search/get_saved`).then((data) => {
                    if (data.ok) {
                        if (data.result.length) {
                            $("#user-searches").innerHTML = `
              <ul class="search-list">
              ${data.result
                                .map((s) => {
                                return `<li> <a href="/search/${s.id}">${s.name || "[Untitled]"} <span class="badge badge-small badge-grey">${s.id}</span></a> ${s.public
                                    ? `<span class="badge badge-small">public</span>`
                                    : ""}</li>`;
                            })
                                .join("")}
                </ul>
            `;
                        }
                        else {
                            $("#user-searches").innerHTML = `<span class="info">You haven't yet saved any searches.</span>`;
                        }
                    }
                    get(`/search/get_others_public`).then((data) => {
                        if (data.ok) {
                            if (data.result.length) {
                                $("#public-searches").innerHTML = `
                <ul class="search-list">
                ${data.result
                                    .map((s) => {
                                    return `<li> <a href="/search/${s.id}">${s.name || "[Untitled]"}<span class="badge badge-small badge-grey">${s.id}</span></a> <span class="badge badge-small badge-green">${s.user_name}</span>
                    </li>`;
                                })
                                    .join("")}
                  </ul>
                `;
                            }
                            else {
                                $("#public-searches").innerHTML = `<span class="info">No saved public searches.</span>`;
                            }
                        }
                    });
                    $("#searches-modal").classList.remove("d-none");
                });
            },
        },
    ],
    keydown: [
        {
            selector: "#search-name",
            callback: (t, e) => {
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
    /*
    keyup: [
      {
        selector: ".node-text",
        callback: () => {
          changeVariationSearchMode();
        },
      },
    ],
    */
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
            "Conf.",
            "O Rel",
            "R Lemma",
            "R Postag",
            "Conf.",
            "R Rel",
            "Y >",
            "< Y",
            "Place",
        ],
    },
    template: (options, dom) => `
    <div class='${options.classes.top}'>
      ${options.searchable
        ? `<div class='${options.classes.search}'>
              <input class='${options.classes.input}' placeholder='${options.labels.placeholder}' type='search' title='${options.labels.searchTitle}'${dom.id ? ` aria-controls="${dom.id}"` : ""}> <span style="margin-left:10px;" id="export-csv" class="button button-small button-plain">Export as CSV</span>
              </div>`
        : ""}
      ${options.paging ? `<div class='${options.classes.info}'></div>` : ""}
      <nav class='${options.classes.pagination}'></nav>
    </div>
    <div class='${options.classes.container}'${options.scrollY.length
        ? ` style='height: ${options.scrollY}; overflow-Y: auto;'`
        : ""}></div>
        <div class='${options.classes.bottom}'>
            ${options.paging
        ? `<div class='${options.classes.info}'></div>`
        : ""}
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
const swapElements = (el1, el2) => {
    let el1Clone = el1.cloneNode(true);
    let el2Clone = el2.cloneNode(true);
    el2.parentNode.replaceChild(el1Clone, el2);
    el1.parentNode.replaceChild(el2Clone, el1);
};
const sliderInit = () => {
    const slider = document.getElementById("slider");
    const input0 = document.getElementById("slider-dnb");
    const input1 = document.getElementById("slider-dna");
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
    slider.noUiSlider.on("update", function (values, handle) {
        let val = Math.round(values[handle]);
        if (handle == 0) {
            if (val == -500) {
                inputs[handle].classList.add("disabled");
            }
            else {
                inputs[handle].classList.remove("disabled");
            }
        }
        if (handle == 1) {
            if (val == 1000) {
                inputs[handle].classList.add("disabled");
            }
            else {
                inputs[handle].classList.remove("disabled");
            }
        }
        inputs[handle].value = `${val}`;
    });
};
const createResultTreeLi = (txt, active) => {
    return `
    <li>
      <span class="tf-nc ${active ? "active" : ""}">
        ${txt.relation
        ? `<div><span class="res-relation">${txt.relation}</span></div>`
        : ""}
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
const jsonToHtml = (json, t, tokenId = 0) => {
    let li;
    if (tokenId) {
        li = createResultTreeLi(json["q"], tokenId == json["q"]["id"]);
    }
    else {
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
const htmlToJson = (el, t) => {
    if (el.tagName == "UL") {
        if (!t.endsWith("{")) {
            t += ",";
        }
        t += '"children":[';
    }
    if (el.tagName == "LI") {
        t += "{";
        let str = el
            .querySelector(".node-text")
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
    let ul = $("#tf-tree > ul");
    let t = "{" + htmlToJson(ul, "").slice(1) + "}";
    let q = JSON.parse(t)["children"][0];
    return {
        q: q,
        layer: $('input[name="layer"]:checked').value,
        "series-type": $('input[name="series-type"]:checked')
            .value,
        dna: $("input#slider-dna").value,
        dnb: $("input#slider-dnb").value,
        "text-type": $("#text-type").value,
        "place-name": $("#place-name").value,
        "text-status": $('input[name="text-status"]:checked')
            .value,
        "person-role": $("#person-role").value,
        "person-id": $("#person-id").value,
        "person-certainty": $('input[name="person-certainty"]:checked').value,
    };
};
const updateSearchBadge = (id, user_id, name) => {
    $("#saved-search-name").innerHTML = name;
    $("#saved-search-id").innerHTML = id;
    if (user_id == getUser().user.id) {
        $("#delete-search").classList.remove("d-none");
    }
    else {
        $("#delete-search").classList.add("d-none");
    }
    $("#delete-search").dataset.searchid = id;
    $("#saved-search-badge").classList.remove("d-none");
};
const saveSearch = (t) => {
    buttonWait(t);
    const name = $("#search-name").innerText;
    post(`/search/check_if_exists`, {
        q: getSearch(),
        name: name,
        public: +$("#public").checked,
    }).then((data) => {
        if (data && data.ok) {
            if (data.result.length) {
                if (confirm(`The search named "${name}" will be overwritten. Continue?`) != true) {
                    buttonDone(t, "Cancelled!");
                    return;
                }
            }
            post(`/search/save`, {
                q: getSearch(),
                name: name,
                public: +$("#public").checked,
            }).then((data) => {
                if (data && data.ok) {
                    if (data.result.new == 1) {
                        history.pushState(null, "", `/search/${data.result.id}`);
                        buttonDone(t, "Saved!");
                    }
                    else {
                        buttonDone(t, "Updated!");
                    }
                    updateSearchBadge(data.result.id, getUser().user.id, $("#search-name").innerText);
                }
            });
        }
    });
};
export default (params) => {
    setTitle("Search");
    let user = getUser();
    const dataTableInit = () => {
        // @ts-ignore
        return new simpleDatatables.DataTable("#datatable", datatableOptions);
    };
    const treeInit = () => {
        let root = $("#tf-tree > ul");
        if (params.id) {
            get(`/search/get_by_id/${params.id}`).then((data) => {
                if (data && data.ok && data.result.length) {
                    let result = data.result[0];
                    $("#search-name").innerText = result.name;
                    if (result["public"]) {
                        $("#public").checked = true;
                    }
                    let json = JSON.parse(result["query"]);
                    root.innerHTML = jsonToHtml(json["q"], "");
                    $("#" + json["layer"]).checked = true;
                    if ("series-type" in json) {
                        $("#series-type-" + json["series-type"]).checked = true;
                    }
                    $("#text-type").value = json["text-type"];
                    $("#person-role").value = json["person-role"];
                    $("#person-id").value = json["person-id"];
                    $("#place-name").value = json["place-name"];
                    $("#text-status-" + json["text-status"]).checked =
                        true;
                    $("#person-certainty-" + json["person-certainty"]).checked = true;
                    const dna = $("#slider-dna");
                    const dnb = $("#slider-dnb");
                    dna.value = json["dna"];
                    dnb.value = json["dnb"];
                    sliderChange(dna);
                    sliderChange(dnb);
                    updateSearchBadge(result["id"], result["user_id"], result["name"]);
                    //changeVariationSearchMode();
                }
                else {
                    window.location.href = `/search`;
                }
            });
        }
        root.appendChild(createTreeLi());
    };
    const getHtml = () => {
        let userButtons = !isEmpty(user) ? `` : `hidden`;
        return `
      <h1 style="margin-left:10px;">Search <span id="help">?</span></h1>
      <section class="centered ${userButtons}" style="margin-top:-9px;">
        <span id="search-list" class="button button-small button-outline">Saved searches</span>
      </section>
      <section id="saved-search-badge" class="d-none centered">
        <span style="font-size:85%;" class="semi-bold">Saved search: </span><span id="saved-search-name" class="badge-small"></span> <span class="semi-bold" style="font-variant:small-caps; font-size:85%;">id: </span> <span class="badge-small badge-grey" id="saved-search-id"></span> <span id="delete-search" class="badge badge-small badge-red" style="cursor:pointer;">x</span>
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
        <div style="font-size:90%" class="fullwidth">
          <table id="datatable"></table>
        </div>
      </section>
      <div id="sentence-tree" class="modal d-none">
          <div class="tf-tree tf-result modal-content" id="tf-tree2">
            <a href="#" title="Close" class="modal-close"></a>
            <div id="sentence-tree-content"></div>
          </div>
      </div>
      <div id="overlay" class="d-none"></div>
      <div id="cloned-graph" class="d-none"><div class="freq-graph"></div></div>
      <div id="searches-modal" class="d-none modal">
          <div class="modal-content">
            <span class="button button-grey button-small modal-close"></span>
            <h2 class="centered">Saved searches</h2>
            <h3 class="centered">My searches</h3>
            <div id="user-searches"></div>
            <h3 class="centered">Other users' public searches</h3>
            <div id="public-searches"></div>
          </div>
      </div>
      <div id="instructions-modal" class="d-none modal">
          <div class="modal-content">
          <h2>PapyGreek Search - User Guide</h2>
          <p></p>
          <p>Welcome to PapyGreek Search, an advanced tool for the linguistic study of Greek papyri. This user guide provides instructions on how to use PapyGreek Search to explore basic word forms, linguistic annotations, variants, and syntactic dependency relationships.</p>
        
          
          <h3>How to Search</h3>
          
          <ol>
              <li>
                <h4>Linguistic Layer Selection</h4>
                <ul>
                    <li>At the top of the interface, you will see options to select either the "Original" or "Regularized" linguistic layer. This choice will determine whether your search targets the original text or the version of the text that has been corrected by editors.</li>
                    <li>Click on the desired option to select it.</li>
                </ul>
            </li>
              <li>
                  <h4>Basic Search</h4>
                  <ul>
                      <li>In the blue box at the center of the interface, type your search parameters in the format: <code>parameter=[value]</code>. For example, to search for the basic word form και in the non-corrected original text, select "Original" from the top selection, then type <code>form=και</code> in the blue box (without the quotation marks). The <code>form</code> parameter is used to search for specific word forms within the database.</li>
                      <li>Diacritics are ignored in search queries, so only include alphabetic characters.</li>
                      <li>The wildcard symbol <code>%</code> and underscore <code>_</code> can be used. <code>%</code> matches any string of characters, while <code>_</code> skips a single character. For example, <code>form=κ_μη%</code> will find forms such as κώμης and καμήλια.</li>
                      <li>Click on the "Search" button to initiate the search.</li>
                  </ul>
              </li>
              <li>
                  <h4>Variation Search</h4>
                  <ul>
                      <li>To search for linguistic variants, use the <code>form</code> parameter in combination with symbols representing editorial actions: <code>+</code> (plus) for additions, <code>-</code> (minus) for deletions. For example, <code>form=-ι</code> would yield all instances where ι has been deleted by an editor, while <code>form=+ι</code> would reveal all cases where ι was added.</li>
                      <li>To find editorial replacements, use a combination of the <code>-</code> and <code>+</code> symbols. For example, to find instances where ε has been replaced by η, the search term would be <code>form=-ε+η</code>.</li>
                      <li>To further refine the search based on context, use the symbols <code>></code> (before) and <code><</code> (after). For instance, to find instances where ε has been corrected to αι following λ, the query would be <code>form=λ>-ε+αι</code>.</li>
                      <li>Regular expressions can be used through the <code>regex:form=</code> parameter, allowing you to create more intricate and specific search criteria. Detailed examples of this will be provided later in this guide. </li>
                      <li>For variation searches, the selection between "Original" and "Regularized" at the top of the interface is disregarded.  </li>
                  </ul>
              </li>
              <li>
                  <h4>Morphosyntactic Search (Single Words)</h4>
                  <ul>
                      <li>To search for morphology and syntax of single word forms, use the parameters <code>lemma</code>, <code>lemma_plain</code>, <code>postag</code>, and <code>relation</code>.</li>
                      <li>The <code>lemma</code> and <code>lemma_plain</code> parameters are for searching dictionary forms with diacritics (e.g., <code>lemma=εἰμί</code>) and without diacritics (e.g., <code>lemma_plain=ειμι</code>), respectively.</li>
                      <li>The <code>postag</code> parameter targets part of speech tags. Refer to <a target="_blank" data-external="1" href="https://github.com/gcelano/LemmatizedAncientGreekXML">this list</a> for the available tags and codes. The wildcard symbol <code>%</code> is particularly useful with this parameter (e.g., <code>postag=v%</code> to find all verbs).</li>
                      <li>The <code>relation</code> parameter targets syntactic relations as encoded in the dependency treebank annotation style. For example, to find predicates, you can type <code>relation=PRED</code>.</li>
                  </ul>
              </li>
              <li>
                  <h4>Dependency Tree Search</h4>
                  <ul>
                      <li>To search for dependency trees, add additional "blue boxes" to your search.</li>
                      <li>Click the "+" button at the bottom of the existing blue box to add a new one below it. You can add as many boxes as needed to construct your desired tree structure.</li>
                      <li>In each box, use any of the previously mentioned parameters. For example, to search for (sub)trees where an object is dependent on a predicate, type <code>relation=PRED</code> in the first box, add a new box below it, and there type <code>relation=OBJ</code>.</li>
                      <li>The parameter <code>depth</code> allows users to specify the depth in the tree in which the box in question is in regard to the parent node. The default is <code>1</code> (immediately below). It can either have a number (for instance, <code>2</code> would skip one level), or the asterisk symbol (<code>*</code>), which means that the depth will be ignored and all nodes that have the specified parent will be matched.</li>
                      <li>By default, word order is ignored; parameters specifying word order are currently under development.</li>
                  </ul>
              </li>
          </ol>

          <h3>A Basic Guide to Regular Expressions in PapyGreek Search</h3>

          <p>Regular expressions, or regex, are sequences of characters defining a search pattern. This can be very helpful in searching texts. In PapyGreek Search, regular expressions can be used with the "regex:form=" parameter.</p>
          
          <ul>
              <li><code>^</code>: Matches the start of a string.</li>
              <li><code>$</code>: Matches the end of a string.</li>
              <li><code>[ ]</code>: Matches any single character enclosed in the square brackets. For example, <code>[αεηιοω]</code> matches all Greek vowels.</li>
              <li><code>( )</code>: Defines a group that you can quantify.</li>
              <li><code>+</code>: Matches one or more of the preceding element.</li>
              <li><code>-</code>: Used in character ranges, e.g., <code>[α-ω]</code> matches any lowercase Greek letter.</li>
          </ul>
          
          <p>In PapyGreek Search, the symbols <code>+</code> (plus) and <code>-</code> (minus) have special meaning in the context of searching for editorial additions and removals. However, in regex mode, you can use the symbols <code>＋</code> (Full-width Plus, U+FF0B) and <code>－</code> (Full-width Hyphen-minus, U+FF0D) to act as the regular <code>+</code> and <code>-</code> in regular expressions. The PapyGreek Search system will transform these full-width symbols back into their regular regex counterparts. </p>
          
          <p>If the <code>regex:form=</code> parameter is used in conjunction with a variation search (involving the symbols <code>+</code>, <code>-</code>, <code><</code>, and <code>></code>), each of the queried substrings (for example, after <code>+</code> or before <code><</code>) must be determined with their own regex search pattern. </p>
          <h3>Example of a Complex Regex Query</h3>

          <p>Let's consider a relatively complex example. You want to find all cases of the original transcription containing either ω or ωι corrected to ου, and only when this correction appears word-finally. Here's how you would form the query:</p>

          <ol>
              <li>Use the parameter <code>regex:form=</code> to initiate the regex mode.</li>
              <li>Since you're searching for replacements and their right-hand context, you will be using the symbols <code>+</code>, <code>-</code> and <code><</code>.</li>
              <li>The removed string is either ω or ωι, which translates to <code>^(ω|ωι)$</code> in the regex syntax. This means the start of the string (<code>^</code>) followed by ω or ωι (<code>ω|ωι</code>) and then the end of the string (<code>$</code>).</li>
              <li>The added string is ου, which is written as <code>^ου$</code> in regex. This means the string starts (<code>^</code>) with ου and then immediately ends (<code>$</code>).</li>
              <li>You want the right-hand context to be empty, which in regex is typed as <code>^$</code> (starts and ends without anything in between).</li>
          </ol>

          <p>The full query, then, is: <code>regex:form=-^(ω|ωι)$+^ου$<^$</code>.</p>
          
          <span class="button button-grey button-small modal-close"></span>
          </div>
      </div>
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
