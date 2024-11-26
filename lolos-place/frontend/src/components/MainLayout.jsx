import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Ensure you provide the correct path to your logo
import { useCustomer } from '../api/CustomerProvider'; // Import the hook to use customer context
import { ToastContainer, toast, Flip } from 'react-toastify';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const { customer, setCustomer, menuData, setMenuData, categories, setCategories } = useCustomer(); // Get customer data from context
  const [dropdownActive, setDropdownActive] = useState(false); // State to manage dropdown visibility
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);

  useEffect(() => {
    // Fetch menu data from backend API
    const fetchMenuData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/menu');
        const data = await response.json();
        setMenuData(data);

        // Extract unique categories from the fetched data
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      }
    };

    fetchMenuData();
  }, []);

  const toastOptions = {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Flip,
};

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    setDropdownActive((prevState) => !prevState); // Toggle between true and false
  };

  // Close dropdown when clicking outside of it
  const handleOutsideClick = (e) => {
    const dropdownBtn = document.querySelector('.profile-dropdown-btn');
    if (dropdownBtn && !dropdownBtn.contains(e.target)) {
      setDropdownActive(false); // Close dropdown if clicked outside
    }
  };

  // Add and remove event listener for outside click
  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    setCustomer(null); // Clear customer on logout
    setDropdownActive(false); // Close the dropdown after logging out
  };

  const toggleBurgerMenu = () => {
    setBurgerMenuActive(!burgerMenuActive);
  };

  return (
    <div className="main-layout">
<header className="mainlayout-header">
    <img className="logo" src={logo} alt="Restaurant Logo" />
    <h1>Lolo's Place</h1>

    {/* Burger menu */}
    <div className="burger-menu" onClick={toggleBurgerMenu}>
        <div></div>
        <div></div>
        <div></div>
    </div>

    {/* Header buttons, slide in from the right */}
    <div className={`header-buttons ${burgerMenuActive ? 'active' : ''}`}>
        <Link to="/"><button>Home</button></Link>
        <Link to="/about"><button>About</button></Link>
        <Link to="/menu"><button>Menu</button></Link>
        <Link to="/delivery-and-reservation"><button>Delivery & Reservation</button></Link>
        <Link to="/feedback"><button>Feedback</button></Link>
        <Link to="/order-history"><button>Order History</button></Link>
        

        {customer ? (
            <>
                {/* Profile Dropdown for larger screens */}
                <div className={`profile-dropdown ${burgerMenuActive ? 'small-screen-hidden' : 'large-screen-profile'}`}>
                    <div onClick={toggleDropdown} className="profile-dropdown-btn">
                        <div className="profile-img">
                            <i className="fa-solid fa-circle"></i>
                        </div>
                        <span>{customer.fullName} <i className="fa-solid fa-angle-down"></i></span>
                    </div>
                    <ul className={`profile-dropdown-list ${dropdownActive ? 'active' : ''}`}>
                        <li className="profile-dropdown-list-item">
                            <Link to="/profile">
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

                {/* Burger menu profile options for smaller screens */}
                {burgerMenuActive && (
                    <div className="burger-profile-buttons small-screen-only">
                        <Link to="/profile"><button>Edit Profile</button></Link>
                        <a href="#" onClick={handleLogout}><button>Log out</button></a>

                        {/* Display Full Name at the Bottom of Burger Menu */}
                        <div className="burger-fullname">
                            <span>{customer.fullName}</span>
                        </div>
                    </div>
                )}

            </>
        ) : (
            <Link to="/login"><button>Login</button></Link>
        )}
    </div>
</header>




  <main>
    {children}
  </main>

  <footer>
    <p>&copy; 2024 Lolo's Place. All rights reserved.</p>
  </footer>

  <ToastContainer
    position="top-right"
    autoClose={1000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    transition={Flip}
  />
</div>


  );
};

export default MainLayout;
