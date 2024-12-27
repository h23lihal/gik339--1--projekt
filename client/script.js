// URL för REST API
const url = "http://localhost:3000/books";

// WebSocket-anslutning
const socket = new WebSocket('ws://localhost:3000/');

// DOM-element
const booksContainer = document.getElementById('Books');
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');

function fetchBooks() {
  fetch(url)
    .then((response) => response.json())
    .then((books) => {
      console.log(books); // Kontrollera att data hämtas korrekt

      if (Array.isArray(books) && books.length > 0) {
        let html = `<ul style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; list-style-type: none; padding: 0;">`;

        // Ändra här: använd rätt variabelnamn för varje bok
        books.forEach((book) => {  // "book" är variabelnamnet här
          html += `
            <div id="book-${book.id}" class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mb-3" style="list-style: none;">
              <div class="books" style="
                background-color: #A76FB4;
                padding: 2rem;
                border-radius: 1rem;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                border: 0.2rem solid #000000;
                font-size: 1.2rem;">
                <p><strong>Titel:</strong> ${book.Titel}</p>
                <p><strong>Författare:</strong> ${book.Författare}</p>
                <p><strong>Genre:</strong> ${book.Gener}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="btn btn-primary" onclick="deleteBook(${book.id})" style="background-color: #FF6347; color: white; border-radius: 0.5rem;">Ta bort</button>
                <button class="btn btn-primary" onclick="updateBook(${book.id})" style="background-color: #FF6347; color: white; border-radius: 0.5rem;">Ändra</button>
              </div>
              </div>
            </div>`;
        });

        html += `</ul>`;

        // Rensa och sätt in HTML i container
        const listContainer = document.getElementById('Books');
        listContainer.innerHTML = ''; // Töm container innan vi sätter ny HTML
        listContainer.insertAdjacentHTML('beforeend', html); // Lägg till HTML
      } else {
        console.log('Ingen bok att visa');
      }
    })
    .catch((error) => console.error('Error fetching books:', error));
}

window.addEventListener('load', fetchBooks);
  

// Lyssna på WebSocket-meddelanden
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Mottog WebSocket-meddelande:', message); // Logga WebSocket-meddelandet

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
          document.getElementById('Genre').value = '';  // Kontrollera detta
  
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
    document.getElementById('Titel').value = '';
    document.getElementById('Författare').value = '';
    document.getElementById('Gener').value = '';

 