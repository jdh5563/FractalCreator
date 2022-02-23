import { firebaseInstance } from "./firebase.js";

const prefix = 'jdh5563';
const canvasKey = prefix + "canvas";
const canvasSrc = localStorage.getItem(canvasKey);

const title = document.querySelector('input');
const content = document.querySelector('textarea');

function init(){
    document.querySelector("#post-button").onclick = () => {
        firebaseInstance.createPost(
            title.value,
            content.value,
            canvasSrc
        );
    }

    document.querySelector('#canvas-image').src = canvasSrc;

    document.querySelector("#cancel-button").onclick = async () => await fetch('/app.html');
}

init();