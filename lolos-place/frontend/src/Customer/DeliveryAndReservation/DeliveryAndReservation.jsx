import React from 'react';
import './DeliveryAndReservation.css'; // Updated stylesheet reference
import MainLayout from '../../components/MainLayout';
import { Link } from 'react-router-dom'; // Ensure you have this import for Link

const DeliveryAndReservation = () => {
  // Placeholder function for handling order type clicks
  const handleOrderType = (type) => {
    console.log(`${type} selected`);
  };

  return (
    <MainLayout>
      <div className="delivery-reservation-page">
        <section className="orderOptions">
          <h2>Order Now</h2>
          <p>Choose your order type:</p>
          <div className="orderOptionsButtons">

          <Link to="/delivery" onClick={() => handleOrderType('Delivery')}>
            <button>Delivery</button>
          </Link>

          <Link to="/reservation" onClick={() => handleOrderType('Reservation')}>
          <button>Reservation</button>
          </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default DeliveryAndReservation;
