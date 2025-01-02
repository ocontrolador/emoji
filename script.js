document.addEventListener('DOMContentLoaded', function() {
  const tabsContainer = document.querySelector('.tabs');
  const categories = [
      "Todos", "Rostos", "Maos", "Pessoas", "Escritorio", "Lugares", "Transporte",
      "Animais", "Comidas", "Plantas", "Esportes", "CeuTerra", "Clima",
      "Roupas", "AudioVideo", "Celebracao", "Simbolos", "Bandeiras", "Objetos",
      "Programacao", "Matematica", "Setas"
  ];

  // Criar as divs de conteúdo para cada categoria
  categories.forEach(category => {
      const tabContent = document.createElement('div');
      tabContent.classList.add('tab-content');
      tabContent.id = category;

      const searchBox = document.createElement('input');
      searchBox.type = 'text';
      searchBox.classList.add('search-box');
      searchBox.placeholder = 'Pesquisar emojis...';

      const emojiGrid = document.createElement('div');
      emojiGrid.classList.add('emoji-grid');
      emojiGrid.id = `${category}-grid`;

      tabContent.appendChild(searchBox);
      tabContent.appendChild(emojiGrid);
      tabsContainer.appendChild(tabContent);
  });

  // Ativar a primeira aba
  document.querySelector('.tab-content').classList.add('active');

  // Carregar o arquivo JSON
  fetch(chrome.runtime.getURL('emojis.json'))
      .then(response => response.json())
      .then(data => {
          const allEmojis = new Set(); // Para evitar repetições

          // Preencher as grades com os emojis
          for (const category in data) {
              const emojiGrid = document.getElementById(`${category}-grid`);
              data[category].forEach(emoji => {
                  if (!allEmojis.has(emoji.char)) {
                      allEmojis.add(emoji.char);

                      const emojiItem = document.createElement('div');
                      emojiItem.classList.add('emoji-item');
                      emojiItem.innerHTML = `
                          <div class="emoji-char">${emoji.char}</div>
                          <div class="emoji-name">${emoji.name}</div>
                      `;

                      // Adicionar funcionalidade de copiar
                      emojiItem.addEventListener('click', () => {
                          const decCode = `&#${emoji.dec};`;
                          navigator.clipboard.writeText(decCode).then(() => {
                              alert(`Código Decimal copiado: ${decCode}`);
                          });
                      });

                      emojiGrid.appendChild(emojiItem);

                      // Adicionar emoji à aba "Todos"
                      const allGrid = document.getElementById('Todos-grid');
                      if (allGrid) {
                          const allEmojiItem = emojiItem.cloneNode(true);
                          allGrid.appendChild(allEmojiItem);
                      }
                  }
              });
          }
      })
      .catch(error => console.error('Erro ao carregar o JSON:', error));

  // Sistema de abas
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Remove classes ativas
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // Adiciona classes ativas
          button.classList.add('active');
          const tabId = button.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
      });
  });

  // Sistema de busca
  const searchBoxes = document.querySelectorAll('.search-box');

  searchBoxes.forEach(searchBox => {
      searchBox.addEventListener('input', function() {
          const searchTerm = this.value.toLowerCase();
          const currentTab = this.closest('.tab-content');
          const emojiItems = currentTab.querySelectorAll('.emoji-item');

          emojiItems.forEach(item => {
              const text = item.textContent.toLowerCase();
              item.style.display = text.includes(searchTerm) ? '' : 'none';
          });
      });
  });
});