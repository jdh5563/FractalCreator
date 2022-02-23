import { firebaseInstance } from "./firebase.js";

const storedCount = [];
const storedPokemon = [];
let storedPokeObject = [];

function init(){
    firebaseInstance.getUserData().then(snapshot => {
        snapshot.forEach(child => {
            // PULL ALL OF THE POSTS AND POST THEM
        });
    });
}

init();