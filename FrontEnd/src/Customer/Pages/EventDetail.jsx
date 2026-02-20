import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../Components/Common Components/Header';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import PlaceIcon from '@mui/icons-material/Place';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useCallback } from 'react';

export default function EventDetail() {
    const [eventDetail, setEventDetail] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [bookingData, setBookingData] = useState({
        guests: 1,
        name: '',
        email: '',
        phone: '',
        specialRequests: '',
    });


    const { id } = useParams();
    console.log('Event ID:', id);
    console.log('Event Detail:', eventDetail);

    // Sample available dates (can be fetched from API if available)
    const availableDates = [
        '2023-10-15',
        '2023-10-16',
        '2023-10-17',
    ];

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                const response = await fetch(`/event/${id}`);
                const data = await response.json();
                setEventDetail(data);
            } catch (error) {
                console.error('Error fetching event detail:', error);
            }
        };

        fetchEventDetail();
    }, [id]); // include id in dependency array

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        console.log('Booking submitted:', { selectedDate, selectedTime, bookingData });
        setShowBookingModal(false);
    };

    const formatIndianRupees = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Carousel component adapted from sample
    const Carousel_Slider = ({ images, title }) => {
        const [currentSlide, setCurrentSlide] = useState(0);
        const [isAutoPlaying, setIsAutoPlaying] = useState(true);
        const navigate = useNavigate();

        useEffect(() => {
            let interval;
            if (isAutoPlaying) {
                interval = setInterval(() => {
                    setCurrentSlide((prev) => (prev + 1) % images.length);
                }, 3000);
            }
            return () => clearInterval(interval);
        }, [isAutoPlaying, images.length]);

        const nextSlide = () => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        };

        const prevSlide = () => {
            setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
        };

        const handlePaginationClick = (index) => {
            setCurrentSlide(index);
        };

        const getImageUrl = useCallback((imgPath) => {
                // Final fallback - a known working image or placeholder
                const FALLBACK = 'https://raw.githubusercontent.com/THIYAGUSRI/THAAIMAN/main/uploads/1765434787902-366029619.png';
        
                if (!imgPath || typeof imgPath !== 'string' || imgPath.trim() === '') {
                    return FALLBACK;
                }
        
                const normalized = imgPath
                    .replace(/\\/g, '/')           // fix any backslashes
                    .replace(/^\/+/, '')           // remove leading slashes
                    .trim();
        
                // If already a full URL, keep it (in case backend sends full link sometimes)
                if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
                    return normalized;
                }
        
                // Build correct GitHub RAW URL
                const repoOwner = 'THIYAGUSRI';
                const repoName = 'THAAIMAN';
                const branch = 'main';
                const folder = 'uploads';
        
                // If path already includes "uploads/", don't duplicate it
                let finalPath = normalized;
                if (!normalized.toLowerCase().startsWith('uploads/')) {
                    finalPath = `${folder}/${normalized}`;
                }
        
                return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${finalPath}`;
            }, []);

        return (
            <div className="relative h-[400px] overflow-hidden bg-black/10 z-20">
                <main className="relative h-full">
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className="flex h-full transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {images.map((img, index) => (
                                <div key={index} className="flex-shrink-0 w-full h-full relative">
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`${title} view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                                        <h3
                                            className={`text-white text-4xl font-bold ${index % 2 === 1 ? 'text-left' : 'text-right'
                                                }`}
                                        >
                                            {title}
                                        </h3>
                                        <button
                                            className="mt-8 px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-black hover:text-white transition-colors duration-300"
                                            onClick={() => setShowBookingModal(true)}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="flex space-x-4">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePaginationClick(index)}
                                    className={`w-8 h-2 transition-all duration-300 rounded-lg ${currentSlide === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 font-extrabold text-white text-6xl opacity-75 hover:opacity-100 transition-opacity duration-300"
                    >
                        <ArrowCircleLeftIcon fontSize="inherit" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 font-extrabold text-white text-6xl opacity-75 hover:opacity-100 transition-opacity duration-300"
                    >
                        <ArrowCircleRightIcon fontSize="inherit" />
                    </button>

                    <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="absolute top-4 right-4 z-10 text-white bg-black/50 px-4 py-2 rounded-full hover:bg-black/75 transition-colors duration-300"
                    >
                        {isAutoPlaying ? 'Pause' : 'Play'}
                    </button>
                </main>
            </div>
        );
    };

    // Calculate days between today and event start date if eventDetail is loaded
    let daysBetween = null;
    if (eventDetail && eventDetail?.startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset time to midnight

        const eventDate = new Date(eventDetail.startDate);
        eventDate.setHours(0, 0, 0, 0); // reset time to midnight

        // calculate difference in days
        const diffTime = eventDate - today;
        daysBetween = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log("Days left:", daysBetween);
    }

    return (
        <div>
            <Header />

            {eventDetail ? (
                <div className="w-full px-0">
                    {/* Carousel section under Header */}
                    <div className="mb-8">
                        <Carousel_Slider
                            images={eventDetail?.images || []}
                            title={eventDetail?.name || 'Event'}
                        />
                    </div>

                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row">
                            <div className="w-full lg:w-8/12 lg:pr-6">
                                <div className="bg-white rounded-lg mb-6">
                                    <div className="p-0">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h1 className="mb-2 text-3xl font-semibold">{eventDetail?.name}</h1>
                                                <div className="flex items-center mb-4">
                                                    <div className="flex items-center">
                                                        <PlaceIcon sx={{ fontSize: 18, color: 'gray', marginRight: '4px' }} />
                                                        <span className="ml-1 text-base">{eventDetail?.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="bg-black text-white px-3 py-1 rounded text-base">
                                                {eventDetail?.eventType || 'Event'}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-2xl font-semibold mb-4">Event Schedule</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-100 rounded-lg p-4 h-full">
                                                    <div className="flex justify-between">
                                                        {eventDetail?.startDate == '' ? '' : <div>
                                                            <h5 className="text-lg font-semibold flex items-center">
                                                                <DateRangeIcon fontSize="inherit" />
                                                                Starting Date
                                                            </h5>
                                                            <p className="text-base">{eventDetail?.startDate}</p>
                                                        </div>}
                                                        {eventDetail?.endDate == '' ? '' : <div>
                                                            <h5 className="text-lg font-semibold flex items-center">
                                                                <DateRangeIcon fontSize="inherit" />
                                                                Ending Date
                                                            </h5>
                                                            <p className="text-base">{eventDetail?.endDate}</p>
                                                        </div>}
                                                    </div>
                                                </div>
                                                {eventDetail?.time == '' ? '' :
                                                    <div className="bg-gray-100 rounded-lg p-4 h-full">
                                                        <h5 className="text-lg font-semibold flex items-center">
                                                            <ScheduleIcon fontSize="inherit" />
                                                            Time
                                                        </h5>
                                                        <p className="text-base">{eventDetail?.time || 'TBD'}</p>
                                                    </div>
                                                }
                                                <div className="bg-gray-100 rounded-lg p-4 h-full">
                                                    <h5 className="text-lg font-semibold flex items-center">
                                                        <PlaceIcon sx={{ fontSize: 18, color: 'gray', marginRight: '4px' }} />
                                                        Location
                                                    </h5>
                                                    <p className="text-base">{eventDetail?.address || eventDetail?.location}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-2xl font-semibold mb-4">Event Overview</h3>
                                            <div className="mb-6">
                                                {eventDetail?.description ? (
                                                    <p className="text-base mb-4">{eventDetail?.description}</p>
                                                ) : (
                                                    eventDetail?.overview?.map((paragraph, index) => (
                                                        <p key={index} className="text-base mb-4">{paragraph}</p>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-4/12">
                                <div className="bg-white rounded-lg shadow-sm sticky top-5 p-6">
                                    <h3 className="text-2xl font-semibold mb-6 flex items-center">
                                        <i className="bi bi-ticket-perforated text-red-600 mr-2"></i>
                                        Reserve Your Spot
                                    </h3>

                                    <div className="mb-6">
                                        <h5 className="text-xl font-semibold mb-6 flex items-center">
                                            <span className="animate-pulse bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center mr-2">
                                                <PriorityHighIcon />
                                            </span>
                                            Event Details
                                        </h5>
                                        {eventDetail?.startDate == '' ? '' :
                                            <div className="mb-3 p-3 rounded-lg bg-gray-100 transition-all duration-300 border-l-4 border-red-600"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 7px 20px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0)';
                                                }}
                                                style={{
                                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                                                }}>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-base font-medium flex items-center">
                                                        <DateRangeIcon fontSize="inherit" className="text-red-600 mr-2" />
                                                        Starting Date:
                                                    </span>
                                                    <span className="text-base">{eventDetail?.startDate}</span>
                                                </div>

                                            </div>
                                        }
                                        {eventDetail?.endDate == '' ? '' :
                                            <div className="mb-3 p-3 rounded-lg bg-gray-100 transition-all duration-300 border-l-4 border-red-600"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 7px 20px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0)';
                                                }}
                                                style={{
                                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                                                }}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base font-medium flex items-center">
                                                        <DateRangeIcon fontSize="inherit" className="text-red-600 mr-2" />
                                                        Ending Date:
                                                    </span>
                                                    <span className="text-base">{eventDetail?.endDate}</span>
                                                </div>
                                            </div>
                                        }
                                        {eventDetail?.time == '' ? '' :
                                            <div className="mb-3 p-3 rounded-lg bg-gray-100 transition-all duration-300 border-l-4 border-red-600"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 7px 20px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0)';
                                                }}
                                                style={{
                                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                                                }}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base font-medium flex items-center">
                                                        <ScheduleIcon fontSize="inherit" className="text-red-600 mr-2" />
                                                        Time:
                                                    </span>
                                                    <span className="text-base">{eventDetail?.time || 'TBD'}</span>
                                                </div>
                                            </div>
                                        }

                                        <div className="mb-3 p-3 rounded-lg bg-gray-100 transition-all duration-300 border-l-4 border-red-600"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = '0 7px 20px rgba(0, 0, 0, 0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0)';
                                            }}
                                            style={{
                                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                                            }}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base font-medium flex items-center">
                                                    <PlaceIcon sx={{ fontSize: 18, color: 'red', marginRight: '4px' }} />
                                                    Location:
                                                </span>
                                                <span className="text-base">{eventDetail?.location}</span>
                                            </div>
                                        </div>

                                        {eventDetail?.price && (
                                            <div className="mb-3 p-3 rounded-lg bg-gray-100 transition-all duration-300 border-l-4 border-red-600"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 7px 20px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0)';
                                                }}
                                                style={{
                                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                                                }}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base font-medium flex items-center">
                                                        <CurrencyRupeeIcon sx={{ fontSize: 18, color: 'red', marginRight: '4px' }} />
                                                        Price:
                                                    </span>
                                                    <span className="text-base font-semibold">{formatIndianRupees(eventDetail?.price)}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-3 rounded-lg bg-gray-100 transition-all duration-300 border-l-4 border-red-600 animate-pulse"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = '0 7px 20px rgba(0, 0, 0, 0)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0)';
                                            }}
                                            style={{
                                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                                            }}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base font-medium flex items-center">
                                                    <WarningAmberIcon sx={{ fontSize: 18, color: 'red', marginRight: '4px' }} />
                                                    Availability:
                                                </span>
                                                <span className="text-base font-semibold text-red-600">
                                                    Only {daysBetween} spots left
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full py-3 mb-4 text-lg font-semibold text-white bg-red-600 rounded-lg transition-all duration-300 shadow-lg relative overflow-hidden hover:bg-red-700"
                                        onClick={() => setShowBookingModal(true)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                            e.currentTarget.style.boxShadow = '0 7px 20px rgba(220, 53, 69, 0.6)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.4)';
                                        }}
                                        style={{
                                            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
                                        }}
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            <i className="bi bi-calendar-check-fill mr-2"></i>
                                            Book Now
                                        </span>
                                        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-600 ease-in-out"></span>
                                    </button>

                                    <div className="text-center text-sm">
                                        <i className="bi bi-shield-lock-fill text-green-500 mr-2"></i>
                                        <span>Secure checkout</span>
                                        <span className="mx-2">•</span>
                                        <i className="bi bi-credit-card-fill text-blue-500 mr-2"></i>
                                        <span>Multiple payment options</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showBookingModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50">
                            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                                <div className="bg-black text-white p-4 flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Reserve: {eventDetail?.name}</h3>
                                    <button
                                        onClick={() => setShowBookingModal(false)}
                                        className="text-white hover:text-gray-300 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleBookingSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Select Date</label>
                                            <select
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            >
                                                <option value="">Select a date</option>
                                                {availableDates.map((date, index) => (
                                                    <option key={index} value={date}>{date}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Select Time</label>
                                            <select
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            >
                                                <option value="">Select a time</option>
                                                {(eventDetail?.availableTimes || []).map((time, index) => (
                                                    <option key={index} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={bookingData.guests}
                                                onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                value={bookingData.name}
                                                onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={bookingData.email}
                                                onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input
                                                type="tel"
                                                value={bookingData.phone}
                                                onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                                            <textarea
                                                value={bookingData.specialRequests}
                                                onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                                rows="4"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setShowBookingModal(false)}
                                                className="px-4 py-2 text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!selectedDate || !selectedTime}
                                                className="px-4 py-2 text-base bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            >
                                                <i className="bi bi-check-circle mr-2"></i>
                                                Confirm Reservation
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-lg">Loading event details...</p>
            )}
        </div>
    );
}