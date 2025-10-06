document.addEventListener('DOMContentLoaded', () => {
    const recipeDetailsContainer = document.getElementById('recipe-details-container');
    const loadingMessage = document.getElementById('loading-message');

    
    const titleEl = document.getElementById('recipe-title');
    const sourceEl = document.getElementById('recipe-source');
    const imageEl = document.getElementById('recipe-image');
    const statsEl = document.getElementById('recipe-stats');
    const tagsEl = document.getElementById('recipe-tags');
    const ingredientsEl = document.getElementById('recipe-ingredients');
    const externalLinkEl = document.getElementById('recipe-external-link');

    
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');

    if (!recipeId) {
        loadingMessage.textContent = 'Erro: Nenhuma receita selecionada.';
        return;
    }

    
    fetch(`/api/recipes?id=${recipeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('A receita não foi encontrada ou ocorreu um erro.');
            }
            return response.json();
        })
        .then(recipe => {
            
            document.title = `${recipe.label} | Sabor Global`;
            titleEl.textContent = recipe.label;
            sourceEl.textContent = `Fonte: ${recipe.source}`;

            // Imagem
            imageEl.src = recipe.image;
            imageEl.alt = recipe.label;

            // Stats (Calorias, Porções, Ingredientes)
            const servings = recipe.yield || 'N/A';
            const caloriesPerServing = Math.round(recipe.calories / servings);
            statsEl.innerHTML = `
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
            `;

            // Tags (Rótulos de Dieta e Saúde)
            const allLabels = [...recipe.dietLabels, ...recipe.healthLabels];
            tagsEl.innerHTML = allLabels.map(label => 
                `<span class="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">${label.replace(/-/g, ' ')}</span>`
            ).join('');

            // Lista de Ingredientes
            ingredientsEl.innerHTML = recipe.ingredientLines.map(line => `<li>${line}</li>`).join('');

            // Link Externo
            externalLinkEl.href = recipe.url;

            // 4. Mostrar o conteúdo e esconder a mensagem de "Carregando"
            loadingMessage.classList.add('hidden');
            recipeDetailsContainer.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Erro ao buscar detalhes da receita:', error);
            loadingMessage.textContent = `Erro ao carregar a receita. Por favor, tente voltar e selecionar novamente. (${error.message})`;
        });
});