import React from 'react';
import { Calendar, Ticket, Users, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { mockEvents, mockTickets, mockAssignedTickets } from '../../data/mockData';

const Dashboard: React.FC = () => {
  const totalEvents = mockEvents.filter(e => !e.is_deleted).length;
  const totalTickets = mockTickets.reduce((sum, ticket) => sum + ticket.total_quantity, 0);
  const soldTickets = mockTickets.reduce((sum, ticket) => sum + (ticket.total_quantity - ticket.available_quantity), 0);
  const revenue = mockTickets.reduce((sum, ticket) => {
    const sold = ticket.total_quantity - ticket.available_quantity;
    return sum + (sold * ticket.price);
  }, 0);

  const stats = [
    {
      name: 'Total Events',
      value: totalEvents.toString(),
      icon: Calendar,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'bg-blue-500',
    },
    {
      name: 'Tickets Sold',
      value: soldTickets.toString(),
      icon: Ticket,
      change: '+23%',
      changeType: 'positive' as const,
      color: 'bg-emerald-500',
    },
    {
      name: 'Total Revenue',
      value: `$${revenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+18%',
      changeType: 'positive' as const,
      color: 'bg-orange-500',
    },
    {
      name: 'Attendees',
      value: mockAssignedTickets.filter(t => t.status === 'used').length.toString(),
      icon: Users,
      change: '+8%',
      changeType: 'positive' as const,
      color: 'bg-purple-500',
    },
  ];

  const upcomingEvents = mockEvents
    .filter(e => !e.is_deleted && new Date(e.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);

  const recentTickets = mockTickets
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100 text-lg">Here's what's happening with your events today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${item.color} p-3 rounded-xl`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {item.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Events
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{event.name}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(event.start_time).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{event.venue}</p>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-emerald-600" />
              Recent Tickets
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {recentTickets.map((ticket) => {
              const event = mockEvents.find(e => e._id === ticket.event_id);
              const soldPercentage = ((ticket.total_quantity - ticket.available_quantity) / ticket.total_quantity) * 100;
              
              return (
                <div key={ticket._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ticket.type}</p>
                      <p className="text-xs text-gray-500">{event?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${ticket.price}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(soldPercentage)}% sold
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
            <Calendar className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-700">Create Event</span>
          </button>
          <button className="flex flex-col items-center p-6 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group">
            <Ticket className="h-8 w-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-emerald-700">Add Tickets</span>
          </button>
          <button className="flex flex-col items-center p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group">
            <Users className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-orange-700">Assign Tickets</span>
          </button>
          <button className="flex flex-col items-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group">
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-purple-700">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;