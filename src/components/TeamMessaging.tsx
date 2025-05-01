import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useCollaboration } from '../contexts/CollaborationContext';
import { TeamMember, Message } from '../models/types';
import { formatDistanceToNow, format } from 'date-fns';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface TeamMessagingProps {
  defaultConversationId?: string;
}

const TeamMessaging: React.FC<TeamMessagingProps> = ({ defaultConversationId }) => {
  const {
    messages,
    conversations,
    teamMembers,
    currentUser,
    getConversation,
    sendMessage,
    markMessageAsRead,
    createConversation,
    getTeamMemberById,
  } = useCollaboration();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    defaultConversationId || null
  );
  const [newMessage, setNewMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [mentionMenuAnchor, setMentionMenuAnchor] = useState<null | HTMLElement>(null);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [caretPosition, setCaretPosition] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load conversation messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      const convoMessages = getConversation(selectedConversation);
      setConversationMessages(convoMessages);

      // Mark unread messages as read
      convoMessages.forEach((msg) => {
        if (!msg.isRead && currentUser && msg.sender !== currentUser.id) {
          markMessageAsRead(msg.id);
        }
      });

      // Close the mobile drawer when conversation is selected
      if (isMobile) {
        setMobileDrawerOpen(false);
      }
    }
  }, [selectedConversation, getConversation, markMessageAsRead, currentUser, isMobile]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  const getUnreadMessageCount = (conversationId: string) => {
    return messages.filter(
      (msg) =>
        msg.conversationId === conversationId &&
        !msg.isRead &&
        currentUser &&
        msg.sender !== currentUser.id
    ).length;
  };

  const filteredConversations = conversations.filter((convo) =>
    convo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '' && selectedConversation && currentUser) {
      // Extract mentions from content
      const mentions = extractMentions(newMessage);

      sendMessage({
        conversationId: selectedConversation,
        content: newMessage,
        sender: currentUser.id,
        mentions,
      });

      // Refresh conversation messages
      setConversationMessages(getConversation(selectedConversation));
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenNewConversationDialog = () => {
    setNewConversationDialogOpen(true);
    setNewConversationTitle('');
    setSelectedParticipants(currentUser ? [currentUser.id] : []);
  };

  const handleCloseNewConversationDialog = () => {
    setNewConversationDialogOpen(false);
  };

  const handleCreateNewConversation = () => {
    if (newConversationTitle.trim() !== '' && selectedParticipants.length > 0) {
      const conversationId = createConversation(selectedParticipants, newConversationTitle);
      setSelectedConversation(conversationId);
      handleCloseNewConversationDialog();
    }
  };

  const handleParticipantChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedParticipants(typeof value === 'string' ? value.split(',') : value);
  };

  // Extract @mentions from content
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@user-\d+/g;
    const matches = content.match(mentionRegex);
    if (matches) {
      return matches.map((m) => m.substring(1)); // Remove the '@' symbol
    }
    return [];
  };

  // Monitor for @ symbol in input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    const cursorPosition = e.target.selectionStart || 0;
    setCaretPosition(cursorPosition);

    // Check if the last character typed was @
    if (value[cursorPosition - 1] === '@') {
      setMentionMenuAnchor(e.target);
      setMentionSearchTerm('');
    }
    // Continue showing the menu if we're in the middle of typing a mention
    else if (mentionMenuAnchor) {
      const textBeforeCursor = value.substring(0, cursorPosition);
      const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

      if (atSymbolIndex !== -1) {
        const searchTerm = textBeforeCursor.substring(atSymbolIndex + 1);
        if (searchTerm.match(/^[a-zA-Z0-9]*$/)) {
          setMentionSearchTerm(searchTerm);
        } else {
          setMentionMenuAnchor(null);
        }
      } else {
        setMentionMenuAnchor(null);
      }
    }
  };

  // Insert mention
  const insertMention = (memberId: string, memberName: string) => {
    const mention = `@${memberId}`;

    const beforeCursor = newMessage.substring(0, caretPosition);
    const atIndex = beforeCursor.lastIndexOf('@');

    const newText =
      beforeCursor.substring(0, atIndex) + mention + ' ' + newMessage.substring(caretPosition);

    setNewMessage(newText);
    setMentionMenuAnchor(null);

    // Focus back on input and set cursor position
    if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = atIndex + mention.length + 1;
          inputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  // Filter team members based on search term
  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(mentionSearchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(mentionSearchTerm.toLowerCase())
  );

  // Format message content with @mentions
  const formatMessageContent = (content: string) => {
    const parts = [];
    let lastIndex = 0;

    // Regular expression to find @user-X mentions
    const mentionRegex = /@(user-\d+)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add the mention as a chip
      const memberId = match[1];
      const member = getTeamMemberById(memberId);

      parts.push(
        <Chip
          key={`${match.index}-${memberId}`}
          size="small"
          avatar={<Avatar src={member?.avatar} alt={member?.name} />}
          label={member?.name || memberId}
          color="primary"
          variant="outlined"
          sx={{ mx: 0.5 }}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  // Get selected conversation participants as formatted string
  const getConversationParticipants = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return '';

    return conversation.participants
      .filter((p) => currentUser && p !== currentUser.id)
      .map((p) => {
        const member = getTeamMemberById(p);
        return member ? member.name : p;
      })
      .join(', ');
  };

  // Render the conversation list sidebar
  const renderConversationList = () => (
    <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Team Messages
        </Typography>

        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search conversations..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleOpenNewConversationDialog}
            aria-label="new conversation"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      <List sx={{ overflow: 'auto', maxHeight: 'calc(100% - 140px)' }}>
        {filteredConversations.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No conversations found"
              secondary="Try a different search term or create a new conversation"
              primaryTypographyProps={{ align: 'center' }}
              secondaryTypographyProps={{ align: 'center' }}
            />
          </ListItem>
        ) : (
          filteredConversations.map((conversation) => {
            const unreadCount = getUnreadMessageCount(conversation.id);
            const isSelected = selectedConversation === conversation.id;

            return (
              <ListItem
                key={conversation.id}
                button
                selected={isSelected}
                onClick={() => handleConversationSelect(conversation.id)}
                sx={{
                  bgcolor: isSelected ? 'action.selected' : 'inherit',
                  borderLeft: isSelected ? 4 : 0,
                  borderColor: 'primary.main',
                  pl: isSelected ? 1.5 : 2,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: unreadCount > 0 ? 700 : 400,
                          color: unreadCount > 0 ? 'text.primary' : 'inherit',
                        }}
                      >
                        {conversation.title}
                      </Typography>
                      {unreadCount > 0 && <Badge badgeContent={unreadCount} color="primary" />}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon
                        fontSize="small"
                        sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(conversation.lastActivity), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })
        )}
      </List>
    </Box>
  );

  // Render the active conversation
  const renderConversation = () => {
    if (!selectedConversation) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose an existing conversation or start a new one
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenNewConversationDialog}
              sx={{ mt: 2 }}
            >
              New Conversation
            </Button>
          </Box>
        </Box>
      );
    }

    const conversation = conversations.find((c) => c.id === selectedConversation);
    if (!conversation) return null;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {/* Conversation header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isMobile && (
            <IconButton edge="start" sx={{ mr: 1 }} onClick={() => setMobileDrawerOpen(true)}>
              <ArrowBackIcon />
            </IconButton>
          )}

          <Box>
            <Typography variant="h6">{conversation.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              With: {getConversationParticipants(selectedConversation)}
            </Typography>
          </Box>

          <Box sx={{ ml: 'auto' }}>
            <IconButton color="primary" size="small">
              <PersonAddIcon />
            </IconButton>
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Message list */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {conversationMessages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            conversationMessages.map((msg, index) => {
              const sender = getTeamMemberById(msg.sender);
              const isCurrentUser = currentUser && sender && sender.id === currentUser.id;
              const showSenderInfo =
                index === 0 || conversationMessages[index - 1].sender !== msg.sender;

              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    mb: 1,
                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  {!isCurrentUser && showSenderInfo && (
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar
                        src={sender?.avatar}
                        alt={sender?.name || 'User'}
                        sx={{ width: 32, height: 32 }}
                      />
                    </ListItemAvatar>
                  )}

                  <Box>
                    {showSenderInfo && (
                      <Box sx={{ display: 'flex', mb: 0.5, alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mr: 1, fontWeight: 500 }}
                        >
                          {isCurrentUser ? 'You' : sender?.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(msg.timestamp), 'h:mm a')}
                        </Typography>
                      </Box>
                    )}

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isCurrentUser ? 'primary.light' : 'background.paper',
                        color: isCurrentUser ? 'white' : 'text.primary',
                        ml: !isCurrentUser && !showSenderInfo ? 5 : 0,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="body2">{formatMessageContent(msg.content)}</Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messageEndRef} />
        </Box>

        {/* Message composer */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              multiline
              maxRows={4}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              disabled={!newMessage.trim()}
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render for mobile view
  if (isMobile) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '85%',
              maxWidth: 300,
            },
          }}
        >
          {renderConversationList()}
        </Drawer>

        {renderConversation()}

        {/* New conversation dialog */}
        <Dialog
          open={newConversationDialogOpen}
          onClose={handleCloseNewConversationDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>New Conversation</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Conversation Title"
              fullWidth
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth>
              <InputLabel id="participants-label">Participants</InputLabel>
              <Select
                labelId="participants-label"
                multiple
                value={selectedParticipants}
                onChange={handleParticipantChange}
                input={<OutlinedInput id="select-participants" label="Participants" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const member = getTeamMemberById(value);
                      return (
                        <Chip
                          key={value}
                          label={member?.name || value}
                          avatar={<Avatar src={member?.avatar} alt={member?.name} />}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {teamMembers.map((member) => (
                  <MenuItem
                    key={member.id}
                    value={member.id}
                    disabled={currentUser?.id === member.id} // Current user is always included
                  >
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    <ListItemText primary={member.name} secondary={member.role} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewConversationDialog}>Cancel</Button>
            <Button
              onClick={handleCreateNewConversation}
              disabled={!newConversationTitle.trim() || selectedParticipants.length === 0}
              variant="contained"
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Team member mention menu */}
        <Menu
          anchorEl={mentionMenuAnchor}
          open={Boolean(mentionMenuAnchor)}
          onClose={() => setMentionMenuAnchor(null)}
        >
          {filteredTeamMembers.length === 0 ? (
            <MenuItem disabled>No matching team members</MenuItem>
          ) : (
            filteredTeamMembers.map((member) => (
              <MenuItem key={member.id} onClick={() => insertMention(member.id, member.name)}>
                <Avatar
                  src={member.avatar}
                  alt={member.name}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                <ListItemText primary={member.name} secondary={member.role} />
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>
    );
  }

  // Render for desktop view
  return (
    <Paper sx={{ height: '600px', display: 'flex', overflow: 'hidden' }}>
      {renderConversationList()}
      {renderConversation()}

      {/* New conversation dialog */}
      <Dialog
        open={newConversationDialogOpen}
        onClose={handleCloseNewConversationDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Title"
            fullWidth
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel id="participants-label">Participants</InputLabel>
            <Select
              labelId="participants-label"
              multiple
              value={selectedParticipants}
              onChange={handleParticipantChange}
              input={<OutlinedInput id="select-participants" label="Participants" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const member = getTeamMemberById(value);
                    return (
                      <Chip
                        key={value}
                        label={member?.name || value}
                        avatar={<Avatar src={member?.avatar} alt={member?.name} />}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {teamMembers.map((member) => (
                <MenuItem
                  key={member.id}
                  value={member.id}
                  disabled={currentUser?.id === member.id} // Current user is always included
                >
                  <Avatar
                    src={member.avatar}
                    alt={member.name}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  <ListItemText primary={member.name} secondary={member.role} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewConversationDialog}>Cancel</Button>
          <Button
            onClick={handleCreateNewConversation}
            disabled={!newConversationTitle.trim() || selectedParticipants.length === 0}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team member mention menu */}
      <Menu
        anchorEl={mentionMenuAnchor}
        open={Boolean(mentionMenuAnchor)}
        onClose={() => setMentionMenuAnchor(null)}
      >
        {filteredTeamMembers.length === 0 ? (
          <MenuItem disabled>No matching team members</MenuItem>
        ) : (
          filteredTeamMembers.map((member) => (
            <MenuItem key={member.id} onClick={() => insertMention(member.id, member.name)}>
              <Avatar src={member.avatar} alt={member.name} sx={{ width: 24, height: 24, mr: 1 }} />
              <ListItemText primary={member.name} secondary={member.role} />
            </MenuItem>
          ))
        )}
      </Menu>
    </Paper>
  );
};

export default TeamMessaging;
