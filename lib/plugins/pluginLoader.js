import registry from './pluginRegistry';
import WeatherPlugin from './weatherPlugin';
import CalendarPlugin from './calendarPlugin';
import TaskAnalysisPlugin from './taskAnalysisPlugin';

/**
 * 插件加载器 - 负责加载和初始化所有插件
 */
export default class PluginLoader {
  constructor() {
    this.loaded = false;
  }
  
  /**
   * 加载所有内置插件和外部插件
   */
  loadPlugins() {
    if (this.loaded) return;
    
    console.log('正在加载插件...');
    
    // 加载内置插件
    this._loadBuiltinPlugins();
    
    // 加载外部插件 (可以从数据库或文件系统)
    this._loadExternalPlugins();
    
    this.loaded = true;
    console.log(`插件加载完成，共 ${registry.getAllPlugins().length} 个插件`);
  }
  
  /**
   * 加载内置插件
   */
  _loadBuiltinPlugins() {
    const builtinPlugins = [
      new WeatherPlugin(),
      new CalendarPlugin(),
      new TaskAnalysisPlugin()
    ];
    
    for (const plugin of builtinPlugins) {
      try {
        // 初始化插件
        const initialized = plugin.init();
        
        if (initialized) {
          // 注册到插件注册表
          registry.register(plugin);
        } else {
          console.warn(`插件 ${plugin.name} 初始化失败，跳过注册`);
        }
      } catch (error) {
        console.error(`加载插件 ${plugin.name} 失败:`, error);
      }
    }
  }
  
  /**
   * 加载外部插件
   */
  _loadExternalPlugins() {
    // 这里可以从数据库或文件系统动态加载外部插件
    // 例如，扫描特定目录下的插件文件并动态导入
    
    // 示例代码:
    // const pluginFiles = fs.readdirSync(PLUGINS_DIR).filter(file => file.endsWith('.js'));
    // for (const file of pluginFiles) {
    //   try {
    //     const PluginClass = require(path.join(PLUGINS_DIR, file)).default;
    //     const plugin = new PluginClass();
    //     if (plugin.init()) {
    //       registry.register(plugin);
    //     }
    //   } catch (error) {
    //     console.error(`加载外部插件 ${file} 失败:`, error);
    //   }
    // }
  }
}