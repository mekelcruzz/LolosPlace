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

const Reservation = () => {
  const { customer, menuData, cartItems, setCartItems, formData, setFormData, isAdvanceOrder, setIsAdvanceOrder } = useCustomer();
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
    const isValid = name.trim() && date.trim() && time.trim() && guests.trim() && contact.trim();
    setFormValid(isValid);
    return isValid;
  };

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
    setCartItems((prevCartItems) => {
      const existingItemIndex = prevCartItems.findIndex((cartItem) => cartItem.name === item.name);

      if (existingItemIndex >= 0) {
        const updatedCartItems = prevCartItems.map((cartItem, index) => {
          if (index === existingItemIndex) {
            return { ...cartItem, quantity: cartItem.quantity + 1 };
          }
          return cartItem;
        });
        return updatedCartItems;
      } else {
        return [...prevCartItems, { ...item, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity <= 0) return;
    const newCartItems = [...cartItems];
    newCartItems[index].quantity = newQuantity;
    setCartItems(newCartItems);
  };

  const handleRemoveFromCart = (index) => {
    const newCartItems = cartItems.filter((_, idx) => idx !== index);
    setCartItems(newCartItems);
  };

  const handleReserve = (event) => {
    event.preventDefault(); // Prevent page reload
    if (!customer || customer === '') {
      setPopupVisibleLogin(true);
      window.scrollTo(0, 0);
    } else if (!validateForm()) {
      setPopupVisible(true);
    }else if (isAdvanceOrder && cartItems.length === 0) {
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
        cart: cartItems.map(item => ({
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
            const { reservation, order } = response.data;
            console.log('Reservation saved:', reservation);
            console.log('Order created:', order);
            setConfirmationPopupVisible(false);
            setQrCodePopupVisible(true); // Show QR code or confirmation
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
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleToggleChange = () => {
    setIsAdvanceOrder((prevState) => !prevState); // Toggle the advance order state
  };

  const makePaymentGCash = async () => {
    const body = {
        user_id: customer.id,
        lineItems: cartItems.map(product => ({
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
    <div className="reservation">
      

      <main>
        <section>
          <h2>Make a Reservation</h2>

          <form noValidate onSubmit={handleReserve}>
            <div className="form-group">
              <label htmlFor="name">Name <span>*</span>:</label>
              <input type="text" id="name" required placeholder="Please Login to Autofill the your name" value={formData.name} onChange={handleInputChange} disabled/>
              {!formValid && <small className="error-message">Please fill out this field.</small>}
            </div>
            <div className="form-group">
              <label htmlFor="contact">Contact Number <span>*</span>:</label>
              <input type="tel" id="contact" required placeholder="Please Login to Autofill the your phone number" value={formData.contact} onChange={handleInputChange} disabled/>
              {!formValid && <small className="error-message">Please fill out this field.</small>}
            </div>
            <div className="form-group">
              <label htmlFor="guests">Number of Guests <span>*</span>:</label>
              <input type="number" id="guests" required placeholder="Number of guests" value={formData.guests} onChange={handleInputChange} />
              {!formValid && <small className="error-message">Please fill out this field.</small>}
            </div>
            <div className="form-group">
              <label htmlFor="date">Reservation Date <span>*</span>:</label>
              <input type="date" id="date" required value={formData.date} onChange={handleInputChange} />
              {!formValid && <small className="error-message">Please fill out this field.</small>}
            </div>
            <div className="form-group">
              <label htmlFor="time">Reservation Time <span>*</span>:</label>
              <input type="time" id="time" required value={formData.time} onChange={handleInputChange} />
              {!formValid && <small className="error-message">Please fill out this field.</small>}
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
                  <div><button onClick={() => handleAddToCart(menuItem)}>Add to Cart</button></div>
                </div>
              ))
            ) : (
              <p>No items found for this category.</p>
            )}
            </div>
          </div>

              <div className="cart">
                <h3>Your Cart</h3>
                <div id="cart-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="item-details">{item.name}</div>
                      <div className="item-actions">
                        <div className="quantity-control">
                          <button onClick={() => handleQuantityChange(index, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                          <span className="quantity-text">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(index, item.quantity + 1)}>+</button>
                        </div>
                        <button className="cart-button" onClick={() => handleRemoveFromCart(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserve with Advance Order button */}
              <button type="submit" className="reserve-button" onClick={handleReserve}>Reserve with Advance Order</button>
            </>
          )}

        </section>
      </main>

      {popupVisible && (
        <div className="delivery-popup">
          <div className="delivery-popup-content">
            {isAdvanceOrder && cartItems.length === 0 ? "Your cart is empty" : "Please fill out the form"}
            <button onClick={closePopup}>OK</button>
          </div>
        </div>
      )}

      {popupVisibleLogin && (
              <div className="delivery-popup">
                <div className="delivery-popup-content">
                  Login First
                  <button onClick={closeToLogin}>Ok</button>
                  <button onClick={closeToHome}>Cancel</button>
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
                  {cartItems.map((item, index) => (
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
            {/* <div className="receipt-footer">
              <button className="confirm-btn" onClick={handleConfirmOrder}>
                Confirm
              </button>
              <button className="close-btn" onClick={closeConfirmationPopup}>
                Close
              </button>
            </div> */}
          </div>
        </div>
      )}
    </div>

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
