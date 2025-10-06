
const API_URL = '/api/recipes';

const dicionarioDeRotulos = {
    "Balanced": "Balanceada", "High-Protein": "Rica em Proteína", "Low-Fat": "Baixa Gordura", "Low-Carb": "Low-Carb", "Vegan": "Vegana", "Vegetarian": "Vegetariana", "Alcohol-Free": "Sem Álcool", "Gluten-Free": "Sem Glúten", "Lactose-Free": "Sem Lactose", "Peanut-Free": "Sem Amendoim", "Sugar-Conscious": "Baixo Açúcar", "Kidney-Friendly": "Bom para os Rins", "Low Potassium": "Baixo Potássio", "Low Sodium": "Baixo Sódio", "Dairy-Free": "Sem Laticínios", "Wheat-Free": "Sem Trigo", "American": "Americana", "Asian": "Asiática", "Brazilian": "Brasileira", "French": "Francesa", "Indian": "Indiana", "Italian": "Italiana", "Japanese": "Japonesa", "Mediterranean": "Mediterrânea", "Mexican": "Mexicana", "South American": "Sul-Americana"
};

const elements = {
    searchInput: document.getElementById('searchInput'), searchButton: document.getElementById('searchButton'), applyFiltersButton: document.getElementById('applyFiltersButton'),
    toggleFilterButton: document.getElementById('toggleFilterButton'), navFilterButton: document.getElementById('navFilterButton'), mobileNavFilterButton: document.getElementById('mobileNavFilterButton'),
    filterPanel: document.getElementById('filterPanel'), recipesContainer: document.getElementById('recipesContainer'), messageArea: document.getElementById('messageArea'),
    loadMoreButton: document.getElementById('loadMoreButton'), loadingMore: document.getElementById('loadingMore'), maxCalories: document.getElementById('maxCalories'),
    dietType: document.getElementById('dietType'), healthType: document.getElementById('healthType'), cuisineType: document.getElementById('cuisineType'),
    hamburgerButton: document.getElementById('hamburger-button'), mobileMenu: document.getElementById('mobile-menu'), featuredRecipeSection: document.getElementById('featured-recipe-section'),
    featuredRecipeContainer: document.getElementById('featured-recipe-container'), activeFiltersContainer: document.getElementById('active-filters-container'),
};

// --- FUNÇÕES PARA GERENCIAR FAVORITOS ---
function getFavorites() {
    return JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
}

function toggleFavorite(recipeId, buttonEl) {
    const favorites = getFavorites();
    const isFavorited = favorites.includes(recipeId);
    if (isFavorited) {
        const updatedFavorites = favorites.filter(id => id !== recipeId);
        saveFavorites(updatedFavorites);
        buttonEl.classList.remove('favorited');
    } else {
        favorites.push(recipeId);
        saveFavorites(favorites);
        buttonEl.classList.add('favorited');
    }
}

async function fetchRecipeOfTheDay() {
    const featuredQueries = ["prato principal gourmet", "almoço brasileiro popular", "sobremesa impressionante", "jantar especial", "receita fácil e rápida"];
    const randomQuery = featuredQueries[Math.floor(Math.random() * featuredQueries.length)];
    const url = `${API_URL}?type=public&q=${encodeURIComponent(randomQuery)}&random=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
            renderFeaturedRecipe(data.hits[0].recipe);
        }
    } catch (error) {
        console.error("Erro ao buscar receita em destaque:", error);
    }
}

function renderFeaturedRecipe(recipe) {
    const servings = recipe.yield || 'N/A';
    const caloriesPerServing = Math.round(recipe.calories / servings);
    const featuredHtml = `<img src="${recipe.image}" alt="${recipe.label}" class="w-full md:w-1/3 h-64 md:h-auto object-cover"><div class="p-8 flex-1"><h4 class="text-4xl font-extrabold text-gray-800 mb-2">${recipe.label}</h4><p class="text-gray-500 mb-6">Por: ${recipe.source}</p><div class="flex flex-wrap gap-x-8 gap-y-4 mb-6"><div class="text-center"><p class="text-2xl font-bold text-primary-green">${caloriesPerServing}</p><p class="text-sm text-gray-600">Kcal/Porção</p></div><div class="text-center"><p class="text-2xl font-bold text-primary-green">${servings}</p><p class="text-sm text-gray-600">Porções</p></div><div class="text-center"><p class="text-2xl font-bold text-primary-green">${recipe.ingredients.length}</p><p class="text-sm text-gray-600">Ingredientes</p></div></div><a href="${recipe.url}" target="_blank" class="inline-block bg-secondary-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition duration-300 shadow-lg">Ver Receita Completa</a></div>`;
    elements.featuredRecipeContainer.innerHTML = featuredHtml;
    elements.featuredRecipeSection.classList.remove('hidden');
}

function updateActiveFiltersUI() {
    const activeFilters = [];
    if (elements.maxCalories.value) activeFilters.push(`Até ${elements.maxCalories.value} kcal`);
    if (elements.dietType.value) activeFilters.push(elements.dietType.options[elements.dietType.selectedIndex].text);
    if (elements.healthType.value) activeFilters.push(elements.healthType.options[elements.healthType.selectedIndex].text);
    if (elements.cuisineType.value) activeFilters.push(elements.cuisineType.options[elements.cuisineType.selectedIndex].text);
    if (activeFilters.length > 0) {
        let filtersHtml = '<div class="flex flex-wrap items-center gap-4"><span class="font-bold text-gray-700">Filtros Ativos:</span>';
        activeFilters.forEach(filter => { filtersHtml += `<span class="bg-blue-200 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">${filter}</span>`; });
        filtersHtml += `<button id="reset-filters-button" class="text-sm text-red-600 hover:underline font-bold ml-auto">Limpar Filtros</button></div>`;
        elements.activeFiltersContainer.innerHTML = filtersHtml;
        elements.activeFiltersContainer.classList.remove('hidden');
        document.getElementById('reset-filters-button').addEventListener('click', resetFilters);
    } else {
        elements.activeFiltersContainer.innerHTML = '';
        elements.activeFiltersContainer.classList.add('hidden');
    }
}

function resetFilters() {
    elements.maxCalories.value = '';
    elements.dietType.value = '';
    elements.healthType.value = '';
    elements.cuisineType.value = '';
    performSearch();
}

function getFilterParams() {
    const params = new URLSearchParams();
    const maxCalories = parseInt(elements.maxCalories.value.trim(), 10);
    if (!isNaN(maxCalories) && maxCalories > 0) {
        params.append('calories', `0-${maxCalories}`);
    }
    if (elements.dietType.value) {
        params.append('diet', elements.dietType.value);
    }
    if (elements.healthType.value) {
        params.append('health', elements.healthType.value);
    }
    if (elements.cuisineType.value) {
        params.append('cuisineType', elements.cuisineType.value);
    }
    return params;
}

async function fetchRecipes(url, isNewSearch = true) {
    if (isNewSearch) {
        let skeletonHTML = '';
        for (let i = 0; i < 8; i++) {
            skeletonHTML += `<div class="bg-white rounded-2xl shadow-lg flex flex-col border animate-pulse"><div class="bg-gray-300 w-full h-48 rounded-t-2xl"></div><div class="p-5"><div class="bg-gray-300 h-6 w-3/4 rounded-md mb-4"></div><div class="bg-gray-200 h-4 w-1/2 rounded-md mb-4"></div><div class="bg-gray-200 h-10 w-full rounded-md"></div></div></div>`;
        }
        elements.recipesContainer.innerHTML = skeletonHTML;
        elements.loadMoreButton.classList.add('hidden');
    } else {
        elements.loadingMore.classList.remove('hidden');
        elements.loadMoreButton.classList.add('hidden');
    }
    elements.messageArea.classList.add('hidden');
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();
        renderRecipes(data.hits, isNewSearch);
        handlePagination(data._links?.next?.href);
    } catch (error) {
        console.error("Erro ao buscar receitas:", error);
        if (isNewSearch) elements.recipesContainer.innerHTML = '';
        elements.messageArea.textContent = "Oops! Tivemos um problema ao buscar as receitas. Tente novamente mais tarde.";
        elements.messageArea.classList.remove('hidden');
    } finally {
        if (!isNewSearch) elements.loadingMore.classList.add('hidden');
    }
}

function performSearch() {
    const query = elements.searchInput.value.trim();
    if (!query) return;
    updateActiveFiltersUI();
    const filterParams = getFilterParams();
    const finalUrl = `${API_URL}?type=public&q=${encodeURIComponent(query)}&${filterParams.toString()}`;
    fetchRecipes(finalUrl, true);
}

function renderRecipes(hits, clearContainer = true) {
    if (clearContainer) {
        elements.recipesContainer.innerHTML = '';
    }
    if (hits.length === 0 && clearContainer) {
        elements.recipesContainer.innerHTML = `<div class="col-span-full text-center p-12"><h3 class="text-2xl font-bold">Nenhum resultado encontrado.</h3><p>Tente buscar por termos em inglês.</p></div>`;
        return;
    }
    const favorites = getFavorites();
    const recipesHtml = hits.map(hit => {
        const { recipe } = hit;
        const recipeId = recipe.uri.split('#recipe_')[1];
        const isFavorited = favorites.includes(recipeId);
        const favoritedClass = isFavorited ? 'favorited' : '';
        const servings = recipe.yield || 'N/A';
        const cuisineOriginal = recipe.cuisineType?.[0].replace(/\b\w/g, l => l.toUpperCase()) || 'Global';
        const cuisineTraduzida = dicionarioDeRotulos[cuisineOriginal] || cuisineOriginal;
        const displayLabels = [...new Set([...recipe.dietLabels, ...recipe.healthLabels])].slice(0, 3);
        const caloriesPerServing = Math.round(recipe.calories / servings);
        let calorieColorClass = 'text-gray-700';
        if (caloriesPerServing <= 400) calorieColorClass = 'text-green-600';
        else if (caloriesPerServing <= 700) calorieColorClass = 'text-orange-500';
        else calorieColorClass = 'text-red-600';
        return `
            <div class="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col group border hover:border-emerald-500">
                <button class="favorite-btn absolute top-4 right-4 bg-white/70 backdrop-blur-sm p-2 rounded-full transition hover:bg-white z-10 ${favoritedClass}" data-recipe-id="${recipeId}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                <a href="receita.html?id=${recipeId}" class="block overflow-hidden rounded-t-2xl">
                    <img src="${recipe.image}" alt="${recipe.label}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                </a>
                <div class="p-5 flex flex-col flex-grow">
                    <h4 class="text-lg font-bold text-gray-800 mb-3 truncate" title="${recipe.label}">${recipe.label}</h4>
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-4 border-b pb-3">
                        <div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg><span class="font-medium">Serve ${servings}</span></div>
                        <div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 4.629 7.973 4 10 4c2.027 0 3.488.629 4.756 1.321a6.012 6.012 0 011.912 2.706C17.37 9.488 18 11.227 18 13c0 1.773-.63 3.512-1.668 4.973a6.01 6.01 0 01-2.706 1.912C12.512 20.37 11.027 21 9 21c-2.027 0-3.488-.629-4.756-1.321a6.01 6.01 0 01-2.706-1.912C.63 16.512 0 14.773 0 13c0-1.773.63-3.512 1.668-4.973z" clip-rule="evenodd" /></svg><span class="font-medium">${cuisineTraduzida}</span></div>
                    </div>
                    <div class="text-center mb-4"><p class="text-4xl font-extrabold ${calorieColorClass}">${caloriesPerServing}</p><p class="text-sm font-medium text-gray-500 -mt-1">Kcal / porção</p></div>
                    <div class="flex-grow flex flex-wrap gap-2 items-center mb-4">${displayLabels.map(label => {const labelTraduzida = dicionarioDeRotulos[label] || label; return `<span class="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">${labelTraduzida.replace(/-/g, ' ')}</span>`;}).join('')}</div>
                    <a href="receita.html?id=${recipeId}" class="mt-auto w-full text-center bg-secondary-blue text-white py-2.5 rounded-lg hover:bg-blue-600 transition font-semibold shadow-md hover:shadow-lg">Ver Receita</a>
                </div>
            </div>
        `;
    }).join('');
    elements.recipesContainer.insertAdjacentHTML('beforeend', recipesHtml);
}

function handlePagination(nextUrl) {
    if (nextUrl) {
        const queryString = nextUrl.split('?')[1];
        elements.loadMoreButton.dataset.nextQuery = queryString;
        elements.loadMoreButton.classList.remove('hidden');
    } else {
        elements.loadMoreButton.classList.add('hidden');
        elements.loadMoreButton.dataset.nextQuery = "";
    }
}

function toggleFilterPanel() {
    elements.filterPanel.classList.toggle('hidden');
}

// --- Event Listeners ---
elements.toggleFilterButton.addEventListener('click', toggleFilterPanel);
elements.navFilterButton.addEventListener('click', toggleFilterPanel);
elements.mobileNavFilterButton.addEventListener('click', () => { toggleFilterPanel(); elements.mobileMenu.classList.add('hidden'); });
elements.searchButton.addEventListener('click', performSearch);
elements.searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
elements.applyFiltersButton.addEventListener('click', () => { performSearch(); toggleFilterPanel(); });
elements.hamburgerButton.addEventListener('click', () => { elements.mobileMenu.classList.toggle('hidden'); });

elements.loadMoreButton.addEventListener('click', (e) => {
    const nextQuery = e.currentTarget.dataset.nextQuery;
    if (nextQuery) {
        const localApiUrl = `${API_URL}?${nextQuery}`;
        fetchRecipes(localApiUrl, false);
    }
});

elements.recipesContainer.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('.favorite-btn');
    if (favoriteButton) {
        const recipeId = favoriteButton.dataset.recipeId;
        toggleFavorite(recipeId, favoriteButton);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const initialSearches = ["chicken", "fish", "salad", "soup", "beef", "pasta"];
    const randomTerm = initialSearches[Math.floor(Math.random() * initialSearches.length)];
    elements.searchInput.value = randomTerm;
    performSearch();
    fetchRecipeOfTheDay();
    const collectionCards = document.querySelectorAll('.collection-card');
    collectionCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            const query = card.dataset.searchQuery;
            elements.searchInput.value = query;
            performSearch();
            document.getElementById('recipesContainer').scrollIntoView({ behavior: 'smooth' });
        });
    });
});