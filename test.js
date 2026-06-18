export function displayExercises(exercises) {


    // Chequea si el contenedor de ejercicios existe antes de intentar manipularlo
    if (exercisesContainer) {

        // Renderiza las tarjetas de ejercicios en el contenedor
        exercisesContainer.innerHTML = exercises.map(createExerciseCard).join("");
        
        // Después de renderizar, actualiza el estado de los botones de favorito para cada ejercicio
        exercises.forEach(exercise => {
            // Busca el botón de favorito correspondiente a este ejercicio usando su ID
            const favoriteButton = exercisesContainer.querySelector(`.favorite-btn[info-exercise-id="${exercise.exerciseId}"]`);
            console.log(favoriteButton, exercise.exerciseId);

            if (favoriteButton) {
                console.log("Updating favorite button state for exercise id:", exercise.exerciseId);
                updateFavoriteButtonState(favoriteButton, exercise.exerciseId, "favoriteExercises", "exerciseId");
            }
        });


        // Adjunta los listeners para los botones de favorito usando delegación de eventos
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
