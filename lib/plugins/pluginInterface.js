/**
 * 插件接口 - 定义插件应该实现的结构
 */
export default class PluginInterface {
  constructor() {
    this.id = null;          // 唯一标识符
    this.name = null;        // 插件名称
    this.description = null; // 插件描述
    this.version = '1.0.0';  // 插件版本
    this.author = null;      // 插件作者
    this.enabled = true;     // 是否启用
    this.configSchema = {};  // 配置模式
    this.config = {};        // 实际配置
    
    this.hooks = {
      beforePrompt: null,   // 提示生成前钩子
      afterPrompt: null,    // 提示生成后钩子
      dataProvider: null    // 数据提供钩子
    };
  }

  /**
   * 初始化插件
   */
  init() {
    throw new Error('插件必须实现init方法');
  }
  
  /**
   * 销毁插件
   */
  destroy() {
    // 可选实现
  }
  
  /**
   * 更新插件配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }
  
  /**
   * 验证插件配置
   */
  validateConfig(config) {
    // 默认实现，子类可以覆盖
    return true;
  }
}