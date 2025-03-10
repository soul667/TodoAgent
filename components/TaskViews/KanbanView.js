import { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Chip, IconButton, 
  Card, CardContent, CardActions, Grid, Divider
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

// 列定义
const columns = [
  { id: 'TODO', title: '待办' },
  { id: 'IN_PROGRESS', title: '进行中' },
  { id: 'DONE', title: '已完成' }
];

// 优先级对应的颜色
const priorityColors = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'error'
};

export default function KanbanView({ tasks, onEdit, onDelete, onStatusChange }) {
  const [columns, setColumns] = useState({
    'TODO': [],
    'IN_PROGRESS': [],
    'DONE': []
  });
  
  // 初始化列数据
  useEffect(() => {
    if (!tasks) return;
    
    const newColumns = {
      'TODO': [],
      'IN_PROGRESS': [],
      'DONE': []
    };
    
    tasks.forEach(task => {
      if (newColumns[task.status]) {
        newColumns[task.status].push(task);
      }
    });
    
    setColumns(newColumns);
  }, [tasks]);
  
  // 处理拖拽结束事件
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    
    // 如果拖拽到看板之外，不做任何处理
    if (!destination) return;
    
    // 如果拖拽到相同位置，不做任何处理
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    if (source.droppableId === destination.droppableId) {
      // 同一列内重新排序
      const reorderedTasks = [...sourceColumn];
      const [movedTask] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, movedTask);
      
      setColumns({
        ...columns,
        [source.droppableId]: reorderedTasks
      });
    } else {
      // 跨列移动 - 改变任务状态
      const sourceTasks = [...sourceColumn];
      const destTasks = [...destColumn];
      const [movedTask] = sourceTasks.splice(source.index, 1);
      
      // 更新任务状态
      const updatedTask = { ...movedTask, status: destination.droppableId };
      destTasks.splice(destination.index, 0, updatedTask);
      
      setColumns({
        ...columns,
        [source.droppableId]: sourceTasks,
        [destination.droppableId]: destTasks
      });
      
      // 通知父组件状态变更
      onStatusChange(movedTask.id, destination.droppableId);
    }
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
        {Object.entries(columns).map(([columnId, columnTasks]) => (
          <Box 
            key={columnId}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '33.3%',
              mx: 1,
              height: '100%'
            }}
          >
            <Paper elevation={0} sx={{ 
              p: 2, 
              backgroundColor: theme => 
                columnId === 'DONE' ? theme.palette.grey[100] : 
                columnId === 'IN_PROGRESS' ? theme.palette.info.light :
                theme.palette.primary.light,
              mb: 1
            }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {columnId === 'TODO' ? '待办' : columnId === 'IN_PROGRESS' ? '进行中' : '已完成'} 
                ({columnTasks.length})
              </Typography>
            </Paper>
            
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent',
                    p: 1,
                    borderRadius: 1,
                    overflowY: 'auto',
                    flexGrow: 1
                  }}
                >
                  {columnTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 1,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                            boxShadow: snapshot.isDragging ? 3 : 1
                          }}
                        >
                          <CardContent sx={{ pb: 0 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                              {task.title}
                            </Typography>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {task.description.length > 100 ? 
                                  task.description.substring(0, 97) + '...' : 
                                  task.description}
                              </Typography>
                            )}
                            <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                              <Chip
                                label={task.priority}
                                size="small"
                                color={priorityColors[task.priority]}
                                variant="outlined"
                              />
                              {task.due_date && (
                                <Chip
                                  label={`${format(new Date(task.due_date), 'MM-dd')}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {task.notion_id && (
                                <Chip
                                  label="Notion"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </CardContent>
                          <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => onEdit(task)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => onDelete(task.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </Box>
    </DragDropContext>
  );
}