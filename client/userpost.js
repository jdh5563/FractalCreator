const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<div class="card mb-6">
    <div class="card-header">
        <div class="card-header-title">
            <p id="title">Title</p>
        </div>
    </div>
    <div class="card-image columns is-centered">
        <img id="canvas" class="column is-6 mt-5" src="">
    </div>
    <div class="card-content pt-0">
        <div class="content">
            <textarea id="content" class="textarea" rows=4 readonly></textarea>
        </div>
    </div>
</div>
`;

// Functionality for the user-post element
class UserPost extends HTMLElement {
    constructor(){
        super();

        this.attachShadow({mode: "open"});

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('user-post', UserPost);