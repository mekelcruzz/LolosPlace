import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import MainLayout from '../../components/MainLayout';
import { useCustomer } from '../../api/CustomerProvider';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';


const UserProfile = () => {
  const {customer, setCustomer} = useCustomer();
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const navigate = useNavigate();


  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserInfo({
      ...userInfo,
      [id]: value
    });
  };

  const handleSaveChanges = () => {
    alert('Changes saved successfully!');
  };

  const handleSavePassword = async () => {
    console.log(userInfo);
    const { oldPassword, newPassword, confirmNewPassword } = userInfo;
    const id = customer.id;
    const errors = [];
    

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        alert("All fields required!");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert("New and confirm password do not match.");
        return;
    }

    if (errors.length > 0) {
        console.error(errors);
        return;
    }

    try {
        const response = await axios.post('http://localhost:5000/api/changeCustomerPassword', {
          id, 
          oldPassword, 
          newPassword, 
          confirmNewPassword
        });

        if (response.status === 200) {
            alert('Password changed successfully!')
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Display the message from the backend
            alert(error.response.data.message);
        } else {
            console.error('Error changing password:', error);
            alert('An error occurred while changing the password.');
        }
    }
};

const handleSaveDetails = async () => {
  console.log(userInfo);
  const { email, phone, address } = userInfo;
  const id = customer.id;
  const errors = [];
  

  if (!email || !phone || !address) {
      alert("All fields required!");
      return;
  }

  if (errors.length > 0) {
      console.error(errors);
      return;
  }

  try {
      const response = await axios.post('http://localhost:5000/api/changeCustomerDetails', {
        id, 
        email, 
        phone, 
        address,
      });

      if (response.status === 200) {
          alert('Details changed successfully!')
      }
  } catch (error) {
      if (error.response && error.response.status === 401) {
          // Display the message from the backend
          alert(error.response.data.message);
      } else {
          console.error('Error changing details:', error);
          alert('An error occurred while changing the details.');
      }
  }
};

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (customer) {
      setUserInfo({
        fullName: customer.fullName || '',
        email: customer.email || '',
        address: customer.address || '',
        phone: customer.phone || '',
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    }
  }, [customer]);

  const handleLogout = () => {
    setCustomer(null); // Clear customer on logout
    navigate('/login')
  };

  return (
    <MainLayout>
      <div className="profile-page">
        <div className="container">
          <div className="sidebar">
            <h2>Account Management</h2>
            <ul>
              <li><button onClick={() => scrollToSection('account-name')}>Account Name</button></li>
              <li><button onClick={() => scrollToSection('personal-info')}>Personal Information</button></li>
              <li><button onClick={() => scrollToSection('change-password')}>Change Password</button></li>
            </ul>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>

          <div className="main-content">
            <div className="section" id="account-name">
              <h3>Full Name</h3>
              <div className="form-group">
                <label htmlFor="firstName">Full Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  value={userInfo.fullName} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="section" id="personal-info">
              <h3>Personal Information</h3>
              <p>This information is used to personalize your account.</p>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={userInfo.email} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="text" 
                  id="phone" 
                  value={userInfo.phone} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input 
                  type="text" 
                  id="address" 
                  value={userInfo.address} 
                  onChange={handleChange} 
                />
              </div>




              <button className="btn" onClick={handleSaveDetails}>Save and Verify</button>
            </div>

            <div className="section" id="change-password">
              <h3>Change Password</h3>
              <div className="form-group">
                <label htmlFor="oldPassword">Old Password</label>
                <input 
                  type="password" 
                  id="oldPassword" 
                  value={userInfo.oldPassword}
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  value={userInfo.newPassword}
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmNewPassword" 
                  value={userInfo.confirmNewPassword}
                  onChange={handleChange} 
                />
              </div>
              <button className="btn" onClick={handleSavePassword}>Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
