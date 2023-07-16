import { setTitle } from "../utils.js";

export default (_params = {}) => {
  setTitle("Bye");

  const getHtml = () => {
    return `
      <section class="g-12 loner">You have been logged out.</section>
    `;
  };
  const afterRender = () => {};

  return {
    getHtml,
    afterRender,
  };
};
