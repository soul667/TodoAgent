import { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Grid, Card, CardContent, 
  Divider, CircularProgress, LinearProgress, Tab, Tabs
} from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// 数据可视化的颜色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_COLORS = {
  'DONE': '#00C49F',
  'IN_PROGRESS': '#FFBB28',
  'TODO': '#FF8042'
};

export default function AnalyticsView({ tasks }) {
  const [tabValue, setTabValue] = useState(0);
  const [statistics, setStatistics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    overdueTasks: 0,
    byPriority: [],
    byStatus: [],
    weeklyProgress: []
  });

  // 计算统计数据
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    
    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.status !== 'DONE' && 
      t.due_date && 
      new Date(t.due_date) < now
    ).length;
    
    // 按优先级分组
    const priorityCounts = {
      'HIGH': tasks.filter(t => t.priority === 'HIGH').length,
      'MEDIUM': tasks.filter(t => t.priority === 'MEDIUM').length,
      'LOW': tasks.filter(t => t.priority === 'LOW').length
    };
    
    const byPriority = [
      { name: '高', value: priorityCounts.HIGH },
      { name: '中', value: priorityCounts.MEDIUM },
      { name: '低', value: priorityCounts.LOW }
    ];
    
    // 按状态分组
    const statusCounts = {
      'TODO': tasks.filter(t => t.status === 'TODO').length,
      'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS').length,
      'DONE': completed
    };
    
    const byStatus = [
      { name: '待办', value: statusCounts.TODO, color: STATUS_COLORS.TODO },
      { name: '进行中', value: statusCounts.IN_PROGRESS, color: STATUS_COLORS.IN_PROGRESS },
      { name: '已完成', value: statusCounts.DONE, color: STATUS_COLORS.DONE }
    ];
    
    // 计算周进度数据
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const weeklyProgress = weekDays.map(day => {
      const tasksForDay = tasks.filter(t => 
        t.updated_at && 
        new Date(t.updated_at).toDateString() === day.toDateString()
      );
      
      const completedForDay = tasksForDay.filter(t => t.status === 'DONE').length;
      
      return {
        date: format(day, 'EEE', { locale: zhCN }),
        total: tasksForDay.length,
        completed: completedForDay
      };
    });
    
    setStatistics({
      totalTasks: total,
      completedTasks: completed,
      completionRate,
      overdueTasks,
      byPriority,
      byStatus,
      weeklyProgress
    });
  }, [tasks]);

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box mb={3}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="概览" />
          <Tab label="进度" />
          <Tab label="任务分布" />
        </Tabs>
      </Box>
      
      {/* 概览标签 */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* 统计卡片 */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <PendingActionsIcon fontSize="large" />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h5">{statistics.totalTasks}</Typography>
                    <Typography variant="body2">总任务数</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <CheckCircleIcon fontSize="large" />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h5">{statistics.completedTasks}</Typography>
                    <Typography variant="body2">已完成任务</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <AccessTimeIcon fontSize="large" />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h5">{statistics.overdueTasks}</Typography>
                    <Typography variant="body2">逾期任务</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* 完成率 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>完成率</Typography>
              <Box display="flex" alignItems="center">
                <Box width="100%" mr={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(statistics.completionRate)} 
                    sx={{ height: 20, borderRadius: 5 }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="text.secondary">
                    {`${statistics.completionRate}%`}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* 优先级饼图 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>按优先级</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.byPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statistics.byPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} 个任务`, '数量']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* 状态饼图 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>按状态</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statistics.byStatus.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} 个任务`, '数量']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* 进度标签 */}
      {tabValue === 1 && (
        <Paper sx={{ p: 2, height: 500 }}>
          <Typography variant="h6" gutterBottom>本周任务进度</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={statistics.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="总任务" fill="#8884d8" />
              <Bar dataKey="completed" name="已完成" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
      
      {/* 任务分布标签 */}
      {tabValue === 2 && (
        <Paper sx={{ p: 2, height: 500 }}>
          <Typography variant="h6" gutterBottom>任务分布</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={statistics.byStatus}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {statistics.byStatus.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} 个任务`, '数量']} />
              <Legend 
                formatter={(value, entry, index) => (
                  <span style={{ color: entry.color }}>{`${value}: ${entry.payload.value}个任务`}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
}