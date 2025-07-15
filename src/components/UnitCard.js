// unit-management-app/src/components/UnitCard.js
import React, { useState } from 'react';

function UnitCard({ unit, levelName, onStatusChange, onAddComment, onToggleCommentResolved, onToggleCommentsExpanded }) {
  const [newCommentText, setNewCommentText] = useState('');

  // Function to determine the entire card's background, text, and border classes
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Ok to Pre-Rock':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Ok to Pre-Insulate':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Ok to Cover':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Issue':
        return 'bg-red-100 text-red-800 border-red-300';
      case null: // Handle null status from backend
      case undefined: // Handle undefined status
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'; // Default to light grey background
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      onAddComment(levelName, unit.unitNumber, newCommentText);
      setNewCommentText('');
    }
  };

  // Display status name, handling null/undefined
  const displayStatus = unit.status || "No Status Set";

  return (
    <div className={`border rounded-lg shadow-md p-4 transition-all duration-300 ${getStatusClasses(unit.status)}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900">{unit.unitNumber}</h3>
        <span className="text-sm font-semibold">{displayStatus}</span>
      </div>
      <div className="text-gray-700 mb-4">
        <p><strong>Area:</strong> {unit.sqFt}</p>
        <p><strong>Type:</strong> {unit.type}</p>
      </div>

      <div className="mb-4">
        <div className="flex flex-col gap-2 mb-2">
          <button
            onClick={() => onStatusChange(levelName, unit.unitNumber, 'Ok to Pre-Rock')}
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full"
          >
            Pre-Rock
          </button>
          <button
            onClick={() => onStatusChange(levelName, unit.unitNumber, 'Ok to Pre-Insulate')}
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full"
          >
            Pre-Insulate
          </button>
          <button
            onClick={() => onStatusChange(levelName, unit.unitNumber, 'Ok to Cover')}
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full"
          >
            Cover
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => onStatusChange(levelName, unit.unitNumber, 'Approved')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full"
          >
            Approved
          </button>
          <button
            onClick={() => onStatusChange(levelName, unit.unitNumber, 'Issue')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full"
          >
            Issue
          </button>
        </div>

        <button
          onClick={() => onStatusChange(levelName, unit.unitNumber, null)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm w-full"
        >
          Clear Status
        </button>
      </div>

      <div className="border-t border-gray-300 pt-3">
        <button
          onClick={() => onToggleCommentsExpanded(levelName, unit.unitNumber)}
          className="w-full text-left text-sm font-semibold text-orange-600 hover:text-orange-800 py-1"
        >
          Comments ({unit.comments ? unit.comments.length : 0}) {unit.isCommentsExpanded ? '▲' : '▼'}
        </button>

        {unit.isCommentsExpanded && (
          <div className="mt-2 space-y-2 text-sm">
            {unit.comments && unit.comments.length > 0 ? (
              unit.comments.map((comment, index) => (
                <div key={index} className={`p-2 rounded ${comment.resolved ? 'bg-gray-200 text-gray-600 line-through' : 'bg-gray-50'}`}>
                  <p>{comment.text}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                    <span>{comment.timestamp}</span>
                    <button
                      onClick={() => onToggleCommentResolved(levelName, unit.unitNumber, index)}
                      className="text-orange-400 hover:underline"
                    >
                      {comment.resolved ? 'Unresolve' : 'Resolve'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No comments yet.</p>
            )}

            <form onSubmit={handleCommentSubmit} className="mt-3">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a new comment..."
                rows="2"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-orange-400 focus:border-orange-400"
              ></textarea>
              <button
                type="submit"
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
              >
                Add Comment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnitCard;