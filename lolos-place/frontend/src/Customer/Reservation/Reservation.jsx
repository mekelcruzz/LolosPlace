import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import menuData from '../../menuData/menuData.json';
import './Reservation.css';
import MainLayout from '../../components/MainLayout';
import { useCustomer } from '../../api/CustomerProvider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import axios from 'axios';
import cartImage from '../../assets/cart.png';
import { format } from 'date-fns';

const Reservation = () => {
  const { customer, menuData, cartReservations, setCartReservations, formData, setFormData, isAdvanceOrder, setIsAdvanceOrder, initialFormData } = useCustomer();
  const [qrCodePopupVisible, setQrCodePopupVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupVisibleLogin, setPopupVisibleLogin] = useState(false);
  const [confirmationPopupVisible, setConfirmationPopupVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [scrollPos, setScrollPos] = useState(window.scrollY);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();
  const [mainFilter, setMainFilter] = useState('all');
  const [subFilter, setSubFilter] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(100); // State for available slots

  const groupedCategories = menuData.reduce((acc, item) => {
    const mainCategory = item.main_category;
    if (!acc[mainCategory]) {
      acc[mainCategory] = new Set();
    }
    acc[mainCategory].add(item.category);
    return acc;
  }, {});
  
  const mainCategories = Object.keys(groupedCategories);

  const validateForm = () => {
    const { name, date, time, guests, contact } = formData;
    const isValid = name.trim() && date.trim() && time.trim() && !isNaN(guests) && guests >= 2 && guests <= 100 && contact.trim(); // Updated to 100
    setFormValid(isValid);
    return isValid;
  };

  const handleMainFilterClick = (selectedFilter) => {
    setMainFilter(selectedFilter);
    setSubFilter(null); // Reset subFilter when selecting a new main category
  };
  
  const handleSubFilterClick = (selectedSubFilter) => {
    setSubFilter(selectedSubFilter);
  };

  const [showCart, setShowCart] = useState(false);
  const toggleCart = () => {
    setShowCart((prev) => !prev);
  };
  const handleButtonClick = () => {
    setShowCart(false);  // Close the cart
    closePopup();        // Close the popup
};
  

  useEffect(() => {
    if (customer) {
      setFormData((prevData) => ({
        ...prevData,
        name: customer.fullName || '',
        contact: customer.phone || '',
      }));
    }
  }, [customer, setFormData]);
  useEffect(() => {
    if (!customer) {
        setFormData(initialFormData);
        setCartReservations([]);
        setIsAdvanceOrder(false);
    }
}, [customer]);

  
  

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < scrollPos) {
        setPopupVisible(true);
      }
      setScrollPos(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollPos]);

  useEffect(() => {
    return () => {
      setIsAdvanceOrder(false); // Reset when the component unmounts
      setCartReservations([]);
    };
  }, []);
  

  const getUniqueCategories = () => {
    const categories = menuData.map((item) => item.category);
    return ['all', ...new Set(categories)];
  };

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

  const handleFilterClick = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const filteredMenu = getFilteredMenu();

  const handleAddToCart = (item) => {
    setCartReservations((prevCartReservations) => {
      const existingItemIndex = prevCartReservations.findIndex((cartItem) => cartItem.name === item.name);

      if (existingItemIndex >= 0) {
        const updatedCartReservations = prevCartReservations.map((cartItem, index) => {
          if (index === existingItemIndex) {
            return { ...cartItem, quantity: cartItem.quantity + 1 };
          }
          return cartItem;
        });
        return updatedCartReservations;
      } else {
        return [...prevCartReservations, { ...item, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity <= 0) return;
    const newCartReservations = [...cartReservations];
    newCartReservations[index].quantity = newQuantity;
    setCartReservations(newCartReservations);
  };

  const handleRemoveFromCart = (index) => {
    const newCartReservations = cartReservations.filter((_, idx) => idx !== index);
    setCartReservations(newCartReservations);
  };

  const handleReserve = (event) => {
    event.preventDefault(); // Prevent page reload
    setShowCart(false);

     if (!customer || customer === '') {
    setPopupVisibleLogin(true);
    window.scrollTo(0, 0);
  } else if (!validateForm()) {
    setPopupVisible(true);
  } else if (availableSlots <= 0) {
    alert("No available slots for the selected date. Please choose another date.");
  } else if (formData.guests > availableSlots) {
    alert(`Only ${availableSlots} slots are available. Please reduce the number of guests or choos another date.`);
  } else if (isAdvanceOrder && cartReservations.length === 0) {
    setPopupVisible(true);
  } else {
    setConfirmationPopupVisible(true);
  }
  };

  const closePopup = () => {
    setPopupVisible(false);
    document.querySelector('h2')?.scrollIntoView({ behavior: 'smooth' });
  };
  const closeToLogin = () => {
    setPopupVisibleLogin(false);
    if (!customer || customer === '') {
      navigate('/login')
      const headerElement = document.querySelector('h2');
      if (headerElement) {
        headerElement.scrollIntoView({ behavior: 'smooth' });
      }
    }else{
      const headerElement = document.querySelector('h2');
      if (headerElement) {
        headerElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleConfirmOrder = async () => {
    if (availableSlots <= 0) {
      alert("No available slots for the selected date. Please choose another date.");
      return;
    }

    if (formData.guests > availableSlots) {
      alert(`Only ${availableSlots} slots are available. Please reduce the number of guests.`);
      return;
    }
  

     const orderDetails = {
    cart: cartReservations.map(item => ({
      menu_id: item.menu_id,
      quantity: item.quantity,
    })),
    guestNumber: formData.guests,
    userId: customer.id,
    reservationDate: formData.date,
    reservationTime: formData.time,
    advanceOrder: isAdvanceOrder,
    totalAmount: getTotalAmount(),
  };
    
  
  try {
    const response = await axios.post('http://localhost:5000/api/reservations', orderDetails);

    if (response.status === 201) {
      setConfirmationPopupVisible(false);
      setFormData(initialFormData);
      setIsAdvanceOrder(false);
      setCartReservations([]); // Clear the cart after successful reservation
    } else {
      console.error('Failed to save reservation and order');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to confirm reservation. Please check your input and try again.');
  }
};

  const closeQrCodePopup = () => {
    setQrCodePopupVisible(false);
  };

  const closeToHome = () => {
    setPopupVisibleLogin(false);
    const headerElement = document.querySelector('h2');
    if (headerElement) {
      headerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const closeConfirmationPopup = () => {
    setConfirmationPopupVisible(false);
  };

  const getTotalAmount = () => {
    return cartReservations.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
////////////////////////////////////////////////////////////////////////////////
const handleInputChange = async (e) => {
  const { id, value } = e.target;

  if (id === 'date') {
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneYearLaterDate = new Date(today);
    oneYearLaterDate.setFullYear(today.getFullYear() + 1);

    if (inputDate < today || inputDate > oneYearLaterDate || isNaN(inputDate)) {
      setFormValid(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/total-guests/${value}`);
      const totalGuests = response.data.totalGuests || 0;
      const slotsLeft = 100 - totalGuests; // Calculate available slots
      setAvailableSlots(slotsLeft); // Update available slots
    } catch (error) {
      console.error('Error fetching total guests:', error);
      setAvailableSlots(100); // Fallback to 100 slots if there's an error
    }

    setFormValid(true);
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  } else {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  }
};





const today = new Date();
const oneYearLaterDate = new Date(today);
oneYearLaterDate.setFullYear(today.getFullYear() + 1);





  ////////////////////////haduken/////////////////////////////
  const handleInputBlur = (e) => {
    const { id, value } = e.target;
  
    // Validate guest number on blur
    if (id === 'guests') {
      const guestNumber = parseInt(value, 10);
      if (guestNumber < 2 || guestNumber > 100) { // Updated from 60 to 100
        alert("Number of guests must be between 2 and 100."); // Updated error message
        setFormData((prevData) => ({
          ...prevData,
          [id]: '',
        })); // Reset invalid value
      }
    }
  };
  
  // In the form input field
<div className="form-group">
  <label htmlFor="guests">Number of Guests:</label>
  <input
    type="number"
    id="guests"
    required
    placeholder="Number of guests"
    value={formData.guests}
    onChange={handleInputChange}
    onBlur={handleInputBlur}
    min="2"
    max="100"
    disabled={!customer} // Disable if no customer is logged in
  />
  {(formData.guests < 2 || formData.guests > 100) && (
    <small className="error-message">Guests must be between 2 and 100.</small>
  )}
  {formData.guests > availableSlots && (
    <small className="error-message">
      Only {availableSlots} slots are available. Please reduce the number of guests.
    </small>
  )}
  <small className="slots-message">
    {formData.date
      ? availableSlots >= 0
        ? `${availableSlots} slots left for ${format(new Date(formData.date), 'MMM-dd-yyyy')}`
        : "Unable to fetch available slots."
      : "Select a date to see available slots."}
  </small>
</div>
  
  

  const handleToggleChange = () => {
    setIsAdvanceOrder((prevState) => !prevState); // Toggle the advance order state
  };

  const makePaymentGCash = async () => {
    const body = {
        user_id: customer.id,
        lineItems: cartReservations.map(product => ({
            quantity: product.quantity,
            name: product.name,
            price: product.price
        })),
    };

    try {
        const response = await axios.post('http://localhost:5000/api/create-gcash-checkout-session', body);

        const { url } = response.data;

        window.location.href = url;
    } catch (error) {
        console.error('Error initiating payment:', error);
    }
}

  return (
    <MainLayout>
      <section>
    <div className="reservation">
      <main>
        <section>
          <h2>Make a Reservation</h2>

          <form noValidate onSubmit={handleReserve}>
  <div className="form-group">
    <label htmlFor="name">Name:</label>
    <input
      type="text"
      id="name"
      required
      placeholder="Please Login to autofill"
      value={formData.name}
      onChange={handleInputChange}
      disabled={!customer} // Disable if no customer is logged in
    />
    {!formValid && <small className="error-message"></small>}
  </div>

  {/* Two-column layout for these fields */}
  <div className="form-columns">
    <div className="form-group">
      <label htmlFor="contact">Contact Number:</label>
      <input
        type="tel"
        id="contact"
        required
        placeholder="Please Login to autofill"
        value={formData.contact}
        onChange={handleInputChange}
        disabled={!customer} // Disable if no customer is logged in
      />
      {!formValid && <small className="error-message"></small>}
    </div>

        

    <div className="form-group">
      <label htmlFor="date">Reservation Date:</label>
      <input
        type="date"
        id="date"
        name="date"
        required
        value={formData.date}
        onChange={handleInputChange}
        min={formatDate(today)}
        max={formatDate(oneYearLaterDate)}
        onKeyDown={(e) => e.preventDefault()}
        disabled={!customer} // Disable if no customer is logged in
      />
      {!formValid && (
        <small className="error-message">
          Please select a valid date within the allowed range.
        </small>
      )}
    </div>

    <div className="form-group">
  <label htmlFor="guests">Number of Guests:</label>
  <input
    type="number"
    id="guests"
    required
    placeholder="Number of guests"
    value={formData.guests}
    onChange={handleInputChange}
    onBlur={handleInputBlur}
    min="2"
    max="100"
    disabled={!customer} // Disable if no customer is logged in
  />
  {(formData.guests < 2 || formData.guests > 100) && (
    <small className="error-message">Guests must be between 2 and 100.</small>
  )}
  <small className="slots-message">
  {formData.date
    ? availableSlots > 0
      ? `${availableSlots} slots left for ${format(new Date(formData.date), 'MMM-dd-yyyy')}`
      : "No slots available for the selected date."
    : "Select a date to see available slots."}
</small>
</div>

    <div className="form-group">
      <label htmlFor="time">Reservation Time:</label>
      <input
        type="time"
        id="time"
        name="time"
        value={formData.time || ''}
        onChange={handleInputChange}
        min="11:00"
        max="20:00"
        required
        disabled={!customer} // Disable if no customer is logged in
      />
    </div>
  </div>

  {/* Rest of the form */}
  <div className="form-group">
    <label htmlFor="toggle" className="toggle-label">Advance Order</label>
    <label className="reservation-switch">
      <input
        type="checkbox"
        checked={isAdvanceOrder}
        onChange={handleToggleChange}
        disabled={!customer} // Disable if no customer is logged in
      />
      <span className="reservation-slider"></span>
    </label>
  </div>

  {!isAdvanceOrder && (
   <button
   type="submit"
   className="reserve-button"
   disabled={!customer || !formValid || availableSlots <= 0}
 >
   {availableSlots <= 0 ? "No Slots Available" : "Reserve Now"}
 </button>
  )}
</form>
          <div className='whitey'></div>

          {/* Conditional rendering of menu when isAdvanceOrder is true */}
          {isAdvanceOrder && (
            <>
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

              <div className="menu">
  <h3>Our Menu</h3>
  <div className="menu-content" id="menu-content">
    {filteredMenu.length > 0 ? (
      filteredMenu.map((menuItem, index) => (
        <div key={index} className="menu-item">
          <h3>{menuItem.name}</h3>
          <p>Price: ₱{menuItem.price}</p>
          <p>{menuItem.description}</p> {/* Add the description here */}
          <>
                      <img src={menuItem.image} alt={menuItem.name} />
                    </>
          {/* Check for bundle items and render them */}
          {menuItem.items && menuItem.items.length > 0 ? (
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {menuItem.items.map((bundleItem, itemIndex) => (
                <li key={itemIndex}>{bundleItem}</li>
              ))}
            </ul>
          ) : null}

          <div>
            <button
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(menuItem)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))
    ) : (
      <p>No items found for this category.</p>
    )}
  </div>
</div>

<>
      {/* Floating Button */}
      <button className="floating-button" onClick={toggleCart}>
        <img src={cartImage} alt="Cart" className="button-image" />
      </button>

      {/* Cart Popup */}
      {showCart && (
        <div className="cart-popup">
          <div className="cart">
            <h3>Your Cart</h3>
            <div id="cart-items">
              {cartReservations.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="item-details">{item.name}</div>
                  <div className="item-actions">
                    <div className="quantity-control">
                      <button
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-text">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(index, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-button" onClick={() => handleRemoveFromCart(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="submit-btn" onClick={handleReserve}>
              Place Order
            </button>
            <button className="close-btn" onClick={() => setShowCart(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
            </>
          )}

        </section>
      </main>

      {popupVisible && (
        <>
          <div
            className="reservation-popup-overlay"
            onClick={handleButtonClick}
          ></div>
          <div className="reservation-popup">
            <div className="reservation-popup-content">
              {isAdvanceOrder && cartReservations.length === 0
                ? "Your cart is empty"
                : "Please fill out the form"}
              <button className="reservation-close-btn" onClick={handleButtonClick}>
                Close
              </button>
            </div>
          </div>
        </>
      )}




{popupVisibleLogin && (
  <div className="reservation-popup">
    <div className="reservation-popup-content">
      Login First
      <div className="button-container">
        <button onClick={closeToLogin}>Ok</button>
        <button onClick={closeToHome}>Cancel</button>
      </div>
    </div>
  </div>
)}


      {confirmationPopupVisible && (
        <div className="confirmation-popup">
        <div className="popup-content receipt">
          {/* Add warning message here */}
          {formData.guests > availableSlots && (
            <div className="warning-message">
              <p>⚠️ Only {availableSlots} slots are available. Please reduce the number of guests.</p>
            </div>
          )}
      
          {isAdvanceOrder ? (
            <>
              <h3>Reservation with Advance Ordering</h3>
              <div className="receipt-header">
                <h1>Lolo's Place</h1>
                <p>Thank you for your reservation!</p>
              </div>
              <div className="receipt-details">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Reservation Date:</strong> {formData.date}</p>
                <p><strong>Reservation Time:</strong> {formData.time}</p>
                <p><strong>Number of Guests:</strong> {formData.guests}</p>
                <p><strong>Contact Number:</strong> {formData.contact}</p>
              </div>
              <h4>Items Ordered:</h4>
              <ul className="receipt-items">
                {cartReservations.map((item, index) => (
                  <li key={index}>
                    {item.name} (x{item.quantity}) - ₱{item.price * item.quantity}
                  </li>
                ))}
              </ul>
              <h4 className="total">Total: ₱{getTotalAmount()}</h4>
              <div className="receipt-footer">
                <button
                  className="confirm-btn"
                  onClick={makePaymentGCash}
                  disabled={formData.guests > availableSlots} // Disable button if guests exceed slots
                >
                  Confirm
                </button>
                <button className="close-btn" onClick={closeConfirmationPopup}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>Reservation Confirmation</h3>
              <div className="receipt-header">
                <h1>Lolo's Place</h1>
                <p>Thank you for your reservation!</p>
              </div>
              <div className="receipt-details">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Reservation Date:</strong> {formData.date}</p>
                <p><strong>Reservation Time:</strong> {formData.time}</p>
                <p><strong>Number of Guests:</strong> {formData.guests}</p>
                <p><strong>Contact Number:</strong> {formData.contact}</p>
              </div>
              <div className="receipt-footer">
                <button
                  className="confirm-btn"
                  onClick={handleConfirmOrder}
                  disabled={formData.guests > availableSlots} // Disable button if guests exceed slots
                >
                  Confirm
                </button>
                <button className="close-btn" onClick={closeConfirmationPopup}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </div>
    </section>
    </MainLayout>
  );
};

export default Reservation;