// Cargar emotes de 7TV
fetch('https://7tv.io/v2/emotes/global')
  .then(response => response.json())
  .then(emotes => {
    const emotesContainer = document.getElementById('emotes');
    emotes.forEach(emote => {
      const img = document.createElement('img');
      img.src = emote.urls[1][1];  // URL del emote
      img.alt = emote.name;
      img.title = emote.name;
      emotesContainer.appendChild(img);
    });
  })
  .catch(error => console.error('Error al cargar los emotes:', error));
