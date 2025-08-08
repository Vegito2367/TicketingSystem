'use client'
import { useEffect, useState } from "react";
import { Ticket } from "../components/ticket";
import { TicketProps } from "@/lib/types";
import { Loader, Inbox } from 'lucide-react';

export default function Home() {

  const [tickets, setTickets] = useState<TicketProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    retrieveData();
  }, [])

  async function retrieveData() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/retrieve", {
        method: "GET"
      });
      const data = await response.json();
      if (data.status === 200) {
        setTickets(data.payload);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  return (
    <main className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Support Tickets</h1>
          <p className="text-md text-gray-600">Manage and respond to customer inquiries.</p>
        </header>

        <div className="flex justify-center mb-8">
          <button onClick={retrieveData}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
          >
            Refresh Tickets
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <Inbox className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">No Tickets Found</h2>
            <p className="mt-2">There are currently no support tickets.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Ticket
                key={ticket.id as string}
                id={ticket.id}
                from={ticket.from}
                subject={ticket.subject}
                description={ticket.description}
                emailID={ticket.emailID}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
