import { loader, centeredLoader } from "../utils.js";
import { get, post } from "../api.js";
import { Dict, ApiResult } from "../types.js";

export const smythLinkListener = (t: HTMLElement) => {
  const hrefHash = getHrefHash((t as HTMLAnchorElement).href);
  getChapter(hrefHash);
  history.pushState(null, "", `/smyth/${hrefHash.join("+")}`);
};
const getHrefHash = (p: string) => {
  let page = p.split("/").pop()!.replace("#", "+");
  return page.split("+");
};

const scrollToMyRef = (id: string) => {
  var ref = document.getElementById(id)!;
  setTimeout(function () {
    ref.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};

const getChapter = (hrefHash: any) => {
  return post(`/smyth/get_page`, { page: hrefHash[0] }).then(
    (data: ApiResult) => {
      if (data && data.ok) {
        $("#smyth-main")!.innerHTML = data["result"];
        $$("#smyth-menu a").forEach((itm) => {
          itm.classList.remove("current");
        });
        const curMenuId = `#smyth-menu a[href="${hrefHash.join("#")}"]`;
        let curMenuEl = $(curMenuId);
        if (!curMenuEl) {
          if (hrefHash.length > 1) {
            const section = $(`#smyth-main [id="${hrefHash[1]}"]`)!.closest(
              ".Section"
            );
            const chapter = $(`#smyth-main [id="${hrefHash[1]}"]`)!.closest(
              ".Chapter"
            );
            if (section) {
              curMenuEl = $(
                `#smyth-menu a[href="${chapter!.id}.html#${section.id}"]`
              );
            } else {
              curMenuEl = $(`#smyth-menu a[href="${chapter!.id}.html"]`);
            }
          } else {
            curMenuEl = $(`#smyth-menu a[href="${hrefHash[0]}"]`);
          }
        }

        if (curMenuEl) {
          const topPos = (curMenuEl as HTMLElement).offsetTop;
          const menuHeight = $<HTMLElement>("#smyth-menu")!.offsetHeight;

          curMenuEl.classList.add("current");
          if (hrefHash.length > 1) {
            console.log("skrollataan " + hrefHash[1]);
            scrollToMyRef(hrefHash[1]);
          } else {
            window.scrollTo(0, 0);
          }
          $("#smyth-menu")!.scrollTo({
            top: topPos - menuHeight / 2 + 20,
            behavior: "smooth",
          });
        }
      }
    }
  );
};

const getCss = () => {
  return get(`/smyth/get_css`).then((data: ApiResult) => {
    if (data && data.ok) {
      $("head")!.insertAdjacentHTML("beforeend", data.result);
    }
  });
};

const getSidebarMenu = () => {
  return post(`/smyth/get_page`, { page: "smyth.html" }).then(
    (data: ApiResult) => {
      if (data && data.ok) {
        $("#smyth-menu")!.innerHTML = data.result;
      }
    }
  );
};

export default (params: Dict<string>) => {
  const getHtml = () => {
    return `
      <section id="smyth-sticky" style="grid-column: span 4">
        <div id="smyth-menu">${loader()}</div>
        <div id="smyth-overlay"></div>
        <div id="smyth-footer" class="info centered smaller">
          <p><strong>A Greek Grammar for Colleges, Herbert Weir Smyth</strong></p>
          <p><a target="_blank" href="https://github.com/alpheios-project/grammar-smyth">Alpheios</a> version. XML for this text provided by Trustees of Tufts University, Medford MA. </p>
          <p>This work is licensed under a <a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/3.0/us/">Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States</a> License.</p>
        </div>
      </section>
      <section id="smyth-main" style="padding: 0 40px; grid-column: 5 / span 10">
        ${centeredLoader()}
      </section>
      `;
  };

  const afterRender = () => {
    getCss();
    getSidebarMenu();
    const hrefHash = getHrefHash(params.id || "preface.html");
    getChapter(hrefHash);
  };

  return {
    getHtml,
    afterRender,
  };
};
