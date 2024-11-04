import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import logo from '../../assets/logo.png';
import { useCustomer } from '../../api/CustomerProvider'; // Adjust the import path if necessary
import MainLayout from '../../components/MainLayout';

const LandingPage = () => {
  const { customer, setCustomer } = useCustomer(); // Get the customer from context
  const [dropdownActive, setDropdownActive] = useState(false);
  const checkcustomer = () => {
    console.log(customer);
  }


  const toggleDropdown = () => {
    setDropdownActive((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    const btn = document.querySelector('.profile-dropdown-btn');
    if (btn && !btn.contains(e.target)) {
      setDropdownActive(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    setCustomer(null); // Clear customer context on logout
    setDropdownActive(false);
  };

  return (
    <MainLayout>
      <div className="landing-page">
    

      <section className="intro-section">
        <h1>Welcome to Lolo's Place</h1>
        <p>
          Enjoy a unique dining experience with our freshly made meals, private dining, and events venue.
        </p>
        <Link to="/menu">
          <button className="explore-button">Explore Our Menu</button>
        </Link>
      </section>
    </div>

    </MainLayout>
    
  );
};

export default LandingPage;
