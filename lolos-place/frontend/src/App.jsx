import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import necessary components from react-router-dom
import './App.css';
import Menu from './Customer/Menu/Menu';
import LandingPage from './Customer/LandingPage/LandingPage';
import LoginPage from './Customer/Login/Login';
import UserProfile from './Customer/UserProfile/UserProfile';
import AboutPage from './Customer/About/About';
import DeliveryAndReservation from './Customer/DeliveryAndReservation/DeliveryAndReservation';
import Delivery from './Customer/Delivery/Delivery';
import Reservation from './Customer/Reservation/Reservation';
import Feedback from './Customer/Feedback/Feedback'
import { CustomerProvider } from './api/CustomerProvider';
import SuccessPage from './Customer/SuccessPage/SuccessPage';
import OrderHistory from './Customer/OrderHistory/OrderHistory';





function App() {
  return (
    <CustomerProvider>
      <Router> {/* Wrap your app in a Router */}
      <Routes> {/* Define your routes */}
        <Route path="/" element={<LandingPage />} /> {/* Root path for LandingPage */}
        <Route path='/about' element={<AboutPage/>}/>
        <Route path="/menu" element={<Menu />} /> {/* /menu path for Menu */}
        <Route path='/login' element={<LoginPage />}/>
        <Route path='/profile' element={<UserProfile/>}/>
        <Route path='/delivery-and-reservation' element={<DeliveryAndReservation/>}/>
        <Route path='/delivery' element={<Delivery/>}/>
        <Route path='/reservation' element={<Reservation/>}/>
        <Route path='/feedback' element={<Feedback/>}/>
        <Route path='/successpage' element={<SuccessPage/>}/>
        <Route path='/order-history' element={<OrderHistory/>}/>
      </Routes>
    </Router>
    </CustomerProvider>
    
  );
}

export default App;
