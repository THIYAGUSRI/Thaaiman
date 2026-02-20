import { useState, useEffect, useRef } from 'react';
import NavigationBox from '../Components/NavigationBox'
import { Link, useNavigate } from 'react-router-dom';
import { Backdrop, Box, Button, Fade, Modal } from '@mui/material';
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
export default function AdminVideoDetail() {
    const [videos, setVideos] = useState([]);
    const [hoveredVideo, setHoveredVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hoverTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const response = await fetch('/videodetails');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                // Handle API shape
                setVideos(data.videos || data || []);
                setError(null);
            } catch (error) {
                console.error('Error fetching video data:', error);
                setError('Failed to load videos. Please check if the server is running.');
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const handleVideoHover = (videoId) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => setHoveredVideo(videoId), 500);
    };

    const handleVideoLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredVideo(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-lg">Loading videos...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-500 text-lg">{error}</div>;
    }

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

    const getYouTubeEmbedUrl = (preview) => {
        if (!preview) return 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1'; // Fallback to a default YouTube video
        // Extract video ID from YouTube URL or use directly if it's an ID
        const videoId = preview.includes('youtube.com')
            ? preview.split('v=')[1]?.split('&')[0]
            : preview.includes('youtu.be')
                ? preview.split('/').pop().split('?')[0]
                : preview;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    };

    const handleDelete = (videoId) => {
        // Call API to delete the video
        fetch(`/deletevideodetail/${videoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (response.ok) {
                    setVideos(videos.filter((video) => video.id !== videoId));
                    console.log(`Video with ID ${videoId} deleted successfully.`);
                    handleClose();
                } else {
                    console.error('Error deleting video:', response.statusText);
                }
            })
            .catch((error) => {
                console.error('Error deleting video:', error);
            });
    };

    return (
        <NavigationBox >
            <div>
                <div className="flex flex-col mt-10 min-h-screen font-roboto">
                    <div className="flex flex-1 overflow-hidden">
                        <main className="flex-1 overflow-y-auto p-6">
                            {videos.length === 0 ? (
                                <div className="text-center py-8 text-gray-600">No videos available</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-4">
                                    {videos.map((video) => (
                                        <div key={video.id}>
                                            <div
                                                key={video.id}
                                                className="cursor-pointer transition-transform duration-200 hover:scale-105"
                                                onMouseEnter={() => handleVideoHover(video.id)}
                                                onMouseLeave={handleVideoLeave}
                                            >
                                                <div className="relative mb-2 w-full pb-[56.25%] overflow-hidden rounded-xl">
                                                    {hoveredVideo === video.id ? (
                                                        <iframe
                                                            src={getYouTubeEmbedUrl(video.preview)}
                                                            className="absolute top-0 left-0 w-full h-full object-cover"
                                                            allow="autoplay; encrypted-media"
                                                            allowFullScreen
                                                            title={video.title}
                                                        ></iframe>
                                                    ) : (
                                                        <img
                                                            src={getImageUrl(video.thumbnail)}
                                                            alt={video.title}
                                                            className="absolute top-0 left-0 w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <h3 className="text-base font-medium mb-1 line-clamp-2 leading-tight">{video.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">{video.channel}</p>
                                                    <p className="text-sm text-gray-600 line-clamp-3">
                                                        {video.description && video.description.substring(0, 100)}...
                                                    </p>
                                                </div>
                                                <div className='flex flex-row justify-between pb-2 pl-8 pr-8 mt-2'>
                                                    <Link to={`/admineditvideo/${video.id}`}><Button>Edit</Button></Link>
                                                    <Button sx={{ bgcolor: 'red', color: 'white' }} onClick={handleOpen}>Delete</Button>
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
                                                            <p>Are you sure you want to delete this video?</p>
                                                            <div className="flex justify-end mt-4">
                                                                <Button onClick={handleClose} color="primary">Cancel</Button>
                                                                <Button onClick={() => handleDelete(video.id)} color="secondary">Delete</Button>
                                                            </div>
                                                        </div>
                                                    </Box>
                                                </Fade>
                                            </Modal>
                                        </div>
                                    ))}
                                </div>

                            )}
                        </main>
                    </div>
                </div>
            </div>
        </NavigationBox>
    )
}

