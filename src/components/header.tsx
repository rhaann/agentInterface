"use client";

import React, { useState } from 'react';
import { Tabs, Tab } from './tabs'; // Assuming you'll create these components or use a UI library



export default function Header () {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  return (
    <header className="bg-gray-200 p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        
        <nav>
          <Tabs activeTab={activeTab} onChange={handleTabChange}>
            <Tab label="Home" />
            <Tab label="About" />
            <Tab label="Contact" />
          </Tabs>
        </nav>
      </div>
    </header>
  );
};