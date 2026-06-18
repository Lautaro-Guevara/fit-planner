import { loadHeaderFooter, createNutritionCard, descargarJsonDesdeApi, saveToFavorites, attachButtonListeners, updateFavoriteButtonState, handleFavoriteButtonClick } from "./utils.mjs";

const nutritionApiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
const nutritionApiUrl = import.meta.env.VITE_SPOONACULAR_API_URL 

//*************************************
// CONSTANTS AND VARIABLES
//*************************************
const searchBar = document.querySelector("#recipeSearch");
const recipeCount = document.querySelector("#recipeCount");

const allButton = document.querySelector(".filter-button[data-category='all']");
const filterButtons = document.querySelectorAll(".filter-button");

const recipeContainer = document.querySelector("#recipeGrid");
let localRecipes = [];



//*************************************
// Initialization Functions
//*************************************

loadHeaderFooter()

//*************************************
// FUNCTIONS
//*************************************

//*************************************
// Data needed for the recipe card:
// - title
// - image
// - mealTypes (array of categories like breakfast, lunch, etc.)
// - instructions (array of steps)
// - calories
// - protein
// - carbs
// - fats
// - readyInMinutes
// - difficulty (can be derived from readyInMinutes or set as a static value for testing)
// - summary (can be a short description or the first few sentences of the instructions)
//*************************************
// Function to search for recipes based on a query
async function searchRecipes(query) {
    try {
        const response = await fetch(`${nutritionApiUrl}/recipes/complexSearch?query=${query}&addRecipeInformation=true&addRecipeNutrition=true&number=5`, {
            headers: {
                "X-Api-Key": nutritionApiKey
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(response);
        // descargarJsonDesdeApi(response);
        console.log(recipeContainer);



        const data = await response.json();
        console.log("Fetched recipes:", data.results);
        return data.results;

    } catch (error) {
        console.error("Error fetching recipes:", error);
    }}



//  Read data from local JSON file to test
// async function loadLocalRecipes() {
//     try {
//         const response = await fetch("/datos.json");
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log("Loaded local recipes:", data);
//         return data;
//     } catch (error) {
//         console.error("Error loading local recipes:", error);
//         return { results: [] };
//     }
// }


// // Function to search local recipes based on a query
// function searchLocalRecipes(query) {
//     const normalizedQuery = query.trim().toLowerCase();
//     if (!normalizedQuery) {
//         return localRecipes;
//     }

//     return localRecipes.filter((recipe) =>
//         recipe.title.toLowerCase().includes(normalizedQuery)
//     );
// }

//Function to display recipes in the UI
function displayRecipes(recipes) {
    if (recipeCount) {
        recipeCount.textContent = recipes.length;
    }
    if (recipeContainer) {
        recipeContainer.innerHTML = recipes.map(createNutritionCard).join("");

        // After rendering, update the state of the favorite buttons for each recipe
        recipes.forEach(recipe => {
            // Find the corresponding favorite button for this recipe using its ID
            const favoriteButton = recipeContainer.querySelector(`.favorite-btn[info-recipe-id="${recipe.id}"]`);
            console.log(favoriteButton, recipe.id);
            if (favoriteButton) {
                console.log("Updating favorite button state for recipe id:", recipe.id);
                updateFavoriteButtonState(favoriteButton, recipe.id, "favoriteRecipes", "id");
            }
        });
        attachButtonListeners("#recipeGrid", ".favorite-btn", async (button) => {
            const recipeId = button.getAttribute("info-recipe-id");
            if (!recipeId) {
                console.warn("Missing recipe id on favorite button.");
                return;
            }

            try {
                const response = await fetch(`${nutritionApiUrl}/recipes/${recipeId}/information?addRecipeNutrition=true`, {
                    headers: {
                        "X-Api-Key": nutritionApiKey
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log("Response from recipe information fetch:", response);
                const data = await response.json();
                console.log("Data from recipe information fetch:", data);
                handleFavoriteButtonClick(button, recipeId, "favoriteRecipes", data, "id");
            } catch (error) {
                console.error("Error fetching recipe information:", error);
            }
        });
    }
}

// Function to filter recipes by category
async function filterRecipesByCategory(category) {
    if (category === "all") {
        showRandomRecipes().then((data) => {
            displayRecipes(data);
        });
        return;
    }
    
    try {
        const response = await fetch(`${nutritionApiUrl}/recipes/complexSearch?type=${category}&addRecipeNutrition=true&number=5`, {
            headers: {
                "X-Api-Key": nutritionApiKey
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Response from category filter fetch:", data);
        console.log("Fetched recipes:", data.results);
        return data.results || [];
    } catch (error) {
        console.error("Error filtering recipes by category:", error);
        return [];
    }
}

// function to show random recipes on page load
export async function showRandomRecipes(number = 12) {
    try {
        const response = await fetch(`${nutritionApiUrl}/recipes/random?number=${number}&includeNutrition=true`, {
            headers: {
                "X-Api-Key": nutritionApiKey
            }
        }); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        return data.recipes || [];
    } catch (error) {
        console.error("Error fetching random recipes:", error);
        return [];
    }
}

async function initNutritionPage() {
    const data = await showRandomRecipes(5);
    localRecipes = data || [];
    displayRecipes(localRecipes);
}


// // Function to create a recipe card HTML string
// async function initNutritionPage() {
//     const data = await fetchRecipes();
//     localRecipes = data.results || [];
//     displayRecipes(localRecipes);
// }


//*************************************
// EVENT LISTENERS
//*************************************

// Event listener for the search bar input
if (searchBar) {
    searchBar.addEventListener("input", async (event) => {
        const query = event.target.value.trim();

        if (query.length > 2) {
        const data = await searchRecipes(query);
        if (data && data.length) {
            displayRecipes(data);
        }
    }});
}

//  Event listener to filter by category
if (filterButtons){
    filterButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const category = button.getAttribute("data-category");
            console.log("Selected category:", category);
            const filteredRecipes = await filterRecipesByCategory(category);
            displayRecipes(filteredRecipes);
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}



initNutritionPage();