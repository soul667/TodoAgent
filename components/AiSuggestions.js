import { useState, useEffect } from 'react';
import {
  Box, Typography, DialogTitle, DialogContent,
  DialogActions, Button, CircularProgress, List,
  ListItem, ListItemText, ListItemButton, Divider,
  Alert
} from '@mui/material';
import axios from 'axios';

export default function AiSuggestions({ onClose, onAddTask }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/ai/suggestions');
        if (data.success) {
          // 解析AI建议，假设返回格式为"1. 建议任务1\n2. 建议任务2\n3. 建议任务3"
          const suggestionsText = data.suggestions;
          const suggestionsArray = suggestionsText
            .split(/\d+\.\s+/)
            .filter(item => item.trim())
            .map(item => ({
              title: item.split('\n')[0].trim(),
              description: item.split('\n').slice(1).join('\n').trim()
            }));
          
          setSuggestions(suggestionsArray);
          
          // 同时获取分析
          const analysisResponse = await axios.get('/api/ai/analyze');
          if (analysisResponse.data.success) {
            setAnalysis(analysisResponse.data.analysis);
          }
        } else {
          setError('无法获取AI建议');
        }
      } catch (err) {
        setError('请求AI建议时出错');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleAddSuggestion = (suggestion) => {
    onAddTask({
      title: suggestion.title,
      description: suggestion.description,
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null
    });
  };

  return (
    <>
      <DialogTitle>AI 任务建议</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              建议的任务
            </Typography>
            <List>
              {suggestions.map((suggestion, index) => (
                <Box key={index}>
                  {index > 0 && <Divider />}
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleAddSuggestion(suggestion)}>
                      <ListItemText
                        primary={suggestion.title}
                        secondary={suggestion.description}
                      />
                    </ListItemButton>
                  </ListItem>
                </Box>
              ))}
            </List>

            {analysis && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  任务完成分析
                </Typography>
                <Typography variant="body2">
                  {analysis}
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </>
  );
}