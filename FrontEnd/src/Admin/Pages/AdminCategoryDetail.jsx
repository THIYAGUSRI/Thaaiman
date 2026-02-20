import React, { useEffect, useState } from 'react';
import NavigationBox from '../Components/NavigationBox';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
  Modal,
  Box,
  Button,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';

// Styled Table Cell
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}));

// Modal Style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 3, sm: 4 },
  borderRadius: 3,
  textAlign: 'center',
};

export default function AdminCategoryDetail() {
  const [categorys, setCategorys] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch('/categorys', {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCategorys(data);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategory();
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

  const handleOpenModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategoryId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/deletecategory/${selectedCategoryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id }),
      });

      if (response.ok) {
        setCategorys(categorys.filter((category) => category.id !== selectedCategoryId));
        handleCloseModal();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete category:', errorData.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // If not admin
  if (!currentUser?.isAdmin) {
    return (
      <NavigationBox>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <AdminHeader />
          <div className="text-center p-8">
            <Typography variant="h5" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You are not authorized to view this page. Only Admins can access category management.
            </Typography>
          </div>
        </div>
      </NavigationBox>
    );
  }

  return (
    <NavigationBox>
      <div className="min-h-screen w-full bg-gray-50">
        {/* Main Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mx-auto mt-10 mb-6 text-center max-w-2xl">
            <Typography variant="h4" className="font-bold text-gray-800">
              Category Management
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mt-2">
              View, edit, and manage all categories in your system.
            </Typography>
          </div>

          {/* Responsive Table Container */}
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: { xs: '70vh', lg: '80vh' } }}>
              <Table stickyHeader aria-label="category table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell>Image</StyledTableCell>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell align="center">Status</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categorys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          No categories found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categorys.map((category) => (
                      <TableRow
                        key={category.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{category.id}</TableCell>
                        <TableCell>
                          <img
                            src={getImageUrl(category.image)}
                            alt={category.categoryName || 'Category'}
                            style={{
                              width: isMobile ? 40 : 60,
                              height: isMobile ? 40 : 60,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '1px solid #e0e0e0',
                            }}
                            onError={(e) => {
                              e.target.src = '/Uploads/no-image.png';
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {category.categoryName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={category.active ? 'Active' : 'Inactive'}
                            color={category.active ? 'success' : 'default'}
                            size="small"
                            sx={{ minWidth: 80 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Category" arrow>
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/admineditcategory/${category.id}`)}
                            >
                              <EditNoteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Category" arrow>
                            <IconButton
                              color="error"
                              onClick={() => handleOpenModal(category.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" gutterBottom>
              Confirm Deletion
            </Typography>
            <Typography sx={{ mt: 2, mb: 4 }} color="text.secondary">
              Are you sure you want to delete this category? This action <strong>cannot be undone</strong>.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" size="large" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="contained" color="error" size="large" onClick={handleDelete}>
                Delete Category
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </NavigationBox>
  );
}