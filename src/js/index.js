// Global app controller

import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from "./views/base";

/** Global state of the app
 * - Search Object
 * - Current recipe Object
 * shopping list object
 * liked recipe 
 * */ 
const state = {};

/**
 * Search Controller
 */
const controlSearch = async () =>{
    // 1) Get query from view
    const query = searchView.getInput();

    if(query){
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try {
            // 4) search for recipes
            await state.search.getResults();

            // 5) render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something wrong with search');
            clearLoader();
        }
     
    }
};

elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        let goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.result, goToPage);
    }
   
});


/**
 * Recipe Controller
 */

const controlRecipe = async () =>{
    // get Id from url
    const id = window.location.hash.replace('#','');
    console.log(id);

    if(id){
        // prepare ui for changes

        // create new  recipe  object
        state.recipe = new Recipe(id);
        
        try {
            // Get recipe data and ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            console.log(state.recipe);
        } catch (error) {
            console.log(error);
            alert('Error Processing recipe');
        }
        
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));