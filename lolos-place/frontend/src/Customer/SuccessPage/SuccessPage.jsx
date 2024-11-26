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
      <section>
      <div class="custom-shape-divider-top-1732602286">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
    <div className="success-page">
      <section className="success-section">
        <h1>Success!</h1>
        <p>Payment Success</p>
      </section>
    </div>
    <div class="custom-shape-divider-bottom-1732602707">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
    </section>
    </MainLayout>
  );
};


export default SuccessPage;
