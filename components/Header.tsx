
import React from 'react';

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="no-print bg-white p-4 flex justify-between items-center border-b border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      <div>
        {children}
      </div>
    </div>
  );
};

export default Header;