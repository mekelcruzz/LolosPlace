import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Feedback.css';
import MainLayout from '../../components/MainLayout';

const FeedbackForm = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    cleanliness: 0,
    atmosphere: 0,
    speed: 0,
  });
  const [comment, setComment] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const feedbackFormRef = useRef(null);

  const handleNext = () => {
    if (!name) {
      alert('Please fill in your name.');
      return;
    }

    feedbackFormRef.current.scrollIntoView({ behavior: 'smooth' });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate the average score
    const totalScore = Object.values(ratings).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(ratings).length;

    try {
      const response = await axios.post('http://localhost:5000/api/feedback', {
        name,
        ratings,
        comment,
        compound_score: averageScore,
      });

      console.log('Feedback submitted:', response.data);
      setShowPopup(true);

      // Clear the form fields
      setName('');
      setRatings({
        food: 0,
        service: 0,
        cleanliness: 0,
        atmosphere: 0,
        speed: 0,
      });
      setComment('');
      setStep(1);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleRatingChange = (category, rating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [category]: rating,
    }));
  };

  return (
    <MainLayout>
      <div className="feedback-page">
        <h1 ref={feedbackFormRef}>Feedback Form</h1>

        {step === 1 && (
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button onClick={handleNext}>Next</button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Food:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ratings.food}
                onChange={(e) => handleRatingChange('food', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Service:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ratings.service}
                onChange={(e) => handleRatingChange('service', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Cleanliness:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ratings.cleanliness}
                onChange={(e) => handleRatingChange('cleanliness', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Atmosphere:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ratings.atmosphere}
                onChange={(e) => handleRatingChange('atmosphere', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Speed:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ratings.speed}
                onChange={(e) => handleRatingChange('speed', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label>Additional Comments:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
            <button type="submit">Submit Feedback</button>
          </form>
        )}

        {showPopup && (
          <>
            <div className="modal-overlay" onClick={() => setShowPopup(false)}></div>
            <div className="popup">
              <p>Thank you for your feedback!</p>
              <button onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default FeedbackForm;