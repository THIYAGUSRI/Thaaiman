import React, { useEffect, useState } from 'react';
import NavigationBox from '../Components/NavigationBox';
import {
  Box,
  Select,
  Typography,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Grid,
} from '@mui/material';

// 24-hour options for the time dropdown
const hourOptions = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
);

export default function AdminDeliveryDateTime() {
  const [deliveryDateTime, setDeliveryDateTime] = useState([]);
  const [selectedDays, setSelectedDays] = useState({});      // { id: array of selected day strings }
  const [lastDeliveryDays, setLastDeliveryDays] = useState({}); // { id: string }
  const [lastDeliveryTimes, setLastDeliveryTimes] = useState({}); // { id: string }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All possible weekdays – you can adjust this list
  const allWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchDeliveryDateTime = async () => {
      try {
        setLoading(true);
        const response = await fetch('/getdeliveryDateTime');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await response.json();
        setDeliveryDateTime(data);

        // Initialize state for each item
        const initialSelected = {};
        const initialLastDays = {};
        const initialLastTimes = {};
        data.forEach(item => {
          initialSelected[item.id] = item.deliveryDay || [];
          initialLastDays[item.id] = item.lastDeliveryDay || '';
          initialLastTimes[item.id] = item.lastDeliveryTime || '';
        });
        setSelectedDays(initialSelected);
        setLastDeliveryDays(initialLastDays);
        setLastDeliveryTimes(initialLastTimes);
        setError(null);
      } catch (error) {
        console.error('Error fetching delivery date and time:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryDateTime();
  }, []);

  const handleDayChange = (itemId, event) => {
    const { value } = event.target;
    setSelectedDays(prev => ({ ...prev, [itemId]: value }));
  };

  const handleLastDayChange = (itemId, value) => {
    setLastDeliveryDays(prev => ({ ...prev, [itemId]: value }));
  };

  const handleLastTimeChange = (itemId, value) => {
    setLastDeliveryTimes(prev => ({ ...prev, [itemId]: value }));
  };

  const handleUpdate = async (itemId) => {
    try {
      const updatedData = {
        deliveryDay: selectedDays[itemId] || [],
        lastDeliveryDay: lastDeliveryDays[itemId] || '',
        lastDeliveryTime: lastDeliveryTimes[itemId] || '',
      };

      const response = await fetch(`/editdeliverydatetime/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update successful', result);

      // Update local state to reflect changes
      setDeliveryDateTime(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, ...updatedData } : item
        )
      );

      alert('Entry updated successfully');
    } catch (err) {
      console.error('Error updating entry:', err);
      alert('Failed to update entry');
    }
  };

  if (loading) return <NavigationBox><div className="mt-30">Loading...</div></NavigationBox>;
  if (error) return <NavigationBox><div className="mt-30 text-red-500">Error: {error}</div></NavigationBox>;

  return (
    <NavigationBox>
      <div className="mt-30">
        <Typography variant="h4" gutterBottom>
          Admin Delivery Date/Time
        </Typography>

        {deliveryDateTime.length === 0 ? (
          <Typography>No data available</Typography>
        ) : (
          <Grid container spacing={3}>
            {deliveryDateTime.map((item) => (
              <Grid size={{ xs: 12 }} key={item.id}>
                <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Order ID: {item.id}
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Delivery Days Multi‑Select (with checkboxes) */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Delivery Days (select multiple)
                      </Typography>
                      <Select
                        multiple
                        value={selectedDays[item.id] || []}
                        onChange={(e) => handleDayChange(item.id, e)}
                        renderValue={(selected) => selected.join(', ')}
                        fullWidth
                        displayEmpty
                      >
                        {allWeekDays.map((day) => (
                          <MenuItem key={day} value={day}>
                            <Checkbox checked={selectedDays[item.id]?.indexOf(day) > -1} />
                            <ListItemText primary={day} />
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>

                    {/* Last Delivery Day Dropdown */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Last Delivery Day
                      </Typography>
                      <Select
                        value={lastDeliveryDays[item.id] || ''}
                        onChange={(e) => handleLastDayChange(item.id, e.target.value)}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="" disabled>Select a day</MenuItem>
                        {allWeekDays.map((day) => (
                          <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                      </Select>
                    </Grid>

                    {/* Last Delivery Time Dropdown (hourly steps) */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Last Delivery Time
                      </Typography>
                      <Select
                        value={lastDeliveryTimes[item.id] || ''}
                        onChange={(e) => handleLastTimeChange(item.id, e.target.value)}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="" disabled>Select a time</MenuItem>
                        {hourOptions.map((time) => (
                          <MenuItem key={time} value={time}>{time}</MenuItem>
                        ))}
                      </Select>
                    </Grid>

                    {/* Update Button */}
                    <Grid size={{ xs: 12 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdate(item.id)}
                      >
                        Save Changes
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </NavigationBox>
  );
}