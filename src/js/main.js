import { loadHeaderFooter, createExerciseCard, createNutritionCard } from "./utils.mjs";
import { showRandomRecipes } from "./nutrition.js";

//*************************************
//  CONST AND VARIABLES
//*************************************

const exercisesUrl = import.meta.env.VITE_EXERCISES_API_URL;
const recipesUrl = import.meta.env.VITE_SPOONACULAR_API_URL;
const recipesApiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

const featuredRecipesContainer = document.querySelector("#featuredRecipes");
const featuredExercisesContainer = document.querySelector("#featuredExercises");


//*************************************
//  FUNCTIONS
//*************************************
async function init() {
  await loadHeaderFooter(); // wait until header/footer are fully loaded
  await fetchFeaturedExercises(); // fetch featured exercises after header/footer are loaded
  await fetchFeaturedRecipes(); // fetch featured recipes after header/footer are loaded
}

async function fetchFeaturedExercises() {
  try {
    const response = await fetch(`${exercisesUrl}/exercises?limit=3&featured=true`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const exercises = await response.json();
    if (featuredExercisesContainer) {
      featuredExercisesContainer.innerHTML = exercises.data.map(createExerciseCard).join("");
    }
  } catch (error) {
    console.error("Error fetching featured exercises:", error);
  }
}

async function fetchFeaturedRecipes() {
  try {
    
    const data = await showRandomRecipes(3); // call the function to show random recipes on page load

    if (featuredRecipesContainer) {
      featuredRecipesContainer.innerHTML = data.map(createNutritionCard).join("");
    }
  } catch (error) {
    console.error("Error fetching featured recipes:", error);
  }
}


init();