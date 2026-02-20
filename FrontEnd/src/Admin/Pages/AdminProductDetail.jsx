import React, { useEffect, useState } from 'react';
import NavigationBox from '../Components/NavigationBox';
import { useSelector } from 'react-redux';
import { Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Tooltip, IconButton, Modal, Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

// Define StyledTableCell
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[200],
  padding: theme.spacing(2),
}));

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function AdminProductDetail() {
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/products', {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('ProductDetail.js: Product details fetched:', data);
          setProducts(data);
        } else {
          console.error('Failed to fetch product details:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    fetchProducts();
  }, []);

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

  const handleOpenModal = (productId) => {
    setSelectedProductId(productId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProductId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/productdelete/${selectedProductId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setProducts(products.filter((product) => product.prod_ID !== selectedProductId));
        console.log('Product deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete product:', errorData.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      handleCloseModal();
    }
  };

  return (
    <NavigationBox>
      <div>        
        {currentUser?.isAdmin ? (
          <div className='mx-auto mt-10 p-4 min-h-screen'>
            <h1 className="text-2xl font-bold mb-4">Product Details</h1>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Product ID</StyledTableCell>
                    <StyledTableCell>Product Image</StyledTableCell>
                    <StyledTableCell>Product Name</StyledTableCell>
                    <StyledTableCell>Edit</StyledTableCell>
                    <StyledTableCell>Delete</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.prod_ID}>
                      <TableCell>{product.prod_ID}</TableCell>
                      <TableCell>
                        <img
                          src={getImageUrl(
                            product.prod_Images && product.prod_Images[0]?.image
                              ? product.prod_Images[0].image
                              : 'default-image.jpg'
                          )}
                          alt={product.prod_Name || 'Product Image'}
                          style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = '/Uploads/no-image.png';
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <h2>{product.prod_Name}</h2>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit" arrow>
                          <IconButton onClick={() => navigate(`/admineditproduct/${product.prod_ID}`)}>
                            <EditNoteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete" arrow>
                          <IconButton onClick={() => handleOpenModal(product.prod_ID)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Delete Confirmation Modal */}
            <Modal
              open={openModal}
              onClose={handleCloseModal}
              aria-labelledby="delete-confirmation-modal"
              aria-describedby="delete-confirmation-modal-description"
            >
              <Box sx={modalStyle}>
                <Typography id="delete-confirmation-modal" variant="h6" component="h2">
                  Confirm Deletion
                </Typography>
                <Typography id="delete-confirmation-modal-description" sx={{ mt: 2 }}>
                  Are you sure you want to delete this product? This action cannot be undone.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="error" onClick={handleDelete}>
                    Delete
                  </Button>
                </Box>
              </Box>
            </Modal>
          </div>
        ) : (
          <div className="text-center text-red-600">
            <p>You are not an Admin. Only Admins can access this page.</p>
          </div>
        )}
      </div>
    </NavigationBox>
  );
}