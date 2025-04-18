"use client";

import React from 'react';

interface TabsProps {
  activeTab: number;
  onChange: (index: number) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChange, children }) => {
  // Convert children to array to work with them
  const tabArray = React.Children.toArray(children);
  
  return (
    <div className="tabs-container">
      <div className="tabs-header flex border-b border-gray-200">
        {React.Children.map(children, (child, index) => {
          // Check if the child is a valid Tab component
          if (React.isValidElement(child)) {
            return (
              <div 
                className={`tab-header px-6 py-3 cursor-pointer transition-all relative ${
                  activeTab === index 
                    ? 'text-black font-medium' 
                    : 'text-gray-900 hover:text-gray-800'
                }`}
                onClick={() => onChange(index)}
              >
                {child.props.label}
                {activeTab === index && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-500"></div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="tab-content p-4">
        {tabArray[activeTab]}
      </div>
    </div>
  );
};

interface TabProps {
  label: string;
  children?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  // This component is mostly a wrapper for content
  // The actual tab rendering is handled by the Tabs component
  return <div className="tab-panel">{children}</div>;
}; 