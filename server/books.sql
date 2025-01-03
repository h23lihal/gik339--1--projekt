DROP TABLE IF EXISTS books;
CREATE TABLE IF NOT EXISTS books(
   id        INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
   Titel     VARCHAR(50) NOT NULL,
   Författare VARCHAR(50) NOT NULL,
   Genre     VARCHAR(50) NOT NULL,
   color     VARCHAR(50) NOT NULL
);

INSERT INTO books (Titel, Författare, Genre, Color) VALUES ('The rainmaker', 'John Grisham', 'Deckare','blue');
INSERT INTO books (Titel, Författare, Genre, Color) VALUES ('The firm', 'John Grisham', 'Deckare','blue');
INSERT INTO books (Titel, Författare, Genre, Color) VALUES ('Harry Potter och den vises sten', 'J.K Rowling', 'Fantasy', 'Purple');
INSERT INTO books (Titel, Författare, Genre, Color) VALUES ('Harry Potter och hemligheternas kammare', 'J.K Rowling', 'Fantasy','Purple');
INSERT INTO books (Titel, Författare, Genre, Color) VALUES ('Luna och superkraften', 'Sören Olsson, Leif Eriksson, Martin Svensson', 'barnbok', 'Yellow');
INSERT INTO books (Titel, Författare, Genre, Color) VALUES ('Fuskbygget: så knäcktes bostadsmarknaden sverige och världen', 'Andreas Cervenka', 'Fakta' ,'Green');

SELECT * FROM books;

