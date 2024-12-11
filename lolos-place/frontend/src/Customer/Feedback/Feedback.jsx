import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Feedback.css';
import MainLayout from '../../components/MainLayout';

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
            <div class="custom-shape-divider-top-1733895035">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
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
                                            <p>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Feedback</p>
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
                                <label htmlFor="comment">Your  additional comments to help us improve:</label>
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
                <div className='whitey'></div>
                <div class="custom-shape-divider-bottom-1733895105">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
            </div>
        </MainLayout>
    );
};

export default FeedbackForm;
