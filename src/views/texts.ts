import { setTitle, centeredLoader, activateTab } from "../utils.js";
import { get } from "../api.js";
import { ApiResult, Dict } from "../types.js";

let cache: string;

export default (params: Dict<string>) => {
  setTitle("Texts");

  let textType = "";
  if ("type" in params) {
    textType = params.type;
  }

  const getSeries = () => {
    const textTypeQuery = textType || "documentary";
    get(`/series/type/${textTypeQuery}`).then((data: ApiResult) => {
      if (data && data.ok) {
        let fullResult = `
          <section class="info">${data.result.length} series</section>
          <section id="series" style="column-count: 3; padding-top:20px; margin:0 30px; text-align:center">
          ${data.result
            .map((el: Dict<string>) => {
              let seriesName = encodeURIComponent(el["series_name"]);
              return `<p data-name="${seriesName}" class="tight"><a href="/series/${seriesName}">${el["series_name"]}</a></p>`;
            })
            .join("")}
          </section>
        `;

        $("#texts")!.innerHTML = fullResult;
        get(`/series/type/${textTypeQuery}/counts`).then((countData) => {
          if (data && data.ok) {
            countData.result.forEach((el: Dict<string>) => {
              let seriesName = encodeURIComponent(el["series_name"]);
              $(`[data-name="${seriesName}"]`)!.insertAdjacentHTML(
                "beforeend",
                ` <span class="badge-small">${el.text_count}</span>`
              );
              if (textTypeQuery == "documentary") {
                cache = $("#texts")!.innerHTML;
              }
            });
          }
        });
      }
    });
  };

  const getHtml = () => {
    return `
      <h1>Texts</h1>
      <section class="tabs">
          <a data-tab="" href="/texts">Documentary papyri</a>
          <a data-nocache="1" data-tab="literary" href="/texts/literary">Literary papyri</a>
          <a data-nocache="1" data-tab="inscriptions" href="/texts/inscriptions">Inscriptions</a>
          <a data-nocache="1" data-tab="others" href="/texts/others">Others</a>
      </section>
      <section id="texts">
      ${cache && !params.nocache ? cache : centeredLoader()}
      </section>
  `;
  };
  const afterRender = () => {
    activateTab(textType);
    if (!cache || params.nocache) {
      getSeries();
    }
  };

  return {
    getHtml,
    afterRender,
  };
};
