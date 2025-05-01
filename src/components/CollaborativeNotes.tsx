import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useCollaboration } from '../contexts/CollaborationContext';
import { CollaborativeNote, TeamMember } from '../models/types';
import { formatDistanceToNow } from 'date-fns';

interface CollaborativeNotesProps {
  candidateId: string;
  candidateName: string;
}

const CollaborativeNotes: React.FC<CollaborativeNotesProps> = ({ candidateId, candidateName }) => {
  const {
    getNotesByCandidate,
    addNote,
    updateNote,
    deleteNote,
    currentUser,
    getTeamMembers,
    getTeamMemberById,
  } = useCollaboration();

  const [notes, setNotes] = useState<CollaborativeNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingNote, setEditingNote] = useState<CollaborativeNote | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mentionMenuAnchor, setMentionMenuAnchor] = useState<null | HTMLElement>(null);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [caretPosition, setCaretPosition] = useState(0);
  const [mentionTarget, setMentionTarget] = useState<'new' | 'edit'>('new');
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const teamMembers = getTeamMembers();
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Load notes when candidateId changes
  useEffect(() => {
    if (candidateId) {
      setNotes(getNotesByCandidate(candidateId));
    }
  }, [candidateId, getNotesByCandidate]);

  // Handle note menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, noteId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNoteId(noteId);
  };

  // Handle note menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNoteId(null);
  };

  // Handle editing a note
  const handleEditNote = () => {
    handleMenuClose();
    const note = notes.find((n) => n.id === selectedNoteId);
    if (note) {
      setEditingNote(note);
      setEditContent(note.content);
    }
  };

  // Handle saving an edited note
  const handleSaveEdit = () => {
    if (editingNote && editContent.trim() !== '') {
      // Extract mentions from content
      const mentions = extractMentions(editContent);

      updateNote(editingNote.id, {
        content: editContent,
        mentions,
        isPrivate: editingNote.isPrivate,
      });

      // Refresh notes
      setNotes(getNotesByCandidate(candidateId));
      setEditingNote(null);
      setEditContent('');
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  // Handle deleting a note
  const handleDeleteNote = () => {
    handleMenuClose();
    if (selectedNoteId) {
      setNoteToDelete(selectedNoteId);
      setConfirmDeleteDialogOpen(true);
    }
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNotes(getNotesByCandidate(candidateId));
      setConfirmDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setConfirmDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  // Handle adding a new note
  const handleAddNote = () => {
    if (newNoteContent.trim() !== '' && currentUser) {
      // Extract mentions from content
      const mentions = extractMentions(newNoteContent);

      addNote({
        candidateId,
        content: newNoteContent,
        createdBy: currentUser.id,
        mentions,
        isPrivate,
      });

      // Refresh notes
      setNotes(getNotesByCandidate(candidateId));
      setNewNoteContent('');
      setIsPrivate(false);
    }
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: 'new' | 'edit'
  ) => {
    const value = e.target.value;

    if (type === 'new') {
      setNewNoteContent(value);
    } else {
      setEditContent(value);
    }

    const cursorPosition = e.target.selectionStart || 0;
    setCaretPosition(cursorPosition);

    // Check if the last character typed was @
    if (value[cursorPosition - 1] === '@') {
      setMentionTarget(type);
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

    if (mentionTarget === 'new') {
      const beforeCursor = newNoteContent.substring(0, caretPosition);
      const atIndex = beforeCursor.lastIndexOf('@');

      const newText =
        beforeCursor.substring(0, atIndex) +
        mention +
        ' ' +
        newNoteContent.substring(caretPosition);

      setNewNoteContent(newText);
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
    } else if (mentionTarget === 'edit') {
      const beforeCursor = editContent.substring(0, caretPosition);
      const atIndex = beforeCursor.lastIndexOf('@');

      const newText =
        beforeCursor.substring(0, atIndex) + mention + ' ' + editContent.substring(caretPosition);

      setEditContent(newText);
      setMentionMenuAnchor(null);

      // Focus back on input and set cursor position
      if (editInputRef.current) {
        editInputRef.current.focus();
        setTimeout(() => {
          if (editInputRef.current) {
            const newPosition = atIndex + mention.length + 1;
            editInputRef.current.setSelectionRange(newPosition, newPosition);
          }
        }, 0);
      }
    }
  };

  // Filter team members based on search term
  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(mentionSearchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(mentionSearchTerm.toLowerCase())
  );

  // Format note content with @mentions
  const formatNoteContent = (content: string) => {
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

  return (
    <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Notes for {candidateName}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Add a note about this candidate..."
          value={newNoteContent}
          onChange={(e) => handleInputChange(e, 'new')}
          inputRef={inputRef}
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                color="primary"
              />
            }
            label="Private note"
          />

          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleAddNote}
            disabled={!newNoteContent.trim()}
          >
            Add Note
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {notes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center">
          No notes yet. Be the first to add a note about this candidate.
        </Typography>
      ) : (
        <List>
          {notes.map((note) => {
            const author = getTeamMemberById(note.createdBy);

            return (
              <ListItem
                key={note.id}
                alignItems="flex-start"
                sx={{
                  mb: 1,
                  borderLeft: note.isPrivate ? '4px solid #f44336' : 'none',
                  bgcolor: note.isPrivate ? 'rgba(244, 67, 54, 0.08)' : 'inherit',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Avatar
                    src={author?.avatar}
                    alt={author?.name || 'User'}
                    sx={{ mr: 2, mt: 0.5 }}
                  />

                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" component="span">
                          {author?.name || 'Unknown User'}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                          sx={{ ml: 1 }}
                        >
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </Typography>

                        {note.isPrivate && (
                          <Chip
                            icon={<LockIcon />}
                            label="Private"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>

                      {/* Only show menu for notes created by current user */}
                      {currentUser && note.createdBy === currentUser.id && (
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, note.id)}
                            aria-label="note options"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>

                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedNoteId === note.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={handleEditNote}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} />
                              Edit
                            </MenuItem>
                            <MenuItem onClick={handleDeleteNote}>
                              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </Box>

                    {editingNote && editingNote.id === note.id ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          value={editContent}
                          onChange={(e) => handleInputChange(e, 'edit')}
                          inputRef={editInputRef}
                          sx={{ mb: 1 }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button size="small" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim()}
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {formatNoteContent(note.content)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}

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

      {/* Confirm delete dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this note? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CollaborativeNotes;
