import { firebaseInstance } from "./firebase.js";

const prefix = 'jdh5563';
const canvasKey = prefix + "canvas";
const canvasSrc = localStorage.getItem(canvasKey);

function init(){
    document.querySelector("#postButton").onclick = () => {
        firebaseInstance.createPost(
            document.querySelector("input").value,
            document.querySelector("textarea").value,
            canvasSrc
        );
    }

    document.querySelector('#canvas-image').src = canvasSrc;

    document.querySelector("#cancelButton").onclick = async () => await fetch('/app.html');
}

init();