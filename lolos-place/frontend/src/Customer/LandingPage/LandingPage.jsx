import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import { useCustomer } from '../../api/CustomerProvider'; // Adjust the import path if necessary
import MainLayout from '../../components/MainLayout';


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
          <h1>Welcome to Lolo's Place</h1>
          <p>
            Enjoy a unique dining experience with our freshly made meals, private dining, and events venue.
          </p>
        </section>

        {/* About Section */}
        <section className="about-section">
        <div class="custom-shape-divider-top-1733154295">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
          <h2>About Us</h2>
          <p>
            Lolo's Place was established in 2017, located at Sitio Maligaya, Cuta, Batangas City. What started as a simple selection of Filipino comfort food has grown to serve a diverse range of customers.
          </p>
          <Link to="/about">
            <button className="about_button">Learn more about Lolo's Place</button>
          </Link>
          <div className="custom-shape-divider-top-1732113857">
            {/* Custom shape divider */}
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="best-sellers-section">
        <div class="custom-shape-divider-top-1733154424">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
  <h2>Top 3 Best Sellers</h2>
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

  <div className="custom-shape-divider-top-1732261032">
    {/* Custom shape divider */}
  </div>
</section>


        {/* Order Now Section */}
        <section className="order-now-section">
        <div class="custom-shape-divider-top-1733154549">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
          <h2>Order Now</h2>
          <p>
            Ready to indulge? Place your order online and enjoy our meals in the comfort of your home or have a reservation with us.
          </p>
          <Link to="/delivery-and-reservation">
            <button className="order-button">Place Your Order</button>
          </Link>
          <div class="custom-shape-divider-bottom-1733154741">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
        </section>
      </div>
    </MainLayout>
  );
};

export default LandingPage;
