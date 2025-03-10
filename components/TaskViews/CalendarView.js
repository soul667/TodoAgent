import { useState } from 'react';
import { 
  Box, Paper, Typography, Chip, IconButton, Tooltip, 
  Dialog, DialogTitle, DialogContent, Grid
} from '@mui/material';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, getDay, isSameDay, addMonths, subMonths,
  isToday, isWithinInterval
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TaskDetail from '../TaskDetail';

// 星期几表示
const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];

// 任务颜色
const statusColors = {
  'TODO': '#d1e9fc',
  'IN_PROGRESS': '#fff7cd',
  'DONE': '#e0f2f1'
};

export default function CalendarView({ tasks, onEdit, onDelete }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  // 返回上一个月
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // 前进到下一个月
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // 处理任务点击
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  // 获取日期当天的任务
  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return task.due_date && isSameDay(taskDate, day);
    });
  };

  return (
    <Box>
      {/* 日历头部 */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
      >
        <IconButton onClick={prevMonth}>
          <NavigateBeforeIcon />
        </IconButton>
        <Typography variant="h5">
          {format(currentMonth, 'yyyy年 MM月', { locale: zhCN })}
        </Typography>
        <IconButton onClick={nextMonth}>
          <NavigateNextIcon />
        </IconButton>
      </Box>
      
      {/* 日历表格 */}
      <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Grid container>
          {/* 星期几表头 */}
          {daysOfWeek.map((day, index) => (
            <Grid 
              item 
              key={index} 
              xs={12/7}
              sx={{ 
                p: 1, 
                backgroundColor: 'primary.main', 
                color: 'white',
                textAlign: 'center',
                borderRight: index < 6 ? '1px solid #fff' : 'none'
              }}
            >
              <Typography variant="subtitle2">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* 日历主体 */}
        <Grid container sx={{ minHeight: 'calc(100vh - 300px)' }}>
          {calendarDays.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isWithinInterval(day, { start: monthStart, end: monthEnd });
            
            return (
              <Grid 
                item 
                key={i} 
                xs={12/7}
                sx={{ 
                  p: 1, 
                  height: '100%',
                  backgroundColor: isToday(day) ? '#e3f2fd' : 
                                isCurrentMonth ? 'white' : '#f5f5f5', 
                  border: '1px solid #e0e0e0',
                  opacity: isCurrentMonth ? 1 : 0.5
                }}
              >
                {/* 日期 */}
                <Typography 
                  variant="body2" 
                  fontWeight={isToday(day) ? 'bold' : 'normal'}
                  color={isToday(day) ? 'primary' : 'textPrimary'}
                  mb={1}
                >
                  {format(day, 'd')}
                </Typography>
                
                {/* 当天任务 */}
                <Box>
                  {dayTasks.map(task => (
                    <Box 
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      sx={{
                        p: 0.5,
                        mb: 0.5,
                        backgroundColor: statusColors[task.status] || '#e1f5fe',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Tooltip title={task.title}>
                        <Typography variant="caption" noWrap>
                          {task.title}
                        </Typography>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
      
      {/* 任务详情对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>任务详情</DialogTitle>
        <DialogContent dividers>
          {selectedTask && (
            <TaskDetail 
              task={selectedTask}
              onEdit={() => {
                setDialogOpen(false);
                onEdit(selectedTask);
              }}
              onDelete={() => {
                setDialogOpen(false);
                onDelete(selectedTask.id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}