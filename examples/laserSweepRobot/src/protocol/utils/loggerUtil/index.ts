export class Logger {
  options = {
    success: '#00cca3',
    error: '#FFaa00',
    info: '#5091F3',
  };

  log(color: string, title: string, ...args: any) {
    console.log(
      `%c Robot Log: ${title}`,
      `background: ${color}; color: #FFFFFF; font-size: 20px`,
      ...args
    );
    // return
    // if (typeof console.groupCollapsed === 'function') {
    //   console.groupCollapsed(
    //     `%c Log: ${title}`,
    //     `background: ${color}; color: #FFFFFF; font-size: 20px`,
    //     `(内容请按小三角展开)`,
    //   );
    //   console.log(...args);
    //   console.groupEnd();
    // }
    // else {
    //   console.log(title);
    //   console.log(...args);
    // }
  }

  success(title: string, ...args: any) {
    this.log(this.options.success, title, ...args);
  }

  error(title: string, ...args: any) {
    if (title === 'system error') {
      debugger;
    }
    this.log(this.options.error, title, ...args);
  }

  info(title: string, ...args: any) {
    this.log(this.options.info, title, ...args);
  }
}

const logger = new Logger();

export default logger;
