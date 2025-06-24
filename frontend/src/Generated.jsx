import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

const Generated = () => {
    const navigate = useNavigate();

    const imageBase64 = localStorage.getItem('generatedImage');

    useEffect(() => {
        return () => {
            localStorage.removeItem('generatedImage');
        };
    }, []);

    return (
        <Container className="text-center py-5">
            <h1>Generated Image</h1>
            {imageBase64 ? (
                <img
                    src={`data:image/png;base64,${imageBase64}`}
                    alt="Generated"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '1rem' }}
                />
            ) : (
                <p>No image found. Please generate one first.</p>
            )}
            <div className="mt-4 d-flex justify-content-center gap-3">
                <Button onClick={() => navigate('/media')}>Generate Another</Button>
                <Button variant="secondary" onClick={() => navigate('/')}>Go Home</Button>
            </div>
        </Container>
    );
};

export default Generated;
