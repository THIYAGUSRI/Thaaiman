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
  useTheme,
  useMediaQuery,
  TableSortLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}));

export default function AdminCustomerDetail() {
  const [cutomer, setCustomer] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  console.log(cutomer);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/users');
        const data = await response.json();
        setCustomer(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <NavigationBox>
      
      <Box
        sx={{
          p: { xs: 2, sm: 4, lg: 6 }, 
          marginTop: '20px',         
          minHeight: '100vh',
          bgcolor: '#f9fafb',
          maxWidth: '1400px',
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
          Customer Management
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          View all registered customers and their contact information.
        </Typography>

        {/* Responsive Table */}
        <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
          <TableContainer sx={{ maxHeight: { xs: '65vh', sm: '70vh', lg: '75vh' } }}>
            <Table stickyHeader aria-label="customer table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>
                    Name
                  </StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>
                    Email
                  </StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>
                    Mobile
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cutomer.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" color="text.secondary">
                        No customers found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cutomer.map((customer) => (
                    <TableRow
                      key={customer.userID}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          py: 2,
                            wordBreak: 'break-word',
                            textAlign: isMobile ? 'left' : 'center',
                        }}
                      >
                        <Typography fontWeight="medium">{customer.userName}</Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          wordBreak: 'break-word',
                            textAlign: isMobile ? 'left' : 'center',
                        }}
                      >
                        {customer.userEmail}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                            wordBreak: 'break-word',
                            textAlign: isMobile ? 'left' : 'center',
                        }}
                      >
                        {customer.userMobile}
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