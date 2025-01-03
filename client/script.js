const url = 'http://localhost:3000/books';

window.addEventListener('load', fetchBooks);

function fetchBooks() {
  fetch(url)
    .then((response) => response.json())
    .then((books) => {
      console.log(books); // Kontrollera att data hämtas korrekt

      if (Array.isArray(books) && books.length > 0) {
        let html = `<ul style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; list-style-type: none; padding: 0;">`;
         books.forEach((book) => {
          html += `
            <div id="book-${book.id}" class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mb-3" style="list-style: none;">
              <div class="books" style="
                background-color: black;
                padding: 2rem;
                border-radius: 1rem;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                border: 0.5rem solid ${book.color};
                font-size: 1.2rem;">
                <p> <strong style="color: white;">Titel: </strong><span style="color: ${book.color};">${book.Titel}</span></p>
                <p> <strong style="color: white;">Författare: </strong><span style="color: ${book.color};">${book.Författare}</span></p>
                <p> <strong style="color: white;">Genre: </strong><span style="color: ${book.color};">${book.Genre}</span></p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                  <button class="btn btn-primary" onclick="deleteBook(${book.id})" style="background-color: ${book.color}; color: black; border-radius: 0.5rem;">Ta bort</button>
                  <button class="btn btn-primary" onclick="setCurrentBook(${book.id})" style="background-color: ${book.color}; color: black; border-radius: 0.5rem;">Ändra</button>
                </div>
              </div>
            </div>`;
        });

        html += `</ul>`;

        const listContainer = document.getElementById('Books');
        listContainer.innerHTML = ''; // Töm container innan vi sätter ny HTML
        listContainer.insertAdjacentHTML('beforeend', html); // Lägg till HTML
      } else {
        console.log('Ingen bok att visa');
      }
    })
    .catch((error) => console.error('Error fetching books:', error));
}

function setCurrentBook(id) {
  console.log('current', id);

  fetch(`${url}/${id}`)
    .then((result) => result.json())
    .then((book) => {
      console.log(book);
      bookForm.Titel.value = book.Titel;
      bookForm.Författare.value = book.Författare;
      bookForm.Genre.value = book.Genre;
      bookForm.color.value = book.color;

      localStorage.setItem('currentId', book.id);
    });
}

// Ta bort en bok
function deleteBook(id) {
  console.log('delete', id);
  fetch(`${url}/${id}`, { method: 'DELETE' }).then((result) => fetchBooks());
  const saveModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  saveModal.show();
}

bookForm.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  const serverBookObject = {
    Titel: '',
    Författare: '',
    Genre: '',
    color: '',
  };
  serverBookObject.Titel = bookForm.Titel.value;
  serverBookObject.Författare = bookForm.Författare.value;
  serverBookObject.Genre = bookForm.Genre.value;
  serverBookObject.color = bookForm.color.value;

  const id = localStorage.getItem('currentId');
  if (id) {
    serverBookObject.id = id;
  }

  console.log(serverBookObject);
  const request = new Request(url, {
    method: serverBookObject.id ? 'PUT' : 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(serverBookObject),
  });

  fetch(request).then((response) => {
    fetchBooks();

    localStorage.removeItem('currentId');
    bookForm.reset();

    const saveModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    saveModal.show();
  });
}