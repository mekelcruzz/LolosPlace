import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCustomer } from "../../api/CustomerProvider"; // Importing the context
import "./OrderHistory.css"; // Styling for the component
import MainLayout from "../../components/MainLayout";

const OrderHistory = () => {
  const { customer } = useCustomer(); // Access customer data from context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) {
      setError("You need to be logged in to view your order history.");
      setLoading(false);
      return;
    }

    // Fetch Order History
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/order-history?user_id=${customer.id}`
        );

        console.log("Fetched Order History:", response.data); // Log response to debug data

        // Set orders directly from API response
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching order history:", err.message);
        setError("Failed to fetch order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch the data
    fetchOrderHistory();
  }, [customer]);

  // Format date function to display it in a readable format
  const formatDate = (dateString, isDelivery) => {
    const date = new Date(dateString); // Parse the date string into a Date object
    if (isDelivery) {
      date.setDate(date.getDate() ); // Shift date by 1 day if it's a delivery
    }
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-PH', options); // Format the date as 'long' (e.g., "Monday, November 27, 2024")
  };

  // Format time function to display reservation time in a readable format
  const formatTime = (timeString) => {
    // Convert reservation time from "HH:mm:ss" to a valid Date object (consider it as local time)
    const [hours, minutes, seconds] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes, seconds);

    // Format time to 12-hour format with AM/PM
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <MainLayout>
      <div className="order-history-page">
        <h1>{customer?.fullName}'s Order History</h1>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <div className="order-card" key={order.order_id}>
                
                {/* Display Order Date */}
                <p><strong>Date:</strong> {formatDate(order.date, order.delivery)}</p>

                {/* Display Items first */}
                <h3>Items:</h3>
                <ul>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <li key={index}>
                        <p><strong>Item:</strong> {item.menu_name}</p> 
                        <p><strong>Quantity:</strong> {item.order_quantity}</p> {/* Quantity on the next line */}
                      </li>
                    ))
                  ) : (
                    <li>No items available for this order</li>
                  )}
                </ul>

                {/* Display Order Type second */}
                <p>
                  <strong>Order Type:</strong> {order.delivery ? "Delivery" : "Reservation"}
                </p>

                {/* Display Reservation Date and Time for reservation orders */}
                {!order.delivery && order.reservation_date && order.reservation_time && (
                  <>
                    <p><strong>Reservation Date:</strong> {formatDate(order.reservation_date, false)}</p>
                    <p><strong>Reservation Time:</strong> {formatTime(order.reservation_time)}</p>
                  </>
                )}

                {/* Display Total Amount last */}
                <p>
                  <strong>Total Amount:</strong> ₱
                  {typeof order.total_amount === "number"
                    ? order.total_amount.toFixed(2)
                    : "Invalid Amount"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrderHistory;
