import { get, getFile } from "../../api.js";
import { downloadAsFile, buttonWait, buttonDone } from "../../utils.js";
import { ApiResult, Listeners } from "../../types.js";

export const listeners: Listeners = {
  click: [
    {
      selector: ".download-backup",
      callback: (t: HTMLElement) => {
        getFile(t.dataset.href || "").then((data) => {
          downloadAsFile(data, "treebank-backup.xml");
        });
      },
    },
  ],
};

export default async (doc: any) => {
  return get(`/text/${doc.id}/archive`).then((data: ApiResult) => {
    if (data && data.ok && data.result.length) {
      return `
        <div class="centered">
        ${data.result
          .map((el: any) => {
            return `<p><span style="cursor:pointer;color:firebrick" class="download-backup" data-href="/text/${doc.id}/archive/${el.id}">${el.created}</a></p>`;
          })
          .join("")}
        </div>`;
    } else {
      return '<p style="text-align:center;">No archived treebanks.</p>';
    }
  });
};
