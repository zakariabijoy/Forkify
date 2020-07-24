// Global app controller

import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Like";
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeview from './views/likeView';
import { elements, renderLoader, clearLoader } from "./views/base";


/** Global state of the app
 * - Search Object
 * - Current recipe Object
 * shopping list object
 * liked recipe 
 * */ 
const state = {};

/**
 * Search Controller     ---------------------------------------------------------------------------
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
 * Recipe Controller  --------------------------------------------------------------------------
 */

const controlRecipe = async () =>{
    // get Id from url
    const id = window.location.hash.replace('#','');

    if(id){
        // prepare ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected  search item
        if(state.search) searchView.highlightSelected(id);

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
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
            alert('Error Processing recipe');
        }
        
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



/**
 * List Controller     ---------------------------------------------------------------------------
 */

const controlList = () =>{
    // prepare  ui for showing list
    listView.clearList();
    
    // Create a new list if there in none yet
    if(!state.list) state.list = new List();

    // add each ingredient to list and user interface
    state.recipe.ingredients.forEach(el =>{
       const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

};



// handle delete and update list evenets
elements.shopping.addEventListener('click', e=>{

    const id = e.target.closest('.shopping__item').getAttribute('data-itemId');

    // handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // delete from state
        state.list.deleteItem(id);

        // delete from ui
        listView.deleteItem(id);

    } else if (e.target.matches('.shopping_count_value')){
        // handle the count update    
            const val = parseFloat(e.target.value, 10);
            if(val >= 0 ){
                state.list.updateCount(id, val);
            }else{
                alert('count can not less than Zero');
            }
            
        
    }
});



/**
 * Like Controller     ---------------------------------------------------------------------------
 */

const controlLike = () =>{
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    // user has not yet liked current recipe
    if(!state.likes.isLiked(currentId)){
        // add like to state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // toggle the like button
        likeview.toggleLikeBtn(true);;

        // add like to ui list
        likeview.renderLike(newLike);
        console.log(state.likes);

        // user has liked current recipe
    }else{
        // remove like from the state
        state.likes.deleteLike(currentId);;

        // toggle the like button
        likeview.toggleLikeBtn(false);

        // remove like from ui list
       likeview.deleteLike(currentId);
    }
    likeview.toggleLikeMenu(state.likes.getNumLikes());
}

// restore liked recipes on pageload
window.addEventListener('load',()=>{
    state.likes = new Likes();

    // restore like
    state.likes.readStorage();

    // toggle like menu button
    likeview.toggleLikeMenu(state.likes.getNumLikes());

    //render the existing like
    state.likes.likes.forEach(like => likeview.renderLike(like));
});


// handling recipe button clicks
elements.recipe.addEventListener('click', e=>{
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        // decreasae button is clicked
        if(state.recipe.servings >1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
       
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // add ingredients to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //like controller
        controlLike();
    }
   
});
