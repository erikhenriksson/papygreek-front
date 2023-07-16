import { get } from "../../api.js";
import { ApiResult, Listeners } from "../../types.js";

export const listeners: Listeners = {
  click: [
    {
      selector: ".download-backup",
      callback: (t: HTMLElement) => {
        fetch(t.dataset.href || "", { method: "get" })
          .then((res) => res.blob())
          .then((res) => {
            const aElement = document.createElement("a");
            aElement.setAttribute("download", "treebank-backup.xml");
            const href = URL.createObjectURL(res);
            aElement.href = href;
            aElement.setAttribute("target", "_blank");
            aElement.click();
            URL.revokeObjectURL(href);
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
            return `<p><span style="cursor:pointer;color:firebrick" class="download-backup" data-href="${cnf.api}/text/${doc.id}/archive/${el.id}">${el.created}</a></p>`;
          })
          .join("")}
        </div>`;
    } else {
      return '<p style="text-align:center;">No archived treebanks.</p>';
    }
  });
};
