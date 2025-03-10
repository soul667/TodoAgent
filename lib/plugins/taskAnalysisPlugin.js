import PluginInterface from './pluginInterface';
import { query } from '../db';
import { formatDistance, parseISO, isThisWeek, isThisMonth } from 'date-fns';

export default class TaskAnalysisPlugin extends PluginInterface {
  constructor() {
    super();
    this.id = 'task-analysis';
    this.name = '任务分析插件';
    this.description = '分析任务完成率和模式';
    this.author = 'TaskMaster';
    
    // 定义钩子
    this.hooks = {
      dataProvider: this.analyzeTaskData.bind(this),
      beforePrompt: this.enhancePromptWithAnalysis.bind(this)
    };
  }

  init() {
    console.log('任务分析插件初始化');
    return true;
  }
  
  async analyzeTaskData() {
    try {
      // 获取所有任务
      const allTasks = await query('SELECT * FROM tasks');
      
      // 计算基本统计数据
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.status === 'DONE').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
      
      // 按优先级分组
      const byPriority = {
        HIGH: allTasks.filter(task => task.priority === 'HIGH').length,
        MEDIUM: allTasks.filter(task => task.priority === 'MEDIUM').length,
        LOW: allTasks.filter(task => task.priority === 'LOW').length
      };
      
      // 按状态分组
      const byStatus = {
        TODO: allTasks.filter(task => task.status === 'TODO').length,
        IN_PROGRESS: allTasks.filter(task => task.status === 'IN_PROGRESS').length,
        DONE: completedTasks
      };
      
      // 统计本周和本月任务
      const thisWeekTasks = allTasks.filter(task => isThisWeek(new Date(task.created_at)));
      const thisMonthTasks = allTasks.filter(task => isThisMonth(new Date(task.created_at)));
      
      // 生成分析结果
      return {
        overview: {
          totalTasks,
          completedTasks,
          completionRate: `${completionRate}%`,
          inProgress: byStatus.IN_PROGRESS,
          pending: byStatus.TODO
        },
        byPriority,
        byStatus,
        timePeriods: {
          thisWeek: thisWeekTasks.length,
          thisMonth: thisMonthTasks.length
        },
        recentActivity: allTasks
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5)
          .map(task => ({
            id: task.id,
            title: task.title,
            status: task.status,
            updatedAt: task.updated_at,
            timeAgo: formatDistance(new Date(task.updated_at), new Date(), { addSuffix: true })
          })),
        insights: this._generateInsights(allTasks, completionRate)
      };
    } catch (error) {
      console.error('分析任务数据失败:', error);
      return {
        error: '无法分析任务数据',
        details: error.message
      };
    }
  }
  
  _generateInsights(tasks, completionRate) {
    const insights = [];
    
    // 完成率见解
    if (completionRate < 30) {
      insights.push('任务完成率较低，可能需要制定更可行的计划或减少任务量');
    } else if (completionRate > 80) {
      insights.push('任务完成率高，可能可以挑战更多任务');
    }
    
    // 高优先级任务处理见解
    const highPriorityTasks = tasks.filter(task => task.priority === 'HIGH');
    const completedHighPriority = highPriorityTasks.filter(task => task.status === 'DONE').length;
    const highPriorityRate = highPriorityTasks.length > 0 
      ? (completedHighPriority / highPriorityTasks.length * 100).toFixed(1) 
      : 0;
    
    if (highPriorityTasks.length > 0 && highPriorityRate < 50) {
      insights.push('高优先级任务完成率较低，建议优先关注这些任务');
    }
    
    // 其他潜在见解...
    
    return insights;
  }
  
  enhancePromptWithAnalysis(context) {
    return {
      additionalContext: '基于最近的任务分析数据增强提示'
    };
  }
}