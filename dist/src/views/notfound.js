import { setTitle } from "../utils.js";
export default () => {
    setTitle("Not found");
    const getHtml = () => {
        return `
      <section class="g-12 loner">Can't find this page.</section>
    `;
    };
    const afterRender = () => { };
    return {
        getHtml,
        afterRender,
    };
};
