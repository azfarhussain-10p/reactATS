import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { useCandidateContext } from '../contexts/CandidateContext';
import { CandidateStatus, CandidateSource } from '../models/types';

interface CandidateStatsProps {
  showTitle?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  selectedStatus?: CandidateStatus | 'all';
  selectedSource?: CandidateSource | 'all';
  maxTagsToShow?: number;
}

const CandidateStats: React.FC<CandidateStatsProps> = ({
  showTitle = true,
  variant = 'default',
  selectedStatus = 'all',
  selectedSource = 'all',
  maxTagsToShow = 5,
}) => {
  const { getCandidatesStats } = useCandidateContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReturnType<typeof getCandidatesStats> | null>(null);
  const theme = useTheme();

  // In the future, this would fetch from PostgreSQL
  useEffect(() => {
    // Simulate API call with a small delay
    const fetchStats = async () => {
      setLoading(true);
      try {
        // In the future, this would be an API call to PostgreSQL
        const candidateStats = getCandidatesStats();
        setStats(candidateStats);
      } catch (error) {
        console.error('Error fetching candidate stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getCandidatesStats, selectedStatus, selectedSource]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Failed to load candidate statistics</Typography>
      </Box>
    );
  }

  // Get top tags based on count
  const topTags = Object.entries(stats.byTag)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, maxTagsToShow);

  // Calculate percentage for each status
  const statusPercentages = Object.entries(stats.byStatus).map(([status, count]) => ({
    status,
    count,
    percentage: stats.total > 0 ? (count / stats.total) * 100 : 0,
  }));

  // Sort status data by count in descending order
  const sortedStatusData = statusPercentages.sort((a, b) => b.count - a.count);

  // Calculate percentage for each source
  const sourcePercentages = Object.entries(stats.bySource).map(([source, count]) => ({
    source,
    count,
    percentage: stats.total > 0 ? (count / stats.total) * 100 : 0,
  }));

  // Sort source data by count in descending order
  const sortedSourceData = sourcePercentages.sort((a, b) => b.count - a.count);

  // Status colors for visual representation
  const statusColors: Record<string, string> = {
    New: theme.palette.info.main,
    Screening: theme.palette.primary.main,
    Interview: theme.palette.secondary.main,
    Assessment: theme.palette.warning.main,
    Offer: theme.palette.success.main,
    Hired: theme.palette.success.dark,
    Rejected: theme.palette.error.main,
    Withdrawn: theme.palette.error.light,
    'On Hold': theme.palette.grey[500],
  };

  // Compact view just shows the total and a few key metrics
  if (variant === 'compact') {
    return (
      <Card>
        {showTitle && (
          <CardHeader title="Candidate Statistics" titleTypographyProps={{ variant: 'h6' }} />
        )}
        <CardContent>
          <Stack direction="row" spacing={2} justifyContent="space-around">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Candidates
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {stats.byStatus['Interview'] || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Interview
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.byStatus['Hired'] || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hired
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Detailed view shows everything
  if (variant === 'detailed') {
    return (
      <Card>
        {showTitle && (
          <CardHeader
            title="Candidate Statistics"
            titleTypographyProps={{ variant: 'h6' }}
            avatar={<PeopleIcon />}
            subheader={`Total: ${stats.total} candidates`}
          />
        )}
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Status Distribution */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Status Distribution
              </Typography>
              <Box sx={{ mb: 2 }}>
                {sortedStatusData.map(({ status, count, percentage }) => (
                  <Box key={status} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="span"
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: statusColors[status] || theme.palette.grey[500],
                            display: 'inline-block',
                            mr: 1,
                          }}
                        />
                        {status}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {count} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: statusColors[status] || theme.palette.grey[500],
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Source Distribution */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Source Distribution
              </Typography>
              <Box sx={{ mb: 2 }}>
                {sortedSourceData.map(({ source, count, percentage }) => (
                  <Box key={source} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{source}</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {count} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Top Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {topTags.map(([tag, count]) => (
                  <Chip
                    key={tag}
                    label={`${tag} (${count})`}
                    icon={<TagIcon />}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Average Rating */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Average Candidate Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={stats.avgRating * 20} // convert 0-5 scale to percentage
                    size={60}
                    thickness={6}
                    sx={{ color: theme.palette.success.main }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" fontWeight="bold">
                      {stats.avgRating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Average rating across {stats.total} candidates
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Default view
  return (
    <Card>
      {showTitle && (
        <CardHeader title="Candidate Statistics" titleTypographyProps={{ variant: 'h6' }} />
      )}
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="h5" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Total Candidates
              </Typography>
              {stats.avgRating > 0 && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                  <Typography variant="body2">
                    Avg. Rating: <strong>{stats.avgRating.toFixed(1)}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Status Distribution
            </Typography>
            {sortedStatusData.slice(0, 5).map(({ status, count, percentage }) => (
              <Box key={status} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{status}</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {count}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: statusColors[status] || theme.palette.grey[500],
                    },
                  }}
                />
              </Box>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {topTags.slice(0, 3).map(([tag, count]) => (
                <Chip key={tag} label={`${tag} (${count})`} size="small" sx={{ mb: 1 }} />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CandidateStats;
