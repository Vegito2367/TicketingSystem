"use client"
import { useEffect, useState } from "react";
import { Ticket } from "../components/ticket";
import { GET } from "./api/retrieve/route";
export interface TicketProps {
  id: String,
  from: String,
  subject: String
  description: String,
  emailID: String,
}
export default function Home() {

  useEffect(() => {
    retrieveData();
  }, [])

  const [tickets, setTickets] = useState<TicketProps[]>([])
  async function retrieveData() {
    try {
      const response = await fetch("/api/retrieve", {
        method: "GET"
      })
      const data = await response.json()
      if (data.status === 200) {
        const pay: TicketProps[] = data.payload
        pay.forEach(tick => {
          const rid = tick.id
          const rfrom = tick.from
          const rsubject = tick.subject
          const rdescription = tick.description
          const remailID = tick.emailID
          setTickets(prev => [...prev, {
            id: rid,
            from: rfrom,
            subject: rsubject,
            description: rdescription,
            emailID: remailID
          }])
        })
      }

    } catch (error) {
      console.log(error)
    }
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
            Retrieve Tickets
          </button>
        </div>

        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <Ticket
              key={index}
              id={ticket.id}
              from={ticket.from}
              subject={ticket.subject}
              description={ticket.description}
              emailID={ticket.emailID}
            />
          ))}
        </div>
      </div>
    </main>
  );
}