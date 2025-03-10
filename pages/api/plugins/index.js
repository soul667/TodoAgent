import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import pluginRegistry from '../../../lib/plugins/pluginRegistry';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  if (req.method === 'GET') {
    try {
      // 获取所有插件
      const plugins = pluginRegistry.getAllPlugins().map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        description: plugin.description,
        author: plugin.author,
        version: plugin.version,
        enabled: plugin.enabled,
        configSchema: plugin.configSchema,
        hooks: Object.keys(plugin.hooks || {}).filter(key => plugin.hooks[key])
      }));
      
      res.status(200).json({ success: true, plugins });
    } catch (error) {
      console.error('获取插件失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}