import { setTitle, centeredLoader } from "../utils.js";
import { frontFilter } from "../components.js";
import { get } from "../api.js";
import { Listeners, ApiResult } from "../types.js";
let cache: string;

export const listeners: Listeners = {
  click: [
    {
      selector: ".expand-people",
      callback: (_t: HTMLElement) => {
        getPersons(true);
      },
    },
  ],
};

const getPersons = (expanded = false) => {
  let container = $("#people")!;
  container.innerHTML = centeredLoader();
  const query = expanded ? `/person/expanded` : `/person/expanded`;
  get(query).then((data: ApiResult) => {
    if (data && data.ok) {
      const result = data.result
        .map((el: { [key: string]: any }) => {
          const roles = el.roles
            ? el.roles
                .split(",")
                .map((role: string) => {
                  return ` <span class="badge-small">${role}</span>`;
                })
                .join("")
            : "";
          return `
            <div style="width:100%; break-inside: avoid-column; display:table;" class="tight filterable" data-filterval="${
              el.name || "[Anonymous]" + el.id
            }"><h3 style="margin-bottom:4px;margin-top:14px; ${
            expanded ? "font-weight:bold;" : ""
          }"><a href="/person/${el.id}"><span>${
            el.name || "[Anonymous]"
          }</span></a> <span class="badge-small badge-grey">${el.id}</span>${
            expanded ? "" : roles
          }</h3>
    
          ${
            expanded
              ? (el.texts || "")
                  .split(",")
                  .map((t: string) => {
                    if (t) {
                      const tParts = t.split("|");
                      return `<span><a href="/text/${tParts[2]}">${
                        tParts[1]
                      }</a> <span class="badge-small">${
                        tParts[0]
                      }</span> <span data-uncertain="${
                        tParts[3] || 0
                      }" class="badge-small uncertainty-${
                        tParts[3] || 0
                      }"></span></span><br>`;
                    } else {
                      return "<span class='info'>No texts</span>";
                    }
                  })
                  .join("")
              : ""
          }
          </div>
       `;
        })
        .join("");
      container.innerHTML = result;
      cache = result;
    }
  });
};

export default (_params = {}) => {
  setTitle("People");

  const getHtml = () => {
    return `
      <h1>People in the Papyri</h1>
      ${frontFilter()}
      <!--<section class="centered"><span class="button button-small expand-people">Show texts</span></section>-->
      <section id="people" style="column-count: 2; padding-top:20px; margin:0 30px; text-align:center">
        ${cache ? cache : ""}
      </section>
    `;
  };
  const afterRender = () => {
    if (!cache) {
      getPersons(true);
    }
  };

  return {
    getHtml,
    afterRender,
  };
};
