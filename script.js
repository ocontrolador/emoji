document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.querySelector('.tabs');
    const tabButtonsContainer = document.querySelector('.tab-buttons');
    const categories = new Set(["Todos"]); // Inicializa com "Todos"

    // Carregar o arquivo JSON
    fetch(chrome.runtime.getURL('emojis.json'))
        .then(response => response.json())
        .then(data => {
            // Obter as categorias dinamicamente
            Object.keys(data).forEach(category => categories.add(category));

            // Criar botões das abas dinamicamente
            categories.forEach(category => {
                const button = document.createElement('button');
                button.classList.add('tab-button');
                button.textContent = category;
                button.setAttribute('data-tab', category);
                tabButtonsContainer.appendChild(button);
            });

            // Criar as divs de conteúdo para cada categoria
            categories.forEach(category => {
                const tabContent = document.createElement('div');
                tabContent.classList.add('tab-content');
                tabContent.id = category;
    
                const searchContainer = document.createElement('div');
                searchContainer.classList.add('search-container');
    
                const searchBox = document.createElement('input');
                searchBox.type = 'text';
                searchBox.classList.add('search-box');
                searchBox.placeholder = 'Pesquisar emojis...';
    
                const emojiCount = document.createElement('span');
                emojiCount.classList.add('emoji-count');
                emojiCount.textContent = '0 emojis';
    
                searchContainer.appendChild(searchBox);
                searchContainer.appendChild(emojiCount);
                tabContent.appendChild(searchContainer);
    
                const emojiGrid = document.createElement('div');
                emojiGrid.classList.add('emoji-grid');
                emojiGrid.id = `${category}-grid`;
    
                tabContent.appendChild(emojiGrid);
                tabsContainer.appendChild(tabContent);
            });
    
            // Ativar a primeira aba
            document.querySelector('.tab-content').classList.add('active');
            document.querySelector('.tab-button').classList.add('active');
    
            const allEmojis = new Set();
            
            // Preencher as grades com os emojis
            for (const category in data) {
                const emojiGrid = document.getElementById(`${category}-grid`);
                data[category].forEach(emoji => {
                    const emojiItem = createEmojiItem(emoji);
                    emojiGrid.appendChild(emojiItem);
    
                    // Adicionar emoji à aba "Todos" sem repetição
                    if (!allEmojis.has(emoji.char)) {
                        allEmojis.add(emoji.char);
                        const allGrid = document.getElementById('Todos-grid');
                        if (allGrid) {
                            allGrid.appendChild(createEmojiItem(emoji));
                        }
                    }
                });
            }
    
            // Atualizar a contagem de emojis inicial
            updateEmojiCount();
    
            // Adicionar funcionalidade de troca de abas
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
                    button.classList.add('active');
                    const tabId = button.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                    updateEmojiCount();
                });
            });

            // Sistema de busca
            document.querySelectorAll('.search-box').forEach(searchBox => {
                searchBox.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase();
                    const currentTab = this.closest('.tab-content');
                    const emojiItems = currentTab.querySelectorAll('.emoji-item');
    
                    emojiItems.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
                    });
    
                    updateEmojiCount();
                });
            });
        })
        .catch(error => console.error('Erro ao carregar o JSON:', error));

    function createEmojiItem(emoji) {
        const emojiItem = document.createElement('div');
        emojiItem.classList.add('emoji-item');
        emojiItem.innerHTML = `
            <div class="emoji-char">${emoji.char}</div>
            <div class="emoji-name">${emoji.name}</div>
        `;
        emojiItem.addEventListener('click', (event) => copyEmoji(emoji.dec, event.target));
        return emojiItem;
    }

    function copyEmoji(decCode, element) {
        const code = `&#${decCode};`;
        navigator.clipboard.writeText(code).then(() => {
            showNotification(element);
        });
    }

    function showNotification(targetElement) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = "✔️ Copiado";
        notification.style.position = 'absolute';
        notification.style.top = `${targetElement.getBoundingClientRect().top + window.scrollY}px`;
        notification.style.left = `${targetElement.getBoundingClientRect().left + window.scrollX}px`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 500);
    }

    function updateEmojiCount() {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const visibleEmojis = activeTab.querySelectorAll('.emoji-item:not([style*="display: none"])').length;
            const totalEmojis = activeTab.querySelectorAll('.emoji-item').length;
            const emojiCount = activeTab.querySelector('.emoji-count');
            if (emojiCount) {
                emojiCount.textContent = `${visibleEmojis} de ${totalEmojis} emojis`;
            }
        }
    }
});
