import { useState, useEffect } from 'react';

function usePersistState(key, initialValue) {
    const [state, setState] = useState(() => {
        // Attempt to get the item from local storage
        const storedValue = localStorage.getItem(key);
        
        // Parse only if storedValue is defined, otherwise use initialValue
        try {
            return storedValue !== null ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.error("Error parsing JSON from local storage", error);
            return initialValue;
        }
    });

    useEffect(() => {
        // Save the state as a JSON string whenever it changes
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}

export default usePersistState;
