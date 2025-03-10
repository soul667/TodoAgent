import PluginInterface from './pluginInterface';
import { google } from 'googleapis';
import { format, addDays } from 'date-fns';

export default class CalendarPlugin extends PluginInterface {
  constructor() {
    super();
    this.id = 'calendar-plugin';
    this.name = '日历插件';
    this.description = '集成Google日历，提供日程安排信息';
    this.author = 'TaskMaster';
    this.configSchema = {
      credentials: {
        type: 'object',
        description: 'Google API凭证',
        required: true
      },
      calendarId: {
        type: 'string',
        description: '日历ID',
        default: 'primary'
      }
    };
    this.config = {
      credentials: null,
      calendarId: 'primary'
    };
    
    this.auth = null;
    this.calendar = null;
    
    // 定义钩子
    this.hooks = {
      dataProvider: this.getCalendarEvents.bind(this)
    };
  }

  init() {
    try {
      if (!this.config.credentials) {
        console.warn('日历插件缺少凭证配置');
        return false;
      }
      
      this.auth = new google.auth.JWT(
        this.config.credentials.client_email,
        null,
        this.config.credentials.private_key,
        ['https://www.googleapis.com/auth/calendar.readonly']
      );
      
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      console.log('日历插件初始化成功');
      return true;
    } catch (error) {
      console.error('日历插件初始化失败:', error);
      return false;
    }
  }
  
  async getCalendarEvents(context) {
    if (!this.calendar) {
      return { error: '日历插件未正确初始化' };
    }
    
    try {
      const now = new Date();
      const endDate = addDays(now, 7); // 默认获取一周内的事件
      
      const res = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      const events = res.data.items.map(event => {
        const start = event.start.dateTime || event.start.date;
        return {
          id: event.id,
          title: event.summary,
          description: event.description || '',
          start: start,
          end: event.end.dateTime || event.end.date,
          location: event.location || ''
        };
      });
      
      return {
        events,
        summary: `未来${events.length}个日历事件`
      };
    } catch (error) {
      console.error('获取日历事件失败:', error);
      return {
        error: '无法获取日历事件',
        details: error.message
      };
    }
  }
  
  destroy() {
    this.auth = null;
    this.calendar = null;
  }
}