// Common listeners
export const listeners = {
    click: [
        {
            selector: ".modal",
            callback: (_t, _e, target) => {
                if (!target.closest(".modal-content")) {
                    $$(".modal").forEach((el) => {
                        el.classList.add("d-none");
                    });
                }
            },
        },
        {
            selector: ".modal-close, .modal-cancel, .modal-save",
            callback: (_t) => {
                $$(".modal").forEach((el) => {
                    el.classList.add("d-none");
                });
            },
        },
        {
            selector: ".enlarge-button.maximize",
            callback: (t) => {
                const cont = t.closest(".sentence-tree");
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
            callback: (t) => {
                const cont = t.closest(".sentence-tree");
                cont.classList.remove("enlarged");
                t.classList.add("d-none");
                cont.querySelector(".maximize")?.classList.remove("d-none");
                setTimeout(() => {
                    resizeCy(cont.dataset.treeid || "");
                }, 300);
            },
        },
    ],
    keyup: [
        {
            selector: ".front-filter",
            callback: (t) => {
                let filterItems = $$(".filterable");
                filterItems.forEach((el) => {
                    if ((el.dataset.filterval || "")
                        .toLowerCase()
                        .includes(t.value.toLowerCase())) {
                        el.classList.remove("d-none");
                    }
                    else {
                        el.classList.add("d-none");
                    }
                });
            },
        },
    ],
    keydown: [
        {
            selector: "[contenteditable]",
            callback: (t, e) => {
                if (e.key == "Enter") {
                    if (!t.classList.contains("noenter")) {
                        //don't automatically put in divs
                        e.preventDefault();
                        e.stopPropagation();
                        //insert newline
                        insertTextAtSelection(t, "\n");
                    }
                    else {
                        t.blur();
                    }
                }
            },
        },
    ],
    paste: [
        {
            selector: "*",
            callback: (_t, e) => {
                e.preventDefault();
                //get plaintext from clipboard
                let text = e.clipboardData.getData("text/plain");
                //insert text manually
                insertTextAtSelection(e.target, text);
            },
        },
    ],
    blur: [
        {
            selector: ".noenter",
            callback: (t) => {
                // Remove breaks
                t.querySelectorAll("br").forEach((e) => e.remove());
            },
        },
    ],
};
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};
export const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");
export const haveUser = () => !isEmpty(JSON.parse(localStorage.getItem("user") || "{}"));
export const haveEditor = () => {
    const user = getUser();
    return !isEmpty(user) && user.user.level.includes("editor");
};
export const setTitle = (t) => {
    document.title = `PapyGreek | ${t || ""}`;
};
export const showModalError = (t) => {
    $("#error-modal-content").innerHTML = t;
    $("#error-modal")?.classList.remove("d-none");
};
export const getHash = () => location.hash.substring(1);
export const getEl = (el) => $(el);
export const loader = () => '<div class="loader"></div>';
export const centeredLoader = () => '<div class="centered g-14" style="column-span:all;"><div class="loader"></div></div>';
export const debounce = (func, timeout = 100) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
};
export const activateTab = (val) => {
    $(`a[data-tab="${val}"]`)?.classList.add("active");
};
export const buttonDone = (btn, txt = "Saved!", afterTxt = null) => {
    const prevTxt = btn.dataset.txt ? btn.dataset.txt : btn.innerHTML;
    btn.innerHTML = txt;
    setTimeout(() => {
        btn.innerHTML = afterTxt ?? prevTxt;
    }, 500);
};
export const buttonWait = (btn) => {
    btn.dataset.txt = btn.innerHTML;
    btn.innerHTML = '<span class="loader-white-small"/>';
};
export const downloadAsFile = (data, name) => {
    const aElement = document.createElement("a");
    aElement.setAttribute("download", name);
    const href = URL.createObjectURL(data);
    aElement.href = href;
    aElement.setAttribute("target", "_blank");
    aElement.click();
    URL.revokeObjectURL(href);
};
export const aowRoles = () => {
    return [
        ["addressee", "Addressee"],
        ["writer", "Writer"],
        ["author", "Author"],
        ["official", "External official"],
    ];
};
export const morphColors = {
    "": "black",
    l: "lightblue",
    n: "#2b727c",
    a: "blue",
    p: "purple",
    v: "red",
    d: "darkorange",
    r: "green",
    c: "deeppink",
    i: "gold",
    u: "punctuation",
    x: "grey",
};
export const textTypes = () => {
    return [
        ["1", "ADMINISTRATION"],
        ["1-1", "-- Application"],
        ["1-1-1", "---- Epikrisis"],
        ["1-1-2", "---- For tutor/kyrios"],
        ["1-1-3", "---- Membership"],
        ["1-1-4", "---- Others"],
        ["1-1-5", "---- Registration"],
        ["1-1-6", "---- Seed-Corn"],
        ["1-1-7", "---- To open testament"],
        ["1-2", "-- Appointment"],
        ["1-2-1", "---- Liturgy"],
        ["1-2-2", "---- Work"],
        ["1-3", "-- Bid"],
        ["1-3-1", "---- Purchase"],
        ["1-4", "-- Cancellation"],
        ["1-5", "-- Certificate"],
        ["1-5-1", "---- Diploma"],
        ["1-5-2", "---- Libelli"],
        ["1-5-3", "---- Other"],
        ["1-5-4", "---- Penthemeros/Five naubion"],
        ["1-5-5", "---- Performed public work"],
        ["1-6", "-- Declaration (apographè)"],
        ["1-6-1", "---- Anachoresis"],
        ["1-6-2", "---- Census declaration"],
        ["1-6-3", "---- Declaration of birth"],
        ["1-6-4", "---- Declaration of death"],
        ["1-6-5", "---- Declaration of inundated/overfloaded land"],
        ["1-6-6", "---- Declaration of livestock/camels"],
        ["1-6-7", "---- Epikrisis"],
        ["1-6-8", "---- Property declaration/property returns"],
        ["1-7", "-- Letter"],
        ["1-7-1", "---- Letter of recommendation (official)"],
        ["1-7-2", "---- Official correspondence"],
        ["1-8", "-- List"],
        ["1-8-1", "---- Land/house"],
        ["1-8-2", "---- Property"],
        ["1-8-3", "---- Taxpayers"],
        ["1-9", "-- Memorandum (official)"],
        ["1-10", "-- Notice"],
        ["1-11", "-- Notification"],
        ["1-12", "-- Oath"],
        ["1-12-1", "---- Assumption liturgy/public work"],
        ["1-13", "-- Order"],
        ["1-13-1", "---- Delivery (military supplies)"],
        ["1-13-2", "---- Entagion"],
        ["1-13-3", "---- Payment (military)"],
        ["1-13-4", "---- Summons (order to arrest)"],
        ["1-14", "-- Petition"],
        ["1-14-1", "---- Enteuxis (to the king/queen)"],
        ["1-14-2", "---- Hypomnema"],
        ["1-15", "-- Receipt"],
        ["1-15-1", "---- Custom duty"],
        ["1-15-2", "---- Tax"],
        ["1-16", "-- Report"],
        ["1-16-1", "---- Administrative"],
        ["1-16-2", "---- Official Diary (hypomnema)"],
        ["1-17", "-- Response (official - ypographè)"],
        ["2", "BUSINESS"],
        ["2-1", "-- Account"],
        ["2-1-1", "---- Calculation"],
        ["2-1-2", "---- Goods"],
        ["2-1-3", "---- Incoming/outgoing money"],
        ["2-1-4", "---- Taxes"],
        ["2-1-5", "---- Transport"],
        ["2-2", "-- Acknowledgement"],
        ["2-2-1", "---- Payment"],
        ["2-3", "-- Application"],
        ["2-3-1", "---- Lease/buy"],
        ["2-4", "-- Invoice"],
        ["2-5", "-- Letter"],
        ["2-5-1", "---- Business correspondence"],
        ["2-6", "-- List"],
        ["2-6-1", "---- Expenditure"],
        ["2-6-2", "---- Items"],
        ["2-6-3", "---- Others"],
        ["2-6-4", "---- Payment"],
        ["2-6-5", "---- Wages"],
        ["2-7", "-- Offer"],
        ["2-7-1", "---- Purchase"],
        ["2-8", "-- Order"],
        ["2-8-1", "---- Delivery"],
        ["2-8-2", "---- Others"],
        ["2-8-3", "---- Payment"],
        ["2-8-4", "---- Transfer Credit in Grain"],
        ["2-9", "-- Receipt"],
        ["2-9-1", "---- Items"],
        ["2-9-2", "---- Money"],
        ["2-9-3", "---- of delivery"],
        ["2-9-4", "---- Payment"],
        ["2-9-5", "---- Rent"],
        ["2-10", "-- Register"],
        ["2-10-1", "---- Contracts"],
        ["2-11", "-- Request"],
        ["2-11-1", "---- Payment"],
        ["2-11-2", "---- Refund"],
        ["3", "LAW"],
        ["3-0-1", "---- Obligatory"],
        ["3-1", "-- Acknowledgement"],
        ["3-1-1", "---- Exemption/Release"],
        ["3-1-2", "---- Of debt"],
        ["3-1-3", "---- Of performed duty"],
        ["3-1-4", "---- Other"],
        ["3-2", "-- Application"],
        ["3-2-1", "---- Emancipation"],
        ["3-3", "-- Appointment"],
        ["3-3-1", "---- Representative"],
        ["3-4", "-- Authorization"],
        ["3-4-1", "---- Power of attorney"],
        ["3-5", "-- Contract"],
        ["3-5-1", "---- Adoption"],
        ["3-5-2", "---- Alienation"],
        ["3-5-3", "---- Alimony"],
        ["3-5-4", "---- Appointment (of a guardian/kyrios)"],
        ["3-5-5", "---- Apprenticeship (didaskalikai)"],
        ["3-5-6", "---- Association"],
        ["3-5-7", "---- by arbitration"],
        ["3-5-8", "---- Cession (parachoresis)"],
        ["3-5-9", "---- Debt"],
        ["3-5-10", "---- Deed of gift"],
        ["3-5-11", "---- Deed of surety"],
        ["3-5-12", "---- Deposit"],
        ["3-5-13", "---- Disownment (apokêryxis)"],
        ["3-5-14", "---- Division"],
        ["3-5-15", "---- Divorce"],
        ["3-5-16", "---- Donation: donatio mortis causa (meriteia)"],
        ["3-5-17", "---- Emancipation (Manumissio/Paramone)"],
        ["3-5-18", "---- Lease"],
        ["3-5-19", "---- Loan"],
        ["3-5-20", "---- Marriage"],
        ["3-5-21", "---- Nurture"],
        ["3-5-23", "---- Procuration"],
        ["3-5-24", "---- Promissory note"],
        ["3-5-25", "---- Purchase"],
        ["3-5-26", "---- Recruitment"],
        ["3-5-27", "---- Renunciation"],
        ["3-5-28", "---- Sale"],
        ["3-5-29", "---- Sale on delivery/sale on credit"],
        ["3-5-30", "---- Settlement (Dialysis)"],
        ["3-5-31", "---- Sublease"],
        ["3-5-32", "---- Termination of a contract"],
        ["3-5-33", "---- Transport"],
        ["3-5-34", "---- Uncertain"],
        ["3-5-35", "---- Will (diathêkê)"],
        ["3-5-36", "---- Work"],
        ["3-6", "-- Declaration"],
        ["3-6-1", "---- Prices"],
        ["3-7", "-- List (official)"],
        ["3-7-1", "---- Survey"],
        ["3-8", "-- Nomination"],
        ["3-8-1", "---- Liturgy"],
        ["3-8-2", "---- to office"],
        ["3-9", "-- Register"],
        ["3-9-1", "---- Tax"],
        ["3-10", "-- Registration"],
        ["3-10-1", "---- Property"],
        ["3-11", "-- Report"],
        ["3-11-1", "---- Legal proceedings"],
        ["3-11-2", "---- Medical"],
        ["3-12", "-- Request"],
        ["3-12-1", "---- Exemption/Release"],
        ["4", "LAW/ADMINISTRATION"],
        ["4-1", "-- Order (law/administration)"],
        ["4-1-1", "---- Decree"],
        ["4-1-2", "---- Edict"],
        ["4-1-3", "---- Programma - imperial decision"],
        ["4-2", "-- Registration"],
        ["4-2-1", "---- Loan"],
        ["4-2-2", "---- Private business"],
        ["4-2-3", "---- Purchase"],
        ["5", "MILITARY"],
        ["5-1", "-- Diploma"],
        ["6", "PRIVATE"],
        ["6-1", "-- Letter"],
        ["6-1-1", "---- Invitation"],
        ["6-1-2", "---- Letter of condolence"],
        ["6-1-3", "---- Letter of recommendation (private)"],
        ["6-1-4", "---- Private correspondence"],
        ["6-2", "-- List"],
        ["6-2-1", "---- Names"],
        ["6-3", "-- Memorandum (private)"],
        ["6-4", "-- School text"],
        ["7", "RELIGION"],
        ["7-1", "-- Dedication"],
        ["7-2", "-- Mummy label"],
        ["7-3", "-- Oracle"],
        ["7-4", "-- Dream"],
        ["7-4-1", "---- List"],
        ["7-4-2", "---- Description"],
        ["8", "UNCERTAIN"],
        ["8-1", "-- Mixed"],
        ["8-2", "-- Uncertain"],
        ["8-2-1", "---- Uncertain"],
    ];
};
// Plaintext contenteditables (https://stackoverflow.com/a/64001839)
export const insertTextAtSelection = (div, txt) => {
    //get selection area so we can position insert
    let sel = window.getSelection();
    let text = div.textContent || "";
    let before = Math.min(sel.focusOffset, sel.anchorOffset);
    let after = Math.max(sel.focusOffset, sel.anchorOffset);
    //ensure string ends with \n so it displays properly
    let afterStr = text.substring(after);
    if (afterStr == "")
        afterStr = "\n";
    //insert content
    div.textContent = text.substring(0, before) + txt + afterStr;
    //restore cursor at correct position
    sel.removeAllRanges();
    let range = document.createRange();
    //childNodes[0] should be all the text
    range.setStart(div.childNodes[0], before + txt.length);
    range.setEnd(div.childNodes[0], before + txt.length);
    sel.addRange(range);
    console.log(div.innerHTML);
};
export const formatTrees = () => {
    const classMapper = (postag) => {
        const colorMap = {
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
        }
        catch {
            return "black";
        }
    };
    $$(".sentence-tree").forEach((itm) => {
        const treeId = itm.dataset.treeid;
        itm.innerHTML =
            "<span class='enlarge-button maximize'></span><span class='enlarge-button minimize d-none'></span><div style='height:100%;width:100%;overflow:hidden;' class='tree-container'></div>";
        let treeCont = itm.querySelector(".tree-container");
        const error = "<span class='info'>[Failed to load sentence tree]</span>";
        let json = itm.dataset.json;
        if (json) {
            const q = JSON.parse(window.atob(json));
            let elements = [
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
            window.cys[treeId] = cytoscape({
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
                            "control-point-distances": (edge) => edge.data("distances") || [0, 0],
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
            const adjustEdgeCurve = function (edge) {
                const { x: x0, y: y0 } = edge.source().position();
                const { x: x1, y: y1 } = edge.target().position();
                const x = x1 - x0;
                const y = y1 - y0;
                const z = Math.sqrt(x * x + y * y);
                const costheta = x / z;
                edge.style("control-point-distances", [-0.1 * y * costheta]);
                edge.style("control-point-weights", [0.5]);
            };
            window.cys[treeId].ready(() => {
                window.cys[treeId].edges().forEach(adjustEdgeCurve);
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
                window.cys[treeId].nodes(`[id='node${id}']`).addClass("hl-node");
            }
            for (let id of q["highlight_edges"].split(",")) {
                let ids = id.split("/");
                window.cys[treeId]
                    .edges(`[id='edge${ids[0]},${ids[1]}']`)
                    .addClass("hl-edge");
            }
        }
        else {
            itm.innerHTML = error;
        }
    });
};
export const resizeCy = (cy) => {
    window.cys[cy].ready(() => {
        window.cys[cy].animate({
            fit: {
                padding: 30,
            },
            easing: "ease-in-out-quad",
            duration: 500,
        });
    });
};
