import { get } from "../../api.js";
import { ApiResult } from "../../types.js";

export default async (doc: any) => {
  return get(`/text/${doc.id}/xml`).then((data: ApiResult) => {
    if (data && data.ok && data.result.length) {
      const xml = data.result;
      return `
        <div class="card">
        <div class="card-header"><div class="card-title">Treebank XML</div></div>
        <div class="card-content xml"><xmp>${xml}</xmp></div>
        </div>
    `;
    } else {
      return '<p style="text-align:center;">No treebank.</p>';
    }
  });
};
