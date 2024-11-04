// src/api/CustomerProvider.js
import { createContext, useContext, useState } from 'react';
import usePersistState from '../Hooks/usePersistState';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
    const [customer, setCustomer] = usePersistState("user", null); // Initialize as null
    const [menuData, setMenuData] = useState([]); // State to store menu items
    const [categories, setCategories] = useState([]);
    const [cartItems, setCartItems] = usePersistState("cart", []);
    const [isAdvanceOrder, setIsAdvanceOrder] = usePersistState("order",false);
    const [formData, setFormData] = usePersistState("formdata",{
        name: customer?.fullName || '',
        contact: customer?.phone || '',
        date: '',
        time: '',
        guests: '',
      });

    return (
        <CustomerContext.Provider value={{ customer, setCustomer, menuData, setMenuData, categories, setCategories, cartItems, setCartItems, isAdvanceOrder, setIsAdvanceOrder, formData, setFormData }}>
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    return useContext(CustomerContext);
}
