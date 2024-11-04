import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png'; // Assuming the logo is in your assets folder
import styles from './DeliveryAndReservation.module.css'; // Updated to use CSS Module
import MainLayout from '../../components/MainLayout';

const DeliveryAndReservation = () => {
  return (
    <MainLayout>
      <main className={styles.mainContainer}> {/* Added new class for responsive fix */}
        {/* Order Options Section */}
        <section className={styles.orderOptions}>
          <h2>Order Now</h2>
          <p>Choose your order type:</p>
          <div className={styles.orderOptionsButtons}>
            <button>
              <Link to="/delivery">Delivery</Link>
            </button>
            <button>
              <Link to="/reservation">Reservation</Link>
            </button>
          </div>
        </section>
      </main>
    </MainLayout>
  );
};

export default DeliveryAndReservation;
