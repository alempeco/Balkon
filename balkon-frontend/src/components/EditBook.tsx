import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookDetails, updateBook } from '../services/api';

const EditBook: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<{ isbn: string; title: string; pages: number; published: string; image: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const bookData = await getBookDetails(id!);
                setBook(bookData);
            } catch (err) {
                setError('Greška prilikom preuzimanja podataka o knjizi.');
            }
        };

        fetchBookDetails();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (book) {
            setBook({
                ...book,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!book) return; // Proveri da li je knjiga učitana

        try {
            const response = await updateBook(id!, {
                isbn: book.isbn,
                title: book.title,
                pages: book.pages,
                published: book.published,
                image: book.image,
            });

            setMessage(`Knjiga ažurirana: ${response}`); // Poruka uspešnog ažuriranja
            navigate('/'); // Preusmeri nakon uspešne izmene
        } catch (error) {
            setError('Greška prilikom ažuriranja knjige. Pokušajte ponovo.');
        }
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!book) {
        return <div>Učitavanje...</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-5 border border-gray-300 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-center mb-5">Uredi Knjigu</h2>
            {message && <div className="text-green-500 mb-4">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">ISBN:</label>
                    <input
                        type="text"
                        name="isbn"
                        value={book.isbn}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Naslov:</label>
                    <input
                        type="text"
                        name="title"
                        value={book.title}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Broj strana:</label>
                    <input
                        type="number"
                        name="pages"
                        value={book.pages}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Godina objavljivanja:</label>
                    <input
                        type="text"
                        name="published"
                        value={book.published}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Slika:</label>
                    <input
                        type="text"
                        name="image"
                        value={book.image}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                    Sačuvaj
                </button>
            </form>
        </div>
    );
};

export default EditBook;
