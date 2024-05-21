import React, { useState, useEffect, useRef, memo , useCallback} from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import './ChatRoom.css'
import './LoginHeader'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LoginHeader from './LoginHeader';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import RetrospectService from '../Service/RetrospectService';
import Typography from '@mui/material/Typography';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
// import Fab from '@mui/material/Fab';
// import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import OptionsMenu from './OptionsMenu';
import LeadingClickAway from './LeadingClickAway';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));


const MessageSection = memo(({ title, messages, inputValue, onInputChange, onSendMessage, onDeleteMessage }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    const handleOptionsClick = (event, messageId) => {
        setAnchorEl(event.currentTarget);
        setSelectedMessageId(messageId);
    };

    const handleOptionsClose = () => {
        setAnchorEl(null);
        setSelectedMessageId(null);
    };

    const handleDelete = async () => {
        try {
            if (selectedMessageId) {
                await RetrospectService.deleteMessageById(selectedMessageId);
                console.log('Message deleted successfully');
                onDeleteMessage(selectedMessageId); // remove message from state
                // setAnchorEl(null);
                handleOptionsClose();
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };
    

    return (
        <div className="message-section">
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <h3 className='title'>{title}</h3>
                <AddCircleOutlineRoundedIcon style={{marginTop: '8%'}}/>
            </div>
            
            <div className="messages">
                {messages.map((msg) => (
                    <>
                    <div key={msg.id} className={`${getClassName(msg.contentType)} message`}>
                        <p className='message-text'><span className='username' style={{fontWeight: 'bold'}}>{msg.username}:</span> {msg.content}</p>
                        <img src='../Asserts/options.png' alt='options' height='20vh' className="options-image" onClick={(event) => handleOptionsClick(event,msg.id)} style={{cursor: 'pointer'}}/>
                        <OptionsMenu anchorEl={anchorEl} onClose={handleOptionsClose} onDelete={handleDelete}/>
                    </div>
                    </>
                ))}
            </div>

            <div className="input-area">
                <textarea
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={`Type your ${title} message here...`}
                    rows="3"
                />
                <button className="send-button" onClick={onSendMessage}>+</button>
            </div>
        </div>
    );
});


// Helper function to determine the class based on message type
function getClassName(contentType) {
  switch (contentType) {
    case 'Good':
      return 'good-message';
    case 'Bad':
      return 'bad-message';
    case 'Pos':
      return 'pos-message';
    case 'Blunder':
      return 'blunder-message';
    default:
      return '';
  }
}


function ChatRoom() {
    const { roomId } = useParams();
    const username = localStorage.getItem('userName');
    const [room, setRoom] = useState([]);
    // const [messageData, setMessageData] = useState([]);
    const [goodMessages, setGoodMessages] = useState([]);
    const [badMessages, setBadMessages] = useState([]);
    const [posMessages, setPosMessages] = useState([]);
    const [blunderMessages, setBlunderMessages] = useState([]);
    const [open, setOpen] = useState(false);
    const [messageInputs, setMessageInputs] = useState({
        Good: '',
        Bad: '',
        Pos: '',
        Blunder: ''
    });

    // Using useRef to manage the socket instance
    const socketRef = useRef(null);



    useEffect(() => {
        // Initialize socket only once
        if (!socketRef.current) {
            const socketUrl = `http://192.168.0.43:8085?room=${roomId}&username=${username}`;
            socketRef.current = io(socketUrl, { transports: ['websocket'], upgrade: false });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
            });

            socketRef.current.on('receive_message', (data) => {
                console.log('Received message from server:', data);
                switch (data.contentType) {
                    case 'Good':
                        setGoodMessages(prev => [...prev, data]);
                        break;
                    case 'Bad':
                        setBadMessages(prev => [...prev, data]);
                        break;
                    case 'Pos':
                        setPosMessages(prev => [...prev, data]);
                        break;
                    case 'Blunder':
                        setBlunderMessages(prev => [...prev, data]);
                        break;
                    default:
                        break;
                }
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket disconnected');
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Socket disconnected on cleanup');
                socketRef.current = null;
            }
        };
    }, [roomId, username]); // Dependencies to recreate the socket if these change

    const fetchRoom = useCallback(async () => {
        try {
            const response = await RetrospectService.getRoomById(roomId);
            setRoom(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    }, [roomId]);

    useEffect(() => {
        fetchRoom();
    }, [fetchRoom]);

    // Fetch messages on mount
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:8080/message/${roomId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const messages = await response.json();

                // Categorize messages based on their contentType
                const good = [];
                const bad = [];
                const pos = [];
                const blunder = [];
                messages.forEach(msg => {
                    switch (msg.contentType) {
                        case 'Good':
                            good.push(msg);
                            break;
                        case 'Bad':
                            bad.push(msg);
                            break;
                        case 'Pos':
                            pos.push(msg);
                            break;
                        case 'Blunder':
                            blunder.push(msg);
                            break;
                        default:
                            break;
                    }
                });

                // Update state with fetched messages
                setGoodMessages(good);
                setBadMessages(bad);
                setPosMessages(pos);
                setBlunderMessages(blunder);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        fetchMessages();
    }, [roomId]); // Dependency on roomId ensures this runs if roomId changes

    const handleInputChange = (value, category) => {
        setMessageInputs(prev => ({ ...prev, [category]: value }));
    };

    const handleSendMessage = (category) => {
        if (socketRef.current && messageInputs[category].trim()) {
            const messageContent = messageInputs[category];
            socketRef.current.emit('message', { content: messageContent, contentType: category, room: roomId, username });
            handleInputChange('', category); // Clear input after sending
        }
    };

    const handleDeleteMessage = (messageId) => {
        setGoodMessages(prev => prev.filter(msg => msg.id !== messageId));
        setBadMessages(prev => prev.filter(msg => msg.id !== messageId));
        setPosMessages(prev => prev.filter(msg => msg.id !== messageId));
        setBlunderMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleClickOpen = () => {
        setOpen(true);
      };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
        <div>
        <LoginHeader/>
        </div>

        <div className='belowheader'>
            <p className='roomname'>{room.roomName}</p>

            <LeadingClickAway/>

            <InfoOutlinedIcon style={{margin: '2%', cursor: 'pointer'}} onClick={handleClickOpen}/>
            <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
             Room Details
            </DialogTitle>
            <IconButton aria-label="close" onClick={handleClose}
            sx={{position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
          <CloseIcon/>
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
            Room Id: {room.roomId}
          </Typography>
          <Typography gutterBottom>
            Room Name: {room.roomName}
          </Typography>
          <Typography gutterBottom>
            Room Description: {room.roomDescription}
          </Typography>
        </DialogContent>
        </BootstrapDialog>
        </div>
        <div className="container">
            <div className="chat-area">
                <MessageSection
                    title="What Went Good"
                    messages={goodMessages}
                    inputValue={messageInputs.Good}
                    onInputChange={(value) => handleInputChange(value, 'Good')}
                    onSendMessage={() => handleSendMessage('Good')}
                    onDeleteMessage={handleDeleteMessage}
                />
                <MessageSection
                    title="What Went Wrong"
                    messages={badMessages}
                    inputValue={messageInputs.Bad}
                    onInputChange={(value) => handleInputChange(value, 'Bad')}
                    onSendMessage={() => handleSendMessage('Bad')}
                    onDeleteMessage={handleDeleteMessage}
                />
                <MessageSection
                    title="Positives"
                    messages={posMessages}
                    inputValue={messageInputs.Pos}
                    onInputChange={(value) => handleInputChange(value, 'Pos')}
                    onSendMessage={() => handleSendMessage('Pos')}
                    onDeleteMessage={handleDeleteMessage}
                />
                <MessageSection
                    title="Blunders"
                    messages={blunderMessages}
                    inputValue={messageInputs.Blunder}
                    onInputChange={(value) => handleInputChange(value, 'Blunder')}
                    onSendMessage={() => handleSendMessage('Blunder')}
                    onDeleteMessage={handleDeleteMessage}
                />
            </div>
        </div>
        </>
    );
}

export default ChatRoom;


