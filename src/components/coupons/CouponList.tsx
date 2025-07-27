import React, { useState } from 'react';
import { Plus, Tag, Percent, DollarSign, Search, Edit, Trash2, Copy, Calendar } from 'lucide-react';
import { mockCoupons, mockEvents } from '../../data/mockData';

const CouponList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  const filteredCoupons = mockCoupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === 'all' || coupon.event_id === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const getEventName = (eventId: string) => {
    const event = mockEvents.find(e => e._id === eventId);
    return event?.name || 'Unknown Event';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const isActive = (validFrom: string, validUntil: string) => {
    const now = new Date();
    return new Date(validFrom) <= now && new Date(validUntil) >= now;
  };

  const getStatusColor = (coupon: typeof mockCoupons[0]) => {
    if (isExpired(coupon.valid_until)) return 'bg-red-100 text-red-800';
    if (isActive(coupon.valid_from, coupon.valid_until)) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (coupon: typeof mockCoupons[0]) => {
    if (isExpired(coupon.valid_until)) return 'Expired';
    if (isActive(coupon.valid_from, coupon.valid_until)) return 'Active';
    return 'Scheduled';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600">Create and manage discount codes for your events</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
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
            placeholder="Search coupons..."
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{mockCoupons.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockCoupons.filter(c => isActive(c.valid_from, c.valid_until)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockCoupons.reduce((sum, c) => sum + c.used_count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockCoupons.filter(c => isExpired(c.valid_until)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div key={coupon._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Coupon Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 font-mono">{coupon.code}</h3>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{getEventName(coupon.event_id)}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(coupon)}`}>
                    {getStatusText(coupon)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Discount Value */}
            <div className="px-6 pb-4">
              <div className="flex items-center mb-3">
                {coupon.discount_type === 'percentage' ? (
                  <div className="flex items-center text-2xl font-bold text-green-600">
                    <Percent className="h-6 w-6 mr-1" />
                    {coupon.discount_value}
                  </div>
                ) : (
                  <div className="flex items-center text-2xl font-bold text-green-600">
                    <DollarSign className="h-6 w-6 mr-1" />
                    {coupon.discount_value}
                  </div>
                )}
                <span className="ml-2 text-sm text-gray-500 capitalize">
                  {coupon.discount_type} discount
                </span>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="px-6 pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Usage</span>
                <span className="text-sm font-medium text-gray-900">
                  {coupon.used_count} / {coupon.usage_limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(coupon.used_count / coupon.usage_limit) * 100}%` }}
                />
              </div>
            </div>

            {/* Validity Dates */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Valid from:</span>
                  <span className="font-medium">{formatDate(coupon.valid_from)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid until:</span>
                  <span className="font-medium">{formatDate(coupon.valid_until)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCoupons.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || selectedEvent !== 'all' ? 'No coupons found' : 'No coupons yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedEvent !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create discount codes to boost ticket sales'
            }
          </p>
          {!searchTerm && selectedEvent === 'all' && (
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Coupon
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponList;