import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Feedback.css';
import MainLayout from '../../components/MainLayout';
//comment
const FeedbackForm = () => {
    const [step, setStep] = useState(1); // Step 1: Feedback options, Step 2: Comment form
    const [name, setName] = useState('');
    const [category, setCategory] = useState(''); // Feedback category (e.g., Food, Service)
    const [feedbackTypes, setFeedbackTypes] = useState([]); // Multiple selected feedback types
    const [comment, setComment] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    // Reference for the h1 element
    const feedbackFormRef = useRef(null);

    const comments = {
        positive: {
            Food: [
                "The food was delicious!",
                "Amazing flavors and fresh ingredients."
            ],
            Service: [
                "The staff was super friendly and attentive.",
                "Our waiter was fantastic!"
            ],
            Cleanliness: [
                "The place was spotless.",
                "Very clean and hygienic."
            ],
            Atmosphere: [
                "The ambiance was cozy and perfect.",
                "Loved the music and lighting."
            ],
            Value: [
                "Great value for money!",
                "Huge portions for a reasonable price."
            ],
            Speed: [
                "The food came out quickly.",
                "We were seated immediately."
            ]
        },
        neutral: {
            Food: [
                "The food was okay.",
                "Nothing special, but decent."
            ],
            Service: [
                "The staff was polite.",
                "Service was average."
            ],
            Cleanliness: [
                "It was clean enough.",
                "Nothing to complain about cleanliness."
            ],
            Atmosphere: [
                "The ambiance was fine.",
                "A typical restaurant setting."
            ],
            Value: [
                "Fair prices.",
                "Reasonable for what you get."
            ],
            Speed: [
                "The food took a bit of time, but it was manageable."
            ]
        },
        negative: {
            Food: [
                "The food was bland and tasteless.",
                "My dish was cold and undercooked."
            ],
            Service: [
                "The staff was rude.",
                "Service was too slow and inattentive."
            ],
            Cleanliness: [
                "The restaurant was dirty.",
                "Tables were sticky and not cleaned properly."
            ],
            Atmosphere: [
                "The place was too noisy and chaotic.",
                "Lighting was too dim."
            ],
            Value: [
                "Overpriced for what we got.",
                "Portions were way too small for the price."
            ],
            Speed: [
                "We waited over an hour for food.",
                "The table service was painfully slow."
            ]
        }
    };

    const handleNext = () => {
        if (!name || !category || feedbackTypes.length === 0) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Scroll to the feedback form heading (h1)
        feedbackFormRef.current.scrollIntoView({ behavior: 'smooth' });

        setStep(2); // Proceed to the comment form
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        if (!comment || feedbackTypes.length === 0) {
          alert('Please select at least one feedback type and provide additional comments.');
          return;
        }
      
        try {
          // Send feedback types along with the comment
          const response = await axios.post('http://localhost:5000/api/feedback', {
            name,
            feedbackType: feedbackTypes.join(', '), // Send feedback types as a comma-separated string
            comment,
          });
      
          console.log('Feedback submitted:', response.data);
      
          // Show success popup
          setShowPopup(true);
      
          // Clear the form fields
          setName('');
          setFeedbackTypes([]);
          setComment('');
          setStep(1); // Reset to the first step
        } catch (error) {
          console.error('Error submitting feedback:', error);
        }
      };

      const toggleFeedbackType = (type) => {
        setFeedbackTypes((prevTypes) => {
          if (prevTypes.includes(type)) {
            return prevTypes.filter(item => item !== type);
          } else {
            return [...prevTypes, type];
          }
        });
     };
     
   
    return (
        <MainLayout>
            <div className="feedback-page">
                {/* Reference the h1 element for scrolling */}
                <h1 ref={feedbackFormRef}>Feedback Form</h1>

                {step === 1 && (
                    <>
                        <p>We value your feedback! Please select a category and provide feedback below:</p>

                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category:</label>
                            <select
                                id="category"
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Food">Food</option>
                                <option value="Service">Service</option>
                                <option value="Cleanliness">Cleanliness</option>
                                <option value="Atmosphere">Atmosphere</option>
                                <option value="Value">Value</option>
                                <option value="Speed">Speed</option>
                            </select>
                        </div>

                        {category && (
                            <>
                                <div className="form-group">
                                    <p>Select feedback types for {category}:</p>
                                    {['positive', 'neutral', 'negative'].map((sentiment) => (
                                        <div key={sentiment}>
                                            <div className="feedback-options">
                                                {comments[sentiment][category].map((option, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        className={`feedback-option ${feedbackTypes.includes(option) ? 'selected' : ''}`}
                                                        onClick={() => toggleFeedbackType(option)}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button type="button" className="submit-button" onClick={handleNext}>Next</button>
                            </>
                        )}
                    </>
                )}

                {step === 2 && (
                    <>
                        <p>Please provide additional comments to help us improve:</p>
                        <div>
                            <h3>Your Selected Feedback:</h3>
                            <ul>
                                {feedbackTypes.map((feedback, index) => (
                                    <li key={index}>{feedback}</li>
                                ))}
                            </ul>
                        </div>
                        <form className="feedback-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="comment">Your comments in this feedback so we can immprove next time we serve you:</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    rows="5"
                                    placeholder="Write your feedback"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button">Submit</button>
                        </form>
                    </>
                )}

                {/* Popup and overlay */}
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
