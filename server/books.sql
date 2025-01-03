DROP TABLE IF EXISTS books;
CREATE TABLE IF NOT EXISTS books(
   id        INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
   Titel     VARCHAR(50) NOT NULL,
   Författare VARCHAR(50) NOT NULL,
   Genre     VARCHAR(50) NOT NULL
);

INSERT INTO books (Titel, Författare, Genre) VALUES ('The rainmaker', 'John Grisham', 'Deckare');
INSERT INTO books (Titel, Författare, Genre) VALUES ('The firm', 'John Grisham', 'Deckare');
INSERT INTO books (Titel, Författare, Genre) VALUES ('Harry Potter och den vises sten', 'J.K Rowling', 'Fantasy');
INSERT INTO books (Titel, Författare, Genre) VALUES ('Harry Potter och hemligheternas kammare', 'J.K Rowling', 'Fantasy');
INSERT INTO books (Titel, Författare, Genre) VALUES ('Luna och superkraften', 'Sören Olsson, Leif Eriksson, Martin Svensson', 'barnbok');
INSERT INTO books (Titel, Författare, Genre) VALUES ('Fuskbygget: så knäcktes bostadsmarknaden sverige och världen', 'Andreas Cervenka', 'Fakta');

SELECT * FROM books;

