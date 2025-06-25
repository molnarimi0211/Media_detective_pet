import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Spinner } from 'react-bootstrap';

const Generated = () => {
    const navigate = useNavigate();
    const [imageBase64, setImageBase64] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [minDelayDone, setMinDelayDone] = useState(false);

    useEffect(() => {
        // Minimum loading duration
        const delayTimer = setTimeout(() => {
            setMinDelayDone(true);
        }, 3000);

        // Poll for image
        const pollTimer = setInterval(() => {
            const img = localStorage.getItem('generatedImage');
            if (img) {
                setImageBase64(img);
            }
        }, 300);

        return () => {
            clearTimeout(delayTimer);
            clearInterval(pollTimer);
        };
    }, []);

    useEffect(() => {
        // Stop loading once both image and delay are done
        if (minDelayDone && imageBase64) {
            setIsLoading(false);
            localStorage.removeItem('generatedImage');
        }
    }, [minDelayDone, imageBase64]);

    return (
        <Container className="text-center py-5">
            <h1>Generated Image</h1>

            {isLoading ? (
                <div className="my-5">
                    <Spinner animation="border" role="status" />
                    <p className="mt-3">Generating your image…</p>
                </div>
            ) : imageBase64 ? (
                <img
                    src={`data:image/png;base64,${imageBase64}`}
                    alt="Generated"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '1rem', marginTop: '1rem' }}
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
