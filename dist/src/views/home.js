import { setTitle } from "../utils.js";
export default () => {
    setTitle("Home");
    const getHtml = () => {
        return `
      <section class="g-12">
        <h1 style="font-size:3rem; background: -webkit-linear-gradient(top, firebrick, chocolate);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;">PapyGreek</h1>
        <h2>A platform for the linguistic study of Greek papyri, <br> including a <a class="semi-bold" href="/grammar" data-link data-url="grammar">grammar</a>, <a class="semi-bold" href="/treebanks" data-link data-url="treebanks">annotated texts</a>, and a <a class="semi-bold" href="/search" data-link data-url="search">search tool</a>.</h2>
      </section>
      <section class="g-12" style="text-align:center;">
        <img style="width:25%;" id="logo" src="./static/img/papygreeklogo.jpg">
      </section>
      <section class="g-12" style="text-align:center;">
        <img style="width:20%;" src="./static/img/erc.png"/><br>
        <img style="width:10%" src="./static/img/hy.png"/><br>
        <p style="font-size:12px; margin:10px 25%;">This project has received funding from the European Research Council (ERC) under the European Union’s Horizon 2020 research and innovation programme (grant agreement No 758481).</p> 
      </section>
    `;
    };
    const afterRender = () => { };
    return {
        getHtml,
        afterRender,
    };
};
