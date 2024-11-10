import React, { useEffect, useRef } from "react";
import './SuccessPage.css'
import MainLayout from '../../components/MainLayout';
import { useCustomer } from '../../api/CustomerProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";



const SuccessPage = () => {
  const { customer, cartReservations, setCartReservations, cartOrders, setCartOrders, isAdvanceOrder, formData, setIsAdvanceOrder, initialFormData, setFormData } = useCustomer();
  const urlLocation = useLocation();
  const queryParams = new URLSearchParams(urlLocation.search);
  const sessionId = queryParams.get('session_id');
  const navigate = useNavigate();
  const hasCalledPayment = useRef(false);

  const getTotalAmountOrders = () => {
    return cartOrders.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const getTotalAmountReservation = () => {
    return cartReservations.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleConfirmOrder = async () => {
    if (hasCalledPayment.current) return; 
    hasCalledPayment.current = true;
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
      totalAmount: getTotalAmountOrders(),
      date: new Date().toISOString().split('T')[0], 
      time: new Date().toTimeString().split(' ')[0], 
      deliveryLocation: customer.address,       
      deliveryStatus: 'Pending',                                 
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderDetails);
  
      if (response.status === 201) {
        setCartOrders([]);
      } else {
        console.error('Failed to save order and delivery');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleReservation = async () => {
    if (hasCalledPayment.current) return; 
    hasCalledPayment.current = true;
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
        totalAmount: getTotalAmountReservation(),  // Total amount of the order
    };


    try {
        const response = await axios.post('http://localhost:5000/api/reservations', orderDetails);

        if (response.status === 201) {
            setCartReservations([]);
            setIsAdvanceOrder(false);
            setFormData(initialFormData);
        } else {
            console.error('Failed to save reservation and order');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

  useEffect(() => {
    const fetchPaymentStatus = async () => {
        const user_id = customer.id;
        try {
            const response = await axios.get(`http://localhost:5000/api/check-payment-status/${user_id}`);
            if (sessionId === response.data.session_id && response.data.payment_status === 'pending') {
              if (isAdvanceOrder) {
                console.log(isAdvanceOrder);
                handleReservation();
              } else {
                handleConfirmOrder();
                console.log(isAdvanceOrder);
              } // Call to confirm payment
            } else {
                navigate('/'); // Navigate if payment does not exist or is not pending
            }
        } catch (error) {
            console.error('Error checking payment status:', error.message);
            navigate('/'); // Navigate on error
        }
    };

    fetchPaymentStatus(); 
}, []);
  

  return (
    <MainLayout>
    <div className="success-page">
      <section className="success-section">
        <h1>Success!</h1>
        <p>Payment Success</p>
      </section>
    </div>
    </MainLayout>
  );
};


export default SuccessPage;
