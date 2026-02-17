import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "../Components/Common Components/Header";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import CommentSection from "../Components/Common Components/CommentSection";

export default function VideoDetail() {
  const { id } = useParams(); 
  const location = useLocation(); 
  const [video, setVideo] = useState(location.state?.video || null);
  const [loading, setLoading] = useState(!location.state?.video); 
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false); // ✅ added for description expand/collapse

  useEffect(() => {
    if (!video) {
      const fetchVideo = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/videodetail/${id}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setVideo(data.video);
        } catch (err) {
          console.error("Error fetching video detail:", err);
          setError("Failed to load video details.");
        } finally {
          setLoading(false);
        }
      };
      fetchVideo();
    }
  }, [id, video]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg">Loading video...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!video) return <div className="flex justify-center items-center min-h-screen">Video not found</div>;

  const words = video.description?.split(" ") || [];
  const shortDescription = words.slice(0, 104).join(" ");

  const getYouTubeEmbedUrl = (preview) => {
        if (!preview) return 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1'; // Fallback to a default YouTube video
        // Extract video ID from YouTube URL or use directly if it's an ID
        const videoId = preview.includes('youtube.com') 
            ? preview.split('v=')[1]?.split('&')[0] 
            : preview.includes('youtu.be') 
            ? preview.split('/').pop().split('?')[0] 
            : preview;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&unmute=1`;
    };

  return (
    <div>
      <Header />
      <div className="flex flex-col sm:flex-row mx-15 mt-30">
        <div className="w-[97%] sm:w-[66%] max-w-[1200px] mx-4 my-4 py-7">
          <div className="relative w-full pb-[56.25%] mb-4 ">
            <iframe src={getYouTubeEmbedUrl(video.preview)} controls className="absolute top-0 left-0 w-full h-full object-cover rounded-3xl" allowFullScreen></iframe>
          </div>
          {/* AppBar section remains unchanged */}
          <AppBar position="static" sx={{ backgroundColor: 'transparent', marginBottom: 2, color: 'black', boxShadow: 'none' }}>
            <Container maxWidth="xl">
              <Toolbar disableGutters>
                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip>
                    <IconButton sx={{ p: 0 }}>
                      <Avatar alt="Memy Sharp" src="/static/images/avatar/2.jpg" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="h6"
                  noWrap
                  component="a"
                  href="#app-bar-with-responsive-menu"
                  sx={{
                    mr: 2,
                    display: 'flex',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                    paddingLeft: 1,
                    textTransform: 'uppercase'
                  }}
                >
                  {video.userName}
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: { md: 'flex-end' } }}>
                  <Button sx={{ my: 2, color: 'black', display: 'block', fontSize: { xs: 9, md: 'body1.fontSize' } }}>
                    {new Date(video.date).toLocaleDateString()}
                  </Button>
                  <Button sx={{ my: 2, color: 'black', display: 'block', fontSize: { xs: 9, md: 'body1.fontSize' } }}>
                    <FavoriteBorderIcon sx={{ fontSize: { xs: 9, md: 'body1.fontSize' } }} /> {video.likes.length || 0}
                  </Button>
                  <Button sx={{ my: 2, color: 'black', display: 'block', fontSize: { xs: 10, md: 'body1.fontSize' } }}>
                    <ShareIcon sx={{ fontSize: { xs: 10, md: 'body1.fontSize' } }} />
                  </Button>
                </Box>
              </Toolbar>
            </Container>
          </AppBar>

          <div className="px-10">
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            <p className="text-gray-700 text-justify">
              {expanded ? video.description : shortDescription + (words.length > 104 ? "..." : "")}
            </p>
            {words.length > 104 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 mt-2 font-semibold hover:underline"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-11.5 mb-4 w-full sm:w-auto sm:flex-1 max-h-233 overflow-y-auto">
          <CommentSection videoID={video.id} />
        </div>
      </div>
    </div>
  );
}
