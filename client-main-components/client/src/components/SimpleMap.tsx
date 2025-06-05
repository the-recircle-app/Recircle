import React, { useRef, useEffect, useState } from 'react';
import { geolocation } from '../lib/geolocation';

interface SimpleMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  readonly?: boolean;
  height?: string;
}

// This is our mock data to make the map look more realistic
const MAJOR_STREETS = [
  { name: "Main Avenue", orientation: "horizontal", position: 0.3 },
  { name: "Oak Street", orientation: "horizontal", position: 0.6 },
  { name: "Pine Boulevard", orientation: "horizontal", position: 0.15 },
  { name: "Maple Drive", orientation: "horizontal", position: 0.45 },
  { name: "Cedar Lane", orientation: "horizontal", position: 0.75 },
  { name: "Market Street", orientation: "vertical", position: 0.25 },
  { name: "Broadway", orientation: "vertical", position: 0.75 },
  { name: "1st Avenue", orientation: "vertical", position: 0.1 },
  { name: "3rd Avenue", orientation: "vertical", position: 0.4 },
  { name: "5th Avenue", orientation: "vertical", position: 0.6 },
  { name: "7th Avenue", orientation: "vertical", position: 0.9 },
];

const LANDMARKS = [
  { name: "City Park", type: "park", x: 0.65, y: 0.25, size: 0.15 },
  { name: "Central Mall", type: "mall", x: 0.3, y: 0.35, size: 0.1 },
  { name: "Memorial Hospital", type: "hospital", x: 0.2, y: 0.7, size: 0.08 },
  { name: "Community Center", type: "community", x: 0.85, y: 0.5, size: 0.06 },
  { name: "Grand Theater", type: "entertainment", x: 0.45, y: 0.55, size: 0.05 },
  { name: "Public Library", type: "education", x: 0.7, y: 0.8, size: 0.07 },
];

const NEIGHBORHOODS = [
  { name: "Downtown", x: 0.25, y: 0.3 },
  { name: "Westside", x: 0.75, y: 0.2 },
  { name: "East End", x: 0.15, y: 0.8 },
  { name: "Northridge", x: 0.6, y: 0.65 },
];

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  latitude, 
  longitude, 
  onLocationChange,
  readonly = false,
  height = "160px"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Initialize the map when the component mounts
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const mapContainer = mapContainerRef.current;
    
    // Clear any previous content
    mapContainer.innerHTML = '';
    
    // Create the grid/map background
    mapContainer.style.position = 'relative';
    mapContainer.style.backgroundColor = '#f2f5f8'; // map background color
    mapContainer.style.borderRadius = '0.375rem'; // rounded corners
    mapContainer.style.overflow = 'hidden';
    mapContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
    mapContainer.style.height = height;
    
    // Create a more realistic map-like appearance with better streets
    
    // Create map background with grid
    const mapBackground = document.createElement('div');
    mapBackground.style.position = 'absolute';
    mapBackground.style.inset = '0';
    mapBackground.style.backgroundColor = '#f2f5f8'; // light gray/blue background
    mapBackground.style.backgroundImage = 
      'linear-gradient(to right, #e2e8f0 1px, transparent 1px), ' +
      'linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)';
    mapBackground.style.backgroundSize = '20px 20px';
    mapContainer.appendChild(mapBackground);
    
    // Create a more detailed street network
    const streets = [
      // Main streets - horizontal
      { width: '100%', height: '16px', top: '30%', left: '0', color: '#cbd5e1', name: 'Main Street' },
      { width: '100%', height: '12px', top: '60%', left: '0', color: '#cbd5e1', name: 'Oak Avenue' },
      // Main streets - vertical
      { width: '16px', height: '100%', top: '0', left: '25%', color: '#cbd5e1', name: 'Market St' },
      { width: '16px', height: '100%', top: '0', left: '75%', color: '#cbd5e1', name: 'Park Road' },
      // Secondary streets - horizontal
      { width: '100%', height: '8px', top: '15%', left: '0', color: '#dbeafe', name: 'Pine St' },
      { width: '100%', height: '8px', top: '45%', left: '0', color: '#dbeafe', name: 'Maple Ave' },
      { width: '100%', height: '8px', top: '75%', left: '0', color: '#dbeafe', name: 'River Rd' },
      // Secondary streets - vertical
      { width: '8px', height: '100%', top: '0', left: '10%', color: '#dbeafe', name: '1st Ave' },
      { width: '8px', height: '100%', top: '0', left: '40%', color: '#dbeafe', name: '2nd Ave' },
      { width: '8px', height: '100%', top: '0', left: '60%', color: '#dbeafe', name: '3rd Ave' },
      { width: '8px', height: '100%', top: '0', left: '90%', color: '#dbeafe', name: '4th Ave' },
    ];
    
    // Create street elements
    streets.forEach(street => {
      const streetElement = document.createElement('div');
      streetElement.style.position = 'absolute';
      streetElement.style.width = street.width;
      streetElement.style.height = street.height;
      streetElement.style.top = street.top;
      streetElement.style.left = street.left;
      streetElement.style.backgroundColor = street.color;
      streetElement.style.zIndex = '1';
      mapContainer.appendChild(streetElement);
      
      // Add street name label if provided
      if (street.name) {
        const streetLabel = document.createElement('div');
        streetLabel.style.position = 'absolute';
        streetLabel.style.fontSize = '8px';
        streetLabel.style.fontWeight = 'bold';
        streetLabel.style.color = '#334155';
        streetLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        streetLabel.style.padding = '1px 3px';
        streetLabel.style.borderRadius = '2px';
        streetLabel.style.zIndex = '4';
        streetLabel.textContent = street.name;
        
        // Determine if it's a horizontal or vertical street
        if (street.height === '16px' || street.height === '12px' || street.height === '8px') {
          // Horizontal street
          streetLabel.style.top = street.top;
          streetLabel.style.left = '50%';
          streetLabel.style.transform = 'translate(-50%, -50%)';
        } else {
          // Vertical street
          streetLabel.style.top = '50%';
          streetLabel.style.left = street.left;
          streetLabel.style.transform = 'translate(-50%, -50%) rotate(-90deg)';
        }
        
        mapContainer.appendChild(streetLabel);
      }
    });
    
    // Add street intersections
    const intersections = [
      { top: '15%', left: '10%' },
      { top: '15%', left: '25%' },
      { top: '15%', left: '40%' },
      { top: '15%', left: '60%' },
      { top: '15%', left: '75%' },
      { top: '15%', left: '90%' },
      
      { top: '30%', left: '10%' },
      { top: '30%', left: '25%' },
      { top: '30%', left: '40%' },
      { top: '30%', left: '60%' },
      { top: '30%', left: '75%' },
      { top: '30%', left: '90%' },
      
      { top: '45%', left: '10%' },
      { top: '45%', left: '25%' },
      { top: '45%', left: '40%' },
      { top: '45%', left: '60%' },
      { top: '45%', left: '75%' },
      { top: '45%', left: '90%' },
      
      { top: '60%', left: '10%' },
      { top: '60%', left: '25%' },
      { top: '60%', left: '40%' },
      { top: '60%', left: '60%' },
      { top: '60%', left: '75%' },
      { top: '60%', left: '90%' },
      
      { top: '75%', left: '10%' },
      { top: '75%', left: '25%' },
      { top: '75%', left: '40%' },
      { top: '75%', left: '60%' },
      { top: '75%', left: '75%' },
      { top: '75%', left: '90%' },
    ];
    
    // Create intersection elements
    intersections.forEach(intersection => {
      const intersectionElement = document.createElement('div');
      intersectionElement.style.position = 'absolute';
      intersectionElement.style.width = '8px';
      intersectionElement.style.height = '8px';
      intersectionElement.style.top = intersection.top;
      intersectionElement.style.left = intersection.left;
      intersectionElement.style.backgroundColor = '#e2e8f0';
      intersectionElement.style.transform = 'translate(-50%, -50%)';
      intersectionElement.style.borderRadius = '1px';
      intersectionElement.style.zIndex = '2';
      mapContainer.appendChild(intersectionElement);
    });
    
    // Add buildings, points of interest & landmarks
    const buildings = [
      // Special landmarks with labels
      { width: '40px', height: '30px', top: '20%', left: '15%', color: '#86efac', name: 'City Park', type: 'park' },
      { width: '24px', height: '24px', top: '35%', left: '32%', color: '#bfdbfe', name: 'Shopping Mall', type: 'mall' },
      { width: '30px', height: '20px', top: '65%', left: '20%', color: '#fecaca', name: 'Hospital', type: 'hospital' },
      { width: '25px', height: '25px', top: '80%', left: '75%', color: '#fdba74', name: 'Public Library', type: 'library' },
      { width: '22px', height: '22px', top: '25%', left: '75%', color: '#c4b5fd', name: 'Theatre', type: 'entertainment' },
      { width: '28px', height: '28px', top: '60%', left: '65%', color: '#d9f99d', name: 'Train Station', type: 'transport' },

      // Regular buildings - Block 1
      { width: '16px', height: '16px', top: '20%', left: '35%', color: '#94a3b8' },
      { width: '14px', height: '12px', top: '20%', left: '50%', color: '#94a3b8' },
      { width: '10px', height: '16px', top: '20%', left: '85%', color: '#94a3b8' },
      
      // Block 2
      { width: '14px', height: '12px', top: '38%', left: '17%', color: '#94a3b8' },
      { width: '12px', height: '14px', top: '38%', left: '52%', color: '#94a3b8' },
      { width: '10px', height: '10px', top: '35%', left: '68%', color: '#94a3b8' },
      { width: '14px', height: '12px', top: '38%', left: '82%', color: '#94a3b8' },
      
      // Block 3
      { width: '16px', height: '14px', top: '52%', left: '18%', color: '#94a3b8' },
      { width: '12px', height: '16px', top: '50%', left: '32%', color: '#94a3b8' },
      { width: '14px', height: '12px', top: '52%', left: '50%', color: '#94a3b8' },
      { width: '10px', height: '16px', top: '52%', left: '82%', color: '#94a3b8' },
      
      // Block 4
      { width: '12px', height: '12px', top: '67%', left: '40%', color: '#94a3b8' },
      { width: '10px', height: '14px', top: '67%', left: '50%', color: '#94a3b8' },
      { width: '14px', height: '12px', top: '65%', left: '82%', color: '#94a3b8' },
      
      // Block 5
      { width: '10px', height: '12px', top: '80%', left: '17%', color: '#94a3b8' },
      { width: '14px', height: '14px', top: '82%', left: '33%', color: '#94a3b8' },
      { width: '16px', height: '10px', top: '80%', left: '48%', color: '#94a3b8' },
      { width: '12px', height: '16px', top: '82%', left: '60%', color: '#94a3b8' },
    ];
    
    // Create building elements
    buildings.forEach(building => {
      const buildingElement = document.createElement('div');
      buildingElement.style.position = 'absolute';
      buildingElement.style.width = building.width;
      buildingElement.style.height = building.height;
      buildingElement.style.top = building.top;
      buildingElement.style.left = building.left;
      buildingElement.style.backgroundColor = building.color;
      buildingElement.style.borderRadius = building.type ? '4px' : '2px';
      buildingElement.style.zIndex = '3';
      
      // If it's a special landmark with a name, add a small icon and label
      if (building.name) {
        // Add icon based on type
        let icon = '';
        switch(building.type) {
          case 'park':
            icon = '🌳'; 
            break;
          case 'mall': 
            icon = '🛍️'; 
            break;
          case 'hospital': 
            icon = '🏥'; 
            break;
          case 'library': 
            icon = '📚'; 
            break;
          case 'entertainment':
            icon = '🎭'; 
            break;
          case 'transport':
            icon = '🚆'; 
            break;
          default:
            icon = '🏢';
        }
        
        // Create wrapper container for the building and its icon
        const containerElement = document.createElement('div');
        containerElement.style.position = 'absolute';
        containerElement.style.top = building.top;
        containerElement.style.left = building.left;
        containerElement.style.zIndex = '3';
        
        buildingElement.style.position = 'relative';
        buildingElement.style.top = '0';
        buildingElement.style.left = '0';
        
        // Create icon element
        const iconElement = document.createElement('div');
        iconElement.style.position = 'absolute';
        iconElement.style.top = '50%';
        iconElement.style.left = '50%';
        iconElement.style.transform = 'translate(-50%, -50%)';
        iconElement.style.fontSize = '10px';
        iconElement.textContent = icon;
        
        // Create label element for the landmark
        const labelElement = document.createElement('div');
        labelElement.style.position = 'absolute';
        labelElement.style.bottom = '-14px';
        labelElement.style.left = '50%';
        labelElement.style.transform = 'translateX(-50%)';
        labelElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        labelElement.style.padding = '2px 4px';
        labelElement.style.borderRadius = '2px';
        labelElement.style.fontSize = '8px';
        labelElement.style.fontWeight = 'bold';
        labelElement.style.color = '#1e293b';
        labelElement.style.whiteSpace = 'nowrap';
        labelElement.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        labelElement.style.zIndex = '4';
        labelElement.textContent = building.name;
        
        // Add elements to container
        containerElement.appendChild(buildingElement);
        buildingElement.appendChild(iconElement);
        containerElement.appendChild(labelElement);
        
        // Add container to map
        mapContainer.appendChild(containerElement);
      } else {
        // Just a regular building without label
        mapContainer.appendChild(buildingElement);
      }
    });
    
    // Create an overlay for handling clicks anywhere on the map
    const mapOverlay = document.createElement('div');
    mapOverlay.style.position = 'absolute';
    mapOverlay.style.inset = '0';
    mapOverlay.style.zIndex = '5';
    mapOverlay.style.cursor = !readonly ? 'pointer' : 'default';
    mapOverlay.style.backgroundColor = 'transparent';
    mapOverlay.style.pointerEvents = 'auto'; // Make sure overlay receives events
    mapContainer.appendChild(mapOverlay);
    
    // Create the marker pin with visual enhancements
    const marker = document.createElement('div');
    marker.style.position = 'absolute';
    marker.style.zIndex = '10';
    marker.style.transform = 'translate(-50%, -100%)';
    marker.style.width = '40px'; // larger size
    marker.style.height = '40px';
    marker.style.left = '50%';
    marker.style.top = '50%';
    marker.style.filter = 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.4))'; // enhanced shadow
    marker.style.cursor = !readonly ? 'move' : 'default'; // cursor indicates draggable/movable
    marker.style.pointerEvents = 'auto'; // Make sure the marker receives events
    
    // First we'll create a pulsating circle under the marker
    const pulsatingCircle = document.createElement('div');
    pulsatingCircle.style.position = 'absolute';
    pulsatingCircle.style.width = '24px';
    pulsatingCircle.style.height = '24px';
    pulsatingCircle.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; // red with transparency
    pulsatingCircle.style.borderRadius = '50%';
    pulsatingCircle.style.transform = 'translate(-50%, -50%)';
    pulsatingCircle.style.left = '50%';
    pulsatingCircle.style.top = '70%';
    pulsatingCircle.style.animation = 'pulse 2s infinite';
    
    // Define the pulse animation
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0.7;
        }
        70% {
          transform: translate(-50%, -50%) scale(2);
          opacity: 0;
        }
        100% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // The actual pin SVG
    marker.innerHTML = `
      <div style="position: relative;">
        ${pulsatingCircle.outerHTML}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="color: #ef4444; width: 36px; height: 36px; position: relative; z-index: 2;">
          <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      </div>
    `;
    mapContainer.appendChild(marker);
    
    // Add coordinates display
    const coordinates = document.createElement('div');
    coordinates.style.position = 'absolute';
    coordinates.style.bottom = '8px';
    coordinates.style.left = '8px';
    coordinates.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    coordinates.style.padding = '4px 8px';
    coordinates.style.borderRadius = '4px';
    coordinates.style.fontSize = '12px';
    coordinates.style.color = '#334155';
    coordinates.style.fontWeight = 'bold';
    coordinates.style.zIndex = '15';
    coordinates.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    
    const formattedCoords = geolocation.formatCoordinates(latitude, longitude);
    coordinates.textContent = `${formattedCoords.lat}, ${formattedCoords.lng}`;
    mapContainer.appendChild(coordinates);
    
    // Add help text if not readonly
    if (!readonly) {
      const helpText = document.createElement('div');
      helpText.style.position = 'absolute';
      helpText.style.top = '8px';
      helpText.style.right = '8px';
      helpText.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      helpText.style.padding = '4px 8px';
      helpText.style.borderRadius = '4px';
      helpText.style.fontSize = '12px';
      helpText.style.color = '#334155';
      helpText.style.fontWeight = 'bold';
      helpText.style.zIndex = '15';
      helpText.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      helpText.innerHTML = '<b>Tap anywhere</b> to set location';
      mapContainer.appendChild(helpText);
      
      // Add tap functionality to the whole map
      const handleMapTap = (e: MouseEvent) => {
        if (!mapContainerRef.current) return;
        e.stopPropagation(); // Prevent any parent handlers
        
        // Get click coordinates relative to map container
        const rect = mapContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log(`Map clicked at position: ${x}, ${y}`);
        
        // Keep within bounds
        const posX = Math.max(0, Math.min(x, rect.width));
        const posY = Math.max(0, Math.min(y, rect.height));
        
        // Move marker to clicked position
        marker.style.left = `${posX}px`;
        marker.style.top = `${posY}px`;
        
        // Calculate adjusted coordinates
        if (onLocationChange) {
          // Creating a variance of coordinates based on position
          const latVariation = ((rect.height - posY) / rect.height - 0.5) * 0.05;
          const lngVariation = ((posX / rect.width) - 0.5) * 0.05;
          
          const newLat = latitude + latVariation;
          const newLng = longitude + lngVariation;
          
          // Log the new coordinates for debugging
          console.log(`New coordinates: ${newLat}, ${newLng}`);
          
          // Update the coordinates display
          const newCoords = geolocation.formatCoordinates(newLat, newLng);
          coordinates.textContent = `${newCoords.lat}, ${newCoords.lng}`;
          
          // Call the callback with new coordinates
          onLocationChange(newLat, newLng);
          
          // Add visual feedback
          const feedback = document.createElement('div');
          feedback.style.position = 'absolute';
          feedback.style.left = `${posX}px`;
          feedback.style.top = `${posY - 40}px`;
          feedback.style.transform = 'translate(-50%, -50%)';
          feedback.style.backgroundColor = 'rgba(59, 130, 246, 0.7)';
          feedback.style.color = 'white';
          feedback.style.padding = '4px 8px';
          feedback.style.borderRadius = '4px';
          feedback.style.fontSize = '12px';
          feedback.style.zIndex = '20';
          feedback.style.pointerEvents = 'none';
          feedback.textContent = 'Location updated';
          feedback.style.animation = 'fadeOutUp 1s forwards';
          
          const feedbackStyle = document.createElement('style');
          feedbackStyle.innerHTML = `
            @keyframes fadeOutUp {
              0% { opacity: 1; transform: translate(-50%, 0); }
              100% { opacity: 0; transform: translate(-50%, -20px); }
            }
          `;
          document.head.appendChild(feedbackStyle);
          
          mapContainer.appendChild(feedback);
          
          // Remove the feedback element after animation
          setTimeout(() => {
            try {
              if (mapContainer && mapContainer.contains(feedback)) {
                mapContainer.removeChild(feedback);
              }
            } catch (err) {
              console.log("Failed to remove feedback element:", err);
            }
          }, 1000);
        }
      };
      
      // Add click handler to the map overlay
      mapOverlay.addEventListener('click', handleMapTap);
      
      // Add drag functionality
      const handleDragStart = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        
        // Store reference to marker for other event handlers
        markerRef.current = marker;
        
        // Change cursor to indicate dragging
        if (marker instanceof HTMLElement) {
          marker.style.cursor = 'grabbing';
          marker.style.zIndex = '25'; // Bring to front while dragging
          marker.style.transform = 'translate(-50%, -100%) scale(1.1)'; // Slightly enlarge for feedback
          marker.style.transition = 'transform 0.1s ease-out';
        }
        
        console.log('Started dragging marker');
      };
      
      const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !mapContainerRef.current || !markerRef.current) return;
        
        let clientX, clientY;
        
        if (e instanceof MouseEvent) {
          clientX = e.clientX;
          clientY = e.clientY;
        } else {
          // Touch event
          if ((e as TouchEvent).touches.length === 0) return;
          clientX = (e as TouchEvent).touches[0].clientX;
          clientY = (e as TouchEvent).touches[0].clientY;
        }
        
        const rect = mapContainerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Keep within bounds
        const posX = Math.max(0, Math.min(x, rect.width));
        const posY = Math.max(0, Math.min(y, rect.height));
        
        markerRef.current.style.left = `${posX}px`;
        markerRef.current.style.top = `${posY}px`;
        
        // Calculate adjusted coordinates
        if (onLocationChange) {
          // Creating a variance of coordinates based on position
          const latVariation = ((rect.height - posY) / rect.height - 0.5) * 0.05;
          const lngVariation = ((posX / rect.width) - 0.5) * 0.05;
          
          const newLat = latitude + latVariation;
          const newLng = longitude + lngVariation;
          
          // Update the coordinates display
          const newCoords = geolocation.formatCoordinates(newLat, newLng);
          coordinates.textContent = `${newCoords.lat}, ${newCoords.lng}`;
          
          onLocationChange(newLat, newLng);
        }
      };
      
      const handleDragEnd = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !markerRef.current) return;
        
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        // Reset cursor and styles
        if (markerRef.current instanceof HTMLElement) {
          markerRef.current.style.cursor = 'move';
          markerRef.current.style.zIndex = '10';
          markerRef.current.style.transform = 'translate(-50%, -100%)';
          
          // Add drop animation
          markerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          
          // Show confirmation that location is set
          const rect = mapContainerRef.current?.getBoundingClientRect();
          if (rect) {
            const feedback = document.createElement('div');
            feedback.style.position = 'absolute';
            feedback.style.left = markerRef.current.style.left;
            feedback.style.top = `${parseFloat(markerRef.current.style.top) - 40}px`;
            feedback.style.transform = 'translate(-50%, -50%)';
            feedback.style.backgroundColor = 'rgba(16, 185, 129, 0.9)'; // Green
            feedback.style.color = 'white';
            feedback.style.padding = '4px 8px';
            feedback.style.borderRadius = '4px';
            feedback.style.fontSize = '12px';
            feedback.style.fontWeight = 'bold';
            feedback.style.zIndex = '20';
            feedback.style.pointerEvents = 'none';
            feedback.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            feedback.textContent = 'Location set';
            feedback.style.animation = 'fadeOutUp 1s forwards';
            
            mapContainer.appendChild(feedback);
            
            // Remove the feedback element after animation
            setTimeout(() => {
              try {
                if (mapContainer && mapContainer.contains(feedback)) {
                  mapContainer.removeChild(feedback);
                }
              } catch (err) {
                console.log("Failed to remove feedback element:", err);
              }
            }, 1000);
          }
        }
        
        // Reset reference
        markerRef.current = null;
      };
      
      marker.addEventListener('mousedown', handleDragStart);
      marker.addEventListener('touchstart', handleDragStart);
      
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);
      
      // Clean up events
      return () => {
        marker.removeEventListener('mousedown', handleDragStart);
        marker.removeEventListener('touchstart', handleDragStart);
        
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchmove', handleDragMove);
        
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchend', handleDragEnd);
        
        mapOverlay.removeEventListener('click', handleMapTap);
      };
    }
  }, [latitude, longitude, onLocationChange, readonly, isDragging, height]);
  
  return (
    <div ref={mapContainerRef} className="relative bg-blue-50 rounded-md overflow-hidden shadow-md" style={{ height }}>
      {/* Map elements will be created in the useEffect */}
      <div className="flex items-center justify-center h-full pointer-events-none">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    </div>
  );
};

export default SimpleMap;