import React, { useState, useRef, useEffect, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
    Box, TextField, Button, Typography, Paper,
    Avatar, CircularProgress, IconButton,
    List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import Zoom from '@mui/material/Zoom';

import UserService from '../services/UserService';
import { AuthContext } from '../context/AuthContext';
const VITE_API_URL = import.meta.env.VITE_API_URL;
const CHAT_API_URL = `${VITE_API_URL}/chat`;

const AIChatbot = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const currentUserId = user?.id;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (currentUserId) {
                try {
                    const history = await UserService.getChatHistory();
                    if (history && history.length > 0) {
                        setMessages(history);
                    } else {
                        setMessages([
                            { question: null, answer: 'Xin chào! Tôi là AI tư vấn về linh kiện máy tính. Bạn cần tìm sản phẩm gì hay có câu hỏi kỹ thuật nào không?', timestamp: new Date() }
                        ]);
                    }
                } catch (error) {
                    console.error("Lỗi khi tải lịch sử chat:", error);
                    setMessages([
                        { question: null, answer: 'Xin chào! Tôi là AI tư vấn về linh kiện máy tính. Bạn cần tìm sản phẩm gì hay có câu hỏi kỹ thuật nào không?', timestamp: new Date() }
                    ]);
                }
            } else {
                setMessages([
                    { question: null, answer: 'Xin chào! Tôi là AI tư vấn về linh kiện máy tính. Bạn cần tìm sản phẩm gì hay có câu hỏi kỹ thuật nào không?', timestamp: new Date() }
                ]);
            }
        };

        fetchChatHistory();
    }, [currentUserId]);

    const sendMessage = async () => {
        if (input.trim() === '' || loading) return;

        const userQuestion = input.trim();
        const newMessageEntry = { question: userQuestion, answer: null, timestamp: new Date() };
        setMessages((prevMessages) => [...prevMessages, newMessageEntry]);
        setInput('');
        setLoading(true);

        try {
            const messagesForAI = messages.flatMap(entry => {
                const msgs = [];
                if (entry.question) {
                    msgs.push({ role: 'user', content: entry.question });
                }
                if (entry.answer) {
                    msgs.push({ role: 'assistant', content: entry.answer });
                }
                return msgs;
            });
            messagesForAI.push({ role: 'user', content: userQuestion });

            const response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: messagesForAI }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Lỗi khi kết nối đến AI.');
            }

            const data = await response.json();
            const assistantAnswer = data.reply;

            // Cập nhật answer cho entry cuối cùng trong state
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                const lastEntryIndex = updatedMessages.length - 1;
                if (updatedMessages[lastEntryIndex].question === userQuestion && updatedMessages[lastEntryIndex].answer === null) {
                    updatedMessages[lastEntryIndex].answer = assistantAnswer;
                    updatedMessages[lastEntryIndex].timestamp = new Date();
                } else {
                    updatedMessages.push({ question: userQuestion, answer: assistantAnswer, timestamp: new Date() });
                }
                return updatedMessages;
            });
            if (currentUserId) {
                try {
                    await UserService.saveChatHistory({
                        question: userQuestion,
                        answer: assistantAnswer,
                        timestamp: new Date()
                    });
                } catch (error) {
                    console.error("Lỗi khi lưu cặp chat vào lịch sử:", error);
                }
            }

        } catch (error) {
            console.error("Lỗi gửi tin nhắn đến chatbot:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { question: userQuestion, answer: `Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. (${error.message || 'Lỗi không xác định'})`, timestamp: new Date() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Zoom in={true} timeout={800}>
        <Paper
            elevation={5}
            sx={{
                position: 'fixed',
                bottom: { xs: 80, md: 30 },
                right: { xs: 20, md: 30 },
                width: { xs: '90%', sm: 350, md: 400 },
                height: { xs: '70%', sm: 500, md: 550 },
                maxHeight: '75vh',
                maxWidth: '60vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                zIndex: 1000,
                boxShadow: '0px 0px 15px rgba(0,0,0,0.2)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    bgcolor: '#328E6E',
                    color: 'white',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold'}}>
                    <SmartToyIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} /> Trợ lý Techzone
                </Typography>
                <IconButton onClick={onClose} color="inherit" size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <List
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    bgcolor: '#f5f5f5',
                    p: 1.5,
                }}
            >
                {/* Duyệt qua các cặp Q&A và render từng tin nhắn */}
                {messages.map((entry, index) => (
                    <React.Fragment key={index}>
                        {entry.question && (
                            <ListItem
                                sx={{
                                justifyContent: 'flex-end',
                                px: 0,
                                py: 0.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'flex-end',
                                        gap: '4px',
                                        maxWidth: '80%',
                                    }}
                                >
                                    <Paper
                                        elevation={1}
                                        sx={{
                                        p: 1.2,
                                        wordBreak: 'break-word',
                                        borderRadius: '15px',
                                        bgcolor: '#e0f7fa',
                                        textAlign: 'left',
                                        }}
                                    >
                                        <Typography variant="body2" component="div">
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{entry.question}</ReactMarkdown>
                                        </Typography>
                                    </Paper>
                                    <Avatar sx={{ bgcolor: '#1976d2', width: 28, height: 28 }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                </Box>
                            </ListItem>
                        )}

                        {entry.answer && (
                            <ListItem
                                sx={{
                                justifyContent: 'flex-start',
                                px: 0,
                                py: 0.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'flex-end',
                                        gap: '4px',
                                        maxWidth: '80%',
                                    }}
                                >
                                <Avatar sx={{ bgcolor: '#328E6E', width: 28, height: 28 }}>
                                    <SmartToyIcon fontSize="small" />
                                </Avatar>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.2,
                                        wordBreak: 'break-word',
                                        borderRadius: '15px',
                                        bgcolor: '#ffffff',
                                        textAlign: 'left',
                                    }}
                                >
                                    <Typography variant="body2" component="div">
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{entry.answer}</ReactMarkdown>
                                    </Typography>
                                </Paper>
                            </Box>
                        </ListItem>
                        )}
                    </React.Fragment>
                ))}

                {loading && (
                    <ListItem sx={{ justifyContent: 'flex-start', mb: 1, px: 0, py: 0.5 }}>
                        <ListItemAvatar sx={{ mr: 0.5 }}>
                            <Avatar sx={{ bgcolor: '#328E6E', width: 28, height: 28 }}>
                                <SmartToyIcon fontSize="small" />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Paper elevation={1} sx={{ p: 1.2, borderRadius: '15px', bgcolor: '#ffffff' }}>
                                    <CircularProgress size={16} sx={{ mr: 0.5 }} />
                                    <Typography variant="caption" component="span">Đang soạn câu trả lời...</Typography>
                                </Paper>
                            }
                        />
                    </ListItem>
                )}
                <div ref={messagesEndRef} />
            </List>

            <Box sx={{ p: 1.5, borderTop: '1px solid #eee', display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    sx={{
                        '& fieldset': { borderRadius: '25px' },
                    }}
                />
                <Button
                    variant="contained"
                    endIcon={<SendIcon fontSize="small" />}
                    onClick={sendMessage}
                    disabled={loading || input.trim() === ''}
                    sx={{
                        borderRadius: '25px',
                        bgcolor: '#328E6E',
                        '&:hover': { bgcolor: '#1B5E20' },
                        minWidth: 'auto',
                        px: 2,
                        py: 1
                    }}
                >
                    Gửi
                </Button>
            </Box>
        </Paper>
        </Zoom>
    );
};

export default AIChatbot;