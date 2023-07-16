import NotFound from "./views/notfound.js";
import Home from "./views/home.js";
import Account from "./views/account.js";
import Bye from "./views/bye.js";
import Person from "./views/person.js";
import Grammar from "./views/grammar.js";
import People from "./views/people.js";
import Series from "./views/series.js";
import Texts from "./views/texts.js";
import Text from "./views/text.js";
import Treebanks from "./views/treebanks.js";
import Search from "./views/search.js";
import Smyth from "./views/smyth.js";

const routes = [
  { path: `/not-found`, view: NotFound },
  { path: `/`, view: Home },
  { path: `/account`, view: Account },
  { path: `/bye`, view: Bye },
  { path: `/grammar`, view: Grammar },
  { path: `/grammar/:id`, view: Grammar },
  { path: `/people`, view: People },
  { path: `/person/:id`, view: Person },
  { path: `/series/:name`, view: Series },
  { path: `/texts/:type`, view: Texts },
  { path: `/texts`, view: Texts },
  { path: `/text/:id/:tab`, view: Text },
  { path: `/text/:id`, view: Text },
  { path: `/treebanks/:type`, view: Treebanks },
  { path: `/treebanks`, view: Treebanks },
  { path: `/search`, view: Search },
  { path: `/search/:id`, view: Search },
  { path: `/smyth`, view: Smyth },
  { path: `/smyth/:id`, view: Smyth },
];

const routeRegex = (str: string) => {
  return `^${str.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)")}$`;
};

export default (url: string, addToHistory: boolean = true, nocache = false) => {
  const getParams = (match: any) => {
    const keys = [...match.path.matchAll(/:(\w+)/g)].map((el) => el[1]);
    const values = (url.match(routeRegex(match.path)) || []).slice(1);
    let params = keys.reduce(
      (obj, key, index) => ({ ...obj, [key]: values[index] }),
      {}
    );
    params["nocache"] = nocache;
    return params;
  };

  if (window.controller) {
    window.controller.abort();
  }

  window.controller = new AbortController();
  window.signal = window.controller.signal;

  if (addToHistory) {
    history.pushState(null, "", url);
  }

  const match =
    routes.find((route) => {
      return url.match(routeRegex(route.path));
    }) || routes[0];

  const view = match.view(getParams(match));

  $("main")!.innerHTML = view.getHtml();
  view.afterRender();
};
