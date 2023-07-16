import { setTitle, loader, getUser, isEmpty } from "../utils.js";
import { get, post } from "../api.js";
import { Listeners, ApiResult, Dict } from "../types.js";

export const listeners: Listeners = {
  click: [
    {
      selector: ".person-gender-edit",
      callback: (t: HTMLElement) => {
        const curGender = t.dataset.genderId;
        let newGenderId = "1";
        if (curGender == "1") {
          newGenderId = "2";
        } else if (curGender == "2") {
          newGenderId = "0";
        }
        const personId = $("h1")!.dataset.id;
        post(`/person/${personId}`, {
          item: "gender",
          value: newGenderId,
        }).then((data: ApiResult) => {
          if (data && data.ok) {
            t.dataset.genderId = newGenderId;
            if (newGenderId == "1") {
              t.innerText = "male";
            } else if (newGenderId == "2") {
              t.innerText = "female";
            } else {
              t.innerText = "?";
            }
          } else {
            alert("An error happened. Sorry!");
          }
        });
      },
    },
  ],
  blur: [
    {
      selector: ".person-name-edit",
      callback: (t: HTMLElement) => {
        const newName = t.innerText;
        const personId = t.dataset.id;
        post(`/person/${personId}`, { item: "name", value: newName }).then(
          (data: ApiResult) => {
            if (!data || !data.ok) {
              alert("An error happened. Sorry!");
            }
          }
        );
      },
    },
    {
      selector: ".person-tmid-edit",
      callback: (t: HTMLElement) => {
        const newTmId = t.innerText || null;
        const personId = $<HTMLElement>("h1")!.dataset.id;
        post(`/person/${personId}`, { item: "tm_id", value: newTmId }).then(
          (data: ApiResult) => {
            if (!data || !data.ok) {
              alert("An error happened. Sorry!");
            }
          }
        );
      },
    },
  ],
};

export default (params: Dict<string>) => {
  setTitle(`PG Person ${params.id}`);
  const user = getUser();

  const getPerson = () => {
    get(`/person/${params.id}`).then((data: ApiResult) => {
      if (data && data.ok && data.result.length) {
        let gender = "?";
        if (data.result[0].gender == "1") {
          gender = "male";
        } else if (data.result[0].gender == "2") {
          gender = "female";
        }
        $<HTMLElement>("h1")!.innerText = data.result[0].name;
        $<HTMLElement>("h1")!.dataset.id = params.id;
        $<HTMLElement>("#person-id .value")!.innerText = params.id;
        $<HTMLElement>("#person-tmid .value")!.innerText =
          data.result[0].tm_id || "";
        $<HTMLElement>("#person-gender .value")!.innerText = gender;
        $<HTMLElement>("#person-gender .value")!.dataset.genderId =
          data.result[0].gender;
        data.result.forEach((item: { [key: string]: string }) => {
          let container = $<HTMLElement>(`#${item.role} .content`)!;
          $$("p").forEach((e) => e.remove());

          let str = `<div><a href="/text/${item.text_id}/metadata">${
            item.text_name
          }</a> <span class="badge-small"><span class="sym" style="font-size:20px; position:relative;top:2px">✍</span> <span class="bold">${
            item.aow_n
          }</span></span> <span data-uncertain="${
            item.uncertain || 0
          }" class="badge-small uncertainty-${
            item.uncertain || 0
          }"></span></div>
                    `;
          container.insertAdjacentHTML("beforeend", str);
        });
      } else {
        $<HTMLElement>(
          "#person-section"
        )!.innerHTML = `<p class="info">Unknown Person ID: ${params.id}</p>`;
      }
    });
    $<HTMLElement>("#role-list")!.classList.remove("d-none");
  };

  const getHtml = () => {
    const e = "No documents";
    return `
      <section id="person-section">
        <h1 id="person-name" ${
          !isEmpty(user)
            ? 'class="noenter person-name-edit" contenteditable="true"'
            : ""
        }>${loader()}</h1>
          <div id="person-metadata" class="centered g-14"><span class="badge-small" id="person-id">ID: <span class="value"></span></span><span class="badge-small" id="person-tmid">TM ID: <span class="value ${
            user ? "noenter person-tmid-edit" : ""
          }" ${
      !isEmpty(user)
        ? 'style="display:inline-block;" contenteditable="true"'
        : ""
    }></span></span><span class="badge-small" id="person-gender">Gender: <span class="value ${
      !isEmpty(user) ? 'person-gender-edit" style="cursor:pointer;"' : '"'
    }></span></span></div>
          <section id="role-list" class="centered d-none" style="margin: 0 100px; display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 10px;
          row-gap: 1em;">
              <div id="author">
                  <h3>Author</h3>
                  <div class="content"><p class="info">${e}</p></div>
              </div>
              <div id="writer">
                  <h3>Writer</h3>
                  <div class="content"><p class="info">${e}</p></div>
              </div>
              <div id="addressee">
                  <h3>Addressee</h3>
                  <div class="content"><p class="info">${e}</p></div>
              </div>
              <div id="official">
                  <h3>Scribal official</h3>
                  <div class="content"><p class="info">${e}</p></div>
              </div>
          </section>
    </section>
  `;
  };
  const afterRender = () => {
    getPerson();
  };

  return {
    getHtml,
    afterRender,
  };
};
