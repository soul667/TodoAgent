/**
 * 插件注册表 - 管理所有可用插件
 */
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.hooks = {
      beforePrompt: [],
      afterPrompt: [],
      dataProviders: []
    };
  }

  /**
   * 注册一个新插件
   * @param {Object} plugin 插件对象
   */
  register(plugin) {
    if (!plugin.id || !plugin.name) {
      throw new Error('插件必须有id和name属性');
    }
    
    if (this.plugins.has(plugin.id)) {
      throw new Error(`插件ID '${plugin.id}' 已存在`);
    }
    
    this.plugins.set(plugin.id, {
      ...plugin,
      enabled: plugin.enabled !== false, // 默认启用
    });
    
    // 注册插件钩子
    if (plugin.hooks) {
      if (plugin.hooks.beforePrompt) this.hooks.beforePrompt.push(plugin.id);
      if (plugin.hooks.afterPrompt) this.hooks.afterPrompt.push(plugin.id);
      if (plugin.hooks.dataProvider) this.hooks.dataProviders.push(plugin.id);
    }
    
    console.log(`插件 '${plugin.name}' 已注册`);
  }
  
  /**
   * 获取所有已注册插件
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
  
  /**
   * 获取单个插件
   */
  getPlugin(id) {
    return this.plugins.get(id);
  }
  
  /**
   * 启用插件
   */
  enablePlugin(id) {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = true;
      return true;
    }
    return false;
  }
  
  /**
   * 禁用插件
   */
  disablePlugin(id) {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = false;
      return true;
    }
    return false;
  }
  
  /**
   * 获取所有已启用的插件
   */
  getEnabledPlugins() {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled);
  }
  
  /**
   * 执行特定钩子上的所有插件函数
   */
  async executeHook(hookName, context) {
    const results = {};
    
    for (const pluginId of this.hooks[hookName] || []) {
      const plugin = this.plugins.get(pluginId);
      
      if (plugin && plugin.enabled && plugin.hooks && typeof plugin.hooks[hookName] === 'function') {
        try {
          results[pluginId] = await plugin.hooks[hookName](context);
        } catch (error) {
          console.error(`执行插件 '${plugin.name}' 钩子 '${hookName}' 时出错:`, error);
          results[pluginId] = { error: error.message };
        }
      }
    }
    
    return results;
  }
  
  /**
   * 收集所有数据提供者插件的数据
   */
  async collectData(context) {
    return this.executeHook('dataProvider', context);
  }
}

// 创建单例插件注册表
const registry = new PluginRegistry();
export default registry;