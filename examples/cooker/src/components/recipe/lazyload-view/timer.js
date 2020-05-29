class Timer {
  constructor() {
    this.timeOutQueue = new Map();
    this.intervalQueue = new Map();
  }

  setTimeout(id, func, delay = 100) {
    this.clearTimeout(id);
    this.timeOutQueue.set(
      id,
      setTimeout(() => func(), delay)
    );
  }

  clearTimeout(id) {
    if (this.timeOutQueue.has(id)) {
      const _timerOut = this.timeOutQueue.get(id);
      this.timeOutQueue.delete(id);
      clearTimeout(_timerOut);
    }
  }

  setInterval(id, func, delay = 100) {
    this.clearInterval(id);
    this.intervalQueue.set(
      id,
      setInterval(() => func(), delay)
    );
  }

  clearInterval(id) {
    if (this.intervalQueue.has(id)) {
      const _Interval = this.intervalQueue.get(id);
      this.intervalQueue.delete(id);
      clearInterval(_Interval);
    }
  }

  destroy() {
    const _sizeOne = this.timeOutQueue.size;
    const _sizeTwo = this.intervalQueue.size;
    if (_sizeOne) {
      this.timeOutQueue.forEach(key => clearTimeout(key));
      this.timeOutQueue.clear();
    }
    if (_sizeTwo) {
      this.intervalQueue.forEach(key => clearInterval(key));
      this.intervalQueue.clear();
    }
  }
}

export default new Timer();
