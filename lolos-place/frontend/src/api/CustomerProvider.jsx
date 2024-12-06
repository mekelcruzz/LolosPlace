// src/api/CustomerProvider.js
import { createContext, useContext, useState, useEffect } from 'react';
import usePersistState from '../Hooks/usePersistState';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
    const [customer, setCustomer] = usePersistState("user", null); // Initialize as null
    const [menuData, setMenuData] = useState([]); // State to store menu items
    const [categories, setCategories] = useState([]);
    const [cartReservations, setCartReservations] = usePersistState("reservation", []);
    const [cartOrders, setCartOrders] = usePersistState("orders", []);
    const [isAdvanceOrder, setIsAdvanceOrder] = usePersistState("order", false);
    const [formData, setFormData] = usePersistState("formdata", {
        name: customer?.fullName || '',
        contact: customer?.phone || '',
        date: '',
        time: '',
        guests: '',
    });

    const initialFormData = {
        name: customer?.fullName || '',
        contact: customer?.phone || '',
        date: '',
        time: '',
        guests: '',
    };

    // Fetch menu data when the provider is initialized
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/menu'); // Adjust API URL as needed
                const data = await response.json();
                setMenuData(data);

                // Extract unique categories
                const uniqueCategories = [...new Set(data.map(item => item.category))];
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching menu data:', error);
            }
        };

        // Only fetch menu data if it's not already loaded
        if (menuData.length === 0) {
            fetchMenuData();
        }
    }, [menuData]); // Depend on menuData to prevent redundant fetches

    return (
        <CustomerContext.Provider
            value={{
                customer,
                setCustomer,
                menuData,
                setMenuData,
                categories,
                setCategories,
                cartReservations,
                setCartReservations,
                cartOrders,
                setCartOrders,
                isAdvanceOrder,
                setIsAdvanceOrder,
                formData,
                setFormData,
                initialFormData,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    return useContext(CustomerContext);
}
