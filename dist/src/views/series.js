import { setTitle } from "../utils.js";
import { get } from "../api.js";
import "https://cdn.jsdelivr.net/npm/simple-datatables@7";
export default (params) => {
    setTitle(params.name);
    const dataTableInit = () => {
        // @ts-ignore
        return new simpleDatatables.DataTable("#datatable", {
            paging: false,
            searchable: true,
            data: {
                headings: ["Name", "Type", "Date", "Provenance"],
            },
            labels: {
                placeholder: "Filter...",
            },
        });
    };
    const getSeriesTexts = (datatable) => {
        const dt = $(".datatable-wrapper");
        get(`/texts/series/${params.name}`).then((data) => {
            if (data && data.ok && data.result.length) {
                const formattedData = data.result.map((item) => {
                    return [
                        `<a href="/text/${item.id}">${item.name}</a>`,
                        `${item.series_type}`,
                        `${item.date_not_before}-${item.date_not_after}`,
                        `${item.place_name}`,
                    ];
                });
                datatable.insert({ data: formattedData });
                dt.classList.add("d-block");
                dt.classList.remove("d-none");
                $(".info").innerHTML = `${data.result.length} texts`;
            }
        });
    };
    const getHtml = () => {
        return `
      <h1>${params.name}</h1>
      <section class="main-content" id="series_texts" style="padding-top:0px; margin:0 30px; text-align:center">
        <p class="info"></p>
        <table id="datatable"></table>
      </section>
  `;
    };
    const afterRender = () => {
        getSeriesTexts(dataTableInit());
    };
    return {
        getHtml,
        afterRender,
    };
};
