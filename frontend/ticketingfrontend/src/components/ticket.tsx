'use client';

import React, { useState } from 'react';
import { TicketProps } from '../app/page';
import { Button } from './ui/button';
import { toast } from "sonner"

export const Ticket = (props:TicketProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // State for editable fields
  const [subject, setSubject] = useState(props.subject);
  const [description, setDescription] = useState(props.description);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  async function saveTicket(){
    console.log(description)
    const response = await fetch("/api/update",{
      method: "POST",
      body: JSON.stringify({
        id: props.id,
        description: description,
      })
    })
    const data = await response.json()

    if(data.status === 200){
      toast.success("Ticket Updated")
    }
    else{
      toast.error("Ticket not updated")
    }
  }

  return (
    <div
      className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg mb-4"
      onClick={!isExpanded ? handleToggleExpand : undefined} // Only expand on click when minimized
    >
      {/* Minimized View */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">From: {props.from}</p>
            <h2 className="text-lg font-semibold text-gray-800 mt-1">{subject}</h2>
          </div>
          <button
            onClick={handleToggleExpand}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Collapse' : 'View Details'}
          </button>
          <Button onClick={saveTicket}>
            Save
          </Button>
        </div>

        {/* Expanded View - Conditionally Rendered */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description as string}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              onClick={(e) => e.stopPropagation()} // Prevents the card from collapsing when textarea is clicked
            />
          </div>
        )}
      </div>
    </div>
  );
};
