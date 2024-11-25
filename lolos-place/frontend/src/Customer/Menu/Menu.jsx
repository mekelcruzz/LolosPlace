import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Menu.css'; // Correct relative path to Menu.css
import logo from '../../assets/logo.png'; // Correct relative path to logo.png
import MainLayout from '../../components/MainLayout';
import { useCustomer } from '../../api/CustomerProvider';

const Menu = () => {
  const [filter, setFilter] = useState('all'); // State to store selected filter
  const [loading, setLoading] = useState(true); // State to handle loading state
  const {menuData, setMenuData, categories, setCategories} = useCustomer();

  useEffect(() => {
    // Fetch menu data from backend API
    const fetchMenuData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/menu');
        const data = await response.json();
        setMenuData(data);
        setLoading(false);

        // Extract unique categories from the fetched data
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Function to filter menu items based on the selected filter
  const getFilteredMenu = () => {
    if (filter === 'all') {
      return menuData; // Return all items if 'all' is selected
    } else {
      // Ensure categories are compared in a case-insensitive manner
      return menuData.filter(menuItem => menuItem.category.toLowerCase() === filter.toLowerCase());
    }
  };

  const handleFilterClick = (selectedFilter) => {
    setFilter(selectedFilter); // Update the filter when button is pressed
  };

  const filteredMenu = getFilteredMenu(); // Get the filtered menu

  if (loading) {
    return <p>Loading menu items...</p>;
  }

  return (
    <MainLayout>
      <div className="menu-page"> {/* Add a unique class here */}
        
      <section id="menu" className="menu" style={{ marginTop: 0, paddingTop: 0}}>
      <div class="custom-shape-divider-top-1732374191">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
        
          <div className="menu-description">
            <h2 className="menu-title">Explore Our Delicious Menu</h2>
          </div>

          <div className="menu-buttons">
            <button 
              data-filter="all" 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => handleFilterClick('all')}
            >
              All Food
            </button>
            {categories.map((category, index) => (
              <button 
                key={index}
                data-filter={category}
                className={`filter-button ${filter === category ? 'active' : ''}`} 
                onClick={() => handleFilterClick(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Display filtered menu items */}
          <div className="menu-content" id="menu-content">
            {filteredMenu.length > 0 ? (
              filteredMenu.map((menuItem, index) => (
                <div key={index} className="menu-item">
                  <h3>{menuItem.name}</h3>
                  <p>Price: ₱{menuItem.price}</p>
                  <p>{menuItem.description || "Good for 2 people"}</p> {/* Set description with fallback for bundles */}
                  <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {menuItem.items && menuItem.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
            </div>
    ))
  ) : (
    <p>No items found for this category.</p>
  )}
  <div class="custom-shape-divider-bottom-1732374289">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill"></path>
    </svg>
</div>

</div>
<div className='white'></div>

        </section>
        
      </div>
    </MainLayout>
  );
};

export default Menu;