import React, { useState } from 'react';
import axios from 'axios';
import './Feedback.css';
import MainLayout from '../../components/MainLayout';

const FeedbackForm = () => {
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [showPopup, setShowPopup] = useState(false); // State to handle popup visibility

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure both fields are filled
        if (!name || !comment) {
            alert('Please fill in both name and feedback.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/feedback', {
                name,
                comment,
            });
            console.log("Feedback submitted:", response.data);

            // Show success popup
            setShowPopup(true);

            // Clear the form fields
            setName('');
            setComment('');
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    return (
        <MainLayout>
            <div className="feedback-page">
                <section className="feedback-section">
                    <h1>Feedback Form</h1>
                    <p>We value your feedback! Please share your thoughts below.</p>

                    <form className="feedback-form" onSubmit={handleSubmit}>
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
                            <label htmlFor="feedback">Your Feedback:</label>
                            <textarea
                                id="feedback"
                                name="feedback"
                                rows="5"
                                placeholder="Write your feedback"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-button">Submit</button>
                    </form>

                    {/* Popup message for success */}
                    {showPopup && (
                        <div className="popup">
                            <p>Thank you for your feedback!</p>
                            <button onClick={() => setShowPopup(false)}>Close</button>
                        </div>
                    )}
                </section>
            </div>
        </MainLayout>
    );
};

export default FeedbackForm;
