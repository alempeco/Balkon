import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { MultiValue } from 'react-select';
import { useNavigate } from 'react-router-dom';


interface Book {
    id: number;
    title: string;
}

interface OptionType {
    value: number;
    label: string;
}

const CreateAuthor: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [image, setImage] = useState('');
    const [bookIds, setBookIds] = useState<number[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:3000/books');
                setBooks(response.data);
            } catch (error) {
                console.error("Greška prilikom dohvaćanja knjiga:", error);
            }
        };

        fetchBooks();
    }, []);

    // Prošireni tip za selectedOptions
    const handleBookChange = (selectedOptions: MultiValue<OptionType>) => {
        const ids = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setBookIds(ids);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/authors', {
                firstName,
                lastName,
                dob,
                image,
                bookIds,
            });

            setMessage(`Autor dodat sa ID: ${response.data.id}`);
            setFirstName('');
            setLastName('');
            setDob('');
            setImage('');
            setBookIds([]);
            navigate('/');
        } catch (error) {
            setMessage('Greška pri dodavanju autora. Pokušajte ponovo.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Dodaj Autora</h2>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="text"
                    placeholder="Ime"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border border-gray-300 p-2 mb-2 w-full"
                    required
                />
                <input
                    type="text"
                    placeholder="Prezime"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border border-gray-300 p-2 mb-2 w-full"
                    required
                />
                <input
                    type="date"
                    placeholder="Datum rođenja"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
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
                    options={books.map(book => ({ value: book.id, label: book.title }))}
                    onChange={handleBookChange}
                    className="mb-2"
                    placeholder="Odaberi knjige"
                    value={books
                        .filter(book => bookIds.includes(book.id))
                        .map(book => ({ value: book.id, label: book.title }))}
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Dodaj Autora
                </button>
            </form>
            {message && <div>{message}</div>}
        </div>
    );
};

export default CreateAuthor;
