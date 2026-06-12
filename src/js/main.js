import { loadHeaderFooter, createExerciseCard } from "./utils.mjs";

const exercisesUrl = import.meta.env.VITE_EXERCISES_API_URL;
const featuredExercisesContainer = document.querySelector("#featuredExercises");

async function init() {
  await loadHeaderFooter(); // wait until header/footer are fully loaded
  await fetchFeaturedExercises(); // fetch featured exercises after header/footer are loaded
}

async function fetchFeaturedExercises() {
  try {
    const response = await fetch(`${exercisesUrl}/exercises?limit=5&featured=true`);
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


init();