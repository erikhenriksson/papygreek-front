import { get, getFile } from "../../api.js";
import { downloadAsFile } from "../../utils.js";
export const listeners = {
    click: [
        {
            selector: ".download-backup",
            callback: (t) => {
                getFile(t.dataset.href || "").then((data) => {
                    downloadAsFile(data, "treebank-backup.xml");
                });
            },
        },
    ],
};
export default async (doc) => {
    return get(`/text/${doc.id}/archive`).then((data) => {
        if (data && data.ok && data.result.length) {
            return `
        <div class="centered">
        ${data.result
                .map((el) => {
                return `<p><span style="cursor:pointer;color:firebrick" class="download-backup" data-href="/text/${doc.id}/archive/${el.id}">${el.created}</a></p>`;
            })
                .join("")}
        </div>`;
        }
        else {
            return '<p style="text-align:center;">No archived treebanks.</p>';
        }
    });
};
