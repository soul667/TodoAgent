import { formatDistanceToNow } from 'date-fns';
import { query } from '../db';

export default class NotificationManager {
  constructor() {
    this.channels = {
      browser: true,
      email: false,
      push: false
    };
    this.preferences = {
      // 默认仅在特定时间发送通知
      quietHours: { start: 22, end: 8 },
      // 根据任务截止时间决定提醒频率
      reminderTimes: [
        { timeBeforeDue: 24 * 60, // 24小时前
          message: '您有一个任务将在明天到期' },
        { timeBeforeDue: 2 * 60, // 2小时前
          message: '您有一个任务即将到期' },
        { timeBeforeDue: 30, // 30分钟前
          message: '您的任务即将在30分钟内到期' }
      ]
    };
  }

  async checkDueTasks() {
    // 查找即将到期的任务
    const now = new Date();
    const tasks = await query(
      `SELECT * FROM tasks 
       WHERE status != 'DONE' 
       AND due_date IS NOT NULL 
       AND due_date > NOW() 
       ORDER BY due_date ASC`
    );
    
    const notifications = [];
    
    for (const task of tasks) {
      const dueDate = new Date(task.due_date);
      const minutesToDue = Math.floor((dueDate - now) / (1000 * 60));
      
      // 检查是否在提醒时间点
      for (const reminder of this.preferences.reminderTimes) {
        if (Math.abs(minutesToDue - reminder.timeBeforeDue) < 5) { // 5分钟误差范围
          notifications.push({
            id: `due_${task.id}_${reminder.timeBeforeDue}`,
            title: reminder.message,
            body: `任务"${task.title}" 将在 ${formatDistanceToNow(dueDate)} 后到期`,
            taskId: task.id,
            priority: task.priority,
            timestamp: now,
            read: false
          });
        }
      }
    }
    
    return notifications;
  }
  
  async shouldSendNotification(notification) {
    const now = new Date();
    const hour = now.getHours();
    
    // 检查是否在免打扰时间
    if (hour >= this.preferences.quietHours.start || 
        hour < this.preferences.quietHours.end) {
      // 对于高优先级任务，即便在免打扰时间也发送通知
      if (notification.priority !== 'HIGH') {
        return false;
      }
    }
    
    return true;
  }
  
  async sendNotification(notification) {
    if (!await this.shouldSendNotification(notification)) {
      return false;
    }
    
    // 存储通知到数据库
    await query(
      `INSERT INTO notifications 
       (id, title, body, task_id, priority, timestamp, read) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [notification.id, notification.title, notification.body, 
       notification.taskId, notification.priority, 
       notification.timestamp, notification.read]
    );
    
    // 基于用户设置发送通知
    if (this.channels.browser) {
      this.sendBrowserNotification(notification);
    }
    
    if (this.channels.email) {
      this.sendEmailNotification(notification);
    }
    
    if (this.channels.push) {
      this.sendPushNotification(notification);
    }
    
    return true;
  }
  
  sendBrowserNotification(notification) {
    // 使用Web Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icons/notification.png'
      });
    }
  }
  
  sendEmailNotification(notification) {
    // 集成邮件发送服务
    console.log('Email notification would be sent:', notification);
  }
  
  sendPushNotification(notification) {
    // 使用Web Push API
    console.log('Push notification would be sent:', notification);
  }
}