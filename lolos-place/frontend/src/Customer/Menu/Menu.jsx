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
        <section id="menu" className="menu">
          <div className="menu-description">
            <p>Explore our menu</p>
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
                  <p>{menuItem.description}</p> {/* Add the description here */}
                  {menuItem.category !== 'Bundle Meal' && menuItem.category !== 'Ultimo Paborito' ? (
                    <>
                      <img src={menuItem.image} alt={menuItem.name} />
                    </>
                  ) : (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                      {menuItem.items && menuItem.items.map((bundleItem, itemIndex) => (
                        <li key={itemIndex}>{bundleItem}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p>No items found for this category.</p>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Menu;