import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const exerciseCountElement = document.querySelector("#exerciseCount");
const recipeCountElement = document.querySelector("#recipeCount");
const savedExercisesContainer = document.querySelector("#savedExercises");
const savedRecipesContainer = document.querySelector("#savedRecipes");

const EXERCISE_KEYS = [
	"favoriteExercises",
	"savedExercises",
	"exerciseFavorites",
	"favoritesExercises"
];

const RECIPE_KEYS = [
	"favoriteRecipes",
	"savedRecipes",
	"recipeFavorites",
	"favoritesRecipes"
];

function readFavoritesWithKey(keys) {
	for (const key of keys) {
		const rawValue = localStorage.getItem(key);
		if (!rawValue) {
			continue;
		}

		try {
			const parsed = JSON.parse(rawValue);
			if (Array.isArray(parsed)) {
				return {
					key,
					items: parsed
				};
			}
		} catch (error) {
			console.warn(`Invalid JSON in localStorage key: ${key}`, error);
		}
	}

	return {
		key: keys[0],
		items: []
	};
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function getRecipeInfo(item) {
	const image = item.image || "";
	const title = item.title || item.name || "Recipe";
	const readyTime = item.readyInMinutes ? `${item.readyInMinutes} min` : "Quick meal";
	const calories = item.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount;
	const caloriesText = calories ? `${Math.round(calories)} cal` : "Balanced nutrition";
	const summary = item.summary
		? String(item.summary).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 110)
		: "Saved from your recipe search.";

	return {
		image,
		title,
		metaLeft: readyTime,
		metaRight: caloriesText,
		description: summary
	};
}

function getExerciseInfo(item) {
	const image = item.gifUrl || "";
	const title = item.name || "Exercise";
	const bodyPart = Array.isArray(item.bodyParts) ? item.bodyParts.join(", ") : "Workout";
	const equipment = Array.isArray(item.equipments) ? item.equipments.join(", ") : "Bodyweight";
	const muscle = Array.isArray(item.targetMuscles) ? item.targetMuscles.join(", ") : "Fitness";

	return {
		image,
		title,
		metaLeft: bodyPart,
		metaRight: equipment,
		description: `Targets: ${muscle}`
	};
}

function buildFavoriteCard(item, index, type, storageKey) {
	const info = type === "Recipe" ? getRecipeInfo(item) : getExerciseInfo(item);
	const imageMarkup = info.image
		? `<img class="favorite-thumb" src="${escapeHtml(info.image)}" alt="${escapeHtml(info.title)}">`
		: `<div class="favorite-thumb placeholder" aria-hidden="true"></div>`;

	return `
		<article class="favorite-item horizontal-card" data-index="${index}" data-storage-key="${escapeHtml(storageKey)}">
			${imageMarkup}
			<div class="favorite-details">
				<button type="button" class="remove-favorite-btn" aria-label="Remove ${escapeHtml(info.title)}">X</button>
				<h3>${escapeHtml(info.title)}</h3>
				<div class="favorite-meta">
					<span>${escapeHtml(info.metaLeft)}</span>
					<span>${escapeHtml(info.metaRight)}</span>
				</div>
				<p>${escapeHtml(info.description)}</p>
			</div>
		</article>
	`;
}

function emptyExerciseIcon() {
	return `
		<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
			<path d="M6.4 7.7 4 10.1m4.3-4.9-4.9 4.9m7.4-1.2-4.9 4.9m7.4-1.2-4.9 4.9m8-12.2-2.4 2.4m2.7 5.7 2.4-2.4m-4.3 4.9 4.9-4.9m-7.4 1.2 4.9-4.9m-7.4 1.2 4.9-4.9" />
		</svg>
	`;
}

function emptyRecipeIcon() {
	return `
		<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
			<path d="M12 8.5c-.8-1.9-.3-3.6 1.6-5.1m-1.6 5.1c-2.2-2.4-6.5-2.2-8 .8-1.7 3.4-.5 8.9 3.3 11.6 1.6 1.1 2.8.6 4.7.6s3.1.5 4.7-.6c3.8-2.7 5-8.2 3.3-11.6-1.5-3-5.8-3.2-8-.8Z" />
		</svg>
	`;
}

function renderEmptyState({ container, icon, message, buttonLabel, buttonHref }) {
	if (!container) {
		return;
	}

	container.innerHTML = `
		<article class="empty-state">
			<span class="empty-icon">${icon}</span>
			<p class="empty-message">${message}</p>
			<a class="browse-btn" href="${buttonHref}">${buttonLabel}</a>
		</article>
	`;
}

function renderFavoriteList(container, items, type, storageKey) {
	if (!container) {
		return;
	}

	container.innerHTML = `
		<div class="favorites-list">
			${items.map((item, index) => buildFavoriteCard(item, index, type, storageKey)).join("")}
		</div>
	`;
}

function initFavoritesPage() {
	const exercisesData = readFavoritesWithKey(EXERCISE_KEYS);
	const recipesData = readFavoritesWithKey(RECIPE_KEYS);
	const savedExercises = exercisesData.items;
	const savedRecipes = recipesData.items;

	if (exerciseCountElement) {
		exerciseCountElement.textContent = String(savedExercises.length);
	}

	if (recipeCountElement) {
		recipeCountElement.textContent = String(savedRecipes.length);
	}

	if (savedExercises.length === 0) {
		renderEmptyState({
			container: savedExercisesContainer,
			icon: emptyExerciseIcon(),
			message: "No saved exercises yet",
			buttonLabel: "Browse Exercises",
			buttonHref: "../exercises/"
		});
	} else {
		renderFavoriteList(savedExercisesContainer, savedExercises, "Exercise", exercisesData.key);
	}

	if (savedRecipes.length === 0) {
		renderEmptyState({
			container: savedRecipesContainer,
			icon: emptyRecipeIcon(),
			message: "No saved recipes yet",
			buttonLabel: "Browse Recipes",
			buttonHref: "../nutrition/"
		});
	} else {
		renderFavoriteList(savedRecipesContainer, savedRecipes, "Recipe", recipesData.key);
	}
}

document.addEventListener("click", (event) => {
	const target = event.target;
	if (!(target instanceof Element)) {
		return;
	}

	const removeButton = target.closest(".remove-favorite-btn");
	if (!removeButton) {
		return;
	}

	const card = removeButton.closest(".favorite-item");
	if (!card) {
		return;
	}

	const storageKey = card.getAttribute("data-storage-key");
	const index = Number(card.getAttribute("data-index"));
	if (!storageKey || Number.isNaN(index)) {
		return;
	}

	const current = localStorage.getItem(storageKey);
	if (!current) {
		return;
	}

	try {
		const parsed = JSON.parse(current);
		if (!Array.isArray(parsed)) {
			return;
		}

		parsed.splice(index, 1);
		localStorage.setItem(storageKey, JSON.stringify(parsed));
		initFavoritesPage();
	} catch (error) {
		console.warn(`Could not remove favorite from key: ${storageKey}`, error);
	}
});

initFavoritesPage();