import axios from 'axios';
import { query } from '../db';

export default class TagSuggester {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24小时缓存
    this.userTags = new Map(); // 用户常用标签缓存
  }

  async suggestTags(task, userId) {
    try {
      // 1. 尝试使用缓存
      const cacheKey = `${task.title}-${task.description?.substring(0, 50) || ''}`;
      if (this.cache.has(cacheKey)) {
        const cachedResult = this.cache.get(cacheKey);
        if (Date.now() - cachedResult.timestamp < this.cacheTimeout) {
          return cachedResult.tags;
        }
      }
      
      // 2. 获取用户已有标签
      await this.loadUserTags(userId);
      
      // 3. 使用AI生成标签建议
      const tags = await this._generateTagsWithAI(task, userId);
      
      // 4. 缓存结果
      this.cache.set(cacheKey, {
        tags,
        timestamp: Date.now()
      });
      
      return tags;
    } catch (error) {
      console.error('标签推荐失败:', error);
      return [];
    }
  }
  
  async loadUserTags(userId) {
    if (this.userTags.has(userId)) {
      const cachedTags = this.userTags.get(userId);
      if (Date.now() - cachedTags.timestamp < this.cacheTimeout) {
        return cachedTags.tags;
      }
    }
    
    // 从数据库加载用户使用过的标签
    try {
      const tasks = await query(
        `SELECT tags FROM tasks WHERE user_id = ? AND tags IS NOT NULL`,
        [userId]
      );
      
      const tagCounts = {};
      
      for (const task of tasks) {
        if (!task.tags) continue;
        
        let tags;
        try {
          tags = JSON.parse(task.tags);
        } catch (e) {
          continue;
        }
        
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }
      
      // 按使用频率排序
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);
      
      this.userTags.set(userId, {
        tags: sortedTags,
        timestamp: Date.now()
      });
      
      return sortedTags;
    } catch (error) {
      console.error('加载用户标签失败:', error);
      return [];
    }
  }
  
  async _generateTagsWithAI(task, userId) {
    try {
      const userTags = this.userTags.get(userId)?.tags || [];
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: `你是一个任务标签生成器。
                       基于任务的标题和描述，生成3-5个相关标签。
                       用户历史上使用过这些标签: ${userTags.slice(0, 20).join(', ')}
                       生成的标签应该简短、相关，并有助于任务分类。
                       只返回一个JSON数组的标签，无需其他回答。`
            },
            {
              role: 'user',
              content: `任务标题: ${task.title}
                       任务描述: ${task.description || '无描述'}`
            }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      try {
        // 解析AI返回的标签
        const suggestedTags = JSON.parse(response.data.choices[0].message.content);
        return Array.isArray(suggestedTags) ? suggestedTags : [];
      } catch (error) {
        console.error('解析AI返回的标签时出错:', error);
        return [];
      }
    } catch (error) {
      console.error('从AI获取标签建议时出错:', error);
      return [];
    }
  }
}