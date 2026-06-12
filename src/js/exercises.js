import { loadHeaderFooter, createExerciseCard } from "./utils.mjs";

const exercisesUrl = import.meta.env.VITE_EXERCISES_API_URL;
const allButton = document.querySelector("#all-filter");
const buttonsFilter = document.querySelectorAll(".filter");
const exercisesCounter = document.querySelector("#exerciseCount");
const searchBar = document.querySelector(".search-container input");

loadHeaderFooter();

async function filterExercisesByMuscleGroup(muscleGroup) {
    try {
        const response = await fetch(`${exercisesUrl}/exercises?limit=20&bodyParts=${muscleGroup}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const exercises = await response.json();
        if (exercisesCounter) {
            exercisesCounter.textContent = exercises.data.length;
        }
        return exercises.data;
    } catch (error) {
        console.error("Error fetching exercises by muscle group:", error);
        return [];
    }
}

allButton.addEventListener("click", async () => {
    try {
        const response = await fetch(`${exercisesUrl}/exercises?limit=20`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const exercises = await response.json();
        const exercisesContainer = document.querySelector("#exerciseGrid");
        console.log("Fetched exercises:", exercises.data);
        exercises.data.forEach(exercise => console.log("Exercise:", exercise.bodyParts, exercise.targetMuscles));
        if (exercisesCounter) {
            exercisesCounter.textContent = exercises.data.length;
        }
        if (exercisesContainer) {
            exercisesContainer.innerHTML = exercises.data.map(createExerciseCard).join("");
        }
    } catch (error) {
        console.error("Error fetching exercises:", error);
    }
});

buttonsFilter.forEach(button => {
            button.addEventListener("click", async () => {
                const muscleGroup = button.textContent.toLowerCase();
                console.log("mussle group:", muscleGroup);
                const filteredExercises = await filterExercisesByMuscleGroup(muscleGroup);
                console.log("Filtered exercises:", filteredExercises);
                const exercisesContainer = document.querySelector("#exerciseGrid");
                if (exercisesContainer) {
                    exercisesContainer.innerHTML = filteredExercises.map(createExerciseCard).join("");
                }
            });
        });


async function fetchExercises() {
    try {
        const response = await fetch(`${exercisesUrl}/exercises?limit=20`);
        console.log("Response status:", response.body);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        

        const exercises = await response.json();
        console.log("Fetched exercises:", exercises.data);
        const exercisesContainer = document.querySelector("#exerciseGrid");
        if (exercisesContainer) {
            exercisesCounter.textContent = exercises.data.length;
            exercisesContainer.innerHTML = exercises.data.map(createExerciseCard).join("");
        }
    } catch (error) {
        console.error("Error fetching exercises:", error);
    }
}

async function searchExercisesByName(query) {
    try {
        const response = await fetch(`${exercisesUrl}/exercises?limit=20&name=${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const exercises = await response.json();
        console.log("Search results:", exercises.data);
        const exercisesContainer = document.querySelector("#exerciseGrid");
        if (exercisesContainer) {
            exercisesContainer.innerHTML = exercises.data.map(createExerciseCard).join("");
            exercisesCounter.textContent = exercises.data.length;
        }
    } catch (error) {
        console.error("Error searching exercises by name:", error);
    }
}

searchBar.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    if (query) {
        await searchExercisesByName(query);
    } else {
        await fetchExercises();
    }
});

fetchExercises();