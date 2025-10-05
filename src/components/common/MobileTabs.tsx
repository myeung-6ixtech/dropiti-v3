'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Tab {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface MobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'scroll' | 'dropdown' | 'segmented';
  className?: string;
}

export default function MobileTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'scroll',
  className = ''
}: MobileTabsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Auto-detect best variant based on tab count
  const detectedVariant = tabs.length <= 3 ? 'segmented' : tabs.length <= 4 ? 'scroll' : 'dropdown';
  const finalVariant = variant === 'scroll' ? detectedVariant : variant;

  // Check scroll position for arrows
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || finalVariant !== 'scroll') return;

    const checkScroll = () => {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth);
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    return () => container.removeEventListener('scroll', checkScroll);
  }, [finalVariant, tabs.length]);

  // Scroll to active tab
  useEffect(() => {
    if (finalVariant !== 'scroll') return;
    
    const container = scrollContainerRef.current;
    const activeTabElement = container?.querySelector(`[data-tab-id="${activeTab}"]`);
    
    if (container && activeTabElement) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      const scrollLeft = container.scrollLeft + (tabRect.left - containerRect.left) - (containerRect.width / 2) + (tabRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeTab, finalVariant]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const getActiveTabName = () => {
    return tabs.find(tab => tab.id === activeTab)?.name || '';
  };

  // Segmented Control (2-3 tabs)
  if (finalVariant === 'segmented') {
    return (
      <div className={`mobile-tabs-segmented ${className}`}>
        <div className="mobile-tabs-segmented-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`mobile-tabs-segmented-button ${
                activeTab === tab.id ? 'mobile-tabs-segmented-button-active' : ''
              }`}
            >
              <div className="mobile-tabs-segmented-content">
                {tab.icon && <tab.icon className="h-4 w-4" />}
                <span className="mobile-tabs-segmented-text">{tab.name}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`mobile-tabs-segmented-count ${
                    activeTab === tab.id ? 'mobile-tabs-segmented-count-active' : ''
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal Scroll (4-5 tabs)
  if (finalVariant === 'scroll') {
    return (
      <div className={`mobile-tabs-scroll ${className}`}>
        <div className="mobile-tabs-scroll-container">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="mobile-tabs-scroll-arrow mobile-tabs-scroll-arrow-left"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Scrollable Tabs */}
          <div 
            ref={scrollContainerRef}
            className="mobile-tabs-scroll-content"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`mobile-tabs-scroll-button ${
                  activeTab === tab.id ? 'mobile-tabs-scroll-button-active' : ''
                }`}
              >
                <div className="mobile-tabs-scroll-button-content">
                  {tab.icon && <tab.icon className="h-4 w-4" />}
                  <span className="mobile-tabs-scroll-button-text">{tab.name}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`mobile-tabs-scroll-button-count ${
                      activeTab === tab.id ? 'mobile-tabs-scroll-button-count-active' : ''
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="mobile-tabs-scroll-arrow mobile-tabs-scroll-arrow-right"
              aria-label="Scroll right"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Dropdown (6+ tabs)
  return (
    <div className={`mobile-tabs-dropdown ${className}`}>
      <div className="mobile-tabs-dropdown-container">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="mobile-tabs-dropdown-trigger"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
        >
          <div className="mobile-tabs-dropdown-trigger-content">
            <span className="mobile-tabs-dropdown-trigger-text">{getActiveTabName()}</span>
            <FiChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="mobile-tabs-dropdown-backdrop"
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Dropdown List */}
            <div className="mobile-tabs-dropdown-menu">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`mobile-tabs-dropdown-item ${
                    activeTab === tab.id ? 'mobile-tabs-dropdown-item-active' : ''
                  }`}
                >
                  <div className="mobile-tabs-dropdown-item-content">
                    {tab.icon && <tab.icon className="h-4 w-4" />}
                    <span className="mobile-tabs-dropdown-item-text">{tab.name}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`mobile-tabs-dropdown-item-count ${
                        activeTab === tab.id ? 'mobile-tabs-dropdown-item-count-active' : ''
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
