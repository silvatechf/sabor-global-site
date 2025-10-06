const API_URL = '/api/recipes';

const dicionarioDeRotulos = {
    // Rótulos de Dieta
    "Balanced": "Balanceada",
    "High-Protein": "Rica em Proteína",
    "Low-Fat": "Baixa Gordura",
    "Low-Carb": "Low-Carb",
    "Vegan": "Vegana",
    "Vegetarian": "Vegetariana",

    // Rótulos de Saúde e Alergia
    "Alcohol-Free": "Sem Álcool",
    "Gluten-Free": "Sem Glúten",
    "Lactose-Free": "Sem Lactose",
    "Peanut-Free": "Sem Amendoim",
    "Sugar-Conscious": "Baixo Açúcar",
    "Kidney-Friendly": "Bom para os Rins",
    "Low Potassium": "Baixo Potássio",
    "Low Sodium": "Baixo Sódio",
    "Dairy-Free": "Sem Laticínios",
    "Wheat-Free": "Sem Trigo",

    // Tipos de Cozinha
    "American": "Americana",
    "Asian": "Asiática",
    "Brazilian": "Brasileira",
    "French": "Francesa",
    "Indian": "Indiana",
    "Italian": "Italiana",
    "Japanese": "Japonesa",
    "Mediterranean": "Mediterrânea",
    "Mexican": "Mexicana",
    "South American": "Sul-Americana"
};


const elements = {
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton'),
    applyFiltersButton: document.getElementById('applyFiltersButton'),
    toggleFilterButton: document.getElementById('toggleFilterButton'),
    navFilterButton: document.getElementById('navFilterButton'),
    mobileNavFilterButton: document.getElementById('mobileNavFilterButton'),
    filterPanel: document.getElementById('filterPanel'),
    recipesContainer: document.getElementById('recipesContainer'),
    messageArea: document.getElementById('messageArea'),
    loadMoreButton: document.getElementById('loadMoreButton'),
    loadingMore: document.getElementById('loadingMore'),
    maxCalories: document.getElementById('maxCalories'),
    dietType: document.getElementById('dietType'),
    healthType: document.getElementById('healthType'),
    cuisineType: document.getElementById('cuisineType'),
    hamburgerButton: document.getElementById('hamburger-button'),
    mobileMenu: document.getElementById('mobile-menu'),
    featuredRecipeSection: document.getElementById('featured-recipe-section'),
    featuredRecipeContainer: document.getElementById('featured-recipe-container'),
    activeFiltersContainer: document.getElementById('active-filters-container'),
};



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
    
    const featuredHtml = `
        <img src="${recipe.image}" alt="${recipe.label}" class="w-full md:w-1/3 h-64 md:h-auto object-cover">
        <div class="p-8 flex-1">
            <h4 class="text-4xl font-extrabold text-gray-800 mb-2">${recipe.label}</h4>
            <p class="text-gray-500 mb-6">Por: ${recipe.source}</p>
            <div class="flex flex-wrap gap-x-8 gap-y-4 mb-6">
                <div class="text-center">
                    <p class="text-2xl font-bold text-primary-green">${caloriesPerServing}</p>
                    <p class="text-sm text-gray-600">Kcal/Porção</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-primary-green">${servings}</p>
                    <p class="text-sm text-gray-600">Porções</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-primary-green">${recipe.ingredients.length}</p>
                    <p class="text-sm text-gray-600">Ingredientes</p>
                </div>
            </div>
            <a href="${recipe.url}" target="_blank" class="inline-block bg-secondary-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition duration-300 shadow-lg">
                Ver Receita Completa
            </a>
        </div>
    `;
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
        activeFilters.forEach(filter => {
            filtersHtml += `<span class="bg-blue-200 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">${filter}</span>`;
        });
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
            skeletonHTML += `
                <div class="bg-white rounded-2xl shadow-lg flex flex-col border animate-pulse">
                    <div class="bg-gray-300 w-full h-48 rounded-t-2xl"></div>
                    <div class="p-5">
                        <div class="bg-gray-300 h-6 w-3/4 rounded-md mb-4"></div>
                        <div class="bg-gray-200 h-4 w-1/2 rounded-md mb-4"></div>
                        <div class="bg-gray-200 h-10 w-full rounded-md"></div>
                    </div>
                </div>
            `;
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
        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }
        const data = await response.json();
        renderRecipes(data.hits, isNewSearch);
        handlePagination(data._links?.next?.href);
    } catch (error) {
        console.error("Erro ao buscar receitas:", error);
        if (isNewSearch) elements.recipesContainer.innerHTML = '';
        const friendlyMessage = "Oops! Parece que tivemos um problema ao buscar as receitas. Por favor, tente refinar sua busca ou tente novamente mais tarde.";
        elements.messageArea.textContent = friendlyMessage;
        elements.messageArea.classList.remove('hidden');
    } finally {
        if (!isNewSearch) elements.loadingMore.classList.add('hidden');
        elements.searchButton.disabled = false;
        elements.searchButton.textContent = 'Pesquisar Receita';
    }
}

function performSearch() {
    const query = elements.searchInput.value.trim();
    if (!query) {
        elements.messageArea.textContent = "Por favor, digite um ingrediente para buscar.";
        elements.messageArea.classList.remove('hidden');
        elements.recipesContainer.innerHTML = '';
        return;
    }
    elements.searchButton.disabled = true;
    elements.searchButton.textContent = 'Buscando...';
    
    updateActiveFiltersUI();

    const filterParams = getFilterParams();
    const baseUrl = `${API_URL}?type=public&q=${encodeURIComponent(query)}`;
    const finalUrl = `${baseUrl}&${filterParams.toString()}`;
    fetchRecipes(finalUrl, true);
}

function renderRecipes(hits, clearContainer = true) {
    if (clearContainer) {
        elements.recipesContainer.innerHTML = '';
    }
    
    if (hits.length === 0 && clearContainer) {
        const searchTerm = elements.searchInput.value;
        const emptyStateHTML = `
            <div class="col-span-full bg-white p-8 md:p-12 rounded-2xl shadow-lg text-center border border-slate-200">
                <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100">
                    <svg class="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 class="mt-6 text-2xl font-bold text-slate-900">Nenhum resultado para "${searchTerm}"</h3>
                <p class="mt-2 text-md text-slate-600">Não encontramos o que você procura. Que tal tentar estas dicas?</p>
                <div class="mt-8 text-left max-w-lg mx-auto border-t border-slate-200 pt-8">
                    <ul class="space-y-5 text-slate-700">
                        <li class="flex items-start gap-3">
                            <svg class="h-6 w-6 text-primary-green flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>Verifique se não há <strong class="font-semibold">erros de digitação</strong> na sua busca.</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="h-6 w-6 text-primary-green flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.7 9.3l.16-.29M16.3 9.3l-.16-.29M12 12l.01 0" /></svg>
                            <span>Busque termos em <strong class="font-semibold">inglês</strong>, ex: <code class="bg-slate-100 p-1 rounded">salmon</code> ao invés de SALMÃO, ou <code class="bg-slate-100 p-1 rounded">pasta</code> ao invés de MACARRÃO, etc.</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="h-6 w-6 text-primary-green flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0012 15.586V21a1 1 0 01-1 1H4a1 1 0 01-1-1v-2.586a1 1 0 00-.293-.707l-6.414-6.414A1 1 0 013 6.586V4z" /></svg>
                            <span>Confira os <button id="check-filters-link" class="text-secondary-blue font-bold underline hover:text-blue-700">filtros ativos</button>, eles podem estar muito restritivos.</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        elements.recipesContainer.innerHTML = emptyStateHTML;
        elements.messageArea.classList.add('hidden');
        document.getElementById('check-filters-link').addEventListener('click', () => {
            elements.filterPanel.classList.remove('hidden');
            elements.filterPanel.scrollIntoView({ behavior: 'smooth' });
        });
        return;
    }
    
    elements.messageArea.classList.add('hidden');

    const recipesHtml = hits.map(hit => {
        const { recipe } = hit;
        const servings = recipe.yield || 'N/A';
        
        const cuisineOriginal = recipe.cuisineType?.[0].replace(/\b\w/g, l => l.toUpperCase()) || 'Global';
        const cuisineTraduzida = dicionarioDeRotulos[cuisineOriginal] || cuisineOriginal;

        const allLabels = [...recipe.dietLabels, ...recipe.healthLabels];
        const uniqueLabels = [...new Set(allLabels)].filter(label => !['mediterranean'].includes(label.toLowerCase()));
        const displayLabels = uniqueLabels.slice(0, 3);
        const caloriesPerServing = Math.round(recipe.calories / servings);

        let calorieColorClass = 'text-gray-700';
        if (caloriesPerServing <= 400) calorieColorClass = 'text-green-600';
        else if (caloriesPerServing <= 700) calorieColorClass = 'text-orange-500';
        else calorieColorClass = 'text-red-600';

        return `
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col group border hover:border-emerald-500">
                <a href="${recipe.url}" target="_blank" class="block overflow-hidden rounded-t-2xl">
                    <img src="${recipe.image}" alt="${recipe.label}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                </a>
                <div class="p-5 flex flex-col flex-grow">
                    <h4 class="text-lg font-bold text-gray-800 mb-3 truncate" title="${recipe.label}">${recipe.label}</h4>
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-4 border-b pb-3">
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                            <span class="font-medium">Serve ${servings}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 4.629 7.973 4 10 4c2.027 0 3.488.629 4.756 1.321a6.012 6.012 0 011.912 2.706C17.37 9.488 18 11.227 18 13c0 1.773-.63 3.512-1.668 4.973a6.01 6.01 0 01-2.706 1.912C12.512 20.37 11.027 21 9 21c-2.027 0-3.488-.629-4.756-1.321a6.01 6.01 0 01-2.706-1.912C.63 16.512 0 14.773 0 13c0-1.773.63-3.512 1.668-4.973z" clip-rule="evenodd" /></svg>
                            <span class="font-medium">${cuisineTraduzida}</span>
                        </div>
                    </div>
                    <div class="text-center mb-4">
                        <p class="text-4xl font-extrabold ${calorieColorClass}">${caloriesPerServing}</p>
                        <p class="text-sm font-medium text-gray-500 -mt-1">Kcal / porção</p>
                    </div>
                    <div class="flex-grow flex flex-wrap gap-2 items-center mb-4">
                        ${displayLabels.map(label => {
                            const labelTraduzida = dicionarioDeRotulos[label] || label;
                            return `<span class="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">${labelTraduzida.replace(/-/g, ' ')}</span>`;
                        }).join('')}
                    </div>
                    <a href="${recipe.url}" target="_blank" class="mt-auto w-full text-center bg-secondary-blue text-white py-2.5 rounded-lg hover:bg-blue-600 transition font-semibold shadow-md hover:shadow-lg">Ver Receita</a>
                </div>
            </div>
        `;
    }).join('');
    elements.recipesContainer.insertAdjacentHTML('beforeend', recipesHtml);
}

// --- INÍCIO DA CORREÇÃO ---
function handlePagination(nextUrl) {
    if (nextUrl) {
        // Extrai apenas os parâmetros (tudo depois do "?") do link completo
        const queryString = nextUrl.split('?')[1];
        elements.loadMoreButton.dataset.nextQuery = queryString; // Salva apenas os parâmetros
        elements.loadMoreButton.classList.remove('hidden');
    } else {
        elements.loadMoreButton.classList.add('hidden');
        elements.loadMoreButton.dataset.nextQuery = ""; // Limpa os parâmetros
    }
}
// --- FIM DA CORREÇÃO ---


function toggleFilterPanel() {
    elements.filterPanel.classList.toggle('hidden');
}
elements.toggleFilterButton.addEventListener('click', toggleFilterPanel);
elements.navFilterButton.addEventListener('click', toggleFilterPanel);
elements.mobileNavFilterButton.addEventListener('click', () => {
    toggleFilterPanel();
    elements.mobileMenu.classList.add('hidden');
});

elements.searchButton.addEventListener('click', performSearch);
elements.searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
elements.applyFiltersButton.addEventListener('click', () => {
    performSearch();
    toggleFilterPanel();
});

elements.hamburgerButton.addEventListener('click', () => {
    elements.mobileMenu.classList.toggle('hidden');
});

// --- INÍCIO DA CORREÇÃO ---
elements.loadMoreButton.addEventListener('click', (e) => {
    const nextQuery = e.currentTarget.dataset.nextQuery; // Pega os parâmetros que salvamos
    if (nextQuery) {
        // Monta a URL para a nossa API interna (/api/recipes)
        const localApiUrl = `${API_URL}?${nextQuery}`;
        fetchRecipes(localApiUrl, false); // Chama a função de busca com o link correto
    }
});
// --- FIM DA CORREÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    const initialSearches = ["chicken","fish", "Salada", "Sopa", "Carne", "Meat", "Peixe", "pasta"];
    const randomTerm = initialSearches[Math.floor(Math.random() * initialSearches.length)];
    elements.searchInput.value = randomTerm;
    performSearch();
    fetchRecipeOfTheDay();
    
    // LÓGICA PARA OS CARDS DE COLEÇÕES
    const collectionCards = document.querySelectorAll('.collection-card');
    collectionCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault(); // Impede que o link padrão (#) funcione
            
            const query = card.dataset.searchQuery; // Pega a busca do atributo "data-search-query"
            elements.searchInput.value = query; // Coloca o texto da busca no campo de pesquisa
            performSearch(); // Executa a busca
            
            // Rola a página suavemente até os resultados
            document.getElementById('recipesContainer').scrollIntoView({ behavior: 'smooth' });
        });
    });
});