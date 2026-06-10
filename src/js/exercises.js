import { loadHeaderFooter, createExerciseCard } from "./utils.mjs";

const exercisesUrl = process.env.EXERCISES_API_URL;

loadHeaderFooter();

async function fetchExercises() {
    try {
        const response = await fetch(`${exercisesUrl}/exercises`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const exercises = await response.json();
        const exercisesContainer = document.querySelector("#exerciseGrid");
        if (exercisesContainer) {
            exercisesContainer.innerHTML = exercises.map(createExerciseCard).join("");
        }
    } catch (error) {
        console.error("Error fetching exercises:", error);
    }
}

fetchExercises();