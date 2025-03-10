import { useState, useEffect } from 'react';
import {
  Box, Fab, Dialog, DialogContent, DialogActions, Button,
  Typography, List, ListItem, ListItemText, CircularProgress,
  Collapse, Badge, IconButton, Paper, Chip
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HelpIcon from '@mui/icons-material/Help';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import SpeechAssistant from '../lib/voice/speechAssistant';
import NaturalLanguageProcessor from '../lib/ai/naturalLanguageProcessor';

export default function VoiceAssistant({ onCreateTask, onListTasks }) {
  const [assistant, setAssistant] = useState(null);
  const [nlp, setNlp] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [availableCommands, setAvailableCommands] = useState([]);
  
  // 初始化语音助手
  useEffect(() => {
    const speechAssistant = new SpeechAssistant();
    const naturalLangProcessor = new NaturalLanguageProcessor();
    
    setAssistant(speechAssistant);
    setNlp(naturalLangProcessor);
    setIsSupported(speechAssistant.isSupported);
    
    if (speechAssistant.isSupported) {
      // 注册命令
      speechAssistant
        .registerCommand(
          /新建任务|创建任务|添加任务|新增任务/i, 
          () => {
            setDialogOpen(true);
            setFeedbackMessage('请描述您想创建的任务');
          },
          '创建新任务'
        )
        .registerCommand(
          /显示任务|查看任务|列出任务|查看待办/i,
          () => {
            onListTasks();
            speechAssistant.speak('已显示您的任务列表');
          },
          '显示任务列表'
        )
        .registerCommand(
          /帮助|说明|指令|命令|你能做什么/i,
          () => {
            setHelpOpen(true);
            speechAssistant.speak('以下是可用的语音命令');
          },
          '显示帮助信息'
        );
      
      setAvailableCommands(speechAssistant.getCommands());
    }
    
    // 清理函数
    return () => {
      if (speechAssistant && speechAssistant.isListening) {
        speechAssistant.stopListening();
      }
    };
  }, [onListTasks]);
  
  // 开始/停止语音识别
  const toggleListening = () => {
    if (!assistant) return;
    
    if (isListening) {
      assistant.stopListening();
      setIsListening(false);
    } else {
      const success = assistant.startListening((text) => {
        setTranscript(text);
      });
      
      if (success) {
        setIsListening(true);
        setFeedbackMessage('正在聆听...');
      } else {
        setFeedbackMessage('无法启动语音识别');
      }
    }
  };
  
  // 处理任务创建对话框的确认
  const handleCreateTaskConfirm = async () => {
    if (transcript) {
      try {
        setFeedbackMessage('正在解析任务...');
        
        const result = await nlp.parseNaturalLanguage(transcript);
        
        if (result.success && result.task) {
          onCreateTask(result.task);
          assistant.speak('任务已创建');
          setDialogOpen(false);
        } else {
          setFeedbackMessage('无法解析任务，请重试');
          assistant.speak('无法解析任务，请重试');
        }
      } catch (error) {
        console.error('创建任务失败:', error);
        setFeedbackMessage('创建任务失败');
        assistant.speak('创建任务失败');
      }
    }
  };
  
  // 处理取消
  const handleCancel = () => {
    setDialogOpen(false);
    setTranscript('');
    
    if (isListening) {
      assistant.stopListening();
      setIsListening(false);
    }
  };
  
  if (!isSupported) {
    return null; // 如果不支持语音识别，不显示此组件
  }
  
  return (
    <>
      {/* 语音助手浮动按钮 */}
      <Fab
        color={isListening ? 'secondary' : 'primary'}
        aria-label="语音助手"
        onClick={toggleListening}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        {isListening ? <MicOffIcon /> : <MicIcon />}
      </Fab>
      
      {/* 创建任务对话框 */}
      <Dialog open={dialogOpen} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            创建任务
          </Typography>
          
          {isListening ? (
            <Box display="flex" alignItems="center" mb={2}>
              <Box flexGrow={1}>
                <CircularProgress size={20} color="secondary" />
                <Typography variant="body2" color="textSecondary" ml={1} component="span">
                  正在聆听...
                </Typography>
              </Box>
              <IconButton onClick={toggleListening} color="secondary">
                <MicOffIcon />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                startIcon={<MicIcon />}
                onClick={toggleListening}
                variant="outlined"
                size="small"
              >
                开始聆听
              </Button>
            </Box>
          )}
          
          {transcript && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1">{transcript}</Typography>
            </Paper>
          )}
          
          {feedbackMessage && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {feedbackMessage}
            </Typography>
          )}
          
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              提示:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              尝试说："创建一个明天下午3点截止的高优先级任务：准备项目演示"
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancel}>取消</Button>
          <Button 
            onClick={handleCreateTaskConfirm}
            disabled={!transcript}
            variant="contained" 
            color="primary"
          >
            创建
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 帮助对话框 */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm">
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            语音助手使用指南
          </Typography>
          
          <List>
            {availableCommands.map((cmd, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={cmd.helpText}
                  secondary={`示例命令: "${cmd.pattern.replace(/[\\^$.*+?()[\]{}|]/g, '')}"`}
                />
              </ListItem>
            ))}
          </List>
          
          <Box mt={2}>
            <Chip icon={<KeyboardVoiceIcon />} label="开始使用时点击右下角的麦克风按钮" />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}