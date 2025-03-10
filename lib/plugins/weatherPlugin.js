import PluginInterface from './pluginInterface';
import axios from 'axios';

export default class WeatherPlugin extends PluginInterface {
  constructor() {
    super();
    this.id = 'weather-plugin';
    this.name = '天气插件';
    this.description = '提供当前天气信息，帮助规划户外任务';
    this.author = 'TaskMaster';
    this.configSchema = {
      apiKey: {
        type: 'string',
        description: '天气API密钥',
        required: true
      },
      location: {
        type: 'string',
        description: '默认位置',
        default: 'Beijing,CN'
      }
    };
    this.config = {
      apiKey: process.env.WEATHER_API_KEY || '',
      location: 'Beijing,CN'
    };
    
    // 定义钩子
    this.hooks = {
      dataProvider: this.getWeatherData.bind(this)
    };
  }

  init() {
    console.log('天气插件初始化');
    return true;
  }
  
  async getWeatherData(context) {
    try {
      // 如果上下文中指定了位置，则使用它
      const location = context.location || this.config.location;
      
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: location,
          appid: this.config.apiKey,
          units: 'metric'
        }
      });
      
      const weather = response.data;
      
      return {
        location: weather.name,
        condition: weather.weather[0].main,
        description: weather.weather[0].description,
        temperature: weather.main.temp,
        feelsLike: weather.main.feels_like,
        humidity: weather.main.humidity,
        summary: `${weather.name}的天气是${weather.weather[0].description}，温度${weather.main.temp}°C，湿度${weather.main.humidity}%`
      };
    } catch (error) {
      console.error('获取天气数据失败:', error);
      return {
        error: '无法获取天气数据',
        details: error.message
      };
    }
  }
}