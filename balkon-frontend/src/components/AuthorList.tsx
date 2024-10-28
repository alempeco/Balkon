import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthorsWithBooks, deleteAuthor } from '../services/api';

const AuthorList: React.FC = () => {
    const [authors, setAuthors] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuthors = async () => {
            const data = await getAuthorsWithBooks();
            setAuthors(data);
        };
        fetchAuthors();
    }, []);

    const handleDetailsClick = (authorId: number) => {
        navigate(`/authors/${authorId}`);
    };

    const handleEditClick = (authorId: number) => {
        navigate(`/edit-author/${authorId}`); // Preusmeri na stranicu za editovanje autora
    };

    const handleAddAuthorClick = () => {
        navigate('/create-author'); // Preusmeri na stranicu za dodavanje autora
    };

    const handleDeleteClick = async (authorId: number) => {
        const confirmDelete = window.confirm('Da li ste sigurni da želite obrisati ovog autora?');
        if (confirmDelete) {
            try {
                await deleteAuthor(authorId); // Pozivamo API za brisanje autora
                // Ponovo učitajte autore nakon brisanja
                const data = await getAuthorsWithBooks();
                setAuthors(data);
            } catch (error) {
                console.error('Greška prilikom brisanja autora:', error);
                alert('Greška prilikom brisanja autora. Pokušajte ponovo.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Lista Autora</h2>
                <button 
                    onClick={handleAddAuthorClick} 
                    className="bg-green-500 text-white px-4 py-2 mb-4 rounded float-right mt-4"
                >
                    Dodaj Autora
                </button>
            </div>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-4">First Name</th>
                        <th className="border border-gray-200 p-4">Last Name</th>
                        <th className="border border-gray-200 p-4">Datum Rođenja</th>
                        <th className="border border-gray-200 p-4">Slika</th>
                        <th className="border border-gray-200 p-4">Knjige</th>
                        <th className="border border-gray-200 p-4">Akcija</th>
                    </tr>
                </thead>
                <tbody>
                    {authors.map((author) => (
                        <tr key={author.id}>
                            <td className="border border-gray-200 p-4">{author.firstName}</td>
                            <td className="border border-gray-200 p-4">{author.lastName}</td>
                            <td className="border border-gray-200 p-4">{new Date(author.dob).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border-b">
                                {author.image ? (
                                    <img src={author.image} alt={author.firstName} className="w-16 h-16 object-cover" />
                                ) : (
                                    'No Image'
                                )}
                            </td>
                            <td className="border border-gray-200 p-4">
                                {author.books && author.books.length > 0 ? (
                                    <ul>
                                        {author.books.map((book: string, index: number) => (
                                            <li key={index}>{book}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No Books</p>
                                )}
                            </td>
                            <td className="border border-gray-200 p-4 flex space-x-2">
                                <button
                                    onClick={() => handleDetailsClick(author.id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => handleEditClick(author.id)} 
                                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(author.id)} // Dugme za brisanje
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

export default AuthorList;
