import { firebaseInstance } from "./firebase.js";

function init(){
    firebaseInstance.getUserData().then(snapshot => {
        snapshot.forEach(child => {
            // PULL ALL OF THE POSTS AND POST THEM
            console.log(child.val());
        });
    });
}

init();