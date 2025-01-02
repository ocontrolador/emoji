document.addEventListener('DOMContentLoaded', function() {
  const tabsContainer = document.querySelector('.tabs');
  const categories = [
      "Rostos", "Maos", "Pessoas", "Escritorio", "Lugares", "Transporte",
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

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      tbody.id = `${category}-body`;

      thead.innerHTML = `
          <tr>
              <th>Char</th>
              <th>Dec</th>
              <th>Hex</th>
              <th>Nome</th>
          </tr>
      `;

      table.appendChild(thead);
      table.appendChild(tbody);
      tabContent.appendChild(searchBox);
      tabContent.appendChild(table);
      tabsContainer.appendChild(tabContent);
  });

  // Ativar a primeira aba
  document.querySelector('.tab-content').classList.add('active');

  // Carregar o arquivo JSON
  fetch(chrome.runtime.getURL('emojis.json'))
      .then(response => response.json())
      .then(data => {
          // Preencher as tabelas com os emojis
          for (const category in data) {
              const tbody = document.getElementById(`${category}-body`);
              data[category].forEach(emoji => {
                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td class="emoji-cell">${emoji.char}</td>
                      <td>${emoji.dec}</td>
                      <td>${emoji.hex}</td>
                      <td>${emoji.name}</td>
                  `;
                  tbody.appendChild(row);
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
          const rows = currentTab.querySelectorAll('tbody tr');

          rows.forEach(row => {
              const text = row.textContent.toLowerCase();
              row.style.display = text.includes(searchTerm) ? '' : 'none';
          });
      });
  });
});