export const frontFilter = () => {
    return `
    <section style="text-align:center;">
      <input type="text" class="front-filter" placeholder="Filter..."></input>
    </section>
  `;
};
export const h1 = (s) => {
    return `<h1>${s}</h1>`;
};
export const mainSection = (s) => {
    return `<section id="main">${s}</section>`;
};
export const tabs = (s) => {
    return `<section class="tabs">${s}</section>`;
};
export const tabLink = (text, tab, href, nocache = false) => {
    return `<a ${nocache ? `data-nocache="1"` : ""} data-tab="${tab}" href="${href}">${text}</a>`;
};
