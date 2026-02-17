import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    IconButton,
    Collapse,
} from '@mui/material';
import {
    Reply as ReplyIcon,
    Send as SendIcon,
    ExpandMore as ExpandMoreIcon,
    EditNote as EditNoteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

// Styled components
const CommentCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
}));

const ReplyCard = styled(Card)(({ theme }) => ({
    marginLeft: theme.spacing(4),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: '8px',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: '20px',
    padding: '8px 20px',
    textTransform: 'none',
    fontWeight: 'bold',
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const ExpandableSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: '8px',
    marginTop: theme.spacing(1),
}));

export default function CommentSection({ videoID }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyRating, setReplyRating] = useState(0);
    const [expandedComments, setExpandedComments] = useState({});
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editRating, setEditRating] = useState(0);

    const currentUser = useSelector((state) => state.user.currentUser);
    const userId = currentUser?.user?.userID;

    // Fetch comments when videoID changes
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`/comments/${videoID}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Organize comments and replies
                const mainComments = data.comments.filter(comment => !comment.recommentID || comment.recommentID === null);
                const replies = data.comments.filter(comment => comment.recommentID && comment.recommentID !== null);

                // Add replies to their parent comments
                const commentsWithReplies = mainComments.map(comment => ({
                    ...comment,
                    replies: replies.filter(reply => reply.recommentID === comment.id)
                }));

                setComments(commentsWithReplies || []);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [videoID]);

    // Handle main comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert('Please log in to comment');
            return;
        }
        if (!newComment.trim()) {
            alert('Comment content cannot be empty');
            return;
        }
        if (rating === 0) {
            alert('Please provide a rating');
            return;
        }

        try {
            const response = await fetch('/createcomment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID: userId,
                    videoID: videoID,
                    content: newComment.trim(),
                    rating: Number(rating),
                    recommentID: null, // Align with server expectation
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const data = await response.json();
            setComments([...comments, { ...data.comment, replies: [] }]);
            setNewComment('');
            setRating(0);
        } catch (error) {
            console.error('Error adding comment:', error);
            alert(`Failed to add comment: ${error.message}`);
        }
    };

    // Handle reply submission
    const handleReplySubmit = async (id) => {
        if (!userId) {
            alert('Please log in to reply');
            return;
        }
        if (!replyContent.trim()) {
            alert('Reply content cannot be empty');
            return;
        }

        try {
            const response = await fetch('/createcomment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID: userId,
                    videoID: videoID,
                    content: replyContent.trim(),
                    rating: Number(replyRating),
                    recommentID: id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const data = await response.json();
            // Update the comments with the new reply
            const updatedComments = comments.map(comment => {
                if (comment.id === id) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), data.comment]
                    };
                }
                return comment;
            });

            setComments(updatedComments);
            setReplyContent('');
            setReplyRating(0);
            setReplyingTo(null);
        } catch (error) {
            console.error('Error adding reply:', error);
            alert(`Failed to add reply: ${error.message}`);
        }
    };

    // Handle comment update
    const handleUpdateComment = async (id, isReply = false) => {
        if (!editContent.trim()) {
            alert('Comment content cannot be empty');
            return;
        }

        try {
            const response = await fetch(`/updatecomment/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editContent.trim(),
                    rating: Number(editRating),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
            }

            const data = await response.json();

            if (isReply) {
                // Update reply in the comments state
                const updatedComments = comments.map(comment => {
                    if (comment.replies && comment.replies.some(reply => reply.id === id)) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply.id === id ? data.comment : reply
                            )
                        };
                    }
                    return comment;
                });
                setComments(updatedComments);
            } else {
                // Update main comment, preserving replies
                const updatedComments = comments.map(comment =>
                    comment.id === id ? { ...data.comment, replies: comment.replies || [] } : comment
                );
                setComments(updatedComments);
            }

            setEditingComment(null);
            setEditContent('');
            setEditRating(0);
        } catch (error) {
            console.error('Error updating comment:', error);
            alert(`Failed to update comment: ${error.message}`);
        }
    };

    // Start editing a comment
    const startEditing = (comment, isReply = false) => {
        setEditingComment({ id: comment.id, isReply });
        setEditContent(comment.content);
        setEditRating(comment.rating || 0);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingComment(null);
        setEditContent('');
        setEditRating(0);
    };

    // Toggle reply section for a comment
    const toggleReply = (id) => {
        if (replyingTo === id) {
            setReplyingTo(null);
        } else {
            setReplyingTo(id);
        }
        setReplyContent('');
        setReplyRating(0);
    };

    // Toggle expanded view for a comment (to show replies)
    const toggleExpanded = (id) => {
        setExpandedComments(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Comments ({comments.length})
            </Typography>

            {userId ? (
                <>
                    {/* New Comment Form */}
                    <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Add a Comment
                            </Typography>
                            <Box component="form" onSubmit={handleCommentSubmit}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" sx={{ mr: 1, color: 'black', fontWeight: 'bold', fontSize: '1rem' }}>
                                        Rate this video<span className='text-red-700 font-bold text-xl'>*</span> :
                                    </Typography>
                                    <Rating
                                        value={rating}
                                        onChange={(event, newValue) => {
                                            setRating(newValue || 0); // Handle null case
                                        }}
                                        onDoubleClick={() => setRating(0)}
                                    />
                                    {rating > 0 && (
                                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                                            ({rating}/5)
                                        </Typography>
                                    )}
                                </Box>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />
                                <SubmitButton
                                    type="submit"
                                    variant="contained"
                                    disabled={!newComment.trim() || rating === 0}
                                    startIcon={<SendIcon />}
                                >
                                    Post Comment
                                </SubmitButton>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Comments List */}
                    {comments.length === 0 ? (
                        <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            No comments yet. Be the first to share your thoughts!
                        </Typography>
                    ) : (
                        <Box>
                            {comments.map((comment) => (
                                <React.Fragment key={comment.id}>
                                    <CommentCard>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                    {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            {comment.userName || 'Anonymous User'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(comment.createdAt || new Date())}
                                                        </Typography>
                                                    </Box>

                                                    {editingComment && editingComment.id === comment.id && !editingComment.isReply ? (
                                                        <>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                                    Rate this video:
                                                                </Typography>
                                                                <Rating
                                                                    value={editRating}
                                                                    onChange={(event, newValue) => {
                                                                        setEditRating(newValue || 0);
                                                                    }}
                                                                />
                                                            </Box>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                variant="outlined"
                                                                sx={{ mb: 2 }}
                                                            />
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() => handleUpdateComment(comment.id, false)}
                                                                    disabled={!editContent.trim()}
                                                                    startIcon={<SaveIcon />}
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={cancelEditing}
                                                                    startIcon={<CancelIcon />}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </Box>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Rating value={comment.rating || 0} readOnly size="small" sx={{ my: 0.5 }} />
                                                            <Typography variant="body1" paragraph>
                                                                {comment.content}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Button
                                                                    size="small"
                                                                    startIcon={<ReplyIcon />}
                                                                    onClick={() => toggleReply(comment.id)}
                                                                >
                                                                    Reply
                                                                </Button>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => startEditing(comment, false)}
                                                                    sx={{ ml: 1, borderRadius: 0 }}
                                                                >
                                                                    <EditNoteIcon /> Edit
                                                                </IconButton>
                                                                {(comment.replies && comment.replies.length > 0) && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                        <Button
                                                                            size="small"
                                                                            onClick={() => toggleExpanded(comment.id)}
                                                                        >
                                                                            {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                                                                        </Button>
                                                                        <ExpandButton
                                                                            size="small"
                                                                            onClick={() => toggleExpanded(comment.id)}
                                                                            style={{
                                                                                transform: expandedComments[comment.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                            }}
                                                                            aria-label="expand replies"
                                                                        >
                                                                            <ExpandMoreIcon />
                                                                        </ExpandButton>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                        {/* Reply Form */}
                                        {replyingTo === comment.id && (
                                            <ExpandableSection>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Replying to {comment.userName || 'Anonymous User'}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Write your reply..."
                                                    variant="outlined"
                                                    sx={{ mb: 2 }}
                                                />
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleReplySubmit(comment.id)}
                                                        disabled={!replyContent.trim()}
                                                        startIcon={<SendIcon />}
                                                    >
                                                        Post Reply
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => setReplyingTo(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </ExpandableSection>
                                        )}

                                        {/* Replies */}
                                        <Collapse in={expandedComments[comment.id]}>
                                            <Box>
                                                {comment.replies && comment.replies.map((reply) => (
                                                    <ReplyCard key={reply.id}>
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                                <Avatar sx={{ mr: 2, bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                                                    {reply.userName ? reply.userName.charAt(0).toUpperCase() : 'U'}
                                                                </Avatar>
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                                            {reply.userName || 'Anonymous User'}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {formatDate(reply.createdAt || new Date())}
                                                                        </Typography>
                                                                    </Box>

                                                                    {editingComment && editingComment.id === reply.id && editingComment.isReply ? (
                                                                        <>
                                                                            <TextField
                                                                                fullWidth
                                                                                multiline
                                                                                rows={2}
                                                                                value={editContent}
                                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                                variant="outlined"
                                                                                sx={{ mb: 2, mt: 1 }}
                                                                            />
                                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    onClick={() => handleUpdateComment(reply.id, true)}
                                                                                    disabled={!editContent.trim()}
                                                                                    startIcon={<SaveIcon />}
                                                                                >
                                                                                    Save
                                                                                </Button>
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    onClick={cancelEditing}
                                                                                    startIcon={<CancelIcon />}
                                                                                >
                                                                                    Cancel
                                                                                </Button>
                                                                            </Box>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Typography variant="body2">
                                                                                {reply.content}
                                                                            </Typography>
                                                                            <Button
                                                                                size="small"
                                                                                startIcon={<EditNoteIcon />}
                                                                                onClick={() => startEditing(reply, true)}
                                                                                sx={{ mt: 1 }}
                                                                            >
                                                                                Edit
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </ReplyCard>
                                                ))}
                                            </Box>
                                        </Collapse>
                                    </CommentCard>
                                </React.Fragment>
                            ))}
                        </Box>
                    )}
                </>
            ) : (
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Join the Conversation
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Please log in to view and add comments.
                    </Typography>
                    <Button variant="contained" color="primary">
                        Log In
                    </Button>
                </Card>
            )}
        </Box>
    );
}