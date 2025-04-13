import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardActions, CardContent, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, IconButton, List, ListItem,
  ListItemIcon, ListItemText, Menu, MenuItem, Paper, TextField, Tooltip,
  Typography, Chip, LinearProgress
} from '@mui/material';
import {
  Description, Folder, Share, MoreVert, Delete, Edit, GetApp,
  AccessTime, Person, Add, InsertDriveFile, CreateNewFolder, 
  PictureAsPdf, Image, InsertChart, Code, Lock, LockOpen
} from '@mui/icons-material';

// Types for document management
type DocumentType = 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'code' | 'other';
type PermissionLevel = 'view' | 'comment' | 'edit';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface DocumentPermission {
  userId: string;
  level: PermissionLevel;
}

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  folderId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  permissions: DocumentPermission[];
  tags: string[];
  description?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: Date;
  permissions: DocumentPermission[];
}

// Mock data
const currentUser: User = { id: 'user1', name: 'John Doe' };

const mockUsers: User[] = [
  currentUser,
  { id: 'user2', name: 'Jane Smith' },
  { id: 'user3', name: 'Robert Johnson' },
  { id: 'user4', name: 'Emily Davis' }
];

const mockFolders: Folder[] = [
  {
    id: 'folder1',
    name: 'Interview Documents',
    parentId: null,
    createdBy: 'user1',
    createdAt: new Date(2023, 5, 15),
    permissions: [{ userId: 'user1', level: 'edit' }]
  },
  {
    id: 'folder2',
    name: 'Candidate Assessments',
    parentId: null,
    createdBy: 'user2',
    createdAt: new Date(2023, 6, 10),
    permissions: [
      { userId: 'user1', level: 'edit' },
      { userId: 'user2', level: 'edit' }
    ]
  }
];

const mockDocuments: Document[] = [
  {
    id: 'doc1',
    name: 'Interview Script Template.docx',
    type: 'doc',
    folderId: 'folder1',
    createdBy: 'user1',
    createdAt: new Date(2023, 5, 20),
    updatedAt: new Date(2023, 5, 25),
    size: 256000,
    permissions: [
      { userId: 'user1', level: 'edit' },
      { userId: 'user2', level: 'view' }
    ],
    tags: ['template', 'interview'],
    description: 'Standard script for structured interviews'
  },
  {
    id: 'doc2',
    name: 'Technical Assessment Rubric.pdf',
    type: 'pdf',
    folderId: 'folder2',
    createdBy: 'user2',
    createdAt: new Date(2023, 6, 12),
    updatedAt: new Date(2023, 6, 15),
    size: 512000,
    permissions: [
      { userId: 'user1', level: 'edit' },
      { userId: 'user2', level: 'edit' },
      { userId: 'user3', level: 'view' }
    ],
    tags: ['rubric', 'assessment', 'technical'],
    description: 'Scoring criteria for technical interviews'
  },
  {
    id: 'doc3',
    name: 'Behavioral Questions Guide.pdf',
    type: 'pdf',
    folderId: 'folder1',
    createdBy: 'user1',
    createdAt: new Date(2023, 7, 5),
    updatedAt: new Date(2023, 7, 5),
    size: 384000,
    permissions: [
      { userId: 'user1', level: 'edit' },
      { userId: 'user2', level: 'comment' },
      { userId: 'user3', level: 'view' }
    ],
    tags: ['behavioral', 'questions', 'guide'],
    description: 'Guide for conducting behavioral interviews'
  }
];

// Helper functions
const getDocumentIcon = (type: DocumentType) => {
  switch (type) {
    case 'pdf': return <PictureAsPdf />;
    case 'doc': return <Description />;
    case 'image': return <Image />;
    case 'spreadsheet': return <InsertChart />;
    case 'code': return <Code />;
    default: return <InsertDriveFile />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

interface DocumentSharingProps {
  candidateId?: string;
  jobId?: string;
  teamId?: string;
}

const DocumentSharing: React.FC<DocumentSharingProps> = ({ candidateId, jobId, teamId }) => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [selectedItem, setSelectedItem] = useState<Document | Folder | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Dialog states
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [userToShare, setUserToShare] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('view');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileDetailDialogOpen, setFileDetailDialogOpen] = useState(false);

  // Filter documents and folders based on current folder
  const filteredDocuments = documents.filter(doc => doc.folderId === currentFolder);
  const filteredFolders = folders.filter(folder => folder.parentId === currentFolder);
  
  // Breadcrumb navigation
  const getBreadcrumbPath = () => {
    if (!currentFolder) return [{ id: null, name: 'Root' }];
    
    const path = [{ id: null, name: 'Root' }];
    let current = folders.find(f => f.id === currentFolder);
    
    if (current) {
      path.push({ id: current.id, name: current.name });
      
      while (current && current.parentId) {
        const parent = folders.find(f => f.id === current?.parentId);
        if (parent) {
          path.unshift({ id: parent.id, name: parent.name });
          current = parent;
        } else {
          break;
        }
      }
    }
    
    return path;
  };

  // Handle menu opening
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Document | Folder) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  // Handle menu closing
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle folder navigation
  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  // Handle file upload
  const handleFileUpload = () => {
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Create new document
        const newDoc: Document = {
          id: `doc${documents.length + 1}`,
          name: `Uploaded Document ${new Date().toISOString()}.pdf`,
          type: 'pdf',
          folderId: currentFolder,
          createdBy: currentUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 256000 + Math.floor(Math.random() * 1000000),
          permissions: [{ userId: currentUser.id, level: 'edit' }],
          tags: ['uploaded'],
          description: 'Recently uploaded document'
        };
        
        setDocuments([...documents, newDoc]);
        setIsUploading(false);
      }
    }, 300);
  };

  // Handle new folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: `folder${folders.length + 1}`,
        name: newFolderName,
        parentId: currentFolder,
        createdBy: currentUser.id,
        createdAt: new Date(),
        permissions: [{ userId: currentUser.id, level: 'edit' }]
      };
      
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  // Handle sharing
  const handleShare = () => {
    if (selectedItem && userToShare) {
      if ('folderId' in selectedItem) { // It's a document
        const updatedDocs = documents.map(doc => {
          if (doc.id === selectedItem.id) {
            // Remove existing permission for this user if it exists
            const filteredPermissions = doc.permissions.filter(p => p.userId !== userToShare);
            
            return {
              ...doc,
              permissions: [
                ...filteredPermissions,
                { userId: userToShare, level: permissionLevel }
              ]
            };
          }
          return doc;
        });
        
        setDocuments(updatedDocs);
      } else { // It's a folder
        const updatedFolders = folders.map(folder => {
          if (folder.id === selectedItem.id) {
            // Remove existing permission for this user if it exists
            const filteredPermissions = folder.permissions.filter(p => p.userId !== userToShare);
            
            return {
              ...folder,
              permissions: [
                ...filteredPermissions,
                { userId: userToShare, level: permissionLevel }
              ]
            };
          }
          return folder;
        });
        
        setFolders(updatedFolders);
      }
      
      setShareDialogOpen(false);
      setUserToShare('');
      setPermissionLevel('view');
    }
  };

  // Handle deletion
  const handleDelete = () => {
    if (selectedItem) {
      if ('folderId' in selectedItem) { // It's a document
        setDocuments(documents.filter(doc => doc.id !== selectedItem.id));
      } else { // It's a folder
        // Delete folder and all its contents recursively
        const folderIdsToDelete = new Set<string>();
        
        // Function to collect all folder IDs to delete
        const collectFolderIds = (folderId: string) => {
          folderIdsToDelete.add(folderId);
          
          // Find child folders
          const childFolders = folders.filter(f => f.parentId === folderId);
          childFolders.forEach(child => collectFolderIds(child.id));
        };
        
        collectFolderIds(selectedItem.id);
        
        // Filter out deleted folders and their documents
        setFolders(folders.filter(folder => !folderIdsToDelete.has(folder.id)));
        setDocuments(documents.filter(doc => !doc.folderId || !folderIdsToDelete.has(doc.folderId)));
      }
      
      setDeleteDialogOpen(false);
    }
  };

  // Render document or folder item
  const renderItem = (item: Document | Folder) => {
    const isDocument = 'folderId' in item;
    const icon = isDocument ? getDocumentIcon((item as Document).type) : <Folder />;
    
    const getPermissionIcon = () => {
      const userPermission = isDocument 
        ? (item as Document).permissions.find(p => p.userId === currentUser.id)
        : (item as Folder).permissions.find(p => p.userId === currentUser.id);
        
      return userPermission?.level === 'edit' ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />;
    };
    
    return (
      <Card
        variant="outlined"
        sx={{
          mb: 1,
          '&:hover': { boxShadow: 2 },
          cursor: isDocument ? 'default' : 'pointer'
        }}
        onClick={isDocument ? undefined : () => navigateToFolder((item as Folder).id)}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <ListItemIcon sx={{ minWidth: 40 }}>
              {icon}
            </ListItemIcon>
            <Box flexGrow={1} overflow="hidden">
              <Typography variant="subtitle1" noWrap>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {isDocument ? (
                  <>
                    {formatFileSize((item as Document).size)} • 
                    Updated {formatDate((item as Document).updatedAt)}
                  </>
                ) : (
                  <>Created {formatDate((item as Folder).createdAt)}</>
                )}
              </Typography>
            </Box>
            <Tooltip title={`You have ${
              isDocument 
                ? (item as Document).permissions.find(p => p.userId === currentUser.id)?.level
                : (item as Folder).permissions.find(p => p.userId === currentUser.id)?.level
            } permission`}>
              <Box ml={1}>{getPermissionIcon()}</Box>
            </Tooltip>
          </Box>
          {isDocument && (item as Document).tags.length > 0 && (
            <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
              {(item as Document).tags.map(tag => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Tooltip title="Share">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
                setShareDialogOpen(true);
              }}
            >
              <Share fontSize="small" />
            </IconButton>
          </Tooltip>
          {isDocument && (
            <Tooltip title="Download">
              <IconButton size="small">
                <GetApp fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Box flexGrow={1} />
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, item);
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Document Sharing</Typography>
        <Box>
          <Button 
            startIcon={<CreateNewFolder />}
            variant="outlined"
            size="small"
            onClick={() => setNewFolderDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            New Folder
          </Button>
          <Button 
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={handleFileUpload}
            disabled={isUploading}
          >
            Upload File
          </Button>
        </Box>
      </Box>
      
      {/* Breadcrumb navigation */}
      <Box mb={2} display="flex" alignItems="center">
        {getBreadcrumbPath().map((item, index, arr) => (
          <React.Fragment key={index}>
            <Button
              variant="text"
              size="small"
              onClick={() => navigateToFolder(item.id)}
              sx={{ textTransform: 'none' }}
            >
              {item.name}
            </Button>
            {index < arr.length - 1 && (
              <Typography variant="body2" sx={{ mx: 0.5 }}>/</Typography>
            )}
          </React.Fragment>
        ))}
      </Box>
      
      {/* Upload progress indicator */}
      {isUploading && (
        <Box mb={2}>
          <Typography variant="body2" mb={1}>
            Uploading file... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
      
      {/* Empty state */}
      {filteredFolders.length === 0 && filteredDocuments.length === 0 && !isUploading && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={4}
        >
          <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">No documents here yet</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Upload files or create a new folder to get started
          </Typography>
          <Box display="flex" gap={1}>
            <Button 
              startIcon={<CreateNewFolder />}
              variant="outlined"
              onClick={() => setNewFolderDialogOpen(true)}
            >
              New Folder
            </Button>
            <Button 
              startIcon={<Add />}
              variant="contained"
              onClick={handleFileUpload}
            >
              Upload File
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Folders grid */}
      {filteredFolders.length > 0 && (
        <>
          <Typography variant="subtitle1" mb={1}>Folders</Typography>
          <Grid container spacing={2} mb={2}>
            {filteredFolders.map(folder => (
              <Grid item xs={12} sm={6} md={4} key={folder.id}>
                {renderItem(folder)}
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Documents grid */}
      {filteredDocuments.length > 0 && (
        <>
          <Typography variant="subtitle1" mb={1}>Documents</Typography>
          <Grid container spacing={2}>
            {filteredDocuments.map(doc => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                {renderItem(doc)}
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            if (selectedItem && 'folderId' in selectedItem) {
              setFileDetailDialogOpen(true);
            }
            handleMenuClose();
          }}
          disabled={selectedItem && !('folderId' in selectedItem)}
        >
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setShareDialogOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setDeleteDialogOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* New folder dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Share dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share with Team Member</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" mb={1}>
            {selectedItem?.name}
          </Typography>
          <TextField
            select
            label="Team Member"
            fullWidth
            margin="dense"
            value={userToShare}
            onChange={(e) => setUserToShare(e.target.value)}
          >
            {mockUsers.filter(u => u.id !== currentUser.id).map(user => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Permission"
            fullWidth
            margin="dense"
            value={permissionLevel}
            onChange={(e) => setPermissionLevel(e.target.value as PermissionLevel)}
          >
            <MenuItem value="view">View only</MenuItem>
            <MenuItem value="comment">Can comment</MenuItem>
            <MenuItem value="edit">Can edit</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShare} variant="contained">Share</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedItem?.name}"?
            {selectedItem && !('folderId' in selectedItem) && (
              <Box mt={1}>
                <Typography color="error">
                  This will also delete all files and folders inside this folder.
                </Typography>
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* File details dialog */}
      {selectedItem && 'folderId' in selectedItem && (
        <Dialog 
          open={fileDetailDialogOpen} 
          onClose={() => setFileDetailDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>File Details</DialogTitle>
          <DialogContent>
            <Box display="flex" alignItems="center" mb={2}>
              {getDocumentIcon((selectedItem as Document).type)}
              <Typography variant="h6" ml={1}>
                {selectedItem.name}
              </Typography>
            </Box>
            
            <Typography variant="body2" mb={1}>
              <strong>Type:</strong> {(selectedItem as Document).type.toUpperCase()}
            </Typography>
            
            <Typography variant="body2" mb={1}>
              <strong>Size:</strong> {formatFileSize((selectedItem as Document).size)}
            </Typography>
            
            <Typography variant="body2" mb={1}>
              <strong>Created:</strong> {formatDate((selectedItem as Document).createdAt)} by {
                mockUsers.find(u => u.id === selectedItem.createdBy)?.name || 'Unknown'
              }
            </Typography>
            
            <Typography variant="body2" mb={1}>
              <strong>Last modified:</strong> {formatDate((selectedItem as Document).updatedAt)}
            </Typography>
            
            <Typography variant="body2" mb={1}>
              <strong>Description:</strong> {(selectedItem as Document).description || 'No description'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" mb={1}>Shared with</Typography>
            <List dense>
              {(selectedItem as Document).permissions.map(permission => {
                const user = mockUsers.find(u => u.id === permission.userId);
                return (
                  <ListItem key={permission.userId}>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary={user?.name || 'Unknown user'}
                      secondary={`Can ${permission.level}`}
                    />
                  </ListItem>
                );
              })}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" mb={1}>Tags</Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {(selectedItem as Document).tags.map(tag => (
                <Chip key={tag} label={tag} />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFileDetailDialogOpen(false)}>Close</Button>
            <Button variant="contained" startIcon={<GetApp />}>
              Download
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default DocumentSharing; 