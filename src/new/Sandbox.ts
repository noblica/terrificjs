/**
 * The sandbox is used as a central point to get resources from, add modules etc.
 * It is shared between all modules.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Sandbox
 *
 * @constructor
 * @param {Application} application
 *      The application reference
 */
/* global Utils */
import Utils from './Utils';

export default class Sandbox {
    /**
	 * Contains references to all module event emitters.
	 *
	 * @property _eventEmitters
	 * @type Array
	 */
    public _eventEmitters;
    
    /**
	 * The application.
	 *
	 * @property _application
	 * @type Application
	 */
    constructor(public _application) {
        this._eventEmitters = [];
    }

    /**
     * Adds (register and start) all modules in the given context scope.
     *
     * @method addModules
     * @param {Node} ctx
     *      The context node
     * @return {Object}
     *      A collection containing the registered modules
     */
    addModules(ctx) {
        let modules = {};
		const application = this._application;

        if (Utils.isNode(ctx)) {
            // register modules
            modules = application.registerModules(ctx);

            // start modules
            application.start(modules);
        }

        return modules;
    }

    /**
     * Removes a module by module instances.
     * This stops and unregisters a module through a module instance.
     *
     * @method removeModules
     * @param {any} modules
     *      A collection of module to remove | Node context to look for registered modules in.
     * @return {Sandbox}
     */
    removeModules(modules) {
        const application = this._application;

        if (Utils.isNode(modules)) {
            // get modules
            const tmpModules = {};

            const nodes = Utils.getModuleNodes(modules);
            nodes.forEach((ctx) => {
                // check for instance
                if (ctx.hasAttribute('data-t-id')) {
                    const id = ctx.getAttribute('data-t-id');
                    const module = this.getModuleById(id);

                    if (module) {
                        tmpModules[id] = module;
                    }
                }
            });

            modules = tmpModules;
        }

        if(Utils.isObject(modules)) {
            // stop modules – let the module clean itself
            application.stop(modules);

            // unregister modules – clean up the application
            application.unregisterModules(modules);
        }

        return this;
    }

    /**
     * Gets the appropriate module for the given ID.
     *
     * @method getModuleById
     * @param {int} id
     *      The module ID
     * @return {Module}
     *      The appropriate module
     */
    getModuleById(id) {
        return this._application.getModuleById(id);
    };

    /**
     * Gets the application config.
     *
     * @method getConfig
     * @return {Object}
     *      The configuration object
     */
    getConfig() {
        return this._application._config;
    };

    /**
     * Gets an application config param.
     *
     * @method getConfigParam
     * @param {String} name
     *      The param name
     * @return {any}
     *      The appropriate configuration param
     */
    getConfigParam(name) {
        const config = this._application._config;

        if (config[name] !== undefined) {
            return config[name];
        } else {
            throw Error('The config param ' + name + ' does not exist');
        }
    };

    /**
     * Adds an event emitter instance.
     *
     * @method addEventEmitter
     * @param {EventEmitter} eventEmitter
     *      The event emitter
     * @return {Sandbox}
     */
    addEventEmitter(eventEmitter) {
        this._eventEmitters.push(eventEmitter);
        return this;
    };

    /**
     * Removes an event emitter instance.
     *
     * @method addEventEmitter
     * @param {EventEmitter} eventEmitter
     *      The event emitter
     * @return {Sandbox}
     */
    removeEventEmitter(eventEmitterToRemove) {
        const eventEmitters = this._eventEmitters;
        this._eventEmitters = eventEmitters.filter(
            (emitter) => emitter !== eventEmitterToRemove
        );
        return this;
    };

    /**
     * Dispatches the event with the given arguments to the attached event emitters.
     *
     * @method dispatch
     * @param {Mixed} ...
     * @return {Sandbox}
     */
    dispatch(...args) {
        const eventEmitters = this._eventEmitters;

        eventEmitters.forEach(eventEmitter => {
            if(eventEmitter) {
                eventEmitter.handle(args);
            }
        });

        return this;
    };
}
