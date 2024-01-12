import {
  setTitle,
  loader,
  activateTab,
  haveEditor,
  centeredLoader,
} from "../utils.js";

import { get } from "../api.js";
import { Dict, ApiResult } from "../types.js";

import getText from "./text/view.js";
import getEditor from "./text/editor.js";
import getMeta from "./text/metadata.js";
import getArethusa from "./text/arethusa.js";
import getWorkflow from "./text/workflow.js";
import getXml from "./text/xml.js";
import getTreebank from "./text/treebank.js";
import getArchive from "./text/archive.js";

let docCache: any;

const userIsEditor = haveEditor();

export default (params: Dict<string>) => {
  const tabMap: Dict<any> = {
    "": getText,
    arethusa: getArethusa,
    workflow: getWorkflow,
    xml: getXml,
    editor: getEditor,
    metadata: getMeta,
    treebank: getTreebank,
    archive: getArchive,
  };

  setTitle("Text");

  let tab = "";
  if ("tab" in params) {
    tab = params.tab;
  }

  const getTab = () => {
    const refresh = true;
    if (docCache && !refresh) {
      render();
    } else {
      get(`/text/${params.id}`).then((data: ApiResult) => {
        if (data && data.ok) {
          docCache = data.result;
          render();
        } else {
          alert("An error happened");
        }
      });
    }
  };

  const render = () => {
    $("h1")!.innerHTML = docCache.name.split(".xml")[0];
    $("h1")!.dataset.textid = docCache.id;
    //document.querySelector('#temp').innerHTML = `python3 run.py try_to_merge ${data.result.name} <br> python3 run.py flag_ignore_and_merge ${data.result.name} ${params.id}`
    setTitle(docCache.name);
    $("#document-meta")!.innerHTML = `${
      docCache.provenance
        ? `<span class="badge badge-small badge-yellow">Place: ${docCache.provenance}</span>`
        : ""
    } ${
      (docCache.date_not_before || docCache.date_not_after) &&
      docCache.date_not_before != docCache.date_not_after
        ? `<span class="badge badge-small badge-blue">Date: ${
            docCache.date_not_before || "?"
          } – ${docCache.date_not_after || "?"}</span>`
        : ""
    } ${
      (docCache.date_not_before || docCache.date_not_after) &&
      docCache.date_not_before == docCache.date_not_after
        ? `<span class="badge badge-small badge-blue">Date: ${
            docCache.date_not_before
              ? docCache.date_not_before
              : docCache.date_not_after
          }</span>`
        : ""
    } ${
      docCache.tm
        ? `<span class="badge badge-small badge-red">TM: ${docCache.tm}</span>`
        : ""
    } ${
      docCache.hgv
        ? `<span class="badge badge-small badge-grey">HGV: ${docCache.hgv}</span>`
        : ""
    }`;

    tabMap[tab](docCache, userIsEditor).then((data: string) => {
      $<HTMLElement>("#main")!.innerHTML = data;
    });
  };

  const getHtml = () => {
    return `
      <h1 data-textid="${params.id}">${loader()}</h1>
      <section id="document-meta" class="centered">${loader()}</section>
      <section class="tabs">
          <a data-tab="" href="/text/${params.id}">Text</a>
          <a data-tab="xml" href="/text/${params.id}/xml">Source XML</a>
          <a data-tab="treebank" href="/text/${
            params.id
          }/treebank">Treebank XML</a>
          <a data-tab="arethusa" href="/text/${
            params.id
          }/arethusa"><span style="position:relative; top:2px; display:inline-block; width:80px; height:14px; background-image:url('/static/img/arethsa.png'); background-size: contain; background-repeat: no-repeat"></span></a>
          ${
            userIsEditor
              ? `
          <a data-tab="editor" href="/text/${params.id}/editor">Edit treebank</a>
          `
              : ""
          }
          <a data-tab="metadata" href="/text/${params.id}/metadata">Metadata</a>
          <a data-tab="workflow" href="/text/${params.id}/workflow">Workflow</a>
          ${
            userIsEditor
              ? `<a data-tab="archive" href="/text/${params.id}/archive">Archive</a>`
              : ""
          }
      </section>
      <section id="main">
        ${centeredLoader()}
      </section>
      `;
  };
  const afterRender = () => {
    activateTab(tab);
    getTab();
  };

  return {
    getHtml,
    afterRender,
  };
};
