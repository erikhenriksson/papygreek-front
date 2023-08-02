import route from "./router.js";
import { Dict, Listeners } from "./types.js";

import { listeners as accountListeners } from "./views/account.js";
import { listeners as grammarListeners } from "./views/grammar.js";
import { listeners as peopleListeners } from "./views/people.js";
import { listeners as personListeners } from "./views/person.js";
import { smythLinkListener } from "./views/smyth.js";
import { listeners as searchListeners } from "./views/search.js";
import { listeners as utilsListeners } from "./utils.js";
import { listeners as textArchiveListeners } from "./views/text/archive.js";
import { listeners as textArethusaListeners } from "./views/text/arethusa.js";
import { listeners as textEditorListeners } from "./views/text/editor.js";
import { listeners as textMetadataListeners } from "./views/text/metadata.js";
import { listeners as textWorkflowListeners } from "./views/text/workflow.js";
import { listeners as textXmlListeners } from "./views/text/xml.js";
import { listeners as textViewListeners } from "./views/text/view.js";

let listeners: Dict<any> = {};
let viewListeners = [
  accountListeners,
  grammarListeners,
  peopleListeners,
  personListeners,
  searchListeners,
  utilsListeners,
  textArchiveListeners,
  textArethusaListeners,
  textEditorListeners,
  textMetadataListeners,
  textWorkflowListeners,
  textXmlListeners,
  textViewListeners,
].flat();

for (let listener of viewListeners) {
  for (let k in listener) {
    if (k in listeners) {
      let s = listener[k as keyof Listeners] || [];
      listeners[k].push(...s);
    } else {
      listeners[k] = listener[k as keyof Listeners];
    }
  }
}

declare var google: any;

export default () => {
  // History
  window.onpopstate = () => {
    route(location.pathname, false);
  };

  window.onload = () => {};

  // Listeners
  for (let listenerType in listeners) {
    document.addEventListener(
      listenerType,
      (event) => {
        const target = event.target as Element;

        if (listenerType == "click" && target.closest("a")) {
          event.preventDefault();
          if (target.closest("#smyth-menu a, #smyth-main a")) {
            smythLinkListener(target.closest("#smyth-menu a, #smyth-main a")!);
          } else if (target.closest("#chapter a")) {
            window.open(target.closest("a")!.getAttribute("href") || "");
            return;
          } else {
            const a = target.closest("a")!;
            if (a.classList.contains("datatable-sorter")) return;
            if (a.classList.contains("datatable-pagination-list-item-link"))
              return;
            const href = a.getAttribute("href") || "";
            const newTab = (a.getAttribute("target") || "") == "_blank";
            const external = (a.getAttribute("data-external") || "") == "1";
            const nocache = (a.getAttribute("data-nocache") || "") == "1";
            if (newTab) {
              if (external) {
                window.open(href);
              } else {
                window.open(`https://${window.location.hostname}${href}`);
              }
            } else {
              route(href, true, nocache);
            }
          }
        }
        for (let listener of listeners[listenerType]) {
          if (target.closest(listener.selector)) {
            listener["callback"](
              target.closest(listener.selector),
              event,
              target
            );
          }
        }
      },
      true
    );
  }
};
