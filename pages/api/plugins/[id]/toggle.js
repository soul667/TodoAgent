import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import pluginRegistry from '../../../../lib/plugins/pluginRegistry';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  const { id } = req.query;
  
  if (req.method === 'PATCH') {
    try {
      const plugin = pluginRegistry.getPlugin(id);
      
      if (!plugin) {
        return res.status(404).json({ success: false, error: '插件不存在' });
      }
      
      // 切换插件状态
      const newStatus = !plugin.enabled;
      const success = newStatus ? 
        pluginRegistry.enablePlugin(id) : 
        pluginRegistry.disablePlugin(id);
      
      if (success) {
        res.status(200).json({ 
          success: true, 
          enabled: newStatus,
          message: `插件 ${plugin.name} 已${newStatus ? '启用' : '禁用'}`
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: `无法${newStatus ? '启用' : '禁用'}插件`
        });
      }
    } catch (error) {
      console.error('切换插件状态失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}