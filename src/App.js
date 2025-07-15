// unit-management-app/src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UnitCard from './components/UnitCard';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/units';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [unitData, setUnitData] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  // const [socket, setSocket] = useState(null); // This line is not needed if you initialize directly below

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        const groupedData = data.reduce((acc, unit) => {
          const levelIndex = acc.findIndex(level => level.level === unit.level);
          if (levelIndex > -1) {
            acc[levelIndex].units.push({ ...unit, isCommentsExpanded: false });
          } else {
            acc.push({
              level: unit.level,
              totalUnits: 0, // This totalUnits property will be updated below
              units: [{ ...unit, isCommentsExpanded: false }]
            });
          }
          return acc;
        }, []);

        groupedData.sort((a, b) => {
          const levelNumA = parseInt(a.level.replace('Level ', ''));
          const levelNumB = parseInt(b.level.replace('Level ', ''));
          return levelNumA - levelNumB;
        });

        groupedData.forEach(level => {
          level.units.sort((a, b) => parseInt(a.unitNumber) - parseInt(b.unitNumber));
          level.totalUnits = level.units.length; // Update totalUnits for each level
        });

        setUnitData(groupedData);
        if (groupedData.length > 0) {
          setSelectedLevel(groupedData[0].level);
        }
      })
      .catch(error => console.error('Error fetching initial data:', error));

    // Initialize socket directly here.
    // By assigning it to 'socket' below, we make sure the 'socket' state variable is used.
    const socket = io(SOCKET_URL); 
    // setSocket(socket); // If you still want to use the state, use this.
                       // However, for this use case, 'socket' from the useEffect scope is fine.

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('unitUpdated', (updatedUnit) => {
      setUnitData(prevData =>
        prevData.map(level => ({
          ...level,
          units: level.units.map(unit =>
            unit._id === updatedUnit._id
              ? { ...updatedUnit, isCommentsExpanded: unit.isCommentsExpanded }
              : unit
          ),
        }))
      );
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Clean up socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleStatusChange = (levelName, unitNumber, newStatus) => {
    const currentUnit = unitData.find(level => level.level === levelName)
                                ?.units.find(unit => unit.unitNumber === unitNumber);

    if (currentUnit) {
      fetch(`${API_URL}/${currentUnit.unitNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Status update sent to backend, waiting for WebSocket confirmation.');
        })
        .catch(error => console.error('Error updating status:', error));
    }
  };

  const handleAddComment = (levelName, unitNumber, commentText) => {
    const currentUnit = unitData.find(level => level.level === levelName)
                                ?.units.find(unit => unit.unitNumber === unitNumber);
    if (currentUnit) {
      fetch(`${API_URL}/${currentUnit.unitNumber}`, {
        method: 'PUT', // Assuming PUT request for adding comment
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentText }),
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add comment');
          return response.json();
        })
        .then(data => {
          console.log('Comment added, waiting for WebSocket confirmation.');
        })
        .catch(error => console.error('Error adding comment:', error));
    }
  };

  const handleToggleCommentResolved = (levelName, unitNumber, commentIndex) => {
    const currentUnit = unitData.find(level => level.level === levelName)
                                ?.units.find(unit => unit.unitNumber === unitNumber);
    if (currentUnit) {
      fetch(`${API_URL}/${currentUnit.unitNumber}`, {
        method: 'PUT', // Assuming PUT request for toggling comment resolved
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentIndex: commentIndex }), // Send comment index for backend to process
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to toggle comment resolved status');
          return response.json();
        })
        .then(data => {
          console.log('Comment resolved status toggled, waiting for WebSocket confirmation.');
        })
        .catch(error => console.error('Error toggling comment resolved status:', error));
    }
  };

  const handleToggleCommentsExpanded = (levelName, unitNumber) => {
    setUnitData(prevData =>
      prevData.map(level =>
        level.level === levelName
          ? {
              ...level,
              units: level.units.map(unit =>
                unit.unitNumber === unitNumber
                  ? { ...unit, isCommentsExpanded: !unit.isCommentsExpanded }
                  : unit
              ),
            }
          : level
      )
    );
  };

  const currentLevelData = unitData.find(level => level.level === selectedLevel);
  // totalUnitsCount is now used here in the JSX below
  const totalUnitsCount = currentLevelData?.units.length || 0; 
  const availableLevels = unitData.map(level => level.level);

  // Calculate status counts for the current level
  const statusCounts = currentLevelData?.units.reduce((acc, unit) => {
    const statusKey = unit.status || "No Status Set"; // Handle null/undefined status
    acc[statusKey] = (acc[statusKey] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <div className="container mx-auto p-4">
        {/* Level Selection Buttons */}
        <div className="flex flex-wrap gap-2 justify-center bg-gray-100 p-4 rounded-lg shadow-md mb-6">
          {availableLevels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                ${selectedLevel === level ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }
            >
              {level}
            </button>
          ))}
        </div>

        {/* Status Tally */}
        {currentLevelData && (
          <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Current Level Summary ({selectedLevel}): Total Units: {totalUnitsCount}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              {Object.entries(statusCounts || {}).map(([status, count]) => (
                <span key={status} className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-medium">
                  {status}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLevelData?.units.map(unit => (
            <UnitCard
              key={unit.unitNumber}
              unit={unit}
              levelName={selectedLevel}
              onStatusChange={handleStatusChange}
              onAddComment={handleAddComment}
              onToggleCommentResolved={handleToggleCommentResolved}
              onToggleCommentsExpanded={handleToggleCommentsExpanded}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;