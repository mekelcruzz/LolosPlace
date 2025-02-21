const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const PAYMONGO_SECRET_KEY = 'sk_test_Uarb4zRpXZb9PXmTHeK1ZTEp';
const axios = require('axios');
const formatTimeTo12Hour = (time) => {
  const [hour, minute] = time.split(':');
  const parsedHour = parseInt(hour, 10);
  const suffix = parsedHour >= 12 ? 'PM' : 'AM';
  const twelveHour = parsedHour % 12 || 12;
  return `${twelveHour}:${minute} ${suffix}`;
};

// kangkongchips

const app = express();
app.use(cors());
app.use(express.json());

// Set up PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lolos-place',
  password: '123',
  port: 5432,
});

// Test route

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Fetch the user from the users table by email or phone
    const checkIdentifier = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [identifier, identifier]
    );
    const user = checkIdentifier.rows[0];

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Concatenate first name and last name using template literals
    const fullName = `${user.first_name} ${user.last_name}`;


    // Retrieve complete address and contact number
    const address = user.address;
    const phone = user.phone;
    const email = user.email
    const id = user.user_id


    // Create the result object
    const userResult = {
      fullName: fullName,
      address: address,
      phone: phone,
      email: email,
      id: id,
    };

    // If password is valid, respond with success and full user information
    return res.status(200).json({
      message: 'Login Successful',
      data: userResult,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

async function getTotalGuestsForDate(date) {
  const client = await pool.connect();
  try {
    const query = `SELECT COALESCE(SUM(guest_number), 0) AS total FROM reservations WHERE reservation_date = $1`;
    const result = await client.query(query, [date]);
    return result.rows[0].total;
  } catch (err) {
    console.error("Error fetching total guests:", err);
    return 0; // Default to 0 if there's an error
  } finally {
    client.release();
  }
}

app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, address, email, phone, password } = req.body;
  
    try {
      // Check if user already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = await pool.query(
        'INSERT INTO users (first_name, last_name, address, email, phone, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [firstName, lastName, address, email, phone, hashedPassword]
      );
  
      const user = newUser.rows[0];
  
      // Respond with the new user details (omit password)
      res.status(201).json({
        user: { id: user.user_id, firstName: user.first_name, lastName: user.last_name, email: user.email },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: 'mekelcruzz@gmail.com', // Your email
    pass: 'qpjn xxky mcrq qcop', // Your email password or app-specific password
  },
});

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in-memory storage)
const otpStorage = {};

// Endpoint to send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = generateOTP();
  otpStorage[email] = otp; // Store OTP in memory

  const mailOptions = {
    from: 'mekelcruzz@gmail.com',
    to: email,
    subject: 'Your OTP for Signup',
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Endpoint to verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  if (otpStorage[email] === otp) {
    delete otpStorage[email]; // Clear OTP after successful verification
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

app.post('/api/changeCustomerPassword', async (req, res) => {
    const { id, oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!id || !oldPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'New and confirm password do not match.' });
    }

    try {
        // Fetch the current password hash from the database
        const result = await pool.query(
            'SELECT password FROM users WHERE user_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        const user = result.rows[0];

        // Compare old password with the stored hash
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect.' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

        // Update the password in the database
        await pool.query(
            'UPDATE users SET password = $1 WHERE user_id = $2',
            [hashedNewPassword, id]
        );

        res.status(200).json({ message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
});

app.post('/api/changeCustomerDetails', async (req, res) => {
  const { id, email, phone, address } = req.body;

  // Validate input
  if (!id || !email || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
      // Fetch the current password hash from the database
      const result = await pool.query(
          'SELECT * FROM users WHERE user_id = $1',
          [id]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Customer not found.' });
      }else {
        await pool.query(
          'UPDATE users SET email = $1, phone = $2, address = $3 WHERE user_id = $4',
          [email, phone, address, id]
      );
      res.status(200).json({ message: 'Changed successfully!' });
      }

  } catch (error) {
      console.error('Error changing details:', error);
      res.status(500).json({ message: 'Error changing details', error: error.message });
  }
});

  
  app.get('/api/menu', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM menu_items');
      res.json(result.rows); // Send the rows as JSON
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // API endpoint to save the order
app.post('/api/web-orders', async (req, res) => {
  const { name, address, contact, totalAmount, items } = req.body;

  try {
    const query = `
      INSERT INTO orders (name, address, contact, total_amount, order_items)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [name, address, contact, totalAmount, JSON.stringify(items)];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect(); // Get a client from the pool
  try {
    await client.query('BEGIN'); // Start a transaction

    const { cart, userId, mop, totalAmount, date, time, deliveryLocation, deliveryStatus } = req.body;
    
    // Check if user provided date and time
    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    // Update payment status
    const paymentResult = await pool.query(
      'UPDATE payment SET payment_status = $1 WHERE user_id = $2', 
      ['paid', userId]
    );
    if (paymentResult.rowCount === 0) {
      return res.status(400).json({ message: 'No payment found for the customer' });
    }

    // Insert order with user-provided date and time
    const orderQuery = `
      INSERT INTO orders (user_id, mop, total_amount, date, time, delivery)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING order_id;
    `;
    const orderValues = [userId, mop, totalAmount, date, time, true];
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].order_id;

    // Insert ordered items
    for (let item of cart) {
      await client.query(
        'INSERT INTO order_quantities (order_id, menu_id, order_quantity) VALUES ($1, $2, $3)',
        [orderId, item.menu_id, item.quantity]
      );
    }

    // Insert delivery details if applicable
    const deliveryQuery = `
      INSERT INTO deliveries (order_id, delivery_location, delivery_status)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const deliveryValues = [orderId, deliveryLocation, deliveryStatus];
    const deliveryResult = await client.query(deliveryQuery, deliveryValues);

    await client.query('COMMIT'); // Commit transaction

    res.status(201).json({
      order: orderResult.rows[0],
      delivery: deliveryResult.rows[0],
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release(); // Release the database connection
  }
});



app.post('/api/reservations', async (req, res) => {
  const { guestNumber, reservationDate } = req.body;
  const totalGuests = await getTotalGuestsForDate(reservationDate);
  const availableSlots = 100 - totalGuests;

  if (guestNumber > availableSlots) {
    return res.status(400).json({ error: `Only ${availableSlots} slots are available.` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { guestNumber, userId, reservationDate, reservationTime, advanceOrder, totalAmount, cart } = req.body;

    // Optional: Check if payment exists, but don't enforce it
    const paymentResult = await pool.query('SELECT * FROM payment WHERE user_id = $1', [userId]);
    if (paymentResult.rows.length > 0) {
      await pool.query('UPDATE payment SET payment_status = $1 WHERE user_id = $2', ['paid', userId]);
    }

    const reservationQuery = `
      INSERT INTO reservations (user_id, guest_number, reservation_date, reservation_time, advance_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING reservation_id;
    `;
    const reservationValues = [userId, guestNumber, reservationDate, reservationTime, advanceOrder];
    const reservationResult = await client.query(reservationQuery, reservationValues);
    const reservationId = reservationResult.rows[0].reservation_id;

    const orderQuery = `
      INSERT INTO orders (user_id, mop, total_amount, date, time, delivery, reservation_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING order_id;
    `;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    const orderValues = [userId, 'GCash', totalAmount, currentDate, currentTime, false, reservationId];
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].order_id;

    for (let item of cart) {
      const orderQuantityQuery = `
        INSERT INTO order_quantities (order_id, menu_id, order_quantity)
        VALUES ($1, $2, $3);
      `;
      await client.query(orderQuantityQuery, [orderId, item.menu_id, item.quantity]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      reservation: {
        id: reservationId,
        userId,
        guestNumber,
        reservationDate,
        reservationTime,
        advanceOrder,
      },
      order: {
        id: orderId,
        userId,
        totalAmount,
        date: currentDate,
        time: currentTime,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});


app.post('/api/feedback', async (req, res) => {
  const { name, ratings, comment, compound_score } = req.body;

  // Insert feedback data into the database
  try {
    const query = `
      INSERT INTO feedback (name, ratings, comment, date, compound_score)
      VALUES ($1, $2, $3, NOW(), $4)
    `;
    const values = [name, JSON.stringify(ratings), comment, compound_score];
    const result = await pool.query(query, values);

    res.status(200).json({ message: 'Feedback successfully submitted!' });
  } catch (err) {
    console.error('Error inserting feedback:', err);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

const generateRandomId = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
  }
  return result;
};

app.post('/api/create-gcash-checkout-session', async (req, res) => {
  const { user_id, lineItems } = req.body;

  const formattedLineItems = lineItems.map((product) => {
      return {
          currency: 'PHP',
          amount: Math.round(product.price * 100), 
          name: product.name,
          quantity: product.quantity,
      };
  });

  const randomId = generateRandomId(28)

  try {
      const response = await axios.post(
          'https://api.paymongo.com/v1/checkout_sessions',
          {
              data: {
                  attributes: {
                      send_email_receipt: false,
                      show_line_items: true,
                      line_items: formattedLineItems, 
                      payment_method_types: ['gcash'],
                      success_url: `http://localhost:5173/successpage?session_id=${randomId}`,
                      cancel_url: 'http://localhost:5173/',
                  },
              },
          },
          {
              headers: {
                  accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`, 
              },
          }
      );

      const checkoutUrl = response.data.data.attributes.checkout_url;

      if (!checkoutUrl) {
          return res.status(500).json({ error: 'Checkout URL not found in response' });
      }

      const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // UPSERT query
            const query = `
                INSERT INTO payment (user_id, session_id, payment_status)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    session_id = EXCLUDED.session_id,
                    payment_status = EXCLUDED.payment_status;
            `;
            const values = [user_id, randomId, 'pending'];

            await client.query(query, values);
            await client.query('COMMIT'); // Commit the transaction
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback in case of error
            console.error('Error inserting/updating payment:', error.message);
            return res.status(500).json({ error: 'Failed to insert/update payment', details: error.message });
        } finally {
            client.release(); // Release the connection back to the pool
        }

      res.status(200).json({ url: checkoutUrl });
  } catch (error) {
      console.error('Error creating checkout session:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to create checkout session', details: error.response ? error.response.data : error.message });
  }
});


app.get('/api/check-payment-status/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
      const client = await pool.connect();
      const query = 'SELECT session_id, payment_status FROM payment WHERE user_id = $1';
      const result = await client.query(query, [user_id]);

      if (result.rows.length > 0) {
          const { session_id, payment_status } = result.rows[0];
          res.status(200).json({ session_id, payment_status });
      } else {
          res.status(200).json({ exists: false });
      }

      client.release();
  } catch (error) {
      console.error('Error checking payment status:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});


//checkpoint
app.get('/api/order-history', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Fetch orders with reservation details
    const result = await pool.query(
      `
      SELECT o.order_id, o.user_id, o.mop, o.total_amount, o.date, o.time, o.delivery, o.reservation_id,
             r.reservation_date, r.reservation_time
      FROM orders o
      LEFT JOIN reservations r ON o.reservation_id = r.reservation_id
      WHERE o.user_id = $1
      ORDER BY o.date DESC;
      `,
      [user_id]
    );

    // Fetch the items for each order
    const orderIds = result.rows.map(order => order.order_id);
    const itemsResult = await pool.query(
      `
      SELECT oq.order_id, oq.menu_id, oq.order_quantity, mi.name as menu_name
      FROM order_quantities oq
      JOIN menu_items mi ON oq.menu_id = mi.menu_id
      WHERE oq.order_id = ANY($1);
      `,
      [orderIds]
    );

    // Group the order items and combine with the orders
    const groupedOrders = result.rows.map(order => {
      const orderItems = itemsResult.rows.filter(item => item.order_id === order.order_id);

      return {
        order_id: order.order_id,
        date: order.date,
        time: formatTimeTo12Hour(order.time),
        total_amount: parseFloat(order.total_amount),
        mop: order.mop,
        order_type: order.delivery ? "Delivery" : order.reservation_id ? "Reservation" : "Unknown", // ✅ Order Type Logic
        reservation_date: order.reservation_date,
        reservation_time: order.reservation_time ? formatTimeTo12Hour(order.reservation_time) : null,
        items: orderItems || [], // ✅ No need for two columns, just return items as an array
      };
    });

    res.json(groupedOrders);
  } catch (error) {
    console.error("Error fetching order history:", error.message);
    res.status(500).json({ error: 'Failed to fetch order history. Please try again later.' });
  }
});


app.get('/api/top-best-sellers', async (req, res) => {
  try {
    // Query to fetch the top 3 best-selling products
    const result = await pool.query(
      `
      SELECT 
        product_name,
        SUM(quantity_sold) AS total_sold,
        SUM(amount) AS total_revenue
      FROM sales_data
      GROUP BY product_name
      ORDER BY total_sold DESC
      LIMIT 3;
      `
    );

    // Send the result as JSON
    res.status(200).json({
      message: 'Top 3 best-selling products retrieved successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching best-sellers:', error.message);
    res.status(500).json({ message: 'Server error while fetching best sellers' });
  }
});

// Example backend route (Node.js/Express)
app.get('/api/total-guests/:date', async (req, res) => {
  const { date } = req.params;
  try {
    const result = await pool.query('SELECT total_guests FROM total_guest WHERE reservation_date = $1', [date]);
    if (result.rows.length > 0) {
      res.json({ totalGuests: result.rows[0].total_guests });
    } else {
      res.json({ totalGuests: 0 }); // No reservations for this date
    }
  } catch (error) {
    console.error('Error fetching total guests:', error);
    res.status(500).json({ error: 'Failed to fetch total guests' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));