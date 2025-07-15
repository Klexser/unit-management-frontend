// unit-management-app/src/components/Header.js
import React from 'react';

function Header() {
  return (
    <header className="bg-black text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-orange-400 mb-2 sm:mb-0">
          WG Clark Construction
        </h1>
        <div className="flex flex-col items-center sm:items-end">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-200">
            Unit Management System
          </h2>
          <p className="text-xs text-gray-400 mt-1">Made by Kian S</p>
        </div>
      </div>
    </header>
  );
}

export default Header;