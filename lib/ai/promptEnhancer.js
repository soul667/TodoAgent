import registry from '../plugins/pluginRegistry';

/**
 * 提示增强器 - 使用插件数据增强AI提示
 */
export default class PromptEnhancer {
  constructor() {
    this.pluginDataCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存
  }
  
  /**
   * 增强提示文本
   * @param {string} basePrompt 基础提示文本
   * @param {Object} context 上下文对象
   * @returns {Promise<string>} 增强后的提示文本
   */
  async enhancePrompt(basePrompt, context = {}) {
    // 1. 执行前置钩子
    const beforeResults = await registry.executeHook('beforePrompt', context);
    
    // 2. 收集插件数据
    const pluginData = await this._getPluginData(context);
    
    // 3. 替换提示中的插件标记
    let enhancedPrompt = basePrompt;
    
    // 替换通用插件数据标记
    enhancedPrompt = this._replacePluginDataMarkers(enhancedPrompt, pluginData);
    
    // 4. 执行后置钩子
    const afterResults = await registry.executeHook('afterPrompt', {
      ...context,
      basePrompt,
      enhancedPrompt,
      pluginData
    });
    
    return enhancedPrompt;
  }
  
  /**
   * 获取插件数据(带缓存)
   */
  async _getPluginData(context) {
    // 检查缓存
    const cacheKey = JSON.stringify(context);
    const now = Date.now();
    
    if (this.pluginDataCache.has(cacheKey)) {
      const cachedData = this.pluginDataCache.get(cacheKey);
      if (now - cachedData.timestamp < this.cacheExpiry) {
        return cachedData.data;
      }
    }
    
    // 从插件收集数据
    const pluginData = await registry.collectData(context);
    
    // 更新缓存
    this.pluginDataCache.set(cacheKey, {
      data: pluginData,
      timestamp: now
    });
    
    return pluginData;
  }
  
  /**
   * 替换提示中的插件数据标记
   * 格式: {{plugin:data_path}}
   */
  _replacePluginDataMarkers(prompt, pluginData) {
    // 查找格式为 {{plugin:data_path}} 的所有标记
    const markerRegex = /\{\{([a-zA-Z0-9_-]+):([\w.]+)\}\}/g;
    
    return prompt.replace(markerRegex, (match, pluginId, path) => {
      // 获取插件数据
      const data = pluginData[pluginId];
      if (!data) {
        return `[无法获取插件 ${pluginId} 的数据]`;
      }
      
      // 按路径获取数据
      const value = this._getValueByPath(data, path);
      if (value === undefined) {
        return `[${pluginId} 中未找到 ${path}]`;
      }
      
      // 根据类型返回适当的字符串表示
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });
  }
  
  /**
   * 按点分隔路径获取对象值
   */
  _getValueByPath(obj, path) {
    return path.split('.').reduce((curr, key) => 
      curr && curr[key] !== undefined ? curr[key] : undefined, obj);
  }
}