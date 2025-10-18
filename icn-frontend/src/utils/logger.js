import { config } from '../config/environment';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  getCurrentLevel() {
    return LOG_LEVELS[config.LOG_LEVEL] ?? LOG_LEVELS.info;
  }
  
  debug(...args) {
    if (this.getCurrentLevel() <= LOG_LEVELS.debug) {
      console.log('[DEBUG]', ...args);
    }
  }
  
  info(...args) {
    if (this.getCurrentLevel() <= LOG_LEVELS.info) {
      console.log('[INFO]', ...args);
    }
  }
  
  warn(...args) {
    if (this.getCurrentLevel() <= LOG_LEVELS.warn) {
      console.warn('[WARN]', ...args);
    }
  }
  
  error(...args) {
    if (this.getCurrentLevel() <= LOG_LEVELS.error) {
      console.error('[ERROR]', ...args);
    }
  }
  
  group(label) {
    if (config.SHOW_DEV_TOOLS) {
      console.group(label);
    }
  }
  
  groupEnd() {
    if (config.SHOW_DEV_TOOLS) {
      console.groupEnd();
    }
  }
  
  table(data) {
    if (config.SHOW_DEV_TOOLS) {
      console.table(data);
    }
  }
  
  time(label) {
    if (config.SHOW_DEV_TOOLS) {
      console.time(label);
    }
  }
  
  timeEnd(label) {
    if (config.SHOW_DEV_TOOLS) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();