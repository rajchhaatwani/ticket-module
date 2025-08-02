import React, { useState } from 'react';
import { Plus, Ticket, DollarSign, Search, Edit, Trash2, Users, Eye } from 'lucide-react';
import { mockTickets, mockEvents } from '../../data/mockData';

const TicketList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === 'all' || ticket.event_id === selectedEvent;
    return !ticket.is_deleted && matchesSearch && matchesEvent;
  });

  const getEventName = (eventId: string) => {
    const event = mockEvents.find(e => e._id === eventId);
    return event?.name || 'Unknown Event';
  };

  const calculateSoldPercentage = (ticket: typeof mockTickets[0]) => {
    const sold = ticket.total_quantity - ticket.available_quantity;
    return (sold / ticket.total_quantity) * 100;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-100 text-red-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 90) return 'Nearly Sold Out';
    if (percentage >= 80) return 'Low Stock';
    if (percentage >= 50) return 'Selling Well';
    return 'Available';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage ticket types and track sales performance</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket Type
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Events</option>
          {mockEvents.filter(e => !e.is_deleted).map(event => (
            <option key={event._id} value={event._id}>{event.name}</option>
          ))}
        </select>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => {
          const soldPercentage = calculateSoldPercentage(ticket);
          const sold = ticket.total_quantity - ticket.available_quantity;
          
          return (
            <div key={ticket._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Ticket Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{ticket.type}</h3>
                    <p className="text-sm text-gray-600">{getEventName(ticket.event_id)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(soldPercentage)}`}>
                      {getStatusText(soldPercentage)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price and Stats */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-2xl font-bold text-gray-900">
                    <DollarSign className="h-6 w-6 mr-1" />
                    {ticket.price.toFixed(2)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{sold} sold</p>
                    <p className="text-xs text-gray-500">of {ticket.total_quantity}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${soldPercentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{Math.round(soldPercentage)}% sold</span>
                  <span>{ticket.available_quantity} remaining</span>
                </div>
              </div>

              {/* Revenue */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>Revenue: ${(sold * ticket.price).toLocaleString()}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Assign Tickets
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || selectedEvent !== 'all' ? 'No tickets found' : 'No tickets yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedEvent !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create ticket types for your events to start selling'
            }
          </p>
          {!searchTerm && selectedEvent === 'all' && (
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketList;