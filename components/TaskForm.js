import { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, DialogTitle, DialogContent, 
  DialogActions, FormControl, InputLabel, Select, MenuItem, 
  FormHelperText, Grid, DialogContentText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: null
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        due_date: task.due_date ? new Date(task.due_date) : null,
        notion_id: task.notion_id
      });
    }
  }, [task]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证表单
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>{task ? '编辑任务' : '创建新任务'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          请填写任务详情
        </DialogContentText>
        <Box mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="标题"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(errors.title)}
                helperText={errors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="描述"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>状态</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="状态"
                >
                  <MenuItem value="TODO">待办</MenuItem>
                  <MenuItem value="IN_PROGRESS">进行中</MenuItem>
                  <MenuItem value="DONE">已完成</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>优先级</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="优先级"
                >
                  <MenuItem value="LOW">低</MenuItem>
                  <MenuItem value="MEDIUM">中</MenuItem>
                  <MenuItem value="HIGH">高</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="截止日期"
                  value={formData.due_date}
                  onChange={(newValue) => {
                    setFormData(prev => ({ ...prev, due_date: newValue }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>取消</Button>
        <Button type="submit" variant="contained" color="primary">保存</Button>
      </DialogActions>
    </Box>
  );
}