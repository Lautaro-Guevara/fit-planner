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

    return `
    
    <article class="exercise-card">

        <img
            src="${exercise.gifUrl}"
            alt="${exercise.name}"
            class="exercise-image"
        >

        <div class="exercise-content">

            <h3>${exercise.name}</h3>

            <div class="tags">
                <span>${exercise.bodyParts.join(", ")}</span>
                <span>Equipment: ${exercise.equipments.join(", ")}</span>
            </div>

            <p>
                Exercise targeting the
                ${exercise.targetMuscles.join(", ")} muscle group.
            </p>
            <p>
                Secundary muscles involved: ${exercise.secondaryMuscles.join(", ")}.
            </p>
            <button class="workout-btn">
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
        ♡
      </button>
    </div>

        <div class="nutrition-content">

      <div class="nutrition-title-row">
        <h3>${recipe.title}</h3>
        <span class="difficulty-badge">${difficulty}</span>
      </div>

      <div class="nutrition-meta">
        <span class="meta-item">
          <span class="meta-icon">◷</span>
          ${readyInMinutes} min
        </span>
        <span class="meta-item">
          <span class="meta-icon">🔥</span>
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
      throw new Error('Debes proporcionar una respuesta válida para descargar el JSON.');
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