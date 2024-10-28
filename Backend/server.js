const express = require('express');
const mysql = require('mysql2/promise'); // za bazu
const cors = require('cors');  
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// CORS middleware
app.use(cors());  

// Parsiranje JSON tijela
app.use(express.json()); 

// konekciju sa MySQL
const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: 'alemusb123',
    database: 'Balkon'
};

// Funkcija za dobijanje konekcije
async function getConnection() {
    return await mysql.createConnection(connectionConfig);
}

const swaggerOptions = {
    definition: {
        openapi: "3.0.0", // Verzija OpenAPI
        info: {
            title: "BALKON API",
            version: "1.0.0",
            description: "API za upravljanje knjigama i autorima",
        },
        servers: [
            {
                url: `http://localhost:${port}` 
            },
        ],
    },
    apis: ["server.js"], 
};

// CRUD za books
// Gen Swagger dokumentaciju
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// koristi http://localhost:3000/api-docs/ da vidis swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// CRUD za books
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Dohvati sve knjige
 *     responses:
 *       200:
 *         description: Lista svih knjiga
 */
app.get('/books', async (req, res) => {
    const query = "SELECT * FROM books";
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(query);
        res.json(rows);
        await connection.end(); // Zatvaranje konekcije
    } catch (err) {
        console.error(err); // Dodajte ovu liniju da biste ispisali grešku
        res.status(500).send("Greška prilikom dobijanja knjiga");
    }
});

// POST za dodavanje knjige
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Dodaj novu knjigu
 *     description: Dodaje novu knjigu i povezuje je sa autorima.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isbn:
 *                 type: string
 *                 example: "1234567890123"
 *               title:
 *                 type: string
 *                 example: "Naslov knjige"
 *               pages:
 *                 type: integer
 *                 example: 350
 *               published:
 *                 type: string
 *                 format: date
 *                 example: "2021"
 *               image:
 *                 type: string
 *                 example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1PxPKSZBiMuNvjdbS0TZFR8Y-d0O6wo7Shg&s"
 *               authorIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]  # Primer ID-ova autora
 *     responses:
 *       201:
 *         description: Knjiga je uspešno dodata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 isbn:
 *                   type: string
 *                   example: "1234567890123"
 *                 title:
 *                   type: string
 *                   example: "Naslov knjige"
 *                 pages:
 *                   type: integer
 *                   example: 350
 *                 published:
 *                   type: string
 *                   format: date
 *                   example: "2021"
 *                 image:
 *                   type: string
 *                   example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1PxPKSZBiMuNvjdbS0TZFR8Y-d0O6wo7Shg&s"
 *                 message:
 *                   type: string
 *                   example: "Knjiga i veze sa autorima dodati"
 *       400:
 *         description: Nevalidni podaci (ISBN, naslov i autori su obavezni)
 *       500:
 *         description: Greška prilikom dodavanja knjige
 */


app.post('/books', async (req, res) => {
    const { isbn, title, pages, published, image, authorIds } = req.body;

    const bookQuery = "INSERT INTO books (isbn, title, pages, published, image) VALUES (?, ?, ?, ?, ?)";
    const booksAuthorsQuery = "INSERT INTO books_authors (book_id, author_id) VALUES (?, ?)";

    // Validacija podataka
    if (!isbn || !title || !authorIds || authorIds.length === 0) {
        return res.status(400).send("ISBN, naslov i barem jedan autor su obavezni");
    }

    try {
        // Dobijanje konekcije
        const connection = await getConnection();

        // Ubacivanje nove knjige
        const [result] = await connection.execute(bookQuery, [isbn, title, pages, published, image]);
        const bookId = result.insertId; // ID nove knjige

        // Ubacivanje zapisa u books_authors za svaki autor
        for (const authorId of authorIds) {
            await connection.execute(booksAuthorsQuery, [bookId, authorId]);
        }

        await connection.end(); // Zatvaranje konekcije

        res.status(201).json({
            id: bookId,
            isbn,
            title,
            pages,
            published,
            image,
            message: "Knjiga i veze sa autorima dodati"
        });
    } catch (err) {
        console.error("Greška prilikom dodavanja knjige:", err);
        res.status(500).send("Greška prilikom dodavanja knjige");
    }
});


// GET /books/:id - Prikaz knjige po ID-u
/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Dohvati knjigu po ID-u
 *     description: Vraća detalje knjige na osnovu ID-a.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID knjige koju želite da dobijete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detalji knjige
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 isbn:
 *                   type: string
 *                   example: "1234567890123"
 *                 title:
 *                   type: string
 *                   example: "Naslov knjige"
 *                 pages:
 *                   type: integer
 *                   example: 350
 *                 published:
 *                   type: string
 *                   format: date
 *                   example: "2021"
 *                 image:
 *                   type: string
 *                   example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1PxPKSZBiMuNvjdbS0TZFR8Y-d0O6wo7Shg&s"
 *       404:
 *         description: Knjiga nije pronađena
 *       500:
 *         description: Greška prilikom dobijanja knjige
 */

app.get('/books/:id', async (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM books WHERE id = ?";

    try {
        // Dobijanje konekcije
        const connection = await getConnection();
        const [rows] = await connection.execute(query, [id]);
        
        if (rows.length === 0) return res.status(404).send("Knjiga nije pronađena");

        res.json(rows[0]);
        await connection.end(); // Zatvaranje konekcije
    } catch (err) {
        console.error("Greška prilikom dobijanja knjige:", err);
        res.status(500).send("Greška prilikom dobijanja knjige");
    }
});


// PUT /books/:id - Ažuriranje knjige po ID-u
/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Ažuriraj knjigu po ID-u
 *     description: Ažurira postojeću knjigu na osnovu ID-a.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID knjige koja se ažurira
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isbn:
 *                 type: string
 *                 example: "9234567890123"
 *               title:
 *                 type: string
 *                 example: "Ažurirani naslov knjige"
 *               pages:
 *                 type: integer
 *                 example: 400
 *               published:
 *                 type: string
 *                 format: date
 *                 example: "2023"
 *               image:
 *                 type: string
 *                 example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKi5lknrw7SIwZ01RQRqyvtXz2bFxrUsGVpA&s"
 *     responses:
 *       200:
 *         description: Knjiga uspešno ažurirana
 *       404:
 *         description: Knjiga nije pronađena za ažuriranje
 *       500:
 *         description: Greška prilikom ažuriranja knjige
 */

app.put('/books/:id', async (req, res) => {
    const { id } = req.params;
    const { isbn, title, pages, published, image } = req.body;
    const query = "UPDATE books SET isbn = ?, title = ?, pages = ?, published = ?, image = ? WHERE id = ?";

    try {
        // Dobijanje konekcije
        const connection = await getConnection();
        const [result] = await connection.execute(query, [isbn, title, pages, published, image, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).send("Knjiga nije pronađena za ažuriranje");
        }

        res.send("Knjiga ažurirana");
        await connection.end(); // Zatvaranje konekcije
    } catch (err) {
        console.error("Greška prilikom ažuriranja knjige:", err);
        res.status(500).send("Greška prilikom ažuriranja knjige");
    }
});


// DELETE /books/:id - Brisanje knjige i autora koji više nemaju knjige
/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Obriši knjigu i autore koji više nemaju knjige
 *     description: Briše knjigu i autore koji više nemaju povezane knjige.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID knjige koja se briše
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Knjiga uspešno obrisana
 *       404:
 *         description: Knjiga nije pronađena
 *       500:
 *         description: Greška prilikom brisanja knjige
 */

app.delete('/books/:id', async (req, res) => {
    const { id } = req.params;

    const deleteAuthorsQuery = "DELETE FROM books_authors WHERE book_id = ?";
    const checkAuthorQuery = "SELECT author_id FROM books_authors WHERE book_id = ?";
    const countAuthorBooksQuery = "SELECT COUNT(*) as count FROM books_authors WHERE author_id = ?";
    const deleteAuthorQuery = "DELETE FROM authors WHERE id = ?";

    try {
        const connection = await getConnection();
        
        // Prvo, dobijamo sve autore vezane za knjigu koju brišemo
        const [authors] = await connection.execute(checkAuthorQuery, [id]);

        // Brišemo vezu knjige i autora
        await connection.execute(deleteAuthorsQuery, [id]);

        // Prolazimo kroz autore i proveravamo da li imaju druge knjige
        for (const author of authors) {
            const authorId = author.author_id;

            const [countResult] = await connection.execute(countAuthorBooksQuery, [authorId]);

            // Ako autor više nema knjiga, brišemo ga iz tabele authors
            if (countResult[0].count === 0) {
                await connection.execute(deleteAuthorQuery, [authorId]);
            }
        }

        // Na kraju, brišemo knjigu
        await connection.execute("DELETE FROM books WHERE id = ?", [id]);

        res.send("Knjiga obrisana");
        await connection.end(); // Zatvaranje konekcije
    } catch (err) {
        console.error("Greška prilikom brisanja knjige:", err);
        res.status(500).send("Greška prilikom brisanja knjige");
    }
});

// GET /authors - Dohvati sve autore
/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Dohvati sve autore
 *     description: Vraća listu svih autora iz baze podataka.
 *     tags:
 *       - Authors
 *     responses:
 *       200:
 *         description: Lista autora uspešno dohvaćena
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   firstName:
 *                     type: string
 *                     example: "Marko"
 *                   lastName:
 *                     type: string
 *                     example: "Marković"
 *                   dob:
 *                     type: string
 *                     format: date
 *                     example: "1980-01-01"
 *                   images:
 *                     type: string
 *                     example: "https://example.com/marko.jpg"
 *       500:
 *         description: Greška prilikom dobijanja autora
 */

app.get('/authors', async (req, res) => {
    const query = "SELECT * FROM authors";
    try {
        const connection = await getConnection(); // Uzimamo konekciju
        const [rows] = await connection.execute(query); // Izvršavamo upit
        res.json(rows); // Vraćamo autore kao JSON
        await connection.end(); // Zatvaranje konekcije
    } catch (err) {
        console.error("Greška prilikom dobijanja autora:", err);
        res.status(500).send("Greška prilikom dobijanja autora");
    }
});


// POST /authors - Dodaj novog autora
/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Dodaj novog autora
 *     description: Dodaje novog autora u bazu podataka, zajedno sa vezama na knjige ako su specificirane.
 *     tags:
 *       - Authors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Ime autora.
 *                 example: "Ivo"
 *               lastName:
 *                 type: string
 *                 description: Prezime autora.
 *                 example: "Andrić"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Datum rođenja autora u formatu YYYY-MM-DD.
 *                 example: "1892-10-09"
 *               image:
 *                 type: string
 *                 description: URL slike autora.
 *                 example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6I-V884USRSgzLpJQ5aQjnI19xnQq7KbNxw&s"
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Lista ID-ova knjiga koje se povezuju s autorom.
 *                 example: [1, 3, 5]
 *     responses:
 *       201:
 *         description: Autor uspješno dodan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID novog autora.
 *                   example: 42
 *                 message:
 *                   type: string
 *                   description: Poruka o uspješnom dodavanju.
 *                   example: "Autor i veze sa knjigama dodati"
 *       500:
 *         description: Greška prilikom dodavanja autora.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Greška prilikom dodavanja autora"
 */

app.post('/authors', async (req, res) => {
    const { firstName, lastName, dob, image, bookIds } = req.body;
    const query = "INSERT INTO authors (firstName, lastName, dob, image) VALUES (?, ?, ?, ?)";

    try {
        const connection = await getConnection(); // Uzimamo konekciju
        const [result] = await connection.execute(query, [firstName, lastName, dob, image]); // Izvršavamo upit za dodavanje autora
        const authorId = result.insertId; // ID novog autora

        if (bookIds && bookIds.length > 0) {
            const booksAuthorsQuery = "INSERT INTO books_authors (book_id, author_id) VALUES ?"; // Upit za dodavanje veza
            const values = bookIds.map(bookId => [bookId, authorId]); // Priprema podataka za vezu

            await connection.query(booksAuthorsQuery, [values]); // Izvršavamo upit za veze
        }

        res.status(201).json({ id: authorId, message: "Autor i veze sa knjigama dodati" });
    } catch (err) {
        console.error("Greška prilikom dodavanja autora:", err);
        res.status(500).send("Greška prilikom dodavanja autora");
    }
});


// GET /authors/:id - Dohvati autora po ID-ju
/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Dohvati autora po ID-ju zajedno sa njegovim knjigama
 *     description: Vraća detalje o autoru, uključujući listu knjiga koje je autor napisao.
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID autora kojeg želite da dobijete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detalji o autoru i lista njegovih knjiga
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 author:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: "Test"
 *                     lastName:
 *                       type: string
 *                       example: "Marković"
 *                     dob:
 *                       type: string
 *                       format: date
 *                       example: "1980-01-01"
 *                     images:
 *                       type: string
 *                       example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1PxPKSZBiMuNvjdbS0TZFR8Y-d0O6wo7Shg&s"
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       isbn:
 *                         type: string
 *                         example: "1234567890123"
 *                       title:
 *                         type: string
 *                         example: "Naslov knjige"
 *                       pages:
 *                         type: integer
 *                         example: 350
 *                       published:
 *                         type: string
 *                         format: date
 *                         example: "2021"
 *                       image:
 *                         type: string
 *                         example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1PxPKSZBiMuNvjdbS0TZFR8Y-d0O6wo7Shg&s"
 *       404:
 *         description: Autor nije pronađen
 *       500:
 *         description: Greška prilikom dobijanja autora
 */

app.get('/authors/:id', async (req, res) => {
    const { id } = req.params;
    const authorQuery = "SELECT * FROM authors WHERE id = ?";
    const booksQuery = `
        SELECT books.* FROM books
        INNER JOIN books_authors ON books.id = books_authors.book_id
        WHERE books_authors.author_id = ?
    `;

    try {
        const connection = await getConnection(); // Uzimamo konekciju

        // Dohvat autora
        const [authorRows] = await connection.execute(authorQuery, [id]);
        if (authorRows.length === 0) {
            return res.status(404).send("Autor nije pronađen");
        }

        // Dohvat knjiga autora
        const [booksRows] = await connection.execute(booksQuery, [id]);

        const authorDetails = {
            author: authorRows[0],
            books: booksRows
        };

        res.json(authorDetails);
    } catch (err) {
        console.error("Greška prilikom dobijanja autora:", err);
        res.status(500).send("Greška prilikom dobijanja autora");
    }
});


// PUT /authors/:id - Ažuriraj autora

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Ažuriraj autora
 *     description: Ažurira podatke o autoru po ID-u.
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID autora koji se ažurira
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Marko"
 *               lastName:
 *                 type: string
 *                 example: "Marković"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1980-01-01"
 *               image:
 *                 type: string
 *                 example: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/ErnestHemingway.jpg/250px-ErnestHemingway.jpg"
 *     responses:
 *       200:
 *         description: Autor uspešno ažuriran
 *       404:
 *         description: Autor nije pronađen za ažuriranje
 *       500:
 *         description: Greška prilikom ažuriranja autora
 */

app.put('/authors/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, dob, image } = req.body;

    // Konvertovanje datuma u 'YYYY-MM-DD' format
    const formattedDob = new Date(dob).toISOString().split('T')[0];
    
    const query = "UPDATE authors SET firstName = ?, lastName = ?, dob = ?, image = ? WHERE id = ?";

    try {
        // Dobijanje konekcije
        const connection = await getConnection();
        const [result] = await connection.execute(query, [firstName, lastName, formattedDob, image, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).send("Autor nije pronađen za ažuriranje");
        }

        res.send("Autor ažuriran");
        await connection.end(); // Zatvaranje konekcije
    } catch (err) {
        console.error("Greška prilikom ažuriranja autora:", err);
        res.status(500).send(`Greška prilikom ažuriranja autora: ${err.message}`);
    }
});





// DELETE /authors/:id - Obriši autora i povezana knjige
/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Obriši autora i povezana knjige
 *     description: Briše autora po ID-u zajedno sa svim povezanim knjigama ako knjige nigdje vise nisu povezane.
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID autora koji se briše
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Autor obrisan, kao i ako je jedina povezana knjige.
 *       500:
 *         description: Greška prilikom brisanja autora
 */


app.delete('/authors/:id', async (req, res) => {
    const { id } = req.params;
    const deleteBooksAuthorsQuery = "DELETE FROM books_authors WHERE author_id = ?";
    const deleteAuthorsQuery = "DELETE FROM authors WHERE id = ?";

    try {
        const connection = await getConnection(); // Uzimamo konekciju

        // Brišemo veze između autora i knjiga
        await connection.execute(deleteBooksAuthorsQuery, [id]);

        // Brišemo autora
        await connection.execute(deleteAuthorsQuery, [id]);

        res.send("Autor obrisan, kao i sve povezane knjige.");
    } catch (err) {
        console.error("Greška prilikom brisanja autora:", err);
        res.status(500).send("Greška prilikom brisanja autora");
    }
});


// GET /books/:id/authors - Dohvati autore za knjigu

app.get('/books/:id/authors', async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT authors.* FROM authors
        JOIN books_authors ON authors.id = books_authors.author_id
        WHERE books_authors.book_id = ?
    `;
    try {
        const connection = await getConnection(); // Uzimamo konekciju
        const [rows] = await connection.execute(query, [id]);
        await connection.end();

        if (rows.length === 0) {
            return res.status(404).send("Nema autora za ovu knjigu");
        }
        res.json(rows);
    } catch (err) {
        console.error("Greška:", err);
        res.status(500).send("Greška prilikom dobijanja autora za knjigu");
    }
});


// POST /books/:id/authors - Dodaj autora knjizi
// POST /books/:id/authors - Dodaj autora knjizi

app.post('/books/:id/authors', async (req, res) => {
    const { id } = req.params;
    const { authorId } = req.body;
    const query = "INSERT INTO books_authors (book_id, author_id) VALUES (?, ?)";
    try {
        const connection = await getConnection(); // Uzimamo konekciju
        await connection.execute(query, [id, authorId]);
        await connection.end();
        res.status(200).send("Autor dodan knjizi");
    } catch (err) {
        console.error("Greška:", err);
        res.status(404).send("Knjiga nije pronađena ili autor ne postoji");
    }
});


// DELETE /books/:idBook/authors/:idAuthor - Obriši autora iz knjige

app.delete('/books/:idBook/authors/:idAuthor', async (req, res) => {
    const { idBook, idAuthor } = req.params;
    const query = "DELETE FROM books_authors WHERE book_id = ? AND author_id = ?";
    try {
        const connection = await getConnection(); // Uzimamo konekciju
        const [result] = await connection.execute(query, [idBook, idAuthor]);
        await connection.end();

        if (result.affectedRows === 0) return res.status(404).send("Knjiga ili autor nisu pronađeni");
        res.send("Autor obrisan iz knjige");
    } catch (err) {
        console.error("Greška:", err);
        res.status(500).send("Greška prilikom brisanja autora iz knjige");
    }
});


// GET /authors/:idAuthor/books - Dohvati knjige za autora

app.get('/authors/:idAuthor/books', async (req, res) => {
    const { idAuthor } = req.params;
    const query = `
        SELECT books.* 
        FROM books
        INNER JOIN books_authors ON books.id = books_authors.book_id
        WHERE books_authors.author_id = ?
    `;
    try {
        const connection = await getConnection(); // Uzimamo konekciju
        const [rows] = await connection.execute(query, [idAuthor]);
        await connection.end();

        if (rows.length === 0) {
            return res.status(404).send("Autor ili njegove knjige nisu pronađeni");
        }
        res.json(rows);
    } catch (err) {
        console.error("Greška:", err);
        res.status(500).send("Greška prilikom dobijanja knjiga za autora");
    }
});


// POST /authors/:idAuthor/books - Dodaj knjigu autoru
app.post('/authors/:idAuthor/books', async (req, res) => {
    const { idAuthor } = req.params;
    const { bookId } = req.body;
    const query = "INSERT INTO books_authors (book_id, author_id) VALUES (?, ?)";
    try {
        const connection = await getConnection(); // Uzimamo konekciju
        await connection.execute(query, [bookId, idAuthor]);
        await connection.end();
        res.status(200).send("Knjiga dodana autoru");
    } catch (err) {
        console.error("Greška:", err);
        res.status(404).send("Autor nije pronađen ili knjiga ne postoji");
    }
});


// DELETE /authors/:idAuthor/books/:idBook - Obriši knjigu iz autora

app.delete('/authors/:idAuthor/books/:idBook', async (req, res) => {
    const { idAuthor, idBook } = req.params;
    const query = "DELETE FROM books_authors WHERE author_id = ? AND book_id = ?";
    try {
        const connection = await getConnection(); // Uzimamo konekciju
        const [result] = await connection.execute(query, [idAuthor, idBook]);
        await connection.end();

        if (result.affectedRows === 0) return res.status(404).send("Knjiga ili autor nisu pronađeni");
        res.send("Knjiga obrisana iz autora");
    } catch (err) {
        console.error("Greška:", err);
        res.status(500).send("Greška prilikom brisanja knjige iz autora");
    }
});


app.listen(port, () => {
    console.log(`Server je pokrenut na http://localhost:${port}`);
});
