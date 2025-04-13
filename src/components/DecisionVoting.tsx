import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Avatar,
  Stack,
  Chip,
  Card,
  CardContent,
  Grid,
  Switch,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Help as HelpIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  Info as InfoIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useCollaboration } from '../contexts/CollaborationContext';
import { TeamMember, DecisionVote } from '../models/types';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface DecisionVotingProps {
  candidateId: string;
  candidateName: string;
  position: string;
}

type Decision = 'hire' | 'reject' | 'consider' | 'need-more-info';

const DecisionVoting: React.FC<DecisionVotingProps> = ({ candidateId, candidateName, position }) => {
  const { 
    getVotesByCandidate, 
    castVote, 
    calculateVoteResult, 
    teamMembers, 
    currentUser,
    getTeamMemberById
  } = useCollaboration();
  
  const theme = useTheme();
  
  const [votes, setVotes] = useState<DecisionVote[]>([]);
  const [votingDialogOpen, setVotingDialogOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision>('hire');
  const [reasoning, setReasoning] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAllVotes, setShowAllVotes] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentUserVote, setCurrentUserVote] = useState<DecisionVote | null>(null);
  const [voteResult, setVoteResult] = useState<{
    hire: number;
    reject: number;
    consider: number;
    needMoreInfo: number;
    decision: 'hire' | 'reject' | 'consider' | 'need-more-info' | 'undecided';
  }>({
    hire: 0,
    reject: 0,
    consider: 0,
    needMoreInfo: 0,
    decision: 'undecided'
  });
  
  // Load votes when candidateId changes
  useEffect(() => {
    if (candidateId) {
      const candidateVotes = getVotesByCandidate(candidateId);
      setVotes(candidateVotes);
      
      // Check if current user has voted
      if (currentUser) {
        const userVote = candidateVotes.find(v => v.voterId === currentUser.id);
        setCurrentUserVote(userVote || null);
        
        // Set initial selected decision to user's existing vote
        if (userVote) {
          setSelectedDecision(userVote.decision);
          setReasoning(userVote.reasoning);
          setIsAnonymous(userVote.isAnonymous);
        }
      }
      
      // Calculate vote result
      setVoteResult(calculateVoteResult(candidateId));
    }
  }, [candidateId, getVotesByCandidate, currentUser, calculateVoteResult]);

  const handleOpenVotingDialog = () => {
    setVotingDialogOpen(true);
  };

  const handleCloseVotingDialog = () => {
    setVotingDialogOpen(false);
  };

  const handleDecisionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDecision(event.target.value as Decision);
  };

  const handleReasoningChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReasoning(event.target.value);
  };

  const handleAnonymousChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnonymous(event.target.checked);
  };

  const handleSubmitVote = () => {
    if (!currentUser) {
      setSnackbarMessage('You must be logged in to vote');
      setSnackbarOpen(true);
      return;
    }
    
    if (!reasoning.trim()) {
      setSnackbarMessage('Please provide your reasoning for this decision');
      setSnackbarOpen(true);
      return;
    }
    
    castVote({
      candidateId,
      voterId: currentUser.id,
      decision: selectedDecision,
      reasoning,
      isAnonymous
    });
    
    // Update local state
    setVotes(getVotesByCandidate(candidateId));
    setCurrentUserVote({
      id: 'temp-id', // This will be replaced by the real ID from the context
      candidateId,
      voterId: currentUser.id,
      decision: selectedDecision,
      reasoning,
      timestamp: new Date().toISOString(),
      isAnonymous
    });
    
    setVoteResult(calculateVoteResult(candidateId));
    setSnackbarMessage('Your vote has been recorded');
    setSnackbarOpen(true);
    handleCloseVotingDialog();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'hire':
        return <ThumbUpIcon color="success" />;
      case 'reject':
        return <ThumbDownIcon color="error" />;
      case 'consider':
        return <HourglassEmptyIcon color="warning" />;
      case 'need-more-info':
        return <HelpIcon color="info" />;
      default:
        return null;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'hire':
        return theme.palette.success.main;
      case 'reject':
        return theme.palette.error.main;
      case 'consider':
        return theme.palette.warning.main;
      case 'need-more-info':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getDecisionChip = (decision: Decision) => {
    let label: string;
    let color: 'success' | 'error' | 'warning' | 'info' | 'default';
    let icon: React.ReactElement;
    
    switch (decision) {
      case 'hire':
        label = 'Hire';
        color = 'success';
        icon = <CheckIcon />;
        break;
      case 'reject':
        label = 'Reject';
        color = 'error';
        icon = <BlockIcon />;
        break;
      case 'consider':
        label = 'Consider';
        color = 'warning';
        icon = <HourglassEmptyIcon />;
        break;
      case 'need-more-info':
        label = 'Need More Info';
        color = 'info';
        icon = <InfoIcon />;
        break;
      default:
        label = 'Unknown';
        color = 'default';
        icon = <HelpIcon />;
    }
    
    return (
      <Chip 
        label={label} 
        color={color} 
        icon={icon} 
        size="small" 
        variant="filled"
      />
    );
  };

  const renderVoteSummary = () => {
    const totalVotes = votes.length;
    
    if (totalVotes === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No votes have been cast yet. Be the first to vote on this candidate.
        </Alert>
      );
    }
    
    const chartData = [
      { name: 'Hire', value: voteResult.hire, color: theme.palette.success.main },
      { name: 'Reject', value: voteResult.reject, color: theme.palette.error.main },
      { name: 'Consider', value: voteResult.consider, color: theme.palette.warning.main },
      { name: 'Need More Info', value: voteResult.needMoreInfo, color: theme.palette.info.main }
    ].filter(item => item.value > 0);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Voting Summary
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Vote Distribution
                </Typography>
                
                <Box height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                      <RechartsTooltip formatter={(value) => [`${value} votes`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Decision Status
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast by {teamMembers.length} team members
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(totalVotes / teamMembers.length) * 100}
                    sx={{ mt: 1 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    <strong>Current Decision:</strong>
                  </Typography>
                  
                  {voteResult.decision === 'undecided' ? (
                    <Chip 
                      label="Undecided" 
                      variant="outlined" 
                      size="small"
                    />
                  ) : (
                    getDecisionChip(voteResult.decision as Decision)
                  )}
                </Box>
                
                <Alert 
                  severity={
                    voteResult.decision === 'hire' 
                      ? 'success' 
                      : voteResult.decision === 'reject' 
                        ? 'error' 
                        : voteResult.decision === 'consider' 
                          ? 'warning' 
                          : 'info'
                  }
                  variant="outlined"
                  sx={{ mb: 1 }}
                >
                  {voteResult.decision === 'undecided'
                    ? "There's no clear consensus yet. More votes may be needed."
                    : voteResult.decision === 'hire'
                      ? `The team recommends hiring ${candidateName} for the ${position} position.`
                      : voteResult.decision === 'reject'
                        ? `The team does not recommend hiring ${candidateName} for this role.`
                        : voteResult.decision === 'consider'
                          ? `The team suggests considering ${candidateName} for a different role or another round of interviews.`
                          : `The team needs more information before making a decision on ${candidateName}.`
                  }
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderVoteList = () => {
    if (!showAllVotes) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Individual Votes
          </Typography>
          
          <Tooltip title={showAllVotes ? "Hide votes" : "Show votes"}>
            <IconButton onClick={() => setShowAllVotes(!showAllVotes)}>
              {showAllVotes ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        {votes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No votes have been cast yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {votes.map((vote) => {
              const voter = getTeamMemberById(vote.voterId);
              
              return (
                <Grid item xs={12} sm={6} key={vote.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {vote.isAnonymous ? (
                            <Avatar sx={{ bgcolor: theme.palette.grey[500], mr: 1 }}>
                              <PersonIcon />
                            </Avatar>
                          ) : (
                            <Avatar 
                              src={voter?.avatar} 
                              alt={voter?.name || 'User'}
                              sx={{ mr: 1 }}
                            >
                              {!voter?.avatar && (voter?.name?.charAt(0) || 'U')}
                            </Avatar>
                          )}
                          
                          <Box>
                            <Typography variant="subtitle2">
                              {vote.isAnonymous ? 'Anonymous Vote' : voter?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(vote.timestamp), 'MMM dd, yyyy - h:mm a')}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {getDecisionChip(vote.decision)}
                      </Box>
                      
                      <Typography variant="body2" sx={{ mt: 1.5, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <strong>Reasoning:</strong> {vote.reasoning}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Hiring Decision for {candidateName}
        </Typography>
        
        <Button
          variant="contained"
          color={currentUserVote ? 'info' : 'primary'}
          onClick={handleOpenVotingDialog}
          startIcon={currentUserVote ? <EditIcon /> : <HowToVoteIcon />}
        >
          {currentUserVote ? 'Update Vote' : 'Cast Vote'}
        </Button>
      </Box>
      
      <Typography variant="body2" gutterBottom>
        Position: <strong>{position}</strong>
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {renderVoteSummary()}
      
      {renderVoteList()}
      
      {/* Voting Dialog */}
      <Dialog
        open={votingDialogOpen}
        onClose={handleCloseVotingDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentUserVote ? 'Update Your Vote' : 'Cast Your Vote'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Candidate: <strong>{candidateName}</strong> for <strong>{position}</strong>
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Your Decision
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="decision"
              name="decision"
              value={selectedDecision}
              onChange={handleDecisionChange}
            >
              <FormControlLabel 
                value="hire" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <Typography>Hire - I recommend hiring this candidate</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="reject" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BlockIcon color="error" sx={{ mr: 1 }} />
                    <Typography>Reject - I do not recommend hiring this candidate</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="consider" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                    <Typography>Consider - This candidate should be considered for a different role</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="need-more-info" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon color="info" sx={{ mr: 1 }} />
                    <Typography>Need More Info - I need more information before deciding</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
          
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Your Reasoning
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            value={reasoning}
            onChange={handleReasoningChange}
            placeholder="Provide a detailed explanation for your decision..."
            variant="outlined"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={isAnonymous}
                onChange={handleAnonymousChange}
                color="primary"
              />
            }
            label="Cast anonymous vote"
            sx={{ mt: 2 }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Anonymous votes will hide your identity from other team members, but will still be counted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVotingDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitVote} 
            variant="contained" 
            color="primary"
            disabled={!reasoning.trim()}
          >
            {currentUserVote ? 'Update Vote' : 'Submit Vote'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default DecisionVoting; 