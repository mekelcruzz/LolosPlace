import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useCustomer } from '../api/CustomerProvider';
import './MainLayout.css';
import burgerIcon from '../assets/burger.png';
import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import locationIcon from '../assets/location.png';
import mailIcon from '../assets/mail.png';
import telephoneIcon from '../assets/telephone.png';

const MainLayout = ({ children }) => {
  const { customer, setCustomer } = useCustomer();
  const [dropdownActive, setDropdownActive] = useState(false);
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // smooth scroll animation
    });
  };

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    setDropdownActive((prevState) => !prevState);
  };

  // Close dropdown when clicking outside of it
  const handleOutsideClick = (e) => {
    const dropdownBtn = document.querySelector('.profile-dropdown-btn');
    if (dropdownBtn && !dropdownBtn.contains(e.target)) {
      setDropdownActive(false);
    }
  };

  // Close the burger menu when clicking outside of it
  const handleBurgerMenuOutsideClick = (e) => {
    const burgerMenu = document.querySelector('.header-buttons');
    const burgerIcon = document.querySelector('.burger-icon');
    if (
      burgerMenu &&
      burgerIcon &&
      !burgerMenu.contains(e.target) &&
      !burgerIcon.contains(e.target)
    ) {
      setBurgerMenuActive(false);
    }
  };

  useEffect(() => {
    // Add event listener for outside clicks
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('click', handleBurgerMenuOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('click', handleBurgerMenuOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    setCustomer(null);
    setDropdownActive(false);
    setBurgerMenuActive(false);
    window.location.href = '/';
  };

  const toggleBurgerMenu = () => {
    setBurgerMenuActive((prevState) => !prevState);
  };

  return (
    <div className="main-layout">
      <header className="mainlayout-header">
        <img className="logo" src={logo} alt="Restaurant Logo" />
        <h1>Lolo's Place</h1>

        {/* Burger Icon for small screens */}
        <img
          src={burgerIcon}
          alt="Burger Menu"
          className="burger-icon"
          onClick={toggleBurgerMenu}
        />

        {/* Header buttons */}
        <div className={`header-buttons ${burgerMenuActive ? 'active' : ''}`}>
          <Link to="/" onClick={scrollToTop}><button>Home</button></Link>
          <Link to="/about" onClick={scrollToTop}><button>About</button></Link>
          <Link to="/menu" onClick={scrollToTop}><button>Menu</button></Link>
          <Link to="/delivery-and-reservation" onClick={scrollToTop}><button>Delivery & Reservation</button></Link>
          <Link to="/feedback" onClick={scrollToTop}><button>Feedback</button></Link>

          {customer && (
            <Link to="/order-history" onClick={scrollToTop}><button>Order History</button></Link>
          )}

          {customer ? (
            <>
              <div className="profile-dropdown">
                <div onClick={toggleDropdown} className="profile-dropdown-btn">
                  <span>{customer.fullName} <i className="fa-solid fa-angle-down"></i></span>
                </div>
                <ul className={`profile-dropdown-list ${dropdownActive ? 'active' : ''}`}>
                  <li className="profile-dropdown-list-item">
                    <Link to="/profile" onClick={scrollToTop}>
                      <i className="fa-regular fa-user"></i> Edit Profile
                    </Link>
                  </li>
                  <li className="logout-dropdown-list-item">
                    <a href="#" onClick={handleLogout}>
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                    </a>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <Link to="/login" onClick={scrollToTop}><button>Login</button></Link>
          )}

          {/* Add buttons to burger menu when active */}
          {burgerMenuActive && customer && (
            <div className="burger-menu-extra">
              <Link to="/profile" onClick={scrollToTop}><button>Edit Profile</button></Link>
              <button onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </header>

      <main>
        {children}
      </main>

      <footer>
        <p>&copy; 2024 Lolo's Place.</p>

        {/* Social Media and Contact Buttons */}
        <div className="social-buttons">
          {/* Facebook Button */}
          <a href="https://www.facebook.com/lolosplacebatangas" target="_blank" rel="noopener noreferrer">
            <img src={facebookIcon} alt="Facebook" className="social-icon" />
          </a>
          
          {/* Instagram Button */}
          <a href="https://www.instagram.com/lolosplacebatangas/" target="_blank" rel="noopener noreferrer">
            <img src={instagramIcon} alt="Instagram" className="social-icon" />
          </a>
          
          {/* Location Button */}
          <a href="https://www.google.com/maps/place/Lolo's+Place+Restaurant/@13.7453807,121.051657,18.79z/data=!4m6!3m5!1s0x33bd05faa4754245:0x8d153aacdc8a2837!8m2!3d13.7451512!4d121.0517685!16s%2Fg%2F11fd43s42l?entry=ttu&g_ep=EgoyMDI0MTEyNC4xIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">
            <img src={locationIcon} alt="Location" className="social-icon" />
          </a>
          
          {/* Mail Button */}
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=lawrence.ebora@yahoo.com" target="_blank">
            <img src={mailIcon} alt="Mail" className="social-icon" />
          </a>



          
          {/* Telephone Button */}
          <a href="tel:(043) 784 8150">
            <img src={telephoneIcon} alt="Telephone" className="social-icon" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
