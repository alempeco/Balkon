import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookDetails, getAuthorsForBook } from '../services/api';

const BookDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<any>(null);
    const [authors, setAuthors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!id) {
                setError('ID nije pronađen.');
                setLoading(false);
                return;
            }

            try {
                const data = await getBookDetails(id);
                setBook(data);
                
                // Fetch authors for the book
                const authorsData = await getAuthorsForBook(Number(id));
                setAuthors(authorsData);
            } catch (err) {
                setError('Greška pri učitavanju detalja knjige');
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    if (loading) return <div className="text-center mt-5">Učitavanje...</div>;
    if (error) return <div className="text-red-500 text-center mt-5">{error}</div>;
    if (!book) return <div className="text-center mt-5">Knjiga nije pronađena.</div>;

    return (
        <div className="max-w-md mx-auto p-5 border border-gray-300 rounded-lg shadow-lg bg-white mt-5">
            <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
            <p className="text-gray-700"><strong>ISBN:</strong> {book.isbn}</p>
            <p className="text-gray-700"><strong>Broj Strana:</strong> {book.pages}</p>
            <p className="text-gray-700"><strong>Godina Izdavanja:</strong> {book.published}</p>
            <p className="text-gray-700"><strong>Autori:</strong> 
                {authors.length > 0 ? (
                    authors.map((author: any, index: number) => (
                        <span key={author.id}>
                            <Link
                                to={`/authors/${author.id}`}
                                className="text-blue-500 hover:underline"
                            >
                                {`${author.firstName} ${author.lastName}`}
                            </Link>
                            {index < authors.length - 1 && ', '}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-500">Nema autora</span>
                )}
            </p>
            {book.image && (
                <img src={book.image} alt={book.title} className="w-full h-auto rounded-md mt-4" />
            )}
        </div>
    );
};

export default BookDetails;
