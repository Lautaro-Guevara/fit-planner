// ==============================
// HEADER + FOOTER LOADER
// ==============================

const baseUrl = import.meta.env.BASE_URL || "/";

function withBase(path) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

async function loadTemplate(path) {
  const res = await fetch(path);
  return await res.text();
}

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate(withBase("partials/header.html"));
  const footerTemplate = await loadTemplate(withBase("partials/footer.html"));

  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  console.log("Header loaded")

  if (!headerElement || !footerElement) return;

  headerElement.innerHTML = headerTemplate;
  footerElement.innerHTML = footerTemplate;

  headerElement.querySelectorAll("a[data-route]").forEach((link) => {
    const route = link.getAttribute("data-route");
    if (route) link.setAttribute("href", withBase(route));
  });

//   // IMPORTANT: wait for DOM injection before running cart badge
//   setTimeout(() => {
//     superscript();
//   }, 0);
}

//*************************************
//  Exercise Card Creator
//*************************************

export function createExerciseCard(exercise) {

  const bodyPart = exercise.bodyParts?.[0] || "Body";
  const equipment = exercise.equipments?.[0] || "None";
  const targetMuscle = exercise.targetMuscles?.[0] || "muscle";
  const secondaryMuscles = (exercise.secondaryMuscles || []).join(", ");
  const level = exercise.level || "Beginner";

    return `
    
    <article class="exercise-card">

    <div class="exercise-media">
      <img
        src="${exercise.gifUrl}"
        alt="${exercise.name}"
        class="exercise-image"
        loading="lazy"
      >

      <button
        type="button"
        class="favorite-btn"
        is-favorite="false"
        aria-label="Save ${exercise.name}"
        info-exercise-id="${exercise.exerciseId}"
      >
        ❤
      </button>
    </div>

        <div class="exercise-content">

      <div class="exercise-title-row">
        <h3>${exercise.name}</h3>
        <span class="exercise-level">${level}</span>
      </div>

      <div class="exercise-tags">
        <span class="exercise-tag">${bodyPart}</span>
        <span class="exercise-tag">${equipment}</span>
      </div>

      <p class="exercise-description">
        A bodyweight exercise that targets the ${targetMuscle}${secondaryMuscles ? ` and engages ${secondaryMuscles}` : ""}.
      </p>

      <div class="exercise-volume">
        <span><strong>3</strong> sets</span>
        <span><strong>10-15</strong> reps</span>
      </div>

            <button class="add-to-workout-btn" type="button" aria-label="Add ${exercise.name} to workout plan" info-exercise-id="${exercise.exerciseId}">
        <span class="plus-icon">+</span>
                Add to Workout
            </button>

        </div>

    </article>

    `;
}

//*************************************
// Nutrition Card Creator
//*************************************

export function createNutritionCard(recipe) {

  const summaryText = cleanSummary(recipe.summary) || defaultSummary(recipe.title);
  const readyInMinutes = recipe.readyInMinutes;

    const nutritionInfo = recipe.nutrition || {};
    const nutrients = nutritionInfo.nutrients || [];

  const calories = nutrients.find(n => n.name === "Calories")?.amount;
  const protein = nutrients.find(n => n.name === "Protein")?.amount;
  const carbs = nutrients.find(n => n.name === "Carbohydrates")?.amount;
  const fats = nutrients.find(n => n.name === "Fat")?.amount;

  const difficulty = recipe.difficulty || getDifficulty(readyInMinutes);
  const mealType = recipe.mealType || normalizeMealType(recipe.dishTypes?.[0]) || "Breakfast";

    return `
    <article class="nutrition-card">

    <div class="nutrition-media">
      <img
        src="${recipe.image}"
        alt="${recipe.title}"
        class="nutrition-image"
      >
      <button
        type="button"
        class="favorite-btn"
        aria-label="Save ${recipe.title}"
        info-recipe-id="${recipe.id}"
      >
        &#9825;
      </button>
    </div>

        <div class="nutrition-content">

      <div class="nutrition-title-row">
        <h3>${recipe.title}</h3>
        <span class="difficulty-badge">${difficulty}</span>
      </div>

      <div class="nutrition-meta">
        <span class="meta-item">
          <span class="meta-icon">&#9687;</span>
          ${readyInMinutes} min
        </span>
        <span class="meta-item">
          <span class="meta-icon">&#128293;</span>
          ${calories} cal
        </span>
      </div>

      <span class="meal-tag">${mealType}</span>

      <p class="nutrition-summary">${summaryText}</p>

      <div class="macro-grid">
        <div class="macro-item">
          <strong>${protein}g</strong>
          <span>Protein</span>
        </div>
        <div class="macro-item">
          <strong>${carbs}g</strong>
          <span>Carbs</span>
        </div>
        <div class="macro-item">
          <strong>${fats}g</strong>
          <span>Fats</span>
        </div>
      </div>

        </div>

    </article>
    `;
}

function cleanSummary(summary = "") {
  if (!summary) return "";
  const withoutHtml = summary.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (!withoutHtml) return "";
  return withoutHtml.length > 95 ? `${withoutHtml.slice(0, 92)}...` : withoutHtml;
}

function defaultSummary(title = "") {
  const base = title ? title.toLowerCase() : "smoothie bowl";
  const sentence = `A nutrient-packed ${base} with balanced macros to support energy, satiety, and your daily goals.`;
  return sentence.length > 95 ? `${sentence.slice(0, 92)}...` : sentence;
}

function getDifficulty(readyInMinutes) {
  if (readyInMinutes <= 20) return "Easy";
  if (readyInMinutes <= 40) return "Medium";
  return "Hard";
}

function normalizeMealType(value = "") {
  if (!value) return "";
  const normalized = String(value).replace(/[-_]+/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}


//*************************************
//  Temporal Function to Dowload JSON
//*************************************

export async function descargarJsonDesdeApi(response) {
  try {
    if (!response) {
      throw new Error('Debes proporcionar una respuesta valida para descargar el JSON.');
    }

    // 1. Obtener los datos de la API
    const data = await response.json(); //

    // 2. Convertir el objeto a string JSON
    const jsonString = JSON.stringify(data, null, 2);

    // 3. Crear un archivo Blob en memoria
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 4. Crear un enlace temporal y forzar la descarga
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'datos.json'; // Nombre del archivo a descargar
    document.body.appendChild(a);
    a.click();
    
    // 5. Limpiar el DOM
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error al obtener o guardar los datos:', error);
  }
}


//*************************************
// Function to save exercises and recipes to favorites in localStorage
// and render them in the favorites page
//*************************************


export function saveToFavorites(key, item) {
    if (!key || !item) {
        console.warn("Both key and item are required to save to favorites.");
        return;
    } 

    const favorites = getFavoritesFromLocalStorage(key);
    favorites.push(item);
    localStorage.setItem(key, JSON.stringify(favorites));
}

export function getFavoritesFromLocalStorage(key) {
    const stored = localStorage.getItem(key);
    if (!stored) {
        return [];
    }

    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch (error) {
        console.warn(`Invalid JSON in localStorage key: ${key}`, error);
    }

    return [];
}


// Function to attach event listeners to dynamically created buttons.
export function attachButtonListeners(containerSelector, buttonSelector, callback) {
  if (!containerSelector || typeof callback !== "function") {
    return;
  }

  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Container not found for selector: ${containerSelector}`);
    return;
  }

  const buttons = container.querySelectorAll(buttonSelector);
  buttons.forEach((button) => {
    if (button.dataset.listenerAttached === "true") {
      console.warn("Listener already attached to button:", button);
      return;
    }

    button.dataset.listenerAttached = "true";
    button.addEventListener("click", async () => {
      await callback(button);
    });
  });
}

// Function to change the state of the favorite button when clicked, and save/remove from favorites accordingly
export function handleFavoriteButtonClick(button, itemId, favoritesKey, data, idParamName = "id") {
    if (!button || !itemId || !favoritesKey || !data) {
        console.warn("All parameters are required for handling favorite button click.");
        return;
    }
    
    console.log("Handling favorite button click for itemId:", itemId, "with data:", data);
    const isFavorite = button.classList.contains("is-favorite");
    if (isFavorite) {
      // Remove from favorites
      const favorites = getFavoritesFromLocalStorage(favoritesKey);
      const updatedFavorites = favorites.filter(item => item.data && item.data[idParamName] !== itemId);
      localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
      button.classList.remove("is-favorite");
    } else {
      // Add to favorites
      const favorites = getFavoritesFromLocalStorage(favoritesKey);
      favorites.push(data);
      localStorage.setItem(favoritesKey, JSON.stringify(favorites));
      button.classList.add("is-favorite");
    }
}

// Function to check if the card is already in favorites and update the button state accordingly
export function updateFavoriteButtonState(button, itemId, favoritesKey, idParamName = "id") {
    if (!button || !itemId || !favoritesKey) {
        console.warn("Button, itemId, and favoritesKey are required to update favorite button state.");
        return;
    }
    console.log("Updating favorite button state for itemId:", itemId);
    const favorites = getFavoritesFromLocalStorage(favoritesKey);
    console.log("Current favorites for key", favoritesKey, ":", favorites);
    if (favorites.some(fav => fav.data && fav.data[idParamName] === itemId)) {
      console.log("ITEM IS IN FAVORITES, marking button as active.");
        button.classList.add("is-favorite");
    } else {
        button.classList.remove("is-favorite");
    }
}

//*************************************
//  WORKOUT PLANNER FUNCTIONS
//*************************************

// Save exercises to workout plan in localStorage
export function saveExerciseToWorkoutPlan(exercise) {
    if (!exercise) {
        console.warn("No exercise provided to save to workout plan.");
        return;
    }
    const workoutPlan = JSON.parse(localStorage.getItem("workoutPlan")) || [];
    workoutPlan.push(exercise);
    localStorage.setItem("workoutPlan", JSON.stringify(workoutPlan));
}