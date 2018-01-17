/**
 * Responsible for inter-module communication.
 * Classic EventEmitter Api. Heavily inspired by https://github.com/component/emitter
 *
 * @author Remo Brunschwiler
 * @class EventEmitter
 *
 * @constructor
 *
 * @param {Sandbox} sandbox
 *      The sandbox instance
 */
export default class EventEmitter {
	/**
	 * The listeners.
	 *
	 * @property _listeners
	 * @type Object
	 */
    public _listeners;

	/**
	 * Indicates whether the instance is connected to the sandbox.
	 *
	 * @property _connected
	 * @type Boolean
	 */
    public _connected;
    
    /**
     * The sandbox instance.
     *
     * @property _sandbox
     * @type Sandbox
     */
    constructor(public _sandbox) {
        this._listeners = {};
        this._connected = false;
    }

    /**
     * Connect instance to the sandbox.
     *
     * @method connect
     * @return {EventEmitter}
     */
    connect() {
        if (!this._connected) {
            this._sandbox.addEventEmitter(this);
            this._connected = true;
        }

        return this;
    };

    /**
     * Adds a listener for the given event.
     *
     * @method on
     * @param {String} event
     * @param {Function} listener
     * @return {EventEmitter}
    */
    addEventListener(event: String, listener: Function | Object) {
        this.connect();

        const currentListeners = this._listeners[`$${event}`] || [];
        currentListeners.push(listener);

        return this;
    }

    // Alias for addEventListener
    on(event: String, listener: Function | Object) {
        this.addEventListener(event, listener);
    }

    /**
     * Remove the given listener for the given event or all
     * registered listeners.
     *
     * @method off
     * @param {String} event
     * @param {Function} listener
     * @return {EventEmitter}
     */
    removeListener(...args: Array<any>) {
        const event: string = args[0];
        const listener: Function = args[1];

        // all
        if (args.length === 0) {
            this._listeners = {};
            return this;
        }

        // specific event
        const listeners = this._listeners[`$${event}`];
        if (!listeners) {
            return this;
        }

        // remove all listeners
        if (args.length === 1) {
            delete this._listeners[`$${event}`];
            return this;
        }

        // remove specific listener
        const filteredListeners = listeners.filter(listenerToCheck => (
                listenerToCheck !== listener &&
                listenerToCheck.listener !== listener
            ));

        return this;
    }

    off(event: String, listener: Function | Object) {
        this.removeListener(event, listener);
    }

    /**
     * Adds a listener that will be invoked a single
     * time and automatically removed afterwards.
     *
     * @method once
     * @param {String} event
     * @param {Function} listener
     * @return {EventEmitter}
     */
    once(event: String, listener: Function) {
        this.connect();

        const args = arguments;
        const listenerWrapper = {
            listenOnce: () => {
                this.removeListener(event, listener);
                listener(args);
            },
            listener
        }
        this.addEventListener(event, listenerWrapper);
        return this;
    }

    /**
     * Dispatches event to the sandbox.
     *
     * @method emit
     * @param {Mixed} ...
     * @return {EventEmitter}
     */
    emit(...args) {
        this.connect();

        // dispatches event to the sandbox
        this._sandbox.dispatch.apply(this._sandbox, args);

        return this;
    }

    /**
     * Handles dispatched event from sandbox.
     *
     * @method handle
     * @param {String} event
     * @param {Mixed} ...
     * @return {EventEmitter}
     */
    handle(event: String, ...args) {
		const listeners = this._listeners[`$${event}`];

        if (listeners) {
            listeners.forEach(listener => listener(...args));
        }

        return this;
    }

    /**
     * Return array of listeners for the given event.
     *
     * @method listeners
     * @param {String} event
     * @return {Array}
     */
    listeners(event: String) {
        return this._listeners[`$${event}`] || [];
    }

    /**
     * Check if this event emitter has listeners.
     *
     * @method hasListeners
     * @param {String} event
     * @return {Boolean}
     */
    hasListeners(event: String): Boolean {
        return !!this.listeners(event).length;
    }

    /**
     * Disconnect instance from the sandbox.
     *
     * @method disconnect
     * @return {EventEmitter}
     */
    disconnect(): EventEmitter {
        if (this._connected) {
            this._sandbox.removeEventEmitter(this);
            this._connected = false;
        }
    
        return this;
    }
}

