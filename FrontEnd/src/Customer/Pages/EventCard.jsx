import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Common Components/Header';
import {
  LocationOn,
  CalendarToday,
  AccessTime,
  Warning,
  ArrowForward,
  CurrencyRupee,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

export default function EventCard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.user.currentUser);
  console.log(currentUser);

  const userId = currentUser?.user?.userID;

  const formatIndianRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return '/uploads/default-image.jpg';
    const normalizedPath = imgPath.replace(/\\/g, '/');
    return normalizedPath.startsWith('http')
      ? normalizedPath
      : `/uploads/${normalizedPath}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/events');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Backend returns direct array, not { events: [...] }
        const eventList = Array.isArray(data) ? data : [];
        setEvents(eventList);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto py-10 text-center">
          <p className="text-xl text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto py-10 text-center text-red-600">
          <p>Error loading events: {error}</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto py-10 text-center">
          <p className="text-xl text-gray-600">No events available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {events.map((eventData) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const eventDate = new Date(eventData.startDate);
          eventDate.setHours(0, 0, 0, 0);

          const diffTime = eventDate - today;
          const daysBetween = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return (
            <div key={eventData.id} className="mb-10 mt-30">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-200">
                <div className="flex flex-col lg:flex-row">
                  {/* Image Section */}
                  <div className="lg:w-1/2 h-64 lg:h-96">
                    <img
                      src={getImageUrl(eventData.images?.[0])}
                      alt={eventData.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/uploads/default-image.jpg';
                      }}
                    />
                  </div>

                  {/* Content Section */}
                  <div className="lg:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                          {eventData.title || 'Untitled Event'}
                        </h2>
                        {eventData.price > 0 && (
                          <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg font-semibold flex items-center">
                            <CurrencyRupee sx={{ fontSize: 20 }} />
                            {formatIndianRupees(eventData.price).replace('₹', '')}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {eventData.description && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-2">
                            <DescriptionIcon sx={{ color: 'purple' }} /> Description
                          </h3>
                          <p className="text-gray-600 leading-relaxed pl-6">
                            {eventData.description.length > 300
                              ? `${eventData.description.substring(0, 300)}...`
                              : eventData.description}
                          </p>
                        </div>
                      )}

                      {/* Location */}
                      {eventData.location && (
                        <div className="flex items-center gap-3 text-gray-700 mb-4">
                          <LocationOn sx={{ color: 'red' }} />
                          <span className="font-medium">{eventData.location}</span>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-3 text-gray-700 mb-4">
                        <CalendarToday sx={{ color: 'gray' }} />
                        <span>
                          <strong>Start:</strong>{' '}
                          {new Date(eventData.startDate).toLocaleDateString('en-IN')}
                          {eventData.endDate && (
                            <>
                              {' → '}
                              {new Date(eventData.endDate).toLocaleDateString('en-IN')}
                            </>
                          )}
                        </span>
                      </div>

                      {/* Time */}
                      {eventData.time && (
                        <div className="flex items-center gap-3 text-gray-700 mb-6">
                          <AccessTime sx={{ color: 'black' }} />
                          <span>{eventData.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <span className="text-lg font-bold text-red-600 flex items-center">
                        <Warning sx={{ fontSize: 20 }} />
                        {daysBetween > 0
                          ? `Starts in ${daysBetween} day${daysBetween > 1 ? 's' : ''}`
                          : daysBetween === 0
                          ? 'Today!'
                          : 'Event has passed'}
                      </span>

                      <Link
                        to={userId ? `/eventdetail/${eventData.id}` : '/login'}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg 
                                 flex items-center gap-2 transition-colors"
                      >
                        View Details <ArrowForward />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}