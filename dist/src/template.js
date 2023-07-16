export default (html, scope) => {
    // Creates empty node and injects html string using .innerHTML
    // in case the variable isn't a string we assume is already a node
    let node;
    if (html.constructor === String) {
        node = document.createElement("div");
        node.innerHTML = html;
    }
    else {
        node = html;
    }
    // Creates of uses and object to which we will create variables
    // that will point to the created nodes
    const _scope = scope || {};
    // Recursive function that will read every node and when a node
    // contains the var attribute add a reference in the scope object
    const toScope = (node, scope) => {
        const children = node.children;
        for (let child of children) {
            //for (var iChild = 0; iChild < children.length; iChild++) {
            if (child.getAttribute("var")) {
                const names = child.getAttribute("var").split(".");
                let obj = scope;
                while (names.length > 0) {
                    const _property = names.shift() || "";
                    if (names.length == 0) {
                        obj[_property] = child;
                    }
                    else {
                        if (!obj.hasOwnProperty(_property)) {
                            obj[_property] = {};
                        }
                        obj = obj[_property];
                    }
                }
            }
            toScope(child, scope);
        }
    };
    toScope(node, _scope);
    if (html.constructor != String) {
        return html;
    }
    // If the node in the highest hierarchy is one return it
    if (node.childNodes.length == 1) {
        // if a scope to add node variables is not set
        // attach the object we created into the highest hierarchy node
        // by adding the nodes property.
        if (!scope) {
            node.childNodes[0].nodes = _scope;
        }
        return node.childNodes[0];
    }
    // if the node in highest hierarchy is more than one return a fragment
    const fragment = document.createDocumentFragment();
    const children = node.childNodes;
    // add notes into DocumentFragment
    while (children.length > 0) {
        if (fragment.append) {
            fragment.append(children[0]);
        }
        else {
            fragment.appendChild(children[0]);
        }
    }
    fragment.nodes = _scope;
    return fragment;
};
