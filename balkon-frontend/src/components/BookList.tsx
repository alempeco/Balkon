import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooksWithAuthors, deleteBook } from '../services/api';

const BookList: React.FC = () => {
    const [books, setBooks] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            const data = await getBooksWithAuthors();
            setBooks(data);
        };
        fetchBooks();
    }, []);

    const handleDetailsClick = (bookId: number) => {
        navigate(`/book/${bookId}`);
    };

    const handleAddBookClick = () => {
        navigate('/create-book');
    };

    const handleEditBookClick = (bookId: number) => {
        navigate(`/edit-book/${bookId}`);
    };

    const handleDeleteBookClick = async (bookId: number) => {
        const confirmDelete = window.confirm('Da li ste sigurni da želite obrisati ovu knjigu?');
        if (confirmDelete) {
            try {
                await deleteBook(bookId);
                // Ponovo učitaj knjige nakon brisanja
                const data = await getBooksWithAuthors();
                setBooks(data);
            } catch (error) {
                console.error('Greška prilikom brisanja knjige:', error);
                alert('Greška prilikom brisanja knjige. Pokušajte ponovo.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold">Lista Knjiga</h4>
                <button 
                    onClick={handleAddBookClick} 
                    className="bg-green-500 text-white px-4 py-2 mb-4 rounded float-right mt-4"
                >
                    Dodaj Knjigu
                </button>
            </div>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-4">ISBN</th>
                        <th className="border border-gray-200 p-4">Title</th>
                        <th className="border border-gray-200 p-4">Pages</th>
                        <th className="border border-gray-200 p-4">Published</th>
                        <th className="border border-gray-200 p-4">Authors</th>
                        <th className="border border-gray-200 p-4">Image</th>
                        <th className="border border-gray-200 p-4">Akcija</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id}>
                            <td className="border border-gray-200 p-4">{book.isbn}</td>
                            <td className="border border-gray-200 p-4">{book.title}</td>
                            <td className="border border-gray-200 p-4">{book.pages}</td>
                            <td className="border border-gray-200 p-4">{book.published}</td>
                            <td className="border border-gray-200 p-4">
                                {Array.isArray(book.authors) && book.authors.length > 0 
                                    ? book.authors.join(', ') 
                                    : 'No Authors'}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {book.image ? 
                                    <img src={book.image} alt={book.title} className="w-16 h-16 object-cover" /> 
                                    : 'No Image'}
                            </td>
                            <td className="border border-gray-200 p-4 flex space-x-2">
                                <button
                                    onClick={() => handleDetailsClick(book.id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => handleEditBookClick(book.id)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteBookClick(book.id)} // Dodano Delete dugme
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookList;
