import { firebaseInstance } from "./firebase.js";

function init(){
    firebaseInstance.getUserData().then(snapshot => {
        snapshot.forEach(child => {
            // PULL ALL OF THE POSTS AND POST THEM
            const posts = child.child('posts').val();
            
            for(let i = Object.keys(posts).length - 1; i >= 0; i--){
                const post = posts[Object.keys(posts)[i]];
                const userPost = document.createElement('user-post');
                userPost.shadowRoot.querySelector("#title").textContent = post.title;
                userPost.shadowRoot.querySelector("#canvas").src = post.canvasSrc;
                userPost.shadowRoot.querySelector("#content").value = post.content;
                document.querySelector("#posts").appendChild(userPost);
            }
        });
    });
}

init();