import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Menu.css';
import logo from '../../assets/logo.png';
import MainLayout from '../../components/MainLayout';
import { useCustomer } from '../../api/CustomerProvider';

const Menu = () => {
  const [mainFilter, setMainFilter] = useState('all');
  const [subFilter, setSubFilter] = useState(null); // New state for subcategory filter
  const [loading, setLoading] = useState(true);
  const { menuData, setMenuData, categories, setCategories } = useCustomer();

  const groupedCategories = menuData.reduce((acc, item) => {
    const mainCategory = item.main_category;
    if (!acc[mainCategory]) {
      acc[mainCategory] = new Set();
    }
    acc[mainCategory].add(item.category);
    return acc;
  }, {});

  const mainCategories = Object.keys(groupedCategories);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/menu');
        const data = await response.json();
        setMenuData(data);
        setLoading(false);
        const uniqueCategories = [...new Set(data.map((item) => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setLoading(false);
      }
    };
    fetchMenuData();
  }, []);

  const getFilteredMenu = () => {
    if (mainFilter === 'all') {
      return menuData;
    }
    return menuData.filter(
      (menuItem) =>
        menuItem.main_category === mainFilter &&
        (!subFilter || menuItem.category === subFilter)
    );
  };

  const handleMainFilterClick = (selectedFilter) => {
    setMainFilter(selectedFilter);
    setSubFilter(null); // Reset subFilter when selecting a new main category
  };

  const handleSubFilterClick = (selectedSubFilter) => {
    setSubFilter(selectedSubFilter);
  };

  const filteredMenu = getFilteredMenu();

  if (loading) {
    return <p>Loading menu items...</p>;
  }

  return (
    <MainLayout>
      <div className="menu-page">
        <section id="menu" className="menu">
          <div className="menu-description">
            <h2 className="menu-title">Explore Our Delicious Menu</h2>
          </div>

          {/* Main Category Buttons */}
          <div className="menu-buttons">
            <button
              data-filter="all"
              className={`filter-button ${mainFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleMainFilterClick('all')}
            >
              All Food
            </button>
            {mainCategories.map((mainCategory, index) => (
              <button
                key={index}
                data-filter={mainCategory}
                className={`filter-button ${mainFilter === mainCategory ? 'active' : ''}`}
                onClick={() => handleMainFilterClick(mainCategory)}
              >
                {mainCategory}
              </button>
            ))}
          </div>

          {/* Subcategory Buttons */}
          {mainFilter !== 'all' && groupedCategories[mainFilter] && (
            <div className="subcategory-buttons">
              {[...groupedCategories[mainFilter]].map((subcategory, index) => (
                <button
                  key={index}
                  data-filter={subcategory}
                  className={`filter-button ${subFilter === subcategory ? 'active' : ''}`}
                  onClick={() => handleSubFilterClick(subcategory)}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          )}

          {/* Display Filtered Menu Items */}
          <div className="menu-content" id="menu-content">
            {filteredMenu.length > 0 ? (
              filteredMenu.map((menuItem, index) => (
                <div key={index} className="menu-item">
                  <div className="menu-item-header">
                    <img
                      src={menuItem.image}
                      alt={menuItem.name}
                      className="menu-item-image"
                    />
                    <div className="menu-item-details">
                      <h3>{menuItem.name}</h3>
                      <p className="menu-item-price">₱{menuItem.price}</p>
                    </div>
                  </div>
                  <p className="menu-item-description">
                    {menuItem.description || 'Good for 2 people'}
                  </p>
                  <ul className="menu-item-list">
                    {menuItem.items &&
                      menuItem.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="no-items">No items found for this category.</p>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Menu;
