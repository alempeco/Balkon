import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { MultiValue } from 'react-select';
import { useNavigate } from 'react-router-dom';
import { getAuthors } from '../services/api';

// Definišite tip za opciju autora
type AuthorOption = {
    value: number;
    label: string;
};

const CreateBook: React.FC = () => {
    const [isbn, setIsbn] = useState('');
    const [title, setTitle] = useState('');
    const [pages, setPages] = useState('');
    const [published, setPublished] = useState('');
    const [image, setImage] = useState('');
    const [authorIds, setAuthorIds] = useState<number[]>([]);
    const [authors, setAuthors] = useState<AuthorOption[]>([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const authorsData = await getAuthors(); // Koristi getAuthors
                setAuthors(authorsData.map((author: { id: number; firstName: string; lastName: string }) => ({
                    value: author.id,
                    label: `${author.firstName} ${author.lastName}`
                })));
            } catch (error) {
                console.error("Greška prilikom dohvaćanja autora:", error);
            }
        };

        fetchAuthors();
    }, []);

    const handleAuthorChange = (newValue: MultiValue<AuthorOption>) => {
        setAuthorIds(newValue.map(option => option.value));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/books', {
                isbn,
                title,
                pages: Number(pages),
                published,
                image,
                authorIds,
            });

            setMessage(`Knjiga dodata sa ID: ${response.data.id}`);
            setIsbn('');
            setTitle('');
            setPages('');
            setPublished('');
            setImage('');
            setAuthorIds([]);

            navigate('/');
        } catch (error) {
            setMessage('Greška pri dodavanju knjige. Pokušajte ponovo.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Dodaj Knjigu</h2>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="text"
                    placeholder="ISBN"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="border border-gray-300 p-2 mb-2 w-full"
                    required
                />
                <input
                    type="text"
                    placeholder="Naslov"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border border-gray-300 p-2 mb-2 w-full"
                    required
                />
                <input
                    type="number"
                    placeholder="Broj stranica"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="border border-gray-300 p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="Godina objave"
                    value={published}
                    onChange={(e) => setPublished(e.target.value)}
                    className="border border-gray-300 p-2 mb-2 w-full"
                />
                <input
                    type="text"
                    placeholder="URL slike"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="border border-gray-300 p-2 mb-2 w-full"
                />
                <Select
                    isMulti
                    options={authors}
                    onChange={handleAuthorChange}
                    className="mb-2"
                    placeholder="Odaberi autore"
                    value={authors.filter(author => authorIds.includes(author.value))}
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Dodaj Knjigu
                </button>
            </form>
            {message && <div>{message}</div>}
        </div>
    );
};

export default CreateBook;
