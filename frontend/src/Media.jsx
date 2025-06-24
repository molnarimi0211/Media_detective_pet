import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import Bootstrap components
import { Container, Row, Col, Button } from 'react-bootstrap';


// Define item types for drag and drop
const ItemTypes = {
    WORD: 'word',
};

// Draggable Word Component
const DraggableWord = ({ word, id, onDropIntoTarget }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.WORD,
        item: { id, word },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                onDropIntoTarget(item.id);
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`
                bg-info-subtle
                rounded-pill
                px-4 py-2
                m-2
                shadow-sm
                d-inline-block
                cursor-grab
                ${isDragging ? 'opacity-50' : ''}
            `}
            style={{ border: '1px solid #6c757d' }}
        >
            {word}
        </div>
    );
};

// Drop Target Component
const DropTargetArea = ({ droppedWords }) => {
    const [{ isOver }, drop] = useDrop(() => ({ 
        accept: ItemTypes.WORD,
        drop: (item) => ({ name: 'DropTargetArea' }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <div
            ref={drop}
            className={`
                border border-dashed border-2
                rounded
                p-4
                d-flex flex-wrap align-items-start align-content-start
                min-vh-50
                position-relative
                ${isOver ? 'bg-primary-subtle border-primary' : 'bg-light border-secondary'}
            `}
        >
            {droppedWords.length === 0 && (
                <p className="text-muted fs-5 w-100 text-center mt-4">
                    Drag words here
                </p>
            )}
            {droppedWords.map((wordObj) => (
                <div
                    key={wordObj.id}
                    className="
                        bg-success-subtle
                        rounded-pill
                        px-4 py-2
                        m-2
                        shadow-sm
                    "
                    style={{ border: '1px solid #28a745' }}
                >
                    {wordObj.word}
                </div>
            ))}
        </div>
    );
};

// Main Media Component
const Media = () => {

    const navigate = useNavigate();

    const [availableWords, setAvailableWords] = useState([
        { id: '1', word: 'carrot' },
        { id: '2', word: 'pineapple' },
        { id: '3', word: 'mandarin' },
        { id: '4', word: 'olive oil' },
        { id: '5', word: 'kiwi' },
        { id: '6', word: 'peach' },
        { id: '7', word: 'watermelon' },
        { id: '8', word: 'cherry' },
    ]);

    const [droppedWords, setDroppedWords] = useState([]);

    const handleDropIntoTarget = (wordId) => {
        const wordToMove = availableWords.find((word) => word.id === wordId);
        if (wordToMove && !droppedWords.some(word => word.id === wordId)) {
            setDroppedWords((prevDroppedWords) => [...prevDroppedWords, wordToMove]);
            setAvailableWords((prevAvailableWords) =>
                prevAvailableWords.filter((word) => word.id !== wordId)
            );
        }
    };

    const handleGenerate = async () => {
    if (droppedWords.length === 0) {
        alert("Please drag some words into the target area before generating.");
        return;
    }

    const wordsToSend = droppedWords.map(wordObj => wordObj.word);
    const backendUrl = '/api/generate';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ words: wordsToSend })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error from backend'}`);
        }

        const data = await response.json();
        console.log('Received data:', data);


        localStorage.setItem('generatedImage', data.imageBase64);
        navigate('/generated');



    } catch (error) {
        console.error('Error sending words to backend:', error);
        alert(`Couldn't send words to backend: ${error.message}`);
    }
};


    return (
        <DndProvider backend={HTML5Backend}>
            <Container fluid className="p-4 bg-light min-vh-100">
                <Row className="gx-4">
                    <Col md={3} className="d-flex flex-column">
                        {availableWords.map((word) => (
                            <DraggableWord
                                key={word.id}
                                id={word.id}
                                word={word.word}
                                onDropIntoTarget={handleDropIntoTarget}
                            />
                        ))}
                    </Col>
                    <Col md={9} className="border rounded shadow-lg bg-white p-3 position-relative d-flex flex-column">
                        <DropTargetArea droppedWords={droppedWords} />
                        <div className="mt-auto d-flex justify-content-end">
                            <Button variant="primary" onClick={handleGenerate} className="shadow-sm">
                                Generate
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </DndProvider>
    );
};

export default Media;