let allEmotes = {};  // Usar un objeto para mapear nombres de emotes a URLs

// Función para cargar los emotes del streamer al entrar en la página
async function loadEmotes(setID) {
    if (!setID || Object.keys(allEmotes).length > 0) return; // Evitar recargar si ya se cargaron emotes

    try {
        const response = await fetch(`https://7tv.io/v3/emote-sets/${setID}`);
        if (!response.ok) throw new Error('Set ID no encontrado.');

        const data = await response.json();
        data.emotes.forEach(emote => {
            const baseUrl = `https://${emote.data.host.url}/2x`;
            allEmotes[emote.name] = { gif: `${baseUrl}.gif`, png: `${baseUrl}.png` };
        });
        console.log(`Set de emotes cargado: ${data.name} (${Object.keys(allEmotes).length} emotes)`);

    } catch (error) {
        console.error('Error al cargar el set de emotes:', error.message);
    }
}

// Función para verificar si una URL de imagen es accesible
async function verifyImageUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' }); // Usar HEAD para verificar la existencia
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Función para obtener el aspecto de una imagen
async function getAspectRatio(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            resolve(aspectRatio);
        };
        img.onerror = reject;
        img.src = url;
    });
}

// Función para reemplazar texto de emotes por imágenes en el chat
async function replaceEmoteText(mutationRecords) {
    mutationRecords.forEach(mutation => {
        mutation.addedNodes.forEach(async node => {
            if (node.nodeType === 1) { // Verifica si el nodo es un elemento
                const messageSpans = node.querySelectorAll('span'); // Buscar todos los spans
                messageSpans.forEach(async span => {
                    let text = span.innerHTML;
                    if (text) {
                        const words = text.split(' ');
                        const replacedWords = await Promise.all(words.map(async word => {
                            if (allEmotes[word]) {
                                const { gif, png } = allEmotes[word];
                                const emoteContainer = document.createElement('span'); // Crea un contenedor para el emote
                                emoteContainer.classList.add('emote-container');

                                let img = document.createElement('img'); // Define img fuera del bloque if
                                if (await verifyImageUrl(gif)) {
                                    img.src = gif;
                                } else if (await verifyImageUrl(png)) {
                                    img.src = png;
                                }

                                if (img.src) {
                                    img.alt = word;
                                    img.classList.add('emote');
                                    img.style.width = 'auto'; // Ancho automático para mantener la relación de aspecto
                                    img.style.height = 'auto'; // Alto automático para mantener la relación de aspecto

                                    // Aplica el CSS de aspecto para hacer más grandes los emotes anchos
                                    const aspectRatio = await getAspectRatio(img.src);
                                    if (aspectRatio > 1) { // Ancho mayor que alto
                                        img.style.maxWidth = '78px'; // Ancho máximo más grande para emotes anchos
                                    } else {
                                        img.style.maxWidth = '56px'; // Ancho máximo estándar para emotes cuadrados
                                    }
                                    img.style.maxHeight = '38px'; // Alto máximo

                                    emoteContainer.appendChild(img);
                                }

                                return emoteContainer.outerHTML;
                            }
                            return word;
                        }));

                        if (replacedWords.join(' ') !== text) { // Solo actualizar si hay cambios
                            span.innerHTML = replacedWords.join(' ');
                        }
                    }
                });
            }
        });
    });
}

// Añadir CSS para ajustar el tamaño de los emotes
const style = document.createElement('style');
style.innerHTML = `
    .emote {
        max-width: 56px; /* Ajusta el tamaño máximo estándar */
        max-height: 38px; /* Ajusta el alto máximo */
        vertical-align: middle; /* Alinea verticalmente con el texto */
        display: inline-block; /* Mantiene los emotes en línea con el texto */
        object-fit: contain; /* Ajusta el tamaño de la imagen sin distorsión */
    }
    .emote-container {
        display: inline; /* Mantiene los emotes en línea con el texto */
        vertical-align: middle; /* Alinea verticalmente con el texto */
    }
`;
document.head.appendChild(style);

// Listener para detectar cambios en el chat y reemplazar los emotes
const chatContainer = document.querySelector('#chatroom-messages'); // Ajusta el selector para el contenedor de mensajes
if (chatContainer) {
    const observer = new MutationObserver(replaceEmoteText);
    observer.observe(chatContainer, { childList: true, subtree: true });
} else {
    console.error("Contenedor del chat no encontrado. Verifica el selector.");
}

// Llama a la función para cargar los emotes del set del streamer (reemplaza por el set ID correcto)
loadEmotes('66dba18c4e1871187160a53f'); // Set ID del streamer
