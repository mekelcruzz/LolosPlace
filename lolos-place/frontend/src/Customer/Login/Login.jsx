import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import './Login.css';
import logo from '../../assets/logo.png'; // Correct path to the logo
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../../api/CustomerProvider';
import MainLayout from '../../components/MainLayout';

const LoginPage = () => {
  // State to manage form visibility
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const navigate = useNavigate();
  const { setCustomer } = useCustomer();

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

    // Validate the input fields
    if (!firstName || !lastName || !address || !email || !phone || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhone = /^\d{10,15}$/.test(phone);

    if (!isEmail) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!isPhone) {
      alert("Please enter a valid phone number.");
      return;
    }
    
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    // Proceed with the signup request
    try {
      const response = await axios.post('http://localhost:5000/api/signup', {
        firstName,
        lastName,
        address,
        email,
        phone,
        password,
      });

      if (response.status === 201) {
        alert('Sign up successful! You can now log in.');
        toggleForms(); // Switch to the login form
      } else {
        alert('Sign up failed. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.message || `Sign up failed. Please check your information.`);
    }
  };

  return (
    <MainLayout>
       <section>
       <div class="custom-shape-divider-top-1732550487">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
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
              <button id="signup-submit" type="button" onClick={handleSignUpSubmit}>Sign Up</button>

              <p>
                Already have an account? 
                <button type="button" onClick={toggleForms}>Login</button>
              </p>
            </form>
            
          </section>
          
        )}
          <div className='white'></div>


    </div>
    <div class="custom-shape-divider-bottom-1732551475">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill"></path>
    </svg>
</div>
    </section>
    </MainLayout>
  );
};

export default LoginPage;
