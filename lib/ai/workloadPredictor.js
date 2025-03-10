import { addDays, differenceInDays, differenceInMinutes } from 'date-fns';
import { query } from '../db';

export default class WorkloadPredictor {
  constructor() {
    this.taskCompletionHistory = new Map(); // 存储任务类型完成时间历史
    this.userPatterns = new Map(); // 存储用户工作模式
  }

  async initialize(userId) {
    await this.loadCompletionHistory(userId);
    await this.analyzeUserPatterns(userId);
  }

  async loadCompletionHistory(userId) {
    // 加载用户已完成任务的历史数据
    const tasks = await query(
      `SELECT t.id, t.title, t.description, t.priority, t.created_at, t.updated_at,
              TIMESTAMPDIFF(MINUTE, t.created_at, t.updated_at) as completion_time
       FROM tasks t
       WHERE t.status = 'DONE'
       AND t.user_id = ?
       ORDER BY t.updated_at DESC
       LIMIT 100`,
      [userId]
    );
    
    // 根据任务特征分类存储完成时间
    for (const task of tasks) {
      // 提取任务类型特征 (例如通过关键词或长度)
      const features = this.extractTaskFeatures(task);
      
      for (const feature of features) {
        if (!this.taskCompletionHistory.has(feature)) {
          this.taskCompletionHistory.set(feature, []);
        }
        
        this.taskCompletionHistory.get(feature).push({
          id: task.id,
          title: task.title,
          completionTime: task.completion_time,
          priority: task.priority,
          createdAt: new Date(task.created_at),
          completedAt: new Date(task.updated_at)
        });
      }
    }
  }
  
  extractTaskFeatures(task) {
    const features = [];
    
    // 基于标题长度的特征
    if (task.title.length < 20) features.push('short_title');
    else if (task.title.length < 50) features.push('medium_title');
    else features.push('long_title');
    
    // 基于描述长度的特征
    if (!task.description) features.push('no_description');
    else if (task.description.length < 100) features.push('short_description');
    else features.push('long_description');
    
    // 基于优先级的特征
    features.push(`priority_${task.priority.toLowerCase()}`);
    
    // 基于关键词的特征
    const keywords = ['会议', '报告', '文档', '研究', '开发', 'bug', '测试', '审核'];
    for (const keyword of keywords) {
      if ((task.title + ' ' + (task.description || '')).includes(keyword)) {
        features.push(`keyword_${keyword}`);
      }
    }
    
    return features;
  }
  
  async analyzeUserPatterns(userId) {
    // 分析用户的工作模式
    const tasks = await query(
      `SELECT DATE_FORMAT(updated_at, '%w') as day_of_week,
              DATE_FORMAT(updated_at, '%H') as hour_of_day,
              COUNT(*) as task_count
       FROM tasks
       WHERE status = 'DONE'
       AND user_id = ?
       GROUP BY day_of_week, hour_of_day
       ORDER BY task_count DESC`,
      [userId]
    );
    
    // 确定高效时间段
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    
    for (const task of tasks) {
      const day = parseInt(task.day_of_week);
      const hour = parseInt(task.hour_of_day);
      const count = parseInt(task.task_count);
      
      hourCounts[hour] += count;
      dayCounts[day] += count;
    }
    
    // 找出最高效的时间段 (前30%)
    const sortedHours = [...hourCounts.keys()]
      .sort((a, b) => hourCounts[b] - hourCounts[a]);
    const productiveHours = sortedHours.slice(0, Math.ceil(sortedHours.length * 0.3));
    
    // 找出最高效的日子
    const sortedDays = [...dayCounts.keys()]
      .sort((a, b) => dayCounts[b] - dayCounts[a]);
    const productiveDays = sortedDays.slice(0, Math.ceil(sortedDays.length * 0.5));
    
    this.userPatterns.set(userId, {
      productiveHours,
      productiveDays
    });
  }
  
  async predictTaskCompletionTime(task) {
    // 提取任务特征
    const features = this.extractTaskFeatures(task);
    
    // 根据相似任务历史计算平均完成时间
    let totalTime = 0;
    let weightSum = 0;
    
    for (const feature of features) {
      if (this.taskCompletionHistory.has(feature)) {
        const similarTasks = this.taskCompletionHistory.get(feature);
        const averageTime = similarTasks.reduce((sum, t) => sum + t.completionTime, 0) / similarTasks.length;
        
        // 根据特征相关性赋予权重
        let weight = 1.0;
        if (feature.startsWith('priority_')) weight = 2.0;
        if (feature.startsWith('keyword_')) weight = 1.5;
        
        totalTime += averageTime * weight;
        weightSum += weight;
      }
    }
    
    // 如果没有足够历史数据，给出基于简单规则的估算
    if (weightSum === 0) {
      // 基本估计: 短任务30分钟，中任务60分钟，长任务120分钟
      if (task.title.length < 20 && (!task.description || task.description.length < 50)) {
        return 30; // 短任务
      } else if (task.title.length < 50 && (!task.description || task.description.length < 200)) {
        return 60; // 中任务
      } else {
        return 120; // 长任务
      }
    }
    
    return Math.round(totalTime / weightSum);
  }
  
  async suggestOptimalTime(userId, task) {
    const estimatedDuration = await this.predictTaskCompletionTime(task);
    const patterns = this.userPatterns.get(userId);
    
    if (!patterns) {
      return null; // 没有足够的用户模式数据
    }
    
    // 获取未来7天的日期
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      if (patterns.productiveDays.includes(dayOfWeek)) {
        dates.push(date);
      }
    }
    
    if (dates.length === 0) {
      // 如果没有匹配高效日，使用所有未来7天
      for (let i = 0; i < 7; i++) {
        dates.push(addDays(today, i));
      }
    }
    
    // 获取用户这段时间的任务
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    
    const existingTasks = await query(
      `SELECT title, due_date, estimated_duration 
       FROM tasks 
       WHERE user_id = ? 
       AND status != 'DONE'
       AND due_date BETWEEN ? AND ?
       ORDER BY due_date ASC`,
      [userId, startDate, endDate]
    );
    
    // 寻找最佳时间段
    let bestScore = -1;
    let bestTime = null;
    
    for (const date of dates) {
      for (const hour of patterns.productiveHours) {
        const proposedTime = new Date(date);
        proposedTime.setHours(hour, 0, 0, 0);
        
        // 如果时间已经过去，跳过
        if (proposedTime < today) continue;
        
        // 计算这个时间段的分数
        const score = this.calculateTimeSlotScore(proposedTime, estimatedDuration, existingTasks);
        
        if (score > bestScore) {
          bestScore = score;
          bestTime = proposedTime;
        }
      }
    }
    
    return {
      suggestedTime: bestTime,
      estimatedDuration,
      score: bestScore
    };
  }
  
  calculateTimeSlotScore(proposedTime, duration, existingTasks) {
    // 基础分数
    let score = 100;
    
    // 检查时间点是否离现在太近（太紧迫）或太远（不紧迫）
    const hoursFromNow = differenceInMinutes(proposedTime, new Date()) / 60;
    if (hoursFromNow < 2) {
      score -= 30; // 太紧迫了
    } else if (hoursFromNow > 72) {
      score -= Math.min(50, (hoursFromNow - 72) / 24 * 10); // 随着时间增加减少分数
    }
    
    // 检查是否与现有任务冲突
    for (const task of existingTasks) {
      const taskDueDate = new Date(task.due_date);
      const minutesDifference = Math.abs(differenceInMinutes(proposedTime, taskDueDate));
      const taskDuration = task.estimated_duration || 60; // 默认1小时
      
      // 如果时间重叠，减分
      if (minutesDifference < (duration + taskDuration) / 2) {
        score -= 40;
      } 
      // 如果时间接近但不重叠，稍微减分
      else if (minutesDifference < duration + taskDuration) {
        score -= 15;
      }
      // 如果任务分布均匀（间隔适当），加分
      else if (minutesDifference < (duration + taskDuration) * 2) {
        score += 10;
      }
    }
    
    return score;
  }
}