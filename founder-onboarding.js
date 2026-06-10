(function(){
  const saveKeys = [
    'barkRaidersSaveV9',
    'barkRaidersSaveV8',
    'barkRaidersSaveV7',
    'barkRaidersMetaV23',
  ];
  const hasExistingProgress = saveKeys.some(key => localStorage.getItem(key));
  if(hasExistingProgress || !window.v24OpenCreator || !state.v23) return;

  state.v23.needsFounder = true;

  const modal = document.getElementById('creatorModal');
  const card = modal?.querySelector('.modal-card');
  const closeButton = document.getElementById('closeCreatorBtn');
  const title = document.getElementById('creatorModalTitle');
  const intro = document.getElementById('creatorModalIntro');
  const originalCreateButton = document.getElementById('createRaiderModalBtn');
  const validation = document.getElementById('creatorValidation');

  if(!modal || !card || !originalCreateButton) return;

  const style = document.createElement('style');
  style.textContent = `
    .creator-modal-intro { margin: -6px 0 12px; }
    .creator-modal-card.first-raider {
      border-color: var(--accent);
      box-shadow: 0 22px 70px rgba(0,0,0,.55), 0 0 36px rgba(242,164,60,.16);
    }
    .creator-validation {
      margin: 12px 0 0;
      color: #ff9d93;
      font-weight: 800;
    }
  `;
  document.head.appendChild(style);

  card.classList.add('first-raider');
  if(title) title.textContent = 'Create Your First Raider';
  if(intro) intro.textContent = 'Every kennel starts with one good dog. Choose their name, breed, coat, and collar.';
  if(closeButton) closeButton.classList.add('hidden');

  const createButton = originalCreateButton.cloneNode(true);
  createButton.textContent = 'Start With This Raider';
  originalCreateButton.replaceWith(createButton);

  createButton.addEventListener('click', () => {
    const nameInput = document.getElementById('modalRaiderName');
    const name = (nameInput?.value || '').trim();
    if(!name){
      if(validation){
        validation.textContent = 'Give your raider a name before starting the kennel.';
        validation.classList.remove('hidden');
      }
      nameInput?.focus();
      return;
    }

    const breed = document.getElementById('modalRaiderBreed')?.value || 'shiba';
    const color = document.getElementById('modalRaiderColor')?.value || 'red';
    const accent = document.getElementById('modalRaiderAccent')?.value || '#8bd77f';
    const raider = {
      id:'raider1',
      name,
      breed,
      color,
      accent,
      level:1,
      xp:0,
      xpNext:40,
      bond:0,
      injuries:[],
    };

    state.roster = [raider];
    state.dogId = raider.id;
    state.injuries = [];
    state.dog.level = 1;
    state.dog.xp = 0;
    state.dog.xpNext = 40;
    state.v23.needsFounder = false;
    state.v23.raiderCounter = Math.max(2, state.v23.raiderCounter || 2);

    applyUpgrades();
    updateGear();
    log(`Welcome to the kennel, ${name}.`);
    save();
    location.reload();
  });

  window.v24OpenCreator();
  window.setTimeout(() => document.getElementById('modalRaiderName')?.focus(), 0);
})();
