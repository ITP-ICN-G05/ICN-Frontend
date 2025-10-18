import { logger } from './logger';
import { config } from '../config/environment';

// Use a module-level variable that persists across resetModules
let sharedMockConfig = {
  LOG_LEVEL: 'info',
  SHOW_DEV_TOOLS: true,
};

jest.mock('../config/environment', () => ({
  get config() {
    return sharedMockConfig;
  }
}));

describe('Logger', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;
  let consoleGroupSpy;
  let consoleGroupEndSpy;
  let consoleTableSpy;
  let consoleTimeSpy;
  let consoleTimeEndSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
    consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
    consoleTimeSpy = jest.spyOn(console, 'time').mockImplementation();
    consoleTimeEndSpy = jest.spyOn(console, 'timeEnd').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Reset config to default
    config.LOG_LEVEL = 'info';
    config.SHOW_DEV_TOOLS = true;
  });

  describe('log levels', () => {
    describe('debug', () => {
      it('should log debug messages when level is debug', () => {
        config.LOG_LEVEL = 'debug';
        // Re-import to pick up new config
        jest.resetModules();
        const { logger: debugLogger } = require('./logger');

        debugLogger.debug('test debug message', 'arg2');

        expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'test debug message', 'arg2');
      });

      it('should not log debug messages when level is info', () => {
        config.LOG_LEVEL = 'info';
        jest.resetModules();
        const { logger: infoLogger } = require('./logger');

        infoLogger.debug('test debug message');

        expect(consoleLogSpy).not.toHaveBeenCalled();
      });

      it('should not log debug messages when level is warn', () => {
        config.LOG_LEVEL = 'warn';
        jest.resetModules();
        const { logger: warnLogger } = require('./logger');

        warnLogger.debug('test debug message');

        expect(consoleLogSpy).not.toHaveBeenCalled();
      });

      it('should not log debug messages when level is error', () => {
        config.LOG_LEVEL = 'error';
        jest.resetModules();
        const { logger: errorLogger } = require('./logger');

        errorLogger.debug('test debug message');

        expect(consoleLogSpy).not.toHaveBeenCalled();
      });
    });

    describe('info', () => {
      it('should log info messages when level is debug', () => {
        config.LOG_LEVEL = 'debug';
        jest.resetModules();
        const { logger: debugLogger } = require('./logger');

        debugLogger.info('test info message', 'arg2');

        expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'test info message', 'arg2');
      });

      it('should log info messages when level is info', () => {
        config.LOG_LEVEL = 'info';
        jest.resetModules();
        const { logger: infoLogger } = require('./logger');

        infoLogger.info('test info message');

        expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'test info message');
      });

      it('should not log info messages when level is warn', () => {
        config.LOG_LEVEL = 'warn';
        jest.resetModules();
        const { logger: warnLogger } = require('./logger');

        warnLogger.info('test info message');

        expect(consoleLogSpy).not.toHaveBeenCalled();
      });

      it('should not log info messages when level is error', () => {
        config.LOG_LEVEL = 'error';
        jest.resetModules();
        const { logger: errorLogger } = require('./logger');

        errorLogger.info('test info message');

        expect(consoleLogSpy).not.toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('should log warn messages when level is debug', () => {
        config.LOG_LEVEL = 'debug';
        jest.resetModules();
        const { logger: debugLogger } = require('./logger');

        debugLogger.warn('test warn message', 'arg2');

        expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'test warn message', 'arg2');
      });

      it('should log warn messages when level is info', () => {
        config.LOG_LEVEL = 'info';
        jest.resetModules();
        const { logger: infoLogger } = require('./logger');

        infoLogger.warn('test warn message');

        expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'test warn message');
      });

      it('should log warn messages when level is warn', () => {
        config.LOG_LEVEL = 'warn';
        jest.resetModules();
        const { logger: warnLogger } = require('./logger');

        warnLogger.warn('test warn message');

        expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'test warn message');
      });

      it('should not log warn messages when level is error', () => {
        config.LOG_LEVEL = 'error';
        jest.resetModules();
        const { logger: errorLogger } = require('./logger');

        errorLogger.warn('test warn message');

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should log error messages at all levels', () => {
        const levels = ['debug', 'info', 'warn', 'error'];
        
        levels.forEach(level => {
          jest.clearAllMocks();
          config.LOG_LEVEL = level;
          jest.resetModules();
          const { logger: testLogger } = require('./logger');

          testLogger.error('test error message', 'arg2');

          expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'test error message', 'arg2');
        });
      });
    });
  });

  describe('multiple arguments', () => {
    it('should handle multiple arguments in debug', () => {
      config.LOG_LEVEL = 'debug';
      jest.resetModules();
      const { logger: debugLogger } = require('./logger');

      debugLogger.debug('msg1', 'msg2', { key: 'value' }, [1, 2, 3]);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[DEBUG]', 'msg1', 'msg2', { key: 'value' }, [1, 2, 3]
      );
    });

    it('should handle multiple arguments in info', () => {
      logger.info('msg1', 'msg2', { key: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[INFO]', 'msg1', 'msg2', { key: 'value' }
      );
    });

    it('should handle multiple arguments in warn', () => {
      logger.warn('msg1', 'msg2', [1, 2]);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN]', 'msg1', 'msg2', [1, 2]
      );
    });

    it('should handle multiple arguments in error', () => {
      logger.error('msg1', new Error('test'), 123);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]', 'msg1', new Error('test'), 123
      );
    });
  });

  describe('dev tools methods', () => {
    describe('group', () => {
      it('should call console.group when SHOW_DEV_TOOLS is true', () => {
        config.SHOW_DEV_TOOLS = true;

        logger.group('Test Group');

        expect(consoleGroupSpy).toHaveBeenCalledWith('Test Group');
      });

      it('should not call console.group when SHOW_DEV_TOOLS is false', () => {
        config.SHOW_DEV_TOOLS = false;

        logger.group('Test Group');

        expect(consoleGroupSpy).not.toHaveBeenCalled();
      });
    });

    describe('groupEnd', () => {
      it('should call console.groupEnd when SHOW_DEV_TOOLS is true', () => {
        config.SHOW_DEV_TOOLS = true;

        logger.groupEnd();

        expect(consoleGroupEndSpy).toHaveBeenCalled();
      });

      it('should not call console.groupEnd when SHOW_DEV_TOOLS is false', () => {
        config.SHOW_DEV_TOOLS = false;

        logger.groupEnd();

        expect(consoleGroupEndSpy).not.toHaveBeenCalled();
      });
    });

    describe('table', () => {
      it('should call console.table when SHOW_DEV_TOOLS is true', () => {
        config.SHOW_DEV_TOOLS = true;
        const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];

        logger.table(data);

        expect(consoleTableSpy).toHaveBeenCalledWith(data);
      });

      it('should not call console.table when SHOW_DEV_TOOLS is false', () => {
        config.SHOW_DEV_TOOLS = false;
        const data = [{ name: 'John', age: 30 }];

        logger.table(data);

        expect(consoleTableSpy).not.toHaveBeenCalled();
      });
    });

    describe('time', () => {
      it('should call console.time when SHOW_DEV_TOOLS is true', () => {
        config.SHOW_DEV_TOOLS = true;

        logger.time('timer1');

        expect(consoleTimeSpy).toHaveBeenCalledWith('timer1');
      });

      it('should not call console.time when SHOW_DEV_TOOLS is false', () => {
        config.SHOW_DEV_TOOLS = false;

        logger.time('timer1');

        expect(consoleTimeSpy).not.toHaveBeenCalled();
      });
    });

    describe('timeEnd', () => {
      it('should call console.timeEnd when SHOW_DEV_TOOLS is true', () => {
        config.SHOW_DEV_TOOLS = true;

        logger.timeEnd('timer1');

        expect(consoleTimeEndSpy).toHaveBeenCalledWith('timer1');
      });

      it('should not call console.timeEnd when SHOW_DEV_TOOLS is false', () => {
        config.SHOW_DEV_TOOLS = false;

        logger.timeEnd('timer1');

        expect(consoleTimeEndSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined LOG_LEVEL', () => {
      config.LOG_LEVEL = undefined;
      jest.resetModules();
      const { logger: defaultLogger } = require('./logger');

      defaultLogger.info('test');
      defaultLogger.debug('test');

      // Should default to info level
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'test');
      expect(consoleLogSpy).not.toHaveBeenCalledWith('[DEBUG]', 'test');
    });

    it('should handle invalid LOG_LEVEL', () => {
      config.LOG_LEVEL = 'invalid';
      jest.resetModules();
      const { logger: defaultLogger } = require('./logger');

      defaultLogger.info('test');

      // Should default to info level
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'test');
    });

    it('should handle no arguments', () => {
      logger.info();
      logger.warn();
      logger.error();

      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]');
    });

    it('should handle objects and arrays', () => {
      const obj = { key: 'value', nested: { data: 123 } };
      const arr = [1, 2, 3, { item: 'test' }];

      logger.info('Object:', obj);
      logger.error('Array:', arr);

      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'Object:', obj);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Array:', arr);
    });
  });

  describe('real-world scenarios', () => {
    it('should support typical logging workflow', () => {
      config.LOG_LEVEL = 'debug';
      config.SHOW_DEV_TOOLS = true;
      jest.resetModules();
      const { logger: workflowLogger } = require('./logger');

      workflowLogger.group('API Request');
      workflowLogger.debug('Request URL:', '/api/users');
      workflowLogger.info('Request sent');
      workflowLogger.time('response-time');
      workflowLogger.timeEnd('response-time');
      workflowLogger.groupEnd();

      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'Request URL:', '/api/users');
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'Request sent');
      expect(consoleTimeSpy).toHaveBeenCalledWith('response-time');
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('response-time');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should handle error logging with stack traces', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      logger.error('An error occurred:', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'An error occurred:', error);
    });
  });
});