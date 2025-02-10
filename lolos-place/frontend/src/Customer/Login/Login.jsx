import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../../api/CustomerProvider';
import MainLayout from '../../components/MainLayout';

const LoginPage = () => {
  // State to manage form visibility
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const navigate = useNavigate();
  const { setCustomer } = useCustomer();

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Function to toggle between login and signup forms
  const toggleForms = () => {
    setIsLoginVisible(!isLoginVisible);
  };

  const handleLoginSubmit = async () => {
    const identifier = document.getElementById('login-identifier').value;
    const password = document.getElementById('login-password').value; 

    // Check if the identifier is either a valid email or phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10,15}$/.test(identifier);

    if (!identifier || (!isEmail && !isPhone)) {
      alert("Please enter a valid Email or Phone Number.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    // If both fields are valid, you can proceed with the form submission
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        identifier, 
        password,
      });

      if (response.status === 200) {
        const customer = response.data.data; // Adjust according to your API response structure
        setCustomer(customer); // Set customer context with the logged-in user
        navigate('/', { replace: true }); // Redirect to home
      } else if (response.status === 401) {
        alert(`Invalid credentials`);
      } else if (response.status === 404) {
        alert(`Login failed. Account not found.`);
      }
    } catch (error) {
      alert(error.response?.data?.message || `Login failed. Incorrect username or Password.`);
    }
  };

  const handleSignUpSubmit = async () => {
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const address = document.getElementById('signup-address').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;

    // Validate input fields
    if (!firstName || !lastName || !address || !email || !phone || !password) {
      alert('Please fill in all fields.');
      return;
    }

    // Send OTP
    try {
      await axios.post('http://localhost:5000/api/send-otp', { email });
      setEmail(email); // Store email for OTP verification
      setShowOTPModal(true); // Show OTP modal
    } catch (error) {
      alert('Failed to send OTP. Please try again.');
    }
  };

  const handleOTPVerification = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
      if (response.status === 200) {
        alert('OTP verified successfully!');
        setShowOTPModal(false); // Hide OTP modal
        // Proceed with signup
        const signupResponse = await axios.post('http://localhost:5000/api/signup', {
          firstName: document.getElementById('signup-firstname').value,
          lastName: document.getElementById('signup-lastname').value,
          address: document.getElementById('signup-address').value,
          email,
          phone: document.getElementById('signup-phone').value,
          password: document.getElementById('signup-password').value,
        });
        if (signupResponse.status === 201) {
          alert('Sign up successful! You can now log in.');
          setIsLoginVisible(true); // Switch to login form
        }
      }
    } catch (error) {
      alert('Invalid OTP. Please try again.');
    }
  };

  return (
    <MainLayout>
       <section>
    <div className="login-page">
        {/* Login Section */}
        {isLoginVisible && (
          <section id="loginSection">
            <h2>Login</h2>
            <form className="login" id="loginForm">
              {/* Email or Phone Number Field */}
              <input 
                type="text" 
                id="login-identifier" 
                placeholder="Email or Phone Number" 
                required 
              />
              {/* Password Field */}
              <input 
                type="password" 
                id="login-password" 
                placeholder="Password" 
                required 
              />
              {/* Submit Button */}
              <button 
                id="login-submit" 
                type="button" 
                onClick={handleLoginSubmit}
              >
                Login
              </button>
              <p>
                Don't have an account? 
                <button type="button" onClick={toggleForms}>Sign Up</button>
              </p>
            </form>
          </section>
        )}

        {/* Sign Up Section */}
        {!isLoginVisible && (
        <section id="signupSection">
          <h2>Sign Up</h2>
          <form className="signup" id="signupForm">
            <input type="text" id="signup-firstname" placeholder="First Name" required />
            <input type="text" id="signup-lastname" placeholder="Last Name" required />
            <input type="text" id="signup-address" placeholder="Complete Address" required />
            <input type="email" id="signup-email" placeholder="Email" required />
            <input type="text" id="signup-phone" placeholder="Phone Number" required />
            <input type="password" id="signup-password" placeholder="Password" required />
            <button id="signup-submit" type="button" onClick={handleSignUpSubmit}>
              Sign Up
            </button>
            <p>
              Already have an account?{' '}
              <button type="button" onClick={toggleForms}>
                Login
              </button>
            </p>
          </form>
        </section>
      )}

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <h2>Enter OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleOTPVerification}>Verify OTP</button>
          </div>
        </div>
      )}
    </div>
    </section>
    </MainLayout>
  );
};

export default LoginPage;
