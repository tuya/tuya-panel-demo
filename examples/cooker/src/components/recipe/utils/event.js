const EventEmitter = require('events').EventEmitter;

const RNEventEmitter = new EventEmitter();
RNEventEmitter.setMaxListeners(0);

const Event = {};

const eventsFns = ['on', 'once', 'emit'];
eventsFns.forEach(it => (Event[it] = RNEventEmitter[it].bind(RNEventEmitter)));
Event.fire = RNEventEmitter.emit.bind(RNEventEmitter);
Event.remove = RNEventEmitter.removeListener.bind(RNEventEmitter);
Event.off = function(type) {
  if (arguments.length === 1) {
    RNEventEmitter.removeAllListeners(type);
  }

  if (arguments.length === 2) {
    RNEventEmitter.removeListener(type, arguments[1]);
  }
};

export default Event;
