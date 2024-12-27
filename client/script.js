// URL för REST API
const url = "http://localhost:3000/books";

// WebSocket-anslutning
const socket = new WebSocket('ws://localhost:3000');

// DOM-element
const booksContainer = document.getElementById('Books');
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');


fetch(url)
  .then(response => response.json())
  .then(data => {
    data.forEach(book => addBookToPage(book));
  });

// Lyssna på WebSocket-meddelanden
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.event) {
    case 'bookAdded':
      addBookToPage(message.data);
      break;
    case 'bookUpdated':
      updateBookOnPage(message.data);
      break;
    case 'bookDeleted':
      removeBookFromPage(message.data.id);
      break;
    default:
      console.error('Okänd händelse:', message.event);
  }
};

// Ta bort bok från DOM
function removeBookFromPage(bookId) {
    const bookElement = document.getElementById(`book-${bookId}`);
    if (bookElement) {
      bookElement.remove();
    }
  }
  
  saveButton.addEventListener('click', () => {
    const Titel = document.getElementById('Titel').value;
    const Författare = document.getElementById('Författare').value;
    const Genre = document.getElementById('Genre').value;
  
    if (Titel && Författare && Genre) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Titel, Författare, Gener: Genre })
      })
        .then(response => response.text())
        .then(message => {
          console.log(message);
  
          // Rensa fälten efter sparande
          document.getElementById('Titel').value = '';
          document.getElementById('Författare').value = '';
          document.getElementById('Genre').value = '';
  
          // Visa modalrutan
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();
        })
        .catch(error => console.error('Error:', error));
    } else {
      alert('Fyll i alla fält innan du sparar!');
    }
  });
  
  // Ta bort bok
  function deleteBook(bookId) {
    fetch(`${url}/${bookId}`, {
      method: 'DELETE'
    })
      .then(response => response.text())
      .then(message => {
        console.log(message);
      })
      .catch(error => console.error('Error:', error));
  }
  
  // Rensa formulär
  clearButton.addEventListener('click', () => {
    document.getElementById('Titel').value = '';
    document.getElementById('Författare').value = '';
    document.getElementById('Genre').value = '';
  });

 