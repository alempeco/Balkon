import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuthorDetails } from '../services/api'; // Funkcija za dobijanje autora po ID-u

const AuthorDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [author, setAuthor] = useState<any>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAuthorDetails = async () => {
            if (!id) {
                setError('ID nije pronađen.');
                setLoading(false);
                return;
            }

            try {
                const data = await getAuthorDetails(id); // API vraća { author, books }
                setAuthor(data.author); // Postavi autor deo u stanje
                setBooks(data.books); // Postavi knjige u posebno stanje
            } catch (err) {
                setError('Greška pri učitavanju detalja autora');
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorDetails();
    }, [id]);

    if (loading) return <div className="text-center text-xl">Učitavanje...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (!author) return <div className="text-center">Autor nije pronađen.</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-lg mt-6">
            <h2 className="text-3xl font-bold text-center mb-4">{author.firstName} {author.lastName}</h2>
            <p className="text-lg text-center"><strong>Datum Rođenja:</strong> {new Date(author.dob).toLocaleDateString()}</p>
            {author.image && <img src={author.image} alt={author.firstName} className="w-32 h-32 object-cover rounded-full mx-auto mt-4" />}

            <h3 className="text-2xl font-semibold mt-6">Knjige:</h3>
            {books.length > 0 ? (
                <ul className="list-disc list-inside mt-2">
                    {books.map((book) => (
                        <li key={book.id} className="mt-2">
                            <Link to={`/book/${book.id}`} className="text-blue-500 hover:underline">{book.title}</Link> {/* Link na BookDetails */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-2">Autor nema knjiga.</p>
            )}
        </div>
    );
};

export default AuthorDetails;
