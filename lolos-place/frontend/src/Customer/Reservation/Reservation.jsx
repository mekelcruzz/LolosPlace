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

  const validateForm = () => {
    const { name, date, time, guests, contact } = formData;
    const isValid = name.trim() && date.trim() && time.trim() && !isNaN(guests) && guests > 0 && contact.trim();
    setFormValid(isValid);
    return isValid;
  };

  const [showCart, setShowCart] = useState(false);
  const toggleCart = () => {
    setShowCart((prev) => !prev);
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
    return filter === 'all'
      ? menuData
      : menuData.filter((menuItem) => menuItem.category.toLowerCase() === filter.toLowerCase());
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
    if (!customer || customer === '') {
      setPopupVisibleLogin(true);
      window.scrollTo(0, 0);
    } else if (!validateForm()) {
      setPopupVisible(true);
    }else if (isAdvanceOrder && cartReservations.length === 0) {
      setPopupVisible(true);
    }else {
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

    const orderDetails = {
        cart: cartReservations.map(item => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
        })), // Cart items to send to the server
        guestNumber: formData.guests, // Number of guests from formData
        userId: customer.id,           // Customer ID
        reservationDate: formData.date, // Date selected in the form
        reservationTime: formData.time, // Time selected in the form
        advanceOrder: isAdvanceOrder,   // Advance order boolean
        totalAmount: getTotalAmount(),  // Total amount of the order
    };


    try {
        const response = await axios.post('http://localhost:5000/api/reservations', orderDetails);

        if (response.status === 201) {
            setConfirmationPopupVisible(false);
            setFormData(initialFormData);
            setIsAdvanceOrder(false);
        } else {
            console.error('Failed to save reservation and order');
        }
    } catch (error) {
        console.error('Error:', error);
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
const handleInputChange = (e) => {
  const { id, value } = e.target;

  // Handle 'guests' input
  if (id === 'guests') {
    const guestNumber = parseInt(value, 10);
    // If value is not a number or empty, don't validate yet
    if (isNaN(guestNumber) || value === '') {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
      return;
    }
    // Otherwise, update state
    setFormData((prevData) => ({
      ...prevData,
      [id]: guestNumber,
    }));
  }

  // Handle 'date' input with validation
  else if (id === 'date') {
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure the time is set to 00:00:00 for today's date
    const oneYearLaterDate = new Date(today);
    oneYearLaterDate.setFullYear(today.getFullYear() + 1);

    // If the date is not valid or is out of range, don't update the state
    if (inputDate < today || inputDate > oneYearLaterDate || isNaN(inputDate)) {
      setFormValid(false);
      return; // Don't update the state if invalid
    }

    // Otherwise, update the state with the valid date
    setFormValid(true);  // Reset form validity flag
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  }

  // Handle 'time' input with validation
  else if (id === 'time') {
    // Define the allowed range for time
    const minTime = "11:00";
    const maxTime = "20:00";

    // If the time is within the allowed range, update the state
    if (value >= minTime && value <= maxTime) {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    } else {
      // Optionally show an alert or log for invalid time
      alert("Please select a time between 11:00 AM and 8:00 PM.");
    }
  }

  // Handle other inputs (if any)
  else {
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
      if (guestNumber < 2 || guestNumber > 60) {
        alert("Number of guests must be between 2 and 60.");
        setFormData((prevData) => ({
          ...prevData,
          [id]: '',
        })); // Reset invalid value
      }
    }
  };
  
  

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
      <div class="custom-shape-divider-top-1732551801">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
    <div className="reservation">
      

      <main>
        <section>
          <h2>Make a Reservation</h2>

          <form noValidate onSubmit={handleReserve}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" required placeholder="Please Login to autofill" value={formData.name} onChange={handleInputChange} disabled/>
              {!formValid && <small className="error-message"></small>}
            </div>


            <div className="form-group">
              <label htmlFor="contact">Contact Number:</label>
              <input type="tel" id="contact" required placeholder="Please Login to autofill" value={formData.contact} onChange={handleInputChange} disabled/>
              {!formValid && <small className="error-message"></small>}
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
    max="60"
  />
  {(formData.guests < 2 || formData.guests > 60) && (
    <small className="error-message">Guests must be between 2 and 60.</small>
  )}
</div>



<div className="form-group">
  <label htmlFor="date">Reservation Date:</label>
  <p className="note">Please press the calendar icon to pick a date.</p>
  <input
    type="date"
    id="date"
    name="date"
    required
    value={formData.date}
    onChange={handleInputChange}
    min={formatDate(today)} // Set today's date
    max={formatDate(oneYearLaterDate)} // Set one year later as max
    onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
  />
  {!formValid && (
    <small className="error-message">
      Please select a valid date within the allowed range.
    </small>
  )}
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
  />
</div>

            
            

            {/* Toggle Slider */}
            <div className="form-group">
              <label htmlFor="toggle" className="toggle-label">Advance Order</label>
              <label className="reservation-switch">
                <input type="checkbox" checked={isAdvanceOrder} onChange={handleToggleChange} />
                <span className="reservation-slider"></span>
              </label>
            </div>

            {/* Reserve Now button that only shows when isAdvanceOrder is false */}
            {!isAdvanceOrder && (
              <button type="submit" className="reserve-button">Reserve Now</button>
            )}
          </form>
          <div className='whitey'></div>

          {/* Conditional rendering of menu when isAdvanceOrder is true */}
          {isAdvanceOrder && (
            <>
              <div className="filter-buttons">
                {getUniqueCategories().map((category, index) => (
                  <button key={index} onClick={() => handleFilterClick(category)}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              <div className="menu">
  <h3>Our Menu</h3>
  <div className="menu-content" id="menu-content">
    {filteredMenu.length > 0 ? (
      filteredMenu.map((menuItem, index) => (
        <div key={index} className="menu-item">
          <h3>{menuItem.name}</h3>
          <p>Price: ₱{menuItem.price}</p>
          <p>{menuItem.description}</p> {/* Add the description here */}
          
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

              {/* Reserve with Advance Order button */}
              <button type="submit" className="reserve-button" onClick={handleReserve}>Reserve with Advance Order</button>
            </>
          )}

        </section>
      </main>

      {popupVisible && (
  <div className="reservation-popup">
    <div className="reservation-popup-content">
      {/* Show different messages based on the conditions */}
      {isAdvanceOrder && cartReservations.length === 0 
        ? "Your cart is empty" 
        : "Please fill out the form"
      }
      <button onClick={closePopup}>OK</button>
    </div>
  </div>
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
              <button className="confirm-btn" onClick={makePaymentGCash}>
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
              <button className="confirm-btn" onClick={handleConfirmOrder}>
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
    <div class="custom-shape-divider-bottom-1732551956">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill"></path>
    </svg>
</div>
    </section>

    <Dialog open={qrCodePopupVisible} onClose={closeQrCodePopup}>
              <DialogTitle>Lolo's Place QR Code</DialogTitle>
              <DialogContent>
                <img src="https://placehold.co/400" alt="qr" />
              </DialogContent>
              <DialogActions>
                <Button onClick={closeQrCodePopup}>Close</Button>
              </DialogActions>
            </Dialog>
    </MainLayout>
  );
};

export default Reservation;