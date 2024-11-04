const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const PAYMONGO_SECRET_KEY = 'sk_test_Uarb4zRpXZb9PXmTHeK1ZTEp';
const axios = require('axios');

// Your existing code here

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
    // Start a transaction
    await client.query('BEGIN');

    // Destructure order and delivery details from request body
    const { cart, userId, mop, totalAmount, date, time, deliveryLocation, deliveryStatus } = req.body;
    const paymentResult = await pool.query('UPDATE payment SET payment_status = $1 WHERE user_id = $2', ['paid', userId])
    if (paymentResult.rowCount === 0) {
      return res.status(400).json({ message: 'No payment found for the customer' });
  }
    // Insert order into orders table
    const orderQuery = `
      INSERT INTO orders (user_id, mop, total_amount, date, time, delivery)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING order_id;
    `;
    const orderValues = [userId, mop, totalAmount, date, time, true]; // Assuming 'delivery' is true
    const orderResult = await client.query(orderQuery, orderValues);

    // Retrieve the generated order_id
    const orderId = orderResult.rows[0].order_id;

    // Insert order quantities into order_quantities table (from cart)
    for (let item of cart) {
      await client.query(
        'INSERT INTO order_quantities (order_id, menu_id, order_quantity) VALUES ($1, $2, $3)',
        [orderId, item.menu_id, item.quantity]
      );
    }

    // Insert delivery details into deliveries table
    const deliveryQuery = `
      INSERT INTO deliveries (order_id, delivery_location, delivery_status)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const deliveryValues = [orderId, deliveryLocation, deliveryStatus];
    const deliveryResult = await client.query(deliveryQuery, deliveryValues);

    // Commit the transaction
    await client.query('COMMIT');

    // Return the new order and delivery details
    res.status(201).json({
      order: orderResult.rows[0],
      delivery: deliveryResult.rows[0]
    });
  } catch (err) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    // Release the client back to the pool
    client.release();
  }
});



app.post('/api/reservations', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Destructure reservation details from request body
    const { guestNumber, userId, reservationDate, reservationTime, advanceOrder, totalAmount, cart } = req.body;
    console.log(req.body);
    const paymentResult = await pool.query('UPDATE payment SET payment_status = $1 WHERE user_id = $2', ['paid', userId])
    if (paymentResult.rowCount === 0) {
      return res.status(400).json({ message: 'No payment found for the customer' });
  }

    // Insert reservation into reservations table
    const reservationQuery = `
      INSERT INTO reservations (user_id, guest_number, reservation_date, reservation_time, advance_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING reservation_id;
    `;
    const reservationValues = [userId, guestNumber, reservationDate, reservationTime, advanceOrder];
    const reservationResult = await client.query(reservationQuery, reservationValues);
    const reservationId = reservationResult.rows[0].reservation_id;

    // Insert order associated with the reservation
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

    // Insert each item from the cart into order_quantities table
    for (let item of cart) {
      const orderQuantityQuery = `
        INSERT INTO order_quantities (order_id, menu_id, order_quantity)
        VALUES ($1, $2, $3);
      `;
      await client.query(orderQuantityQuery, [orderId, item.menu_id, item.quantity]);
    }

    // Commit the transaction
    await client.query('COMMIT');

    // Return reservation and order details
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
  const { name, comment } = req.body;

  if (!name || !comment) {
      return res.status(400).json({ message: 'Name and comment are required.' });
  }

  try {
      const result = await pool.query(
          'INSERT INTO feedback (name, comment, date) VALUES ($1, $2, NOW()) RETURNING *',
          [name, comment]
      );
      res.status(201).json({ message: 'Feedback submitted successfully!', feedback: result.rows[0] });
  } catch (error) {
      console.error('Error saving feedback:', error);
      res.status(500).json({ message: 'Server error while submitting feedback', error: error.message });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));