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
      <section>
      <div class="custom-shape-divider-top-1732551728">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
    <div className="delivery">
        <section>
          
          <h2>Place Your Delivery Order</h2>

          <form noValidate>
            <div className="form-group">
              <label htmlFor="name">Name <span>*</span>:</label>
              <input type="text" id="name" required placeholder="Login to autofill" value={formData.name} onChange={handleInputChange} disabled />
            </div>

            <div className="form-group">
              <label htmlFor="address">Complete Address <span>*</span>:</label>
              <input type="text" id="address" required placeholder="Login to autofill" value={formData.address} onChange={handleInputChange}disabled />
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Number <span>*</span>:</label>
              <input type="tel" id="contact" required placeholder="Login to autofill" value={formData.contact} onChange={handleInputChange}disabled />
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
      <div className="delivery-popup-buttons">
        <button onClick={closeToLogin}>Okay</button>
        <button onClick={closeToHome}>Cancel</button>
      </div>
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
                        Confir
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
            <div className='white'></div>

        </section>
    </div>
    <div class="custom-shape-divider-bottom-1732551681">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
    </section>
    </MainLayout>
  );
};

export default Delivery;
