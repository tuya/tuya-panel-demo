const Event = {
  listeners: {},
  on(type: string, cb: (data: any) => void) {
    if (!Event.listeners[type]) {
      Event.listeners[type] = [];
    }
    Event.listeners[type].push(cb);
  },
  off(type: string, cb?: (data: any) => void) {
    if (typeof cb === 'function') {
      const list = Event.listeners[type];
      if (list) {
        const index = list.indexOf(cb);
        if (index >= 0) {
          list.splice(index, 1);
        }
      }
    } else {
      delete Event.listeners[type];
    }
  },
  emit(type: string, data: any) {
    const list = Event.listeners[type] || [];
    list.forEach(cb => {
      cb(data);
    });
  },
};

const addEventListener = (type: string, cb: (data: any) => void): void => {
  Event.on(type, cb);
};

const removeEventListener = (type: string, cb?: (data: any) => void): void => {
  Event.off(type, cb);
};

const pushNotification = (type: string, data: unknown): void => {
  Event.emit(type, data);
};

export const NotificationCenter = {
  addEventListener,
  pushNotification,
  removeEventListener,
};
