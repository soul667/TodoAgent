import axios from 'axios';
import { parseISO, format, addDays, addHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default class NaturalLanguageProcessor {
  constructor() {
    this.timeKeywords = {
      '今天': () => new Date(),
      '明天': () => addDays(new Date(), 1),
      '后天': () => addDays(new Date(), 2),
      '下周': () => addDays(new Date(), 7),
      '下个月': () => addDays(new Date(), 30),
    };
    
    this.priorityKeywords = {
      '紧急': 'HIGH',
      '重要': 'HIGH',
      '高优先级': 'HIGH',
      '中等': 'MEDIUM',
      '一般': 'MEDIUM',
      '低优先级': 'LOW',
      '不急': 'LOW'
    };
  }

  async parseNaturalLanguage(text) {
    try {
      // 先尝试本地规则解析
      const localResult = this.parseWithLocalRules(text);
      if (localResult.confidence > 0.7) {
        return localResult;
      }
      
      // 本地解析置信度不高，使用AI解析
      return await this.parseWithAI(text);
    } catch (error) {
      console.error('Natural language parsing error:', error);
      return {
        success: false,
        error: '无法解析自然语言输入'
      };
    }
  }
  
  parseWithLocalRules(text) {
    // 简单的本地解析逻辑
    const task = {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null
    };
    
    let confidence = 0.5; // 默认置信度
    
    // 尝试提取标题 (例如："提醒我 xxx" 或 "创建任务 xxx")
    const titleMatch = text.match(/(?:提醒我|创建任务|添加任务|记得|todo)[\s:：](.+?)(?:\s|$|。|，|,)/i);
    if (titleMatch) {
      task.title = titleMatch[1].trim();
      confidence += 0.2;
    } else {
      // 如果没有特定模式，使用第一句话作为标题
      const firstSentence = text.split(/[。.!！?？]/).filter(s => s.trim())[0];
      if (firstSentence) {
        task.title = firstSentence.trim();
      } else {
        task.title = text;
      }
    }
    
    // 提取时间信息
    for (const [keyword, dateFunc] of Object.entries(this.timeKeywords)) {
      if (text.includes(keyword)) {
        task.due_date = dateFunc();
        confidence += 0.1;
        
        // 查找具体时间 (例如: "下午3点" 或 "15:00")
        const timeMatch = text.match(/(\d{1,2})[点:：](\d{0,2})\s*(上午|下午|am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const period = timeMatch[3];
          
          // 处理12小时制
          if ((period === '下午' || period?.toLowerCase() === 'pm') && hours < 12) {
            hours += 12;
          } else if ((period === '上午' || period?.toLowerCase() === 'am') && hours === 12) {
            hours = 0;
          }
          
          task.due_date = new Date(task.due_date);
          task.due_date.setHours(hours, minutes, 0, 0);
          confidence += 0.1;
        }
        
        break;
      }
    }
    
    // 提取优先级信息
    for (const [keyword, priority] of Object.entries(this.priorityKeywords)) {
      if (text.includes(keyword)) {
        task.priority = priority;
        confidence += 0.1;
        break;
      }
    }
    
    // 尝试提取描述
    const descMatch = text.match(/(?:描述|详情|注意|备注|说明)[\s:：](.+?)(?:$|。|；|;)/i);
    if (descMatch) {
      task.description = descMatch[1].trim();
      confidence += 0.1;
    }
    
    return {
      success: true,
      confidence,
      task
    };
  }
  
  async parseWithAI(text) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: `你是一个自然语言任务解析器。
                     将用户输入解析为任务对象，包括以下字段：
                     - title: 任务标题
                     - description: 任务描述
                     - status: 任务状态 (TODO, IN_PROGRESS, DONE)
                     - priority: 任务优先级 (LOW, MEDIUM, HIGH)
                     - due_date: 截止日期，ISO格式 (YYYY-MM-DDTHH:MM:SS) 或 null
                     仅返回JSON格式，无需其他回答。`
          },
          { role: 'user', content: text }
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
      // 解析JSON响应
      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        success: true,
        confidence: 0.9, // AI解析通常更可靠
        task: result
      };
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return {
        success: false,
        error: '无法解析AI响应'
      };
    }
  }
}