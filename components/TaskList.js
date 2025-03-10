import { useState } from 'react';
import { 
  Box, List, ListItem, ListItemText, IconButton, 
  Typography, Chip, Paper, Divider, ListItemIcon, 
  Checkbox, Menu, MenuItem, Tab, Tabs
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';

// 优先级对应的颜色
const priorityColors = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'error'
};

// 状态对应的显示文本
const statusLabels = {
  TODO: '待办',
  IN_PROGRESS: '进行中',
  DONE: '已完成'
};

export default function TaskList({ tasks, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  const handleMenuClick = (event, taskId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };
  
  const handleEdit = () => {
    const task = tasks.find(task => task.id === selectedTaskId);
    onEdit(task);
    handleMenuClose();
  };
  
  const handleDelete = () => {
    onDelete(selectedTaskId);
    handleMenuClose();
  };

  // 根据状态过滤任务
  const filteredTasks = tasks.filter(task => {
    if (currentTab === 0) return true; // 全部
    if (currentTab === 1) return task.status === 'TODO';
    if (currentTab === 2) return task.status === 'IN_PROGRESS';
    if (currentTab === 3) return task.status === 'DONE';
    return true;
  });

  return (
    <Box>
      <Paper>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="全部" />
          <Tab label="待办" />
          <Tab label="进行中" />
          <Tab label="已完成" />
        </Tabs>
        
        {filteredTasks.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              没有任务
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTasks.map((task, index) => (
              <Box key={task.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="more"
                      onClick={(e) => handleMenuClick(e, task.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.status === 'DONE'}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        style={{
                          textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                          color: task.status === 'DONE' ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {task.description}
                          </Typography>
                        )}
                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                          <Chip
                            label={statusLabels[task.status]}
                            size="small"
                            color={task.status === 'DONE' ? 'default' : 'primary'}
                            variant={task.status === 'DONE' ? 'outlined' : 'filled'}
                          />
                          <Chip
                            label={task.priority}
                            size="small"
                            color={priorityColors[task.priority]}
                            variant="outlined"
                          />
                          {task.due_date && (
                            <Chip
                              label={`截止: ${format(new Date(task.due_date), 'yyyy-MM-dd')}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {task.notion_id && (
                            <Chip
                              label="已同步到Notion"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          编辑
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>
    </Box>
  );
}