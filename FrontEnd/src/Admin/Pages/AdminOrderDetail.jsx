import React, { useEffect, useState } from 'react';
import NavigationBox from '../Components/NavigationBox';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}));

export default function AdminOrderDetail() {
  const [orders, setOrders] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  console.log(orders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/admin/orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching order centres:', error);
      }
    };
    fetchOrders();
  }, []);

  const getStatusChip = (status) => {
    const colorMap = {
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'error',
    };
    return (
      <Chip
        label={status || 'Unknown'}
        color={colorMap[status] || 'default'}
        size="small"
        sx={{ minWidth: 90 }}
      />
    );
  };

  return (
    <NavigationBox>      
      <Box
        sx={{
          p: { xs: 2, sm: 4, lg: 6 },    
          marginTop: '20px',      
          minHeight: '100vh',
          bgcolor: '#f9fafb',
          maxWidth: '1600px',
          mx: 'auto',
        }}
      >
        {/* Page Title */}
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight="bold"
          textAlign="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 5 }}
        >
          Order Management
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          View and track all customer orders across delivery centres.
        </Typography>

        {/* Responsive Table */}
        <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
          <TableContainer sx={{ maxHeight: { xs: '65vh', sm: '70vh', lg: '75vh' } }}>
            <Table stickyHeader aria-label="orders table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Order ID</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Customer ID</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Order Date</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Status</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Delivery Day</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Total Amount</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Actual Total</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Delivery Centre</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" color="text.secondary">
                        No orders found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow
                      key={order.order_ID}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 'medium' }}>
                        {order.order_ID}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {order.userID}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(order.currentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(order.deliveryProcess)}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(order.currentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 'medium' }}>
                        ₹{order.grandTotal?.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 'medium' }}>
                        ₹{order.actual_grandTotal?.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {order.deliveryProcess}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </NavigationBox>
  );
}