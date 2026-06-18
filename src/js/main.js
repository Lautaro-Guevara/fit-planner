import { loadHeaderFooter, createExerciseCard, createNutritionCard, attachButtonListeners, handleFavoriteButtonClick, updateFavoriteButtonState } from "./utils.mjs";
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
      exercises.data.forEach(exercise => {
        const favoriteButton = featuredExercisesContainer.querySelector(`.favorite-btn[info-exercise-id="${exercise.exerciseId}"]`);
        console.log(favoriteButton, exercise.exerciseId);
        if (favoriteButton) {
          console.log("Updating favorite button state for exercise id:", exercise.exerciseId);
          updateFavoriteButtonState(favoriteButton, exercise.exerciseId, "favoriteExercises", "exerciseId");
        }
      });
      attachButtonListeners("#featuredExercises", ".favorite-btn", async (button) => {
        console.log("Favorite button clicked for exercise id:", button.getAttribute("info-exercise-id"));
        const exerciseId = button.getAttribute("info-exercise-id");
        if (!exerciseId) {
          console.warn("Missing exercise id on favorite button.");
          return;
        }

        try {
          const response = await fetch(`${exercisesUrl}/exercises/${exerciseId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          console.log("Response from exercise information fetch:", response);

          const data = await response.json();
          console.log("Data from exercise information fetch:", data);
          handleFavoriteButtonClick(button, exerciseId, "favoriteExercises", data, "exerciseId");

        } catch (error) {
          console.error("Error fetching exercise information:", error);
        }
      });

      attachButtonListeners("#featuredExercises", ".add-to-workout-btn", async (button) => {
        console.log("Add to workout plan button clicked for exercise id:", button.getAttribute("info-exercise-id"));
        const exerciseId = button.getAttribute("info-exercise-id");
        if (!exerciseId) {
          console.warn("Missing exercise id on add to workout plan button.");
          return;
        }

        try {
          const response = await fetch(`${exercisesUrl}/exercises/${exerciseId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          console.log("Response from exercise information fetch:", response);

          const data = await response.json();
          console.log("Data from exercise information fetch:", data);
          saveExerciseToWorkoutPlan(data);
        } catch (error) {
          console.error("Error fetching exercise information:", error);
        }
      }, ".add-to-workout-btn");
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