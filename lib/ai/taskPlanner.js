import axios from 'axios';
import { query } from '../db';
import { format, addDays, getHours, getDay } from 'date-fns';
import WorkloadPredictor from './workloadPredictor';

export default class TaskPlanner {
  constructor() {
    this.workloadPredictor = new WorkloadPredictor();
  }
  
  async initialize(userId) {
    await this.workloadPredictor.initialize(userId);
  }

  async planDay(userId, date = new Date()) {
    try {
      // 1. 获取用户的待办任务
      const tasks = await query(
        `SELECT * FROM tasks 
         WHERE user_id = ? 
         AND status != 'DONE'
         ORDER BY 
           CASE 
             WHEN due_date IS NULL THEN 1 
             ELSE 0 
           END, 
           due_date ASC, 
           CASE priority 
             WHEN 'HIGH' THEN 0 
             WHEN 'MEDIUM' THEN 1 
             ELSE 2 
           END`,
        [userId]
      );
      
      if (tasks.length === 0) {
        return { success: true, message: "没有待办任务", plan: [] };
      }
      
      // 2. 获取用户的工作时间偏好
      const userPrefs = await query(
        `SELECT preferences FROM user_preferences WHERE user_id = ?`,
        [userId]
      );
      
      let workingHours = {
        start: 9,
        end: 18,
        workDays: [1, 2, 3, 4, 5]
      };
      
      if (userPrefs.length > 0) {
        try {
          const prefs = JSON.parse(userPrefs[0].preferences);
          if (prefs.workingHours) {
            workingHours = prefs.workingHours;
          }
        } catch (e) {
          console.error('解析用户偏好设置失败:', e);
        }
      }
      
      // 3. 检查计划日期是否为工作日
      const dayOfWeek = getDay(date);
      const isWorkDay = workingHours.workDays.includes(dayOfWeek);
      
      if (!isWorkDay) {
        // 如果是非工作日，只返回关键和逾期任务
        const criticalTasks = tasks.filter(task => 
          task.priority === 'HIGH' || 
          (task.due_date && new Date(task.due_date) <= date)
        );
        
        if (criticalTasks.length === 0) {
          return { 
            success: true, 
            message: "今天是非工作日，没有关键任务需要处理", 
            plan: [] 
          };
        }
        
        // 为关键任务创建计划
        const plan = await this._createPlan(criticalTasks, userId, date, workingHours, true);
        
        return { 
          success: true, 
          message: "今天是非工作日，但有一些关键任务需要处理", 
          plan,
          isWorkDay: false
        };
      }
      
      // 4. 创建工作日计划
      const plan = await this._createPlan(tasks, userId, date, workingHours, false);
      
      return { 
        success: true, 
        plan,
        isWorkDay: true
      };
    } catch (error) {
      console.error('创建日计划失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  async _createPlan(tasks, userId, date, workingHours, isNonWorkDay) {
    // 获取每个任务的估计完成时间
    const tasksWithEstimates = await Promise.all(tasks.map(async task => {
      const estimatedDuration = await this.workloadPredictor.predictTaskCompletionTime(task);
      return { ...task, estimatedDuration };
    }));
    
    // 对任务进行排序 (优先级 + 截止日期)
    const sortedTasks = [...tasksWithEstimates].sort((a, b) => {
      // 首先按优先级排序
      const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // 然后按截止日期排序
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      
      // 有截止日期的任务优先
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      
      return 0;
    });
    
    // 计算工作时间总长度（分钟）
    const workMinutes = (workingHours.end - workingHours.start) * 60;
    
    // 如果是非工作日，限制计划时间为2小时
    const availableMinutes = isNonWorkDay ? 120 : workMinutes;
    
    // 创建计划
    const plan = [];
    let currentTime = new Date(date);
    currentTime.setHours(workingHours.start, 0, 0, 0);
    let remainingMinutes = availableMinutes;
    
    for (const task of sortedTasks) {
      // 如果没有更多可用时间，停止添加任务
      if (remainingMinutes <= 0) break;
      
      const duration = Math.min(task.estimatedDuration, remainingMinutes);
      
      plan.push({
        taskId: task.id,
        title: task.title,
        startTime: new Date(currentTime),
        endTime: new Date(currentTime.getTime() + duration * 60000),
        duration,
        priority: task.priority,
        status: task.status
      });
      
      // 更新剩余时间和当前时间
      remainingMinutes -= duration;
      currentTime = new Date(currentTime.getTime() + duration * 60000);
    }
    
    return plan;
  }
  
  async generateWeekPlan(userId) {
    try {
      const today = new Date();
      const weekPlans = [];
      
      // 为接下来的7天生成计划
      for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
        const dayPlan = await this.planDay(userId, date);
        
        weekPlans.push({
          date: format(date, 'yyyy-MM-dd'),
          dayOfWeek: format(date, 'EEEE'),
          ...dayPlan
        });
      }
      
      return { 
        success: true, 
        weekPlans 
      };
    } catch (error) {
      console.error('生成周计划失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  async suggestTaskReallocation(userId) {
    try {
      // 获取用户的任务和周计划
      const weekPlan = await this.generateWeekPlan(userId);
      
      if (!weekPlan.success) {
        return { success: false, error: weekPlan.error };
      }
      
      // 检查是否有工作量不均衡的情况
      const dailyWorkloads = weekPlan.weekPlans.map(day => {
        return {
          date: day.date,
          taskCount: day.plan ? day.plan.length : 0,
          totalDuration: day.plan ? day.plan.reduce((sum, task) => sum + task.duration, 0) : 0,
          isWorkDay: day.isWorkDay
        };
      });
      
      // 只考虑工作日的工作量
      const workDayLoads = dailyWorkloads.filter(day => day.isWorkDay !== false);
      
      if (workDayLoads.length === 0) {
        return { success: true, message: "没有工作日数据可分析", suggestions: [] };
      }
      
      // 计算平均工作量
      const avgDuration = workDayLoads.reduce((sum, day) => sum + day.totalDuration, 0) / workDayLoads.length;
      
      // 找出工作量过重和过轻的日子
      const heavyDays = workDayLoads.filter(day => day.totalDuration > avgDuration * 1.3);
      const lightDays = workDayLoads.filter(day => day.totalDuration < avgDuration * 0.7);
      
      if (heavyDays.length === 0) {
        return { success: true, message: "工作量已经平衡分配", suggestions: [] };
      }
      
      // 生成任务重新分配建议
      const suggestions = [];
      
      for (const heavyDay of heavyDays) {
        const heavyDayPlan = weekPlan.weekPlans.find(d => d.date === heavyDay.date);
        
        if (!heavyDayPlan || !heavyDayPlan.plan) continue;
        
        // 找出可以移动的低优先级任务
        const movableTasks = heavyDayPlan.plan
          .filter(task => task.priority !== 'HIGH')
          .sort((a, b) => {
            const priorityOrder = { 'MEDIUM': 0, 'LOW': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
        
        // 为每个可移动的任务寻找最佳目标日
        for (const task of movableTasks) {
          // 按工作量从低到高排序
          const targetDays = [...lightDays].sort((a, b) => a.totalDuration - b.totalDuration);
          
          if (targetDays.length > 0) {
            suggestions.push({
              taskId: task.taskId,
              taskTitle: task.title,
              sourceDate: heavyDay.date,
              targetDate: targetDays[0].date,
              reason: `工作日 ${heavyDay.date} 工作量过重(${heavyDay.totalDuration}分钟)，建议将任务移至工作量较轻的 ${targetDays[0].date}(${targetDays[0].totalDuration}分钟)`
            });
            
            // 更新目标日的工作量
            targetDays[0].totalDuration += task.duration;
          }
        }
      }
      
      return { 
        success: true, 
        suggestions,
        workloadAnalysis: dailyWorkloads
      };
    } catch (error) {
      console.error('生成任务重新分配建议失败:', error);
      return { success: false, error: error.message };
    }
  }
}