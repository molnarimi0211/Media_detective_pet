import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Form } from 'react-bootstrap';
import './Media.css';

const ItemTypes = {
  WORD: 'word',
};

const DraggableWord = ({ word, id, category, onDropIntoTarget }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORD,
    item: { id, word, category },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDropIntoTarget(item.id, item.category);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-info-subtle rounded-pill px-4 py-2 m-2 shadow-sm d-inline-block cursor-grab ${isDragging ? 'opacity-50' : ''
        }`}
      style={{ border: '1px solid rgb(63, 184, 145)' }}
    >
      {word}
    </div>
  );
};

const DropTargetArea = ({ droppedWords }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORD,
    drop: () => ({ name: 'DropTargetArea' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`border border-dashed border-2 rounded p-4 d-flex flex-wrap min-vh-50 ${isOver ? 'bg-primary-subtle border-primary' : 'bg-light border-secondary'
        }`}
    >
      {droppedWords.length === 0 ? (
        <p className="text-muted fs-5 w-100 text-center mt-4">Drag words here</p>
      ) : (
        droppedWords.map((wordObj) => (
          <div
            key={wordObj.id}
            className="bg-success-subtle rounded-pill px-4 py-2 m-2 shadow-sm"
            style={{ border: '1px solid #28a745' }}
          >
            {wordObj.word}
          </div>
        ))
      )}
    </div>
  );
};

export default function Media() {
  const navigate = useNavigate();

  //Separate each category into its own state
  const [whoWords, setWhoWords] = useState([
    { id: '0', word: 'Frankenstein', category: 'who' },
    { id: '1', word: 'Cleopatra', category: 'who' },
    { id: '2', word: 'Dracula', category: 'who' },
  ]);

  const [withWhomWords, setWithWhomWords] = useState([
    { id: '3', word: 'Shrek', category: 'withWhom' },
    { id: '4', word: 'dwarves', category: 'withWhom' },
    { id: '5', word: 'aliens', category: 'withWhom' },
    { id: '6', word: 'unicorns', category: 'withWhom' },
    { id: '7', word: 'capybaras', category: 'withWhom' },
  ]);

  const [didWords, setDidWords] = useState([
    { id: '8', word: 'danced', category: 'did' },
    { id: '9', word: 'met', category: 'did' },
    { id: '10', word: 'played poker', category: 'did' },
    { id: '11', word: 'had dinner', category: 'did' },
    { id: '12', word: 'watched TV', category: 'did' },
  ]);

  const [droppedWords, setDroppedWords] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState('Facebook');

  // Handle drop based on category
  const handleDropIntoTarget = (wordId, category) => {
    let sourceSetter;
    let sourceList;

    if (category === 'who') {
      sourceSetter = setWhoWords;
      sourceList = whoWords;
    } else if (category === 'withWhom') {
      sourceSetter = setWithWhomWords;
      sourceList = withWhomWords;
    } else if (category === 'did') {
      sourceSetter = setDidWords;
      sourceList = didWords;
    }

    const wordToMove = sourceList.find((w) => w.id === wordId);
    if (wordToMove && !droppedWords.some((w) => w.id === wordId)) {
      setDroppedWords((prev) => [...prev, { ...wordToMove, category }]);
      sourceSetter((prev) => prev.filter((w) => w.id !== wordId));
    }
  };

  //Refresh only resets dropped words (doesn't merge categories)
  const handleRefreshWords = () => {
    // restore each dropped word back to its category
    droppedWords.forEach((word) => {
      if (whoWords.every((w) => w.category === word.category)) {
        setWhoWords((prev) => [...prev, word]);
      } else if (withWhomWords.every((w) => w.category === word.category)) {
        setWithWhomWords((prev) => [...prev, word]);
      } else if (didWords.every((w) => w.category === word.category)) {
        setDidWords((prev) => [...prev, word]);
      }
    });
    setDroppedWords([]);
  };

  const handleGenerate = async () => {
    if (droppedWords.length === 0) {
      alert('Please drag some words into the target area before generating.');
      return;
    }


    let whoCategory = '';
    let didCategory = '';
    let withCategory = '';

    droppedWords.forEach((word) => {
      if (word.category === 'who') {
        whoCategory += `${word.word}, `;
      } else if (word.category === 'did') {
        didCategory += word.word;
      } else if (word.category === 'withWhom') {
        withCategory += `${word.word}, `;
      }
    });

    const categories = droppedWords.reduce((acc, word) => {
      acc[word.category] = (acc[word.category] || 0) + 1;
      return acc;
    }, {});

    if (categories.who !== 1 || categories.did !== 1 || categories.withWhom !== 1) {
      alert('Please select exactly one word from each category.');
      return;
    }

    const sentence = `${whoCategory} ${didCategory} with ${withCategory}.`;
    console.log('Generated sentence:', sentence);

    if (!whoCategory || !didCategory || !withCategory) {
      alert('Please ensure you have selected words from all categories.');
      return;
    }

    navigate('/generated');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: sentence,
          media: selectedMedia,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Unknown error');
      }

      localStorage.setItem('generatedImage', data.imageBase64);
      navigate('/generated');
    } catch (err) {
      console.error('Failed to generate:', err.message);
      localStorage.removeItem('generatedImage');

      if (err.message.includes('safety system')) {
        alert("Your prompt was rejected by OpenAI's safety system. Try rephrasing.");
      } else {
        alert("Couldn't generate image. Please try again.");
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="media-container">
        <div className="word-list">
          <div className="word-row">
            <h5>Who?</h5>
            {whoWords.map((word) => (
              <DraggableWord
                key={word.id}
                id={word.id}
                word={word.word}
                category="who"
                onDropIntoTarget={handleDropIntoTarget}
              />
            ))}
          </div>

          <div className="word-row">
            <h5>Did?</h5>
            {didWords.map((word) => (
              <DraggableWord
                key={word.id}
                id={word.id}
                word={word.word}
                category="did"
                onDropIntoTarget={handleDropIntoTarget}
              />
            ))}
          </div>

          <div className="word-row">
            <h5>With Whom?</h5>
            {withWhomWords.map((word) => (
              <DraggableWord
                key={word.id}
                id={word.id}
                word={word.word}
                category="withWhom"
                onDropIntoTarget={handleDropIntoTarget}
              />
            ))}
          </div>


        </div>

        <div className="drop-target-wrapper">
          <Form className="mb-4">
            <Form.Label className="fw-bold">Select a media surface:</Form.Label>
            <div className="d-flex flex-wrap gap-4 mt-2">
              <Form.Check
                type="radio"
                label="Facebook"
                id="media-facebook"
                name="media"
                checked={selectedMedia === 'Facebook'}
                onChange={() => setSelectedMedia('Facebook')}
              />
              <Form.Check
                type="radio"
                label="Google news feed"
                id="media-google"
                name="media"
                checked={selectedMedia === 'Google'}
                onChange={() => setSelectedMedia('Google')}
              />
            </div>
          </Form>

          <DropTargetArea droppedWords={droppedWords} />

          <div className="mt-3 d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={handleRefreshWords}>
              Refresh
            </Button>
            <Button variant="primary" onClick={handleGenerate}>
              Generate
            </Button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
