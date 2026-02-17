import { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import DeliveryHeader from '../Components/DeliveryHeader';

export default function DeliverySignUp() {
    const [formData, setFormData] = useState({
        deliveryCenterName: '',
        deliveryNickName: '',
        userName: '',
        userMobile: '',
        userEmail: '',
        password: '',
        retypePassword: '',
        address: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        alternateMobile: '',
        landmark: '',
        googleMapLocation: '',
        location: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const navigate = useNavigate();

    // Your Google Maps API Key
    const API_KEY = "wkwkfkf"; 

    useEffect(() => {
        // Load Google Maps Script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initMap = () => {
        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 11.0168, lng: 76.9558 }, // Default: Coimbatore
            zoom: 13,
        });

        const marker = new window.google.maps.Marker({
            map: map,
            draggable: true,
        });
        markerRef.current = marker;

        // On drag end → update URLs
        marker.addListener('dragend', () => {
            const position = marker.getPosition();
            const lat = position.lat();
            const lng = position.lng();

            const shareLink = `https://www.google.com/maps?q=${lat},${lng}`;

            setFormData(prev => ({
                ...prev,
                location: shareLink,
                googleMapLocation: shareLink // Store same URL for both fields
            }));
        });

        // Optional: Geocode address on map click
        map.addListener('click', (e) => {
            marker.setPosition(e.latLng);
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            const shareLink = `https://www.google.com/maps?q=${lat},${lng}`;

            setFormData(prev => ({
                ...prev,
                location: shareLink,
                googleMapLocation: shareLink // Store same URL for both fields
            }));
        });
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[id]) {
            setFieldErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});

        try {
            const requiredFields = [
                'deliveryCenterName', 'deliveryNickName', 'userName', 
                'userMobile', 'userEmail', 'password', 'street', 
                'area', 'city', 'pincode', 'state', 'googleMapLocation', 'location'
            ];
            
            // Check for missing fields and create field-specific errors
            const missingFields = requiredFields.filter(field => !formData[field]);
            if (missingFields.length > 0) {
                const newFieldErrors = {};
                missingFields.forEach(field => {
                    newFieldErrors[field] = 'This field is required';
                });
                setFieldErrors(newFieldErrors);
                setError(`Please fill in all required fields`);
                setLoading(false);
                return;
            }
            
            // Check password match
            if (formData.password !== formData.retypePassword) {
                setFieldErrors({
                    password: 'Passwords do not match',
                    retypePassword: 'Passwords do not match'
                });
                setError("Passwords do not match!");
                setLoading(false);
                return;
            }
            
            const { retypePassword, ...submitData } = formData;
            
            const response = await fetch('http://localhost:3000/createdeliverycentre', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            const responseData = await response.json();
            
            if (response.ok) {
                // Show success notification
                setShowSuccess(true);
                // Hide notification after 1 second and redirect
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate('/deliverysignin');
                }, 1000);
            } else {
                setError(responseData.message || `Registration failed. Server returned ${response.status}`);
            }
        } catch (error) {
            setError('Cannot connect to server. Please make sure the backend is running on localhost:3000');
        } finally {
            setLoading(false);
        }
    };

    // Function to render InputLabel with red star for required fields
    const renderRequiredLabel = (text, fieldName) => (
        <InputLabel className="mb-1 mt-5" style={{ color: fieldErrors[fieldName] ? 'red' : 'inherit' }}>
            {text}<span style={{ color: 'red' }}>*</span>
            {fieldErrors[fieldName] && (
                <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '8px' }}>
                    {fieldErrors[fieldName]}
                </span>
            )}
        </InputLabel>
    );

    return (
        <div>
            <DeliveryHeader />
            <div>
                <div className='container mx-auto p-4'>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Delivery Center Sign Up</h2>                    
                </div>
                
                {/* Success Notification */}
                {showSuccess && (
                    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Registration successful! Redirecting...
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="container mx-auto p-4">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    </div>
                )}
                
                <div className="container mx-auto p-4 space-y-4 lg:space-y-0 grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">                
                    {/* First Column */}
                    <div className="space-y-2 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        {renderRequiredLabel('Delivery Center Name', 'deliveryCenterName')}
                        <TextField 
                            id="deliveryCenterName" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.deliveryCenterName}
                            helperText={fieldErrors.deliveryCenterName}
                            required 
                        />
                        
                        {renderRequiredLabel('Unique Nick Name (eg: 636003 - ponnammapet)', 'deliveryNickName')}
                        <TextField 
                            id="deliveryNickName" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            inputProps={{ style: { textTransform: 'uppercase' } }} 
                            error={!!fieldErrors.deliveryNickName}
                            helperText={fieldErrors.deliveryNickName}
                            required 
                        />
                        
                        {renderRequiredLabel('User Name', 'userName')}
                        <TextField 
                            id="userName" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.userName}
                            helperText={fieldErrors.userName}
                            required 
                        />                    
                        
                        {renderRequiredLabel('Phone Number', 'userMobile')}
                        <TextField 
                            id="userMobile" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.userMobile}
                            helperText={fieldErrors.userMobile}
                            required 
                        />
                        
                        <InputLabel className="mb-1 mt-5">Backup Phone Number</InputLabel>
                        <TextField id="alternateMobile" fullWidth variant="outlined" onChange={handleChange} />
                        
                        {renderRequiredLabel('Email', 'userEmail')}
                        <TextField 
                            id="userEmail" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            type="email" 
                            error={!!fieldErrors.userEmail}
                            helperText={fieldErrors.userEmail}
                            required 
                        />
                        
                        {renderRequiredLabel('Enter New Password', 'password')}
                        <TextField 
                            id="password" 
                            type="password" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.password}
                            helperText={fieldErrors.password}
                            required 
                        />                                        
                    </div>

                    {/* Second Column */}
                    <div className="space-y-2 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        {renderRequiredLabel('Confirm Password', 'retypePassword')}
                        <TextField 
                            id="retypePassword" 
                            type="password" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.retypePassword}
                            helperText={fieldErrors.retypePassword}
                            required 
                        />   
                        
                        {renderRequiredLabel('City', 'city')}
                        <TextField 
                            id="city" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.city}
                            helperText={fieldErrors.city}
                            required 
                        />
                        
                        {renderRequiredLabel('Area', 'area')}
                        <TextField 
                            id="area" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.area}
                            helperText={fieldErrors.area}
                            required 
                        />                    
                        
                        {renderRequiredLabel('Street', 'street')}
                        <TextField 
                            id="street" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.street}
                            helperText={fieldErrors.street}
                            required 
                        />
                        
                        <InputLabel className="mb-1 mt-5">Address</InputLabel>
                        <TextField id="address" fullWidth variant="outlined" onChange={handleChange} />                                                        
                        
                        {renderRequiredLabel('Pincode', 'pincode')}
                        <TextField 
                            id="pincode" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.pincode}
                            helperText={fieldErrors.pincode}
                            required 
                        />
                        
                        <InputLabel className="mb-1 mt-5">Landmark</InputLabel>
                        <TextField id="landmark" fullWidth variant="outlined" onChange={handleChange} />
                    </div>

                    {/* Third Column: Interactive Google Map */}
                    <div className="space-y-2 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        {renderRequiredLabel('State', 'state')}
                        <TextField 
                            id="state" 
                            fullWidth 
                            variant="outlined" 
                            onChange={handleChange} 
                            error={!!fieldErrors.state}
                            helperText={fieldErrors.state}
                            required 
                        />
                        
                        {renderRequiredLabel('Drop Pin on Map to Set Location', 'location')}
                        <InputLabel 
                            className="mb-3"
                            style={{ 
                                border: '1px solid #ccc',
                                padding: '16.5px 14px',
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                                minHeight: '56px',
                                display: 'flex',
                                alignItems: 'center',
                                color: (fieldErrors.location || fieldErrors.googleMapLocation) ? 'red' : 'inherit',
                                borderColor: (fieldErrors.location || fieldErrors.googleMapLocation) ? 'red' : '#ccc'
                            }}
                        >
                            {formData.location || "Pinned location will appear here"}
                        </InputLabel>
                        {(fieldErrors.location || fieldErrors.googleMapLocation) && (
                            <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}>
                                {fieldErrors.location || fieldErrors.googleMapLocation}
                            </div>
                        )}

                        <div className="w-full h-125 rounded-lg overflow-hidden shadow-lg border border-gray-200 mt-3">
                            <div ref={mapRef} className="w-full h-full"></div>
                        </div>
                    </div>

                    {/* Button Section */}
                    <div className="container mx-auto p-2 flex flex-wrap justify-center gap-4">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                        <Button variant="outlined" color="secondary" disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}