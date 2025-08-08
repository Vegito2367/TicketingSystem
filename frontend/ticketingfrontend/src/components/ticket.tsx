'use client';

import React, { useState } from 'react';
import { TicketProps } from '@/lib/types';
import { Button } from './ui/button';
import { toast } from "sonner"
import { ChevronDown, ChevronUp, Save } from 'lucide-react';

export const Ticket = (props: TicketProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subject, setSubject] = useState(props.subject);
  const [description, setDescription] = useState(props.description);
  const [hasChanged, setHasChanged] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setHasChanged(!(props.description === description));
  }

  async function saveTicket() {
    const response = await fetch("/api/update", {
      method: "POST",
      body: JSON.stringify({
        id: props.id,
        description: description,
      })
    })
    const data = await response.json()

    if (data.status === 200) {
      toast.success("Ticket Updated")
      setHasChanged(false);
    }
    else {
      toast.error("Ticket not updated")
    }
  }

  return (
    <div
      className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg mb-4"
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-grow">
            <p className="text-sm text-gray-500">From: {props.from}</p>
            <h2 className="text-lg font-semibold text-gray-800 mt-1">{subject}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={saveTicket} disabled={!hasChanged} size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleToggleExpand} variant="outline" size="icon">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description as string}
              onChange={handleDescriptionChange}
              className="w-full h-32 p-2 border border-gray-300 text-black rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        )}
      </div>
    </div>
  );
};