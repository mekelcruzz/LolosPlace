import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import './Delivery.css'; // Assuming the styles are in Delivery.css]
import { useCustomer } from '../../api/CustomerProvider';
import MainLayout from '../../components/MainLayout';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import axios from 'axios';



const Delivery = () => {
  const { customer, menuData, cartOrders, setCartOrders } = useCustomer();
  const [popupVisible, setPopupVisible] = useState(false);
  const [confirmationPopupVisible, setConfirmationPopupVisible] = useState(false);
  const [qrCodePopupVisible, setQrCodePopupVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [scrollPos, setScrollPos] = useState(window.scrollY);
  const [formValid, setFormValid] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    address: "", 
    contact: "" 
    });
    const navigate = useNavigate();
    

  
    useEffect(() => {
      if (customer) {
        setFormData({
          name: customer.fullName || '',
          address: customer.address || '',
          contact: customer.phone || ''
        });
      }
    }, [customer]);

    
    const getFilteredMenu = () => {
      if (filter === 'all') {
        return menuData;
      } else {
        return menuData.filter((menuItem) =>
          menuItem.category.toLowerCase() === filter.toLowerCase()
        );
      }
    };

  const validateForm = () => {
    const { name, address, contact } = formData;
    if (name.trim() && address.trim() && contact.trim()) {
      setFormValid(true);
      return true;
    }
    setFormValid(false);
    return false;
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
    const categories = menuData.map(item => item.category);
    return ['all', ...new Set(categories)];
  };

  const handleFilterClick = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const filteredMenu = getFilteredMenu();

  const handleAddToCart = (item) => {
    setCartOrders((prevCartOrders) => {
      const existingItemIndex = prevCartOrders.findIndex(cartItem => cartItem.name === item.name);

      if (existingItemIndex >= 0) {
        const updatedCartOrders = prevCartOrders.map((cartItem, index) => {
          if (index === existingItemIndex) {
            return { ...cartItem, quantity: cartItem.quantity + 1 };
          }
          return cartItem;
        });
        return updatedCartOrders;
      } else {
        return [...prevCartOrders, { ...item, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (index, newQuantity) => {
    const newCartOrders = [...cartOrders];
    if (newQuantity <= 0) return;
    newCartOrders[index].quantity = newQuantity;
    setCartOrders(newCartOrders);
  };

  const handleRemoveFromCart = (index) => {
    const newCartOrders = [...cartOrders];
    newCartOrders.splice(index, 1);
    setCartOrders(newCartOrders);
  };

  const handlePlaceOrder = () => {
    if (!customer || customer === '') {
      setPopupVisible(true);
      window.scrollTo(0, 0);
    } else if (!validateForm()) {
      setPopupVisible(true);
      window.scrollTo(0, 0);
    } else if (cartOrders.length === 0) {
      setPopupVisible(true);
      window.scrollTo(0, 0);
    } else {
      setConfirmationPopupVisible(true)
    }
  };

  const closeToLogin = () => {
    setPopupVisible(false);
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

  const closeToHome = () => {
    setPopupVisible(false);
    const headerElement = document.querySelector('h2');
    if (headerElement) {
      headerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConfirmOrder = async () => {
    const orderDetails = {
      cart: cartOrders.map(item => ({
        menu_id: item.menu_id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        items: item.items,
        img: item.img,
        quantity: item.quantity,
      })),
      userId: customer.id,                
      mop: 'GCash',                    
      totalAmount: getTotalAmount(),
      date: new Date().toISOString().split('T')[0], 
      time: new Date().toTimeString().split(' ')[0], 
      deliveryLocation: formData.address,       
      deliveryStatus: 'Pending',                                 
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderDetails);
  
      if (response.status === 201) {
        const { order, delivery } = response.data;
        console.log('Order and delivery saved:', order, delivery);
  
        setConfirmationPopupVisible(false);
        setQrCodePopupVisible(true); 
      } else {
        console.error('Failed to save order and delivery');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const closeQrCodePopup = () => {
    setQrCodePopupVisible(false);
  };



  const closeConfirmationPopup = () => {
    setConfirmationPopupVisible(false);
  };

  const getTotalAmount = () => {
    return cartOrders.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  const makePaymentGCash = async () => {
    const body = {
        user_id: customer.id,
        lineItems: cartOrders.map(product => ({
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
    <div className="delivery">

      <main>
        <section>
          <h2>Place Your Delivery Order</h2>

          <form noValidate>
            <div className="form-group">
              <label htmlFor="name">Name <span>*</span>:</label>
              <input type="text" id="name" required placeholder="" value={formData.name} onChange={handleInputChange} disabled />
              {!formValid && <small className="error-message">Please fill out this field.</small>}
            </div>
            <div className="form-group">
              <label htmlFor="address">Complete Address <span>*</span>:</label>
              <input type="text" id="address" required placeholder="" value={formData.address} onChange={handleInputChange}disabled />
              {!formValid && <small className="error-message">Please fill out this field.</small>}
            </div>
            <div className="form-group">
              <label htmlFor="contact">Contact Number <span>*</span>:</label>
              <input type="tel" id="contact" required placeholder="" value={formData.contact} onChange={handleInputChange}disabled />
              {!formValid && <small className="error-message">Please fill out this field.</small>}
            </div>
          </form>

          <div className="filler-buttons">
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
              {cartOrders.map((item, index) => (
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

          <button className="submit-btn" onClick={handlePlaceOrder}>Place Order</button>

          {popupVisible && (
            <div className="delivery-popup">
              <div className="delivery-popup-content">
                <p>{formValid && customer ? "Your cart is empty" : "Please Login"}</p>
                <button onClick={closeToLogin}>OK</button>
                <button onClick={closeToHome}>cancel</button>
              </div>
            </div>
          )}
              {confirmationPopupVisible && customer && (
                <div className="confirmation-popup">
                  <div className="popup-content receipt">
                    <h3>Order Confirmation</h3>
                    <div className="receipt-header">
                      <h1>Lolo's Place</h1>
                      <p>Thank you for your order!</p>
                    </div>
                    <div className="receipt-details">
                      <p><strong>Name:</strong> {formData.name}</p>
                      <p><strong>Address:</strong> {formData.address}</p>
                      <p><strong>Contact:</strong> {formData.contact}</p>
                    </div>
                    <h4>Items Ordered:</h4>
                    <ul className="receipt-items">
                      {cartOrders.map((item, index) => (
                        <li key={index}>
                          {item.name} (x{item.quantity}) - ₱{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                    <h4 className="total">Total Amount: ₱{getTotalAmount()}</h4>
                    <div className="receipt-footer">
                      <button className="confirm-btn" onClick={makePaymentGCash}>
                        Confirm
                      </button>
                      <button className="close-btn" onClick={closeConfirmationPopup}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Dialog */}

            {/* QR Code Dialog */}
            <Dialog open={qrCodePopupVisible} onClose={closeQrCodePopup}>
              <DialogTitle>Lolo's Place QR Code</DialogTitle>
              <DialogContent>
                <img src="https://placehold.co/400" alt="qr" />
              </DialogContent>
              <DialogActions>
                <Button onClick={closeQrCodePopup}>Close</Button>
              </DialogActions>
            </Dialog>

        </section>
      </main>
    </div>
    </MainLayout>
  );
};

export default Delivery;
