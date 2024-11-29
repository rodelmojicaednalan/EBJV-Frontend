// Loader.js
import React, { useEffect, useState } from 'react';
import './Loader.css'; // Import the CSS for loader styles

const Loader = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '')); // Cycle dots
    }, 500); // Adjust the interval timing as needed

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <div className="loader">
    <div className="spinner"></div>
</div>

  );
};

export default Loader;
