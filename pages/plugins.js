import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, List, ListItem, 
  ListItemText, ListItemSecondaryAction, Switch, Divider,
  Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, CircularProgress, IconButton, Chip,
  Grid, Card, CardContent, CardActions
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';

export default function PluginsPage() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // 加载插件列表
  useEffect(() => {
    const fetchPlugins = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/plugins');
        setPlugins(data.plugins);
      } catch (error) {
        console.error('加载插件失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  // 切换插件启用状态
  const togglePluginEnabled = async (plugin) => {
    try {
      const { data } = await axios.patch(`/api/plugins/${plugin.id}/toggle`);
      setPlugins(plugins.map(p => 
        p.id === plugin.id ? { ...p, enabled: data.enabled } : p
      ));
    } catch (error) {
      console.error('切换插件状态失败:', error);
    }
  };

  // 打开插件配置对话框
  const openConfigDialog = (plugin) => {
    setSelectedPlugin(plugin);
    setConfigOpen(true);
  };

  // 打开插件信息对话框
  const openInfoDialog = (plugin) => {
    setSelectedPlugin(plugin);
    setInfoOpen(true);
  };

  // 保存插件配置
  const savePluginConfig = async (config) => {
    try {
      await axios.patch(`/api/plugins/${selectedPlugin.id}/config`, { config });
      setConfigOpen(false);
      
      // 更新插件列表中的配置
      setPlugins(plugins.map(p => 
        p.id === selectedPlugin.id ? { ...p, config } : p
      ));
    } catch (error) {
      console.error('保存插件配置失败:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          插件管理
        </Typography>
        
        <Box my={3}>
          <Typography variant="body1" paragraph>
            插件可以扩展AI提示功能，提供额外数据和上下文。在AI提示中使用 
            <code>{'{{插件ID:数据路径}}'}</code> 格式引用插件数据。
          </Typography>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {plugins.map(plugin => (
              <Grid item xs={12} md={6} key={plugin.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">{plugin.name}</Typography>
                      <Switch
                        checked={plugin.enabled}
                        onChange={() => togglePluginEnabled(plugin)}
                        color="primary"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {plugin.description}
                    </Typography>
                    
                    <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                      <Chip size="small" label={`v${plugin.version}`} variant="outlined" />
                      {plugin.author && (
                        <Chip size="small" label={`作者: ${plugin.author}`} variant="outlined" />
                      )}
                      {Object.keys(plugin.hooks || {}).map(hook => (
                        <Chip 
                          key={hook} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          label={hook} 
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      startIcon={<InfoIcon />}
                      size="small" 
                      onClick={() => openInfoDialog(plugin)}
                    >
                      详情
                    </Button>
                    <Button 
                      startIcon={<SettingsIcon />}
                      size="small"
                      onClick={() => openConfigDialog(plugin)}
                      disabled={!plugin.configSchema || Object.keys(plugin.configSchema).length === 0}
                    >
                      配置
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* 插件配置对话框 */}
      {selectedPlugin && (
        <Dialog 
          open={configOpen} 
          onClose={() => setConfigOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{selectedPlugin.name} 配置</DialogTitle>
          <PluginConfigForm 
            plugin={selectedPlugin} 
            onSave={savePluginConfig} 
            onCancel={() => setConfigOpen(false)} 
          />
        </Dialog>
      )}

      {/* 插件信息对话框 */}
      {selectedPlugin && (
        <Dialog 
          open={infoOpen} 
          onClose={() => setInfoOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{selectedPlugin.name} 详情</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              插件ID: {selectedPlugin.id}
            </Typography>
            <Typography variant="body1" paragraph>
              {selectedPlugin.description}
            </Typography>
            