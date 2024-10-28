import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookList from './components/BookList';
import AuthorList from './components/AuthorList'; // Importuj AuthorList
import BookDetails from './components/BookDetails';
import AuthorDetails from './components/AuthorDetails'; // Importuj AuthorDetails
import './index.css';
import CreateBook from './components/CreateBook';
import CreateAuthor from './components/CreateAuthor';
import EditBook from './components/EditBook';
import EditAuthor from './components/EditAuthor ';

const App: React.FC = () => {
    const [, ] = useState(false);

    /* const handleShowDetails = () => {
        setShowDetails(true);
    }; */

    return (
        <Router>
            <div className="container mx-auto">
                <Routes>
                    <Route path="/" element={
                        <>
                            <BookList />
                            <AuthorList />
                        </>
                    } />
                    <Route path="/book/:id" element={<BookDetails />} />
                    <Route path="/authors/:id" element={<AuthorDetails />} /> {/* Dodaj rutu za AuthorDetails */}
                    <Route path="/create-book" element={<CreateBook />} /> {/* Dodaj rutu za CreateBook */}
                    <Route path="/create-author" element={<CreateAuthor />} /> {/* Dodaj rutu za CreateBook */}
                    <Route path="/edit-book/:id" element={<EditBook />} /> {/* Ispravljen poziv EditBook */}
                    <Route path="/edit-author/:id" element={<EditAuthor />} />



                    

                </Routes>
            </div>
        </Router>
    );
};

export default App;
