import React from 'react'
import AdminHeader from '../Components/AdminHeader'
import NavigationBox from '../Components/NavigationBox'
import { useState } from 'react';
import { useEffect } from 'react';
import { CalendarToday, LocationOn } from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import { Backdrop, Box, Button, Fade, Modal } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function AdminEventDetail() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.id;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  console.log(events);
  useEffect(() => {
    try {
      const fetchEvent = async () => {
        const response = await fetch('/events')
        const data = await response.json();
        setEvents(data);
      }
      fetchEvent();
    } catch (error) {
      setError(error);
      console.error('Error fetching events:', error);
    }
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

  const handleDelete = (eventId) => {
    // Implement delete functionality here
    console.log(`Delete event with ID: ${eventId}`);
    // Call API to delete the event
    fetch(`/deleteevent/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
      .then((response) => {
        if (response.ok) {
          setEvents(events.filter((event) => event.id !== eventId));
          console.log(`Event with ID ${eventId} deleted successfully.`);
          handleClose();
        } else {
          console.error('Error deleting event:', response.statusText);
        }
      })
      .catch((error) => {
        console.error('Error deleting event:', error);
      });
  }

  return (
    <NavigationBox>
      <div>        
        <div className='flex flex-wrap justify-center mt-10 mb-8'>
          {events && events.map((event) => (
            <>
              <div key={event.id} className="w-120 rounded-4xl shadow-2xl m-4">
                <div>
                  <img src={getImageUrl(event.images[0])} alt={event.title} />
                </div>
                <div>
                  <h2 className='font-bold text-xl uppercase pl-8 pr-8 pb-4'>{event.title}</h2>
                  <div className='flex flex-row justify-around mb-4'>
                    <h4><CalendarToday />{event.startDate}</h4>
                    <h4><LocationOn />{event.location}</h4>
                  </div>
                  <p className='pl-8 pr-8 mb-4'><DescriptionIcon />{event.description.length > 100 ? event.description.slice(0, 100) + '...' : event.description}</p>
                </div>
                <div className='flex flex-row justify-between pb-2 pl-8 pr-8'>
                  <Link to={`/admineditevent/${event.id}`}><Button>Edit</Button></Link>
                  <Button onClick={handleOpen}>Delete</Button>
                </div>
              </div>
              <Modal open={open} className="flex items-center justify-center bg-white h-40 w-100 border-2 m-auto" onClose={handleClose} closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                  backdrop: {
                    timeout: 500,
                  },
                }}>
                <Fade in={open}>
                  <Box sx={style}>
                    <div className="p-4">
                      <h2 className="text-lg font-bold mb-2">Confirm Deletion</h2>
                      <p>Are you sure you want to delete this event?</p>
                      <div className="flex justify-end mt-4">
                        <Button onClick={handleClose} color="primary">Cancel</Button>
                        <Button onClick={() => handleDelete(event.id)} color="secondary">Delete</Button>
                      </div>
                    </div>
                  </Box>
                </Fade>
              </Modal>
            </>
          ))}
        </div>
      </div>
    </NavigationBox>
  )
}
