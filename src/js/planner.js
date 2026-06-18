import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

//*************************************
//  CONST AND VARIABLES
//*************************************
const clearAllButton = document.querySelector("#clearWorkout");
const workoutListContainer = document.querySelector("#workoutList");

const totalExercisesCount = document.querySelector("#exerciseCount");
const totalSetsCount = document.querySelector("#totalSets");
const muscleGroupsCount = document.querySelector("#muscleCount");




//*************************************
//  FUNCTIONS
//*************************************

// Function to show the list of exercises in the workout plan
function renderWorkoutPlan() {
    const workoutPlan = JSON.parse(localStorage.getItem("workoutPlan")) || [];
    if (workoutListContainer) {
        if (workoutPlan.length === 0) {
            workoutListContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Your workout plan is empty</h3>
                    <p>Add exercises to start building your routine.</p>
                    <a href="../exercises/index.html">Browse Exercises</a>
                </div>
            `;
        } else {
            workoutListContainer.innerHTML = workoutPlan.map(createWorkoutPlanCard).join("");
        }

        const setInputs = workoutListContainer.querySelectorAll('input[name="sets"]');
        setInputs.forEach(input => {
            input.addEventListener("input", () => {
                const totalSets = countTotalSets();
                if (totalSetsCount) {
                    totalSetsCount.textContent = totalSets;
                }
                // Save changes to localStorage when the user updates the sets input
                const exerciseId = input.id.replace("sets-", "");
                const workoutPlan = JSON.parse(localStorage.getItem("workoutPlan")) || [];
                const exerciseIndex = workoutPlan.findIndex(exercise => exercise.data.exerciseId === exerciseId);
                if (exerciseIndex !== -1) {
                    workoutPlan[exerciseIndex].data.sets = parseInt(input.value, 10);
                    localStorage.setItem("workoutPlan", JSON.stringify(workoutPlan));
                    console.log(`Updated sets for exercise ${exerciseId} to ${input.value} in localStorage.`);
                }
            });
        });

        const repsInputs = workoutListContainer.querySelectorAll('input[name="reps"]');
        repsInputs.forEach(input => {
            input.addEventListener("input", () => {
                const exerciseId = input.id.replace("reps-", "");
                const workoutPlan = JSON.parse(localStorage.getItem("workoutPlan")) || [];
                const exerciseIndex = workoutPlan.findIndex(exercise => exercise.data.exerciseId === exerciseId);
                if (exerciseIndex !== -1) {
                    workoutPlan[exerciseIndex].data.reps = parseInt(input.value, 10);
                    localStorage.setItem("workoutPlan", JSON.stringify(workoutPlan));
                    console.log(`Updated reps for exercise ${exerciseId} to ${input.value} in localStorage.`);
                }
            });
        });

        // Attach event listeners to remove buttons
        const removeButtons = workoutListContainer.querySelectorAll(".remove-workout-btn");
        removeButtons.forEach(button => {
            button.addEventListener("click", () => {
                const exerciseId = button.getAttribute("data-exercise-id");
                removeExerciseFromWorkoutPlan(exerciseId);
            });
        });
    }
    if (totalExercisesCount) {
        totalExercisesCount.textContent = countTotalExercises();
    }
    if (totalSetsCount) {
        const totalSets = countTotalSets();
        totalSetsCount.textContent = totalSets;
        
    }
    if (muscleGroupsCount) {
        const muscleGroups = countTotalMuscleGroups();
        muscleGroupsCount.textContent = muscleGroups;
    }
}

// Function to clear the workout plan from localStorage and update the UI
function clearWorkoutPlan() {
    localStorage.removeItem("workoutPlan");
    renderWorkoutPlan();
}

// Function to remove a single exercise from the workout plan
function removeExerciseFromWorkoutPlan(exerciseId) {
    const workoutPlan = JSON.parse(localStorage.getItem("workoutPlan")) || [];
    const updatedPlan = workoutPlan.filter(exercise => exercise.data.exerciseId !== exerciseId);
    localStorage.setItem("workoutPlan", JSON.stringify(updatedPlan));
    renderWorkoutPlan();
}

// Function to Create a workout plan card for an exercise with input for set and series
function createWorkoutPlanCard(exercise) {
    const bodyPart = (exercise.data.bodyParts || []).join(", ");
    const equipment = (exercise.data.equipments || []).join(", ");
    const targetMuscles = (exercise.data.targetMuscles || []).join(", ");

    return `
        <div class="workout-plan-card">
            <img src="${exercise.data.gifUrl}" alt="${exercise.data.name}" class="workout-plan-image">
            <div class="exercise-info">
                <h3 class="workout-plan-title">${exercise.data.name}</h3>
                <div class="info-box workout-plan-info-box">
                    <p class="workout-plan-bodypart">Body Part: ${bodyPart}</p>
                    <p class="workout-plan-equipment">Equipment: ${equipment}</p>
                    <p class="workout-plan-muscle">Target Muscle: ${targetMuscles}</p>
                </div>
                <div class="workout-plan-inputs">
                    <div>
                        <label for="sets-${exercise.data.exerciseId}">Sets:</label>
                        <input type="number" id="sets-${exercise.data.exerciseId}" name="sets" min="1" value="${exercise.data.sets || 3}">
                    </div>
                    <div>
                        <label for="reps-${exercise.data.exerciseId}">Reps:</label>
                        <input type="number" id="reps-${exercise.data.exerciseId}" name="reps" min="1" value="${exercise.data.reps || 10}">
                    </div>
                </div>
            </div>
            <button type="button" class="remove-workout-btn remove-btn" aria-label="Remove ${exercise.data.name}" data-exercise-id="${exercise.data.exerciseId}">X</button>
        </div>
    `;
}

function countTotalExercises() {
    const workoutPlan = JSON.parse(localStorage.getItem("workoutPlan")) || [];
    return workoutPlan.length;
}

function countTotalSets() {
    const setInputs = workoutListContainer
        ? workoutListContainer.querySelectorAll('input[name="sets"]')
        : document.querySelectorAll('input[name="sets"]');

    return Array.from(setInputs).reduce((sum, input) => {
        const value = parseInt(input.value, 10);
        return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
}

function countTotalMuscleGroups() {
    const workoutPlan = JSON.parse(localStorage.getItem("workoutPlan")) || [];
    const muscleGroups = new Set();
    workoutPlan.forEach(exercise => {
        exercise.data.targetMuscles.forEach(muscle => muscleGroups.add(muscle));
    });
    return muscleGroups.size;
}


//*************************************
//  EVENT LISTENERS
//*************************************
if (clearAllButton) {
    clearAllButton.addEventListener("click", clearWorkoutPlan);
}

// Event to sum or rest Total Sets when the user changes the input values for sets


// Initial render of the workout plan
renderWorkoutPlan();
