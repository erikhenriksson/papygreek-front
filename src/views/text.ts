import {
  setTitle,
  loader,
  activateTab,
  getUser,
  isEmpty,
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

  let user = getUser();

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
    $("h1")!.innerHTML = docCache.name;
    $("h1")!.dataset.textid = docCache.id;
    //document.querySelector('#temp').innerHTML = `python3 run.py try_to_merge ${data.result.name} <br> python3 run.py flag_ignore_and_merge ${data.result.name} ${params.id}`
    setTitle(docCache.name);
    $("#document-meta")!.innerHTML = `
      [Metadata placeholder]
    `;

    tabMap[tab](docCache, user).then((data: string) => {
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
            !isEmpty(user)
              ? `
          <a data-tab="editor" href="/text/${params.id}/editor">Edit treebank</a>
          `
              : ""
          }
          <a data-tab="metadata" href="/text/${params.id}/metadata">Metadata</a>
          <a data-tab="workflow" href="/text/${params.id}/workflow">Workflow</a>
          ${
            !isEmpty(user)
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
