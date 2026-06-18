import { loadHeaderFooter, createExerciseCard, attachButtonListeners, saveToFavorites, saveExerciseToWorkoutPlan, updateFavoriteButtonState, handleFavoriteButtonClick } from "./utils.mjs";


//*************************************
// CONSTANTS AND VARIABLES
//*************************************

const exercisesUrl = import.meta.env.VITE_EXERCISES_API_URL;
const buttonsFilter = document.querySelectorAll(".filter");
const exercisesCounter = document.querySelector("#exerciseCount");
const searchBar = document.querySelector(".search-container input");
const exercisesContainer = document.querySelector("#exerciseGrid");

loadHeaderFooter();

//*************************************
// FUNCTIONS
//*************************************

// Function to display exercises in the UI
export function displayExercises(exercises) {
    if (exercisesContainer) {
        exercisesContainer.innerHTML = exercises.map(createExerciseCard).join("");
        exercises.forEach(exercise => {
            const favoriteButton = exercisesContainer.querySelector(`.favorite-btn[info-exercise-id="${exercise.exerciseId}"]`);
            console.log(favoriteButton, exercise.exerciseId);
            if (favoriteButton) {
                console.log("Updating favorite button state for exercise id:", exercise.exerciseId);
                updateFavoriteButtonState(favoriteButton, exercise.exerciseId, "favoriteExercises", "exerciseId");
            }
        });
        attachButtonListeners("#exerciseGrid", ".favorite-btn", async (button) => {
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

        // Use the same function to atach "add to workout plan" functionality, but with a different callback
            attachButtonListeners("#exerciseGrid", ".add-to-workout-btn", async (button) => {
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
}

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



async function fetchExercises() {
    try {
        const response = await fetch(`${exercisesUrl}/exercises?limit=20`);
        console.log("Response status:", response.body);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        

        const exercises = await response.json();
        console.log("Fetched exercises:", exercises.data);
        
        if (exercisesContainer) {
            exercisesCounter.textContent = exercises.data.length;
            displayExercises(exercises.data);

        console.log("Exercises rendered and event listeners attached.");
        }} catch (error) {
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
        if (exercisesContainer) {
            exercisesContainer.innerHTML = exercises.data.map(createExerciseCard).join("");
            exercisesCounter.textContent = exercises.data.length;
        }
    } catch (error) {
        console.error("Error searching exercises by name:", error);
    }
}


//*************************************
//  EVENT LISTENERS
//*************************************


searchBar.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    if (query) {
        await searchExercisesByName(query);
    } else {
        await fetchExercises();
    }
});


// allButton.addEventListener("click", async () => {
//     try {
//         const response = await fetch(`${exercisesUrl}/exercises?limit=20`);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const exercises = await response.json();
//         const exercisesContainer = document.querySelector("#exerciseGrid");
//         console.log("Fetched exercises:", exercises.data);
//         exercises.data.forEach(exercise => console.log("Exercise:", exercise.bodyParts, exercise.targetMuscles));
//         if (exercisesCounter) {
//             exercisesCounter.textContent = exercises.data.length;
//         }
//         if (exercisesContainer) {
//             exercisesContainer.innerHTML = exercises.data.map(createExerciseCard).join("");
//         }
//     } catch (error) {
//         console.error("Error fetching exercises:", error);
//     }
// });

buttonsFilter.forEach(button => {
            button.addEventListener("click", async () => {
                const muscleGroup = button.textContent.toLowerCase();
                console.log("mussle group:", muscleGroup);
                if (muscleGroup === "all") {                    await fetchExercises();
                    buttonsFilter.forEach(btn => btn.classList.remove("active"));
                    button.classList.add("active");
                    return;
                }
                const filteredExercises = await filterExercisesByMuscleGroup(muscleGroup);
                console.log("Filtered exercises:", filteredExercises);
                
                displayExercises(filteredExercises);
                buttonsFilter.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
            });
        });


fetchExercises();