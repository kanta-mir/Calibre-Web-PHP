/**
 * event-emitter.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2019 Google Inc.
 */

/**
 * An EventEmitter is an object that can emit events which it will send to any subscribers.
 * Subscribers can subscribe to individual events, or can subscribe to all types of events
 * from this EventEmitter.
 * The callback functions are bound at call-time.
 * Each context object can have only one callback function per type.
 * TODO: When EventTarget constructors are broadly supported, remove this.
 *     https://caniuse.com/#feat=mdn-api_eventtarget_eventtarget
 */
export class EventEmitter {
  constructor() {
    /**
     * This is a map from event-type to a map of bound functions.  The map of bound functions
     * is keyed by the object context.
     * @private {Map<string, Map<Object, Function>>}
     */
    this.subscriberMap_ = new Map();

    /**
     * A map of subscribers to all events from this EventEmitter.  The map of bound functions
     * is keyed by the object context.
     * @private {Map<Object, Function>}
     */
    this.allEventSubscriberMap_ = new Map();
  }

  /**
   * Adds a subscriber for the event type.
   * @param {Object} context
   * @param {Function} callbackFn
   * @param {string} eventType
   */
  subscribe(context, callbackFn, eventType) {
    if (!eventType || typeof eventType !== 'string') {
      throw 'eventType must be a string in subscribe()';
    }
    if (!context || typeof context != 'object') {
      throw 'Must set a context object when binding a callback function in subscribe()';
    }
    if (!callbackFn || typeof callbackFn !== 'function') {
      throw 'Invalid callback function sent to subscribe()';
    }

    if (!this.subscriberMap_.has(eventType)) {
      this.subscriberMap_.set(eventType, new Map());
    }
    const eventSubscriberMap = this.subscriberMap_.get(eventType);
    eventSubscriberMap.set(context, callbackFn);
  }

  /**
   * Adds a subscriber for all event types.
   * TODO:  Should I merge this with subscribe() above, like I did with unsubscribe()?
   * @param {Object} context
   * @param {Function} callbackFn
   */
  subscribeToAllEvents(context, callbackFn) {
    this.allEventSubscriberMap_.set(context, callbackFn);
  }

  /**
   * Removes the subscriber for the event type.  If eventType is not specified, then the
   * subscriber for all events is removeed.
   * @param {Object} context
   * @param {string?} eventType
   */
  unsubscribe(context, eventType = undefined) {
    if (eventType) {
      const eventSubscriberMap = this.subscriberMap_.get(eventType);
      if (eventSubscriberMap) {
        eventSubscriberMap.delete(context);
      }
    } else {
      this.allEventSubscriberMap_.delete(context);
    }
  }

  /**
   * Function used by sub-classes to notify all subscribers.
   * @param {Object} evt The event to send to all subscribers.  Must have a type string property.
   */
  notify(evt) {
    if (!evt || typeof evt !== 'object' || !(evt.type) || typeof evt.type !== 'string') {
      console.dir(evt);
      throw 'Invalid caxll to notify() with an improper event';
    }

    const eventType = evt.type;
    const eventSubscriberMap = this.subscriberMap_.get(eventType);
    if (eventSubscriberMap) {
      for (const context of eventSubscriberMap.keys()) {
        const boundCallbackFn = eventSubscriberMap.get(context).bind(context);
        boundCallbackFn(evt);
      }
    }

    // Now send to all subscribers that are subscribed to all events from this EventEmitter.
    for (const context of this.allEventSubscriberMap_.keys()) {
      const boundCallbackFn = this.allEventSubscriberMap_.get(context).bind(context);
      boundCallbackFn(evt);
    }
  }
}
