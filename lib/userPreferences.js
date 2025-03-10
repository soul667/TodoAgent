export default class UserPreferences {
  constructor() {
    this.defaultPreferences = {
      theme: 'light',
      layout: 'list',
      defaultView: 'all',
      sortBy: 'dueDate',
      sortDirection: 'asc',
      workingHours: {
        start: 9,
        end: 18,
        workDays: [1, 2, 3, 4, 5], // 周一到周五
      },
      notifications: {
        browser: true,
        email: false,
        push: false,
        quietHours: {
          enabled: true,
          start: 22,
          end: 8
        }
      },
      aiFeatures: {
        enabled: true,
        autoSuggestions: true,
        naturalLanguage: true,
        analysisFrequency: 'weekly'
      },
      dashboard: {
        widgets: [
          { id: 'upcoming', enabled: true, position: 0 },
          { id: 'statistics', enabled: true, position: 1 },
          { id: 'aiSuggestions', enabled: true, position: 2 },
          { id: 'calendar', enabled: true, position: 3 }
        ]
      },
      sync: {
        notion: {
          enabled: true,
          autoSync: false,
          syncFrequency: 'daily'
        },
        calendar: {
          enabled: false,
          provider: 'google',
          twoWay: false
        }
      }
    };
  }

  async loadUserPreferences(userId) {
    try {
      // 从数据库加载用户偏好设置
      const userPrefs = await query(
        'SELECT preferences FROM user_preferences WHERE user_id = ?',
        [userId]
      );
      
      if (userPrefs.length === 0) {
        // 如果没有保存的偏好，使用默认值
        return this.defaultPreferences;
      }
      
      // 将保存的偏好与默认偏好合并，确保所有字段都存在
      return {
        ...this.defaultPreferences,
        ...JSON.parse(userPrefs[0].preferences)
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return this.defaultPreferences;
    }
  }
  
  async saveUserPreferences(userId, preferences) {
    try {
      // 保存用户偏好设置到数据库
      await query(
        `INSERT INTO user_preferences (user_id, preferences) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE preferences = ?`,
        [userId, JSON.stringify(preferences), JSON.stringify(preferences)]
      );
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }
  
  async updateUserTheme(userId, theme) {
    try {
      const prefs = await this.loadUserPreferences(userId);
      prefs.theme = theme;
      return await this.saveUserPreferences(userId, prefs);
    } catch (error) {
      console.error('Error updating theme:', error);
      return false;
    }
  }
  
  async updateDashboardLayout(userId, widgets) {
    try {
      const prefs = await this.loadUserPreferences(userId);
      prefs.dashboard.widgets = widgets;
      return await this.saveUserPreferences(userId, prefs);
    } catch (error) {
      console.error('Error updating dashboard layout:', error);
      return false;
    }
  }
  
  // 获取用户的工作时间偏好
  async getUserWorkingHours(userId) {
    const prefs = await this.loadUserPreferences(userId);
    return prefs.workingHours;
  }
  
  // 检查当前是否在用户的工作时间内
  async isWithinWorkingHours(userId) {
    const workingHours = await this.getUserWorkingHours(userId);
    const now = new Date();
    const day = now.getDay(); // 0是周日，1-6是周一到周六
    const hour = now.getHours();
    
    // 检查是否是工作日
    if (!workingHours.workDays.includes(day)) {
      return false;
    }
    
    // 检查是否在工作时间内
    return hour >= workingHours.start && hour < workingHours.end;
  }
}