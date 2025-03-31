
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
            if (document.querySelector('.tab-content')) {
                 document.querySelector('.tab-content').classList.add('active');
            }
           if(document.querySelector('.tab-button')) {
               document.querySelector('.tab-button').classList.add('active');
           }


            const allEmojis = new Set();

            // Preencher as grades com os emojis
            for (const category in data) {
                const emojiGrid = document.getElementById(`${category}-grid`);
                 if (!emojiGrid) {
                     console.warn(`Emoji grid not found for category: ${category}`);
                     continue; // Pula para a próxima categoria se a grid não existir
                 }
                data[category].forEach(emoji => {
                     // Validação básica do objeto emoji
                     if (!emoji || typeof emoji.char === 'undefined' || typeof emoji.name === 'undefined' || typeof emoji.dec === 'undefined' || typeof emoji.hex === 'undefined') {
                         console.warn('Skipping invalid emoji object:', emoji);
                         return; // Pula este emoji se estiver malformado
                     }

                    const emojiItem = createEmojiItem(emoji);
                    emojiGrid.appendChild(emojiItem);

                    // Adicionar emoji à aba "Todos" sem repetição
                    if (!allEmojis.has(emoji.char)) {
                        allEmojis.add(emoji.char);
                        const allGrid = document.getElementById('Todos-grid');
                        if (allGrid) {
                            // Precisamos criar um *novo* item para a aba "Todos"
                            const allEmojiItem = createEmojiItem(emoji);
                            allGrid.appendChild(allEmojiItem);
                        }
                    }
                });
            }

            // Atualizar a contagem de emojis inicial para todas as abas
             document.querySelectorAll('.tab-content').forEach(tab => {
                 updateEmojiCount(tab); // Passa a aba específica para atualizar
             });
             // Garante que a contagem da aba ativa esteja correta após o preenchimento inicial
             const activeTabInitially = document.querySelector('.tab-content.active');
             if (activeTabInitially) {
                 updateEmojiCount(activeTabInitially);
             }


            // Adicionar funcionalidade de troca de abas
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                    button.classList.add('active');
                    const tabId = button.getAttribute('data-tab');
                    const targetTab = document.getElementById(tabId);
                    if (targetTab) {
                        targetTab.classList.add('active');
                        updateEmojiCount(targetTab); // Atualiza a contagem da aba que se tornou ativa
                    }
                });
            });

            // Sistema de busca - Ajustado para atualizar a contagem da aba correta
            document.querySelectorAll('.search-box').forEach(searchBox => {
                searchBox.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase();
                    const currentTab = this.closest('.tab-content'); // Encontra a aba pai da caixa de busca
                    if (!currentTab) return; // Segurança

                    const emojiItems = currentTab.querySelectorAll('.emoji-item');

                    emojiItems.forEach(item => {
                        // Busca no caractere ou no nome do emoji
                        const emojiChar = item.querySelector('.emoji-char')?.textContent.toLowerCase() || '';
                        const emojiName = item.querySelector('.emoji-name')?.textContent.toLowerCase() || '';
                        const isVisible = emojiChar.includes(searchTerm) || emojiName.includes(searchTerm);
                        item.style.display = isVisible ? 'flex' : 'none'; // Use 'flex' se seu CSS usar display:flex para .emoji-item
                    });

                    updateEmojiCount(currentTab); // Atualiza a contagem da aba atual
                });
            });
        })
        .catch(error => console.error('Erro ao carregar ou processar o JSON:', error));

    // --- MODIFICADO ---
    function createEmojiItem(emoji) {
        const emojiItem = document.createElement('div');
        emojiItem.classList.add('emoji-item');

        // Cria os elementos internos
        const emojiCharDiv = document.createElement('div');
        emojiCharDiv.classList.add('emoji-char');
        emojiCharDiv.textContent = emoji.char;

        const emojiNameDiv = document.createElement('div');
        emojiNameDiv.classList.add('emoji-name');
        emojiNameDiv.textContent = emoji.name;

        // Container para os botões de cópia
        const copyOptionsDiv = document.createElement('div');
        copyOptionsDiv.classList.add('copy-options');

        // Botão para copiar CHAR
        const copyCharButton = document.createElement('button');
        copyCharButton.classList.add('copy-button', 'copy-char');
        copyCharButton.textContent = 'Char';
        copyCharButton.title = `Copiar caractere: ${emoji.char}`;
        copyCharButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique se propague para o emojiItem (se houver listener nele)
            copyToClipboard(emoji.char, copyCharButton);
        });

        // Botão para copiar DEC (como entidade HTML)
        const copyDecButton = document.createElement('button');
        copyDecButton.classList.add('copy-button', 'copy-dec');
        copyDecButton.textContent = 'Dec';
        const decCode = `&#${emoji.dec};`;
        copyDecButton.title = `Copiar código Decimal HTML: ${decCode}`;
        copyDecButton.addEventListener('click', (event) => {
            event.stopPropagation();
            copyToClipboard(decCode, copyDecButton);
        });

        // Botão para copiar HEX (como entidade HTML)
        const copyHexButton = document.createElement('button');
        copyHexButton.classList.add('copy-button', 'copy-hex');
        copyHexButton.textContent = 'Hex';
        const hexCode = `&#x${emoji.hex};`;
        copyHexButton.title = `Copiar código Hexadecimal HTML: ${hexCode}`;
        copyHexButton.addEventListener('click', (event) => {
            event.stopPropagation();
            copyToClipboard(hexCode, copyHexButton);
        });

        // Adiciona os botões ao container de opções
        copyOptionsDiv.appendChild(copyCharButton);
        copyOptionsDiv.appendChild(copyDecButton);
        copyOptionsDiv.appendChild(copyHexButton);

        // Adiciona os elementos principais e as opções ao item do emoji
        emojiItem.appendChild(emojiCharDiv);
        emojiItem.appendChild(emojiNameDiv);
        emojiItem.appendChild(copyOptionsDiv);

        return emojiItem;
    }

    // --- MODIFICADO ---
    // Função genérica para copiar texto e mostrar notificação
    function copyToClipboard(textToCopy, elementToShowNotificationNear) {
        if (!navigator.clipboard) {
            console.error("Clipboard API não suportada neste navegador.");
            // Fallback (menos seguro e pode não funcionar em extensões)
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed"; // Fora da tela
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification(elementToShowNotificationNear, "✔️ Copiado (fallback)");
            } catch (err) {
                showNotification(elementToShowNotificationNear, "❌ Falha ao copiar");
                console.error('Fallback de cópia falhou:', err);
            }
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification(elementToShowNotificationNear, "✔️ Copiado");
        }).catch(err => {
            showNotification(elementToShowNotificationNear, "❌ Falha");
            console.error('Erro ao copiar para a área de transferência:', err);
        });
    }

    // --- MODIFICADO --- (Adicionado parâmetro de texto da notificação)
    function showNotification(targetElement, message = "✔️ Copiado") {
        // Remove notificações antigas, se houver
        const existingNotification = document.querySelector('.copy-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.classList.add('copy-notification'); // Usar uma classe específica
        notification.textContent = message;
        notification.style.position = 'absolute';
        notification.style.zIndex = '1000'; // Garante que fique por cima
        notification.style.padding = '5px 10px';
        notification.style.background = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.borderRadius = '4px';
        notification.style.fontSize = '12px';
        notification.style.textAlign = 'center';
        // Tenta posicionar perto do elemento clicado
         const rect = targetElement.getBoundingClientRect();
         // Ajusta para a posição dentro do popup/documento
         notification.style.top = `${rect.top + window.scrollY - notification.offsetHeight - 5}px`; // Um pouco acima do botão
         notification.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (notification.offsetWidth / 2)}px`; // Centralizado horizontalmente

        document.body.appendChild(notification);

        // Reposiciona após adicionar ao DOM para obter dimensões corretas
        notification.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (notification.offsetWidth / 2)}px`;

        setTimeout(() => {
            notification.remove();
        }, 800); // Aumentei um pouco o tempo para melhor visibilidade
    }

     // --- MODIFICADO --- (Aceita um elemento de aba específico)
    function updateEmojiCount(tabElement = null) {
        const targetTab = tabElement || document.querySelector('.tab-content.active'); // Usa a aba fornecida ou a ativa
        if (targetTab) {
             // Seleciona apenas emojis visíveis DENTRO da aba alvo
            const visibleEmojis = targetTab.querySelectorAll('.emoji-item:not([style*="display: none"])').length;
             // Seleciona TODOS os emojis DENTRO da aba alvo
            const totalEmojis = targetTab.querySelectorAll('.emoji-item').length;
            const emojiCountSpan = targetTab.querySelector('.emoji-count');
            if (emojiCountSpan) {
                // Verifica se a busca está ativa (se algum emoji está escondido)
                 const searchBox = targetTab.querySelector('.search-box');
                 const isSearching = searchBox && searchBox.value.trim() !== '';

                 if (isSearching) {
                     emojiCountSpan.textContent = `${visibleEmojis} de ${totalEmojis} emojis encontrados`;
                 } else {
                     emojiCountSpan.textContent = `${totalEmojis} emojis`; // Mostra apenas o total se não houver busca ativa
                 }
            }
        }
    }

});
