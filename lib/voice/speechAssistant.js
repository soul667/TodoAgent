  // 处理命令
  processCommand(transcript) {
    let matched = false;
    
    for (const [pattern, command] of this.commands.entries()) {
      const match = transcript.match(pattern);
      if (match) {
        try {
          command.handler(match, transcript);
          matched = true;
          break;
        } catch (error) {
          console.error('执行命令时出错:', error);
          this.speak('执行命令时出错');
        }
      }
    }
    
    if (!matched) {
      console.log('没有匹配的命令');
      // 可以添加自然语言处理来解析未匹配的命令
    }
    
    return matched;
  }
  
  // 文本转语音
  speak(text) {
    if (!this.synthesis) {
      console.warn('语音合成不被支持');
      return false;
    }
    
    // 停止当前正在播放的语音
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language;
    
    // 可以设置语音参数
    // utterance.pitch = 1.0;
    // utterance.rate = 1.0;
    // utterance.volume = 1.0;
    
    this.synthesis.speak(utterance);
    return true;
  }
  
  // 获取注册的命令列表
  getCommands() {
    const commands = [];
    for (const [pattern, command] of this.commands.entries()) {
      commands.push({
        pattern: pattern.toString(),
        helpText: command.helpText
      });
    }
    return commands;
  }
  
  // 设置语言
  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }
}

export default SpeechAssistant;