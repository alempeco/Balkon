import axios from 'axios';
import { AxiosError } from 'axios'; // Uvezi AxiosError


const API_URL = 'http://localhost:3000';

export const getBooks = async () => {
    const response = await axios.get(`${API_URL}/books`);
    return response.data;
};

export const getAuthors = async () => {
    const response = await axios.get(`${API_URL}/authors`);
    return response.data;
};
export const getBookDetails = async (id: string) => {
    const response = await axios.get(`${API_URL}/books/${id}`);
    return response.data;
    console.log(response.data);
  };
  export const getAuthorDetails = async (id: string) => {
    const response = await axios.get(`${API_URL}/authors/${id}`);
    return response.data;
};

export const getAuthorsForBook = async (bookId: number) => {
    try {
        const response = await axios.get(`${API_URL}/books/${bookId}/authors`);
        return response.data; // Vraća listu autora za određenu knjigu
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            // Ako nema autora (404), vrati prazan niz i ne loguj ništa
            return [];
        } else {
            // Za ostale greške, možeš ih logovati ako želiš
            console.error(`Error fetching authors for book ${bookId}: `, error);
            return [];
        }
    }
};


export const getBooksWithAuthors = async () => {
    const response = await axios.get(`${API_URL}/books`);
    
    const books = response.data;
    
    // Za svaku knjigu dobij imena autora
    for (const book of books) {
        try {
            const authors = await getAuthorsForBook(book.id);
            book.authors = authors.map((author: { firstName: any; lastName: any; }) => `${author.firstName} ${author.lastName}`);
        } catch (error) {
            if (error instanceof AxiosError) { // Provjeri da li je error instanca AxiosError
                if (error.response && error.response.status === 404) {
                    book.authors = [];
                } else {
                    console.error("Error fetching authors:", error);
                }
            } else {
                console.error("Unexpected error:", error);
            }
        }
    }

    return books;
};

export const getAuthorsWithBooks = async () => {
    const authors = await getAuthors();

    for (const author of authors) {
        try {
            const response = await axios.get(`${API_URL}/authors/${author.id}/books`);
            author.books = response.data.map((book: { title: string }) => book.title); // Dodaj naslove knjiga autoru
        } catch (error) {
            console.error(`Error fetching books for author ${author.id}:`, error);
            author.books = []; // Ako dođe do greške, postavi praznu listu knjiga
        }
    }

    return authors;
};
export const createBook = async (bookData: {
    isbn: string;
    title: string;
    pages: number;
    published: string;
    image: string;
    authorIds: number[];
}) => {
    const response = await axios.post(`${API_URL}/books`, bookData);
    return response.data; // Vraća dodanu knjigu
};
export const updateBook = async (id: string, bookData: { isbn: string; title: string; pages: number; published: string; image: string }) => {
    const response = await axios.put(`${API_URL}/books/${id}`, bookData);
    return response.data;
};
export const deleteBook = async (id: number) => {
    await axios.delete(`${API_URL}/books/${id}`);
};

export const getAuthorById = async (id: number) => {
    const response = await axios.get(`${API_URL}/authors/${id}`);
    return response.data;
};

export const updateAuthor = async (id: number, authorData: any) => {
    const response = await axios.put(`${API_URL}/authors/${id}`, authorData);
    return response.data; // Vraća odgovor
};



export const deleteAuthor = async (id: number) => {
    await axios.delete(`${API_URL}/authors/${id}`);
};

// Ostale API funkcije (POST, PUT, DELETE) se mogu dodati ovdje
