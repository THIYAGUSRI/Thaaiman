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
  Link,
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

export default function AdminDeliveryCentre() {
  const [deliveryCentres, setDeliveryCentres] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchDeliveryCentres = async () => {
      try {
        const response = await fetch('/deliverycentres');
        const data = await response.json();
        setDeliveryCentres(data);
      } catch (error) {
        console.error('Error fetching delivery centres:', error);
      }
    };
    fetchDeliveryCentres();
  }, []);

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
          Delivery Centre Management
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          View all registered delivery centres and their details.
        </Typography>

        {/* Responsive Table */}
        <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
          <TableContainer sx={{ maxHeight: { xs: '65vh', sm: '70vh', lg: '75vh' } }}>
            <Table stickyHeader aria-label="delivery centres table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Centre ID</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Centre Name</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>User Name</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Contact Number</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>User Email</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Address</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Location</StyledTableCell>
                  <StyledTableCell align={isMobile ? 'left' : 'center'}>Is Active</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryCentres.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" color="text.secondary">
                        No delivery centres found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveryCentres.map((centre) => (
                    <TableRow
                      key={centre.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {centre.id}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 'medium' }}>
                        {centre.deliveryCenterName}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {centre.userName}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {centre.userMobile}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                        {centre.userEmail}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {centre.address}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={centre.location}
                          target="_blank"
                          rel="noopener"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'underline',
                            '&:hover': { color: 'error.main' },
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          View Location
                        </Link>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={centre.availability === 'Active' ? 'Yes' : 'No'}
                          color={centre.availability === 'Active' ? 'success' : 'default'}
                          size="small"
                          sx={{ minWidth: 70 }}
                        />
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