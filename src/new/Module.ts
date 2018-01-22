import EventEmitter from './EventEmitter';

/**
 * Base class for the different modules.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Module
 *
 * @constructor
 * @param {Node} ctx
 *      The context node
 * @param {Sandbox} sandbox
 *      The sandbox to get the resources from
 */
/* global EventEmitter */
export default class Module {
    public _events;
    /**
     * Contains the context node.
	 *
     * @property ctx
     * @type Node
	 */    
	/**
     * The sandbox to get the resources from.
	 *
     * @property _sandbox
     * @type Sandbox
	 */
    
    constructor(public _ctx, public _sandbox) {
        /**
         * The emitter.
         *
         * @property _events
         * @type EventEmitter
         */
        this._events = new EventEmitter(this._sandbox);
    }
    
    /**
     * Template method to start the module.
     *
     * @method start
     * @param {Function} resolve
     *      The resolve promise function
     * @param {Function} reject
     * 		The reject promise function
     */
    start(resolve: Function) {
        resolve();
    }
    
    /**
     * Template method to stop the module.
     *
     * @method stop
     */
    stop() {
        this._events.off().disconnect();
    }
}
