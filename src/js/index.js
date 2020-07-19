// Global app controller

import Search from "./models/Search";

/** Global state of the app
 * - Search Object
 * - Current recipe Object
 * shopping list object
 * liked recipe 
 * */ 
const state = {};

const controlSearch = async () =>{
    // 1) Get query from view
    const query = 'pizza'; // to do

    if(query){
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results

        // 4) search for recipes
        await state.search.getResults();

        // 5) render results on UI
        console.log(state.search.result);
    }
};

document.querySelector('.search').addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();
});
