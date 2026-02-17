import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure, signoutSuccess } from '../../redux/user/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Container,
    Grid,
} from '@mui/material';

export default function DeliverySignIn() {
    const [formData, setFormData] = useState({
        userEmail: '',
        password: '',
    });
    const { currentUser, loading, error } = useSelector((state) => state.user);
    console.log(currentUser);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(signInStart());

        try {
            const response = await fetch('/deliverycentrelogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            console.log('Login response:', data);
            console.log('id from response data:', data.deliveryCentre?.id);
            console.log('Response status:', response.status);
            console.log('Response ok?', response.ok);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to sign in');
            }

            console.log('Dispatching user data:', data);

            dispatch(signInSuccess(data));
            navigate('/deliveryhome');
        } catch (err) {
            console.error('Login error:', err);
            dispatch(signInFailure(err.message));
        }
    };

    const handleSignOut = () => {
        dispatch(signoutSuccess());
        setFormData({
            userEmail: '',
            password: '',
        });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >

            <Container maxWidth="sm">
                <Paper
                    elevation={12}
                    sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        bgcolor: 'background.paper',
                    }}
                >
                    {/* Header Section */}
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textAlign: 'center',
                            py: 6,
                            px: 4,
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Delivery Centre Login
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Sign in to manage your deliveries
                        </Typography>
                    </Box>

                    {/* Form Section */}
                    <Box sx={{ p: { xs: 4, sm: 6 } }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="userEmail"
                                        type="email"
                                        placeholder="delivery@centre.com"
                                        value={formData.userEmail}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        variant="outlined"
                                        InputProps={{
                                            sx: { borderRadius: 2 },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        variant="outlined"
                                        InputProps={{
                                            sx: { borderRadius: 2 },
                                        }}
                                    />
                                </Grid>

                                {error && (
                                    <Grid item xs={12}>
                                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                                            {error}
                                        </Alert>
                                    </Grid>
                                )}

                                <Grid item xs={12} >
                                    <Button
                                        type="submit"
                                        fullWidth
                                        disabled={loading}
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            py: 1.8,
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                            },
                                            '&:disabled': {
                                                opacity: 0.7,
                                            },
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                                Signing In...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>                                    
                                </Grid>
                            </Grid>
                        </form>
                        <div>
                            <h3 className='font-extrabold text-lg mt-10 text-center mb-10'>Or</h3>
                        </div>
                        {/* Sign Up Link */}
                        <Link to="/deliverysignup" style={{ textDecoration: 'none' }}>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            disabled={loading}
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                py: 1.8,
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                background: 'linear-gradient(135deg, #67eea 0%, #764ba2 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                                },
                                                '&:disabled': {
                                                    opacity: 0.7,
                                                },
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                                    Signing up...
                                                </>
                                            ) : (
                                                'Sign Up'
                                            )}
                                        </Button>
                                    </Link>
                        {/* Footer Note */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mt: 4 }}
                        >
                            Secure Delivery Centre Portal • © 2026
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}