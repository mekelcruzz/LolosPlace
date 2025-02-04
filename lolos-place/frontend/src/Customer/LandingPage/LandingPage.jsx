import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './LandingPage.css';
import { useCustomer } from '../../api/CustomerProvider'; // Adjust the import path if necessary
import MainLayout from '../../components/MainLayout';
import pic1 from '../../assets/lolos-place1.jpeg';
import pic2 from '../../assets/lolos-place2.jpeg';

const LandingPage = () => {
  const { customer, setCustomer } = useCustomer(); // Get the customer from context
  const [dropdownActive, setDropdownActive] = useState(false);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = () => {
    setDropdownActive((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    const btn = document.querySelector('.profile-dropdown-btn');
    if (btn && !btn.contains(e.target)) {
      setDropdownActive(false);
    }
  };
  const scrollToTop = () => {
    window.scrollTo(0, 0);
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

  // Fetch top 3 best-sellers from the API
  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/top-best-sellers');
        const data = await response.json();
        
        if (response.ok) {
          console.log('Top Sellers:', data); // Debugging line
          setTopSellers(data.data); // Access the 'data' field
        } else {
          console.error('Error fetching top sellers:', data.message);
        }
      } catch (error) {
        console.error('Error fetching top sellers:', error);
      } finally {
        setLoading(false); // Set loading to false
      }
    };
  
    fetchTopSellers();
  }, []);


  

  return (
    <MainLayout>
      <div className="landing-page">
        {/* Welcome Section */}
        <section className="intro-section">
          <div className="text-content">
            <h1>Welcome to Lolo's Place</h1>
            <p>
              Enjoy a unique dining experience with our freshly made meals, private dining, and events venue.
            </p>
            <Link to="/delivery-and-reservation">
            <button className="order-now-button">Order Now →</button>
          </Link>
          </div>
          <img src={pic1} alt="Lolo's Place" className="image-right" />
        </section>


        {/* Best Sellers Section */}
        <section className="best-sellers-section">
          <h1>Top 3 Best Sellers</h1>
          <p>Discover our most loved dishes, crafted to perfection and adored by our customers.</p>
          {loading ? (
            <p>Loading top sellers...</p>
          ) : (
            <div className="best-sellers">
              {topSellers.map((product, index) => (
                <div key={index} className="best-seller-card">
                  <h3>{product.product_name}</h3>
                </div>
              ))}
            </div>
          )}

          {/* Menu Button */}
          <div className="button-container">
            <Link to="/menu" onClick={scrollToTop}>
              <button className="menu-button">Explore Our Menu</button>
            </Link>
          </div>
        </section>


        {/* About Section */}
        <section className="about-section">
          <div className="text-content">
            <h2>About Us</h2>
            <p>
              Lolo's Place was established in 2017, located at Sitio Maligaya, Cuta, Batangas City. 
              What started as a simple selection of Filipino comfort food has grown to serve a diverse range of customers.
            </p>
            <Link to="/about">
              <button className="about-button">Learn more about Lolo's Place</button>
            </Link>
          </div>
          <img src={pic2} alt="About Us at Lolo's Place" className="image-right" />
        </section>




      

        {/* Order Now Section */}
        <section className="order-now-section">
  <div className="text-content">
    <h2>Order Now</h2>
    <p>
      Choose delivery for convenience, reserve a table to enjoy dining with us, or reserve a table with an advance order for a seamless experience.
    </p>
    <Link to="/delivery-and-reservation">
      <button className="order-button">Place Your Order</button>
    </Link>
  </div>
</section>

      </div>
    </MainLayout>
  );
};

export default LandingPage;