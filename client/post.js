import { firebaseInstance } from "./firebase.js";

const title = document.querySelector('input');
const content = document.querySelector('textarea');

async function init(){
    const response = await fetch('/getPost');
    const responseJSON = await response.json();
    const canvasSrc = responseJSON.src;

    document.querySelector("#post-button").onclick = e => {
        e.preventDefault();

        if(title.value && content.value){
            firebaseInstance.createPost(
                title.value,
                content.value,
                canvasSrc
            );
        }
        else{
            const notification = document.querySelector('nav-bar').shadowRoot.querySelector('#code-notification');
            
            notification.classList.add("is-danger");
            notification.classList.remove("is-hidden");
            notification.innerHTML = `<b>Post title or content not entered!<b>`;
        }
    }

    document.querySelector('#canvas-image').src = canvasSrc;

    document.querySelector("#cancel-button").onclick = async () => await fetch('/app.html');
}

init();