"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SideBar() {
  const [activeSection, setActiveSection] = useState('distribution');

  const navItems = [
    { id: 'distribution', label: 'DISTRIBUTION' },
    { id: 'wholefoods', label: 'WHOLEFOODS' },
    // Add more navigation items as needed
  ];

  return (
    <div className="bg-gray-800 text-white h-screen w-48 flex flex-col">
      {/* Logo at the top */}
      <div className="p-4 border-b border-gray-700 flex justify-center">
        <div className="relative w-24 h-24">
          {/* Using logo.png from public folder */}
          <Image 
            src="/logo.png" 
            alt="Walker Brothers Logo"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-grow">
        {navItems.map((item) => (
          <Link 
            href={`/${item.id}`} 
            key={item.id}
            className={`block py-3 px-4 ${
              activeSection === item.id 
                ? 'bg-gray-700' 
                : 'hover:bg-gray-700'
            }`}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer with company logo */}
      <div className="p-4 border-t border-gray-700 flex justify-center items-center">
        <div className="text-xs text-gray-400">
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={24} 
              height={16} 
              className="mr-1"
            />
            <span>ACTUAL INSIGHT</span>
          </div>
          <div className="text-center mt-1">SOLUTIONS</div>
        </div>
      </div>
    </div>
  );
}