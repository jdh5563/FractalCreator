const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<nav class="navbar is-fixed-top is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="https://people.rit.edu/jdh5563/" target="blank">
            <img src="./images/my-name.png" alt="John Heiden">
        </a>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarLinks">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div id="navbarLinks" class="navbar-menu">
        <div class="navbar-start">
            <a class="navbar-item" href="about.html">
                About
            </a>

            <a class="navbar-item" href="app.html">
                Sandbox
            </a>

            <a class="navbar-item" href="community.html">
                Community
            </a>
        </div>
    </div>
</nav>
`;

// Functionality for the navbar element
class NavBar extends HTMLElement {
    constructor(){
        super();

        this.attachShadow({mode: "open"});

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Tell the user what page they are on
        const navbarStart = this.shadowRoot.querySelector(".navbar-start");
        const pageURL = window.location.href.split('/');
        for(let i = 0; i < navbarStart.children.length; i++){
            const child = navbarStart.children[i];
            child.innerHTML += pageURL[pageURL.length - 1] == child.href.split('/')[child.href.split('/').length - 1] ? `<br>(You are here)` : "";
        }

        // Give the hamburger icon functionality only if it is appearing on the screen
        if(this.shadowRoot.querySelector(".navbar-burger")){
            this.shadowRoot.querySelector(".navbar-burger").onclick = e => {
                e.target.classList.toggle("is-active");
                this.shadowRoot.querySelector(".navbar-menu").classList.toggle("is-active");
            }
        }
    }
}

customElements.define('nav-bar', NavBar);