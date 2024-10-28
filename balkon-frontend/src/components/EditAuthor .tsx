import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuthorDetails, updateAuthor } from '../services/api';

const EditAuthor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [author, setAuthor] = useState<{ firstName: string; lastName: string; dob: string; image: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchAuthorDetails = async () => {
            try {
                const authorData = await getAuthorDetails(id!);
                setAuthor(authorData.author);
            } catch (err) {
                setError('Greška prilikom preuzimanja podataka o autoru.');
            }
        };

        fetchAuthorDetails();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (author) {
            setAuthor({
                ...author,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!author) return; // Proveri da li je autor učitan
        


        try {
            const response = await updateAuthor(Number(id), {
                firstName: author.firstName,
                lastName: author.lastName,
                dob: author.dob,
                image: author.image,
            });
            

            setMessage(`Autor ažuriran: ${response.message}`); // Poruka uspešnog ažuriranja
            navigate('/'); // Preusmeri nakon uspešne izmene
        } catch (error) {
            setError('Greška prilikom ažuriranja autora. Pokušajte ponovo.');
        }
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!author) {
        return <div>Učitavanje...</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-5 border border-gray-300 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-center mb-5">Uredi Autora</h2>
            {message && <div className="text-green-500 mb-4">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ime:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={author.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Prezime:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={author.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Datum Rođenja:</label>
                    <input
                        type="date"
                        name="dob"
                        value={author.dob.split('T')[0]} // Formatirajte datum za input
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Slika:</label>
                    <input
                        type="text"
                        name="image"
                        value={author.image}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Ažuriraj Autora
                </button>
            </form>
        </div>
    );
};

export default EditAuthor;
