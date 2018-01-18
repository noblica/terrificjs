/*!
 * TerrificJS modularizes your frontend code by solely relying on naming conventions.
 * http://terrifically.org
 *
 * @copyright   Copyright (c) <%= year %> Remo Brunschwiler
 * @license     Licensed under MIT license
 * @version     <%= version %>
 */

/**
 * @module T
 */

 import Sandbox from './Sandbox';
 import Module from './Module';
 import Utils from './Utils';

/**
 * Responsible for application-wide issues such as the creation of modules.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Application
 */
/* global Sandbox, Utils, Module */

export default class Application {
    public _sandbox: Sandbox;
    public _modules: Object;
    public _id: number;

    /**
    * @param _ctx
    * @constructor
    * @param {Node} ctx
    *      The context node
    * @param {Object} config
    *      The configuration
    */
    constructor(public _ctx: Node, public _config: Object) {
        // validate params
        if (!_ctx && !_config) {
            // both empty
            this._ctx = document;
            _config = {};
        } else if (Utils.isNode(_config)) {
            // reverse order of arguments
            const tmpConfig = _config;
            this._config = _ctx;
            this._ctx = tmpConfig;
        } else if (!Utils.isNode(_ctx) && !_config) {
            // only config is given
            this._config = _ctx;
            this._ctx = document;
        } else if (Utils.isNode(_ctx) && !_config) {
            // only _ctx is given
            this._config = {};
        }

        var defaults = {
            namespace: Module
        };

        this._config = Utils.extend(defaults, this._config);

        /**
         * The context node.
         *
         * @property _ctx
         * @type Node
         */
        this._ctx = Utils.getElement(this._ctx);

        /**
         * The configuration.
         *
         * @property config
         * @type Object
         */

        /**
         * The sandbox to get the resources from.
         * The singleton is shared between all modules.
         *
         * @property _sandbox
         * @type Sandbox
         */
        this._sandbox = new Sandbox(this);

        /**
         * Contains references to all modules on the page.
         *
         * @property _modules
         * @type Object
         */
        this._modules = {};

        /**
         * The next unique module id to use.
         *
         * @property id
         * @type Number
         */
        this._id = 1;
    }

    /**
     * Register modules within the context
     * Automatically registers all modules within the context,
     * as long as the modules use the naming conventions.
     *
     * @method registerModules
     * @param {Node} ctx
     *      The context node
     * @return {Object}
     *      A collection containing the registered modules
     */
    registerModules(ctx) {
        const modules = {};
        ctx = Utils.getElement(ctx) || this._ctx;
    
        this._sandbox.dispatch('t.register.start');
    
        // get module nodes
        const nodes = Utils.getModuleNodes(ctx);
        nodes.forEach((ctx) => {
    
            /*
             * A module can have different data attributes.
             * See below for possible values.
             */
    
            /*
             * @config data-t-name="{mod-name}"
             *
             * Example: data-t-name="foo"
             * Indicates that the module Foo should be bound.
             */
    
            /*
             * @config data-t-namespace="{namespace}"
             *
             * Example: data-t-namespace="App.Components"
             * The namespace of the module. Optional.
             */
    
            /*
             * @config data-t-decorator="{decorator-name}"
             *
             * Example: data-t-decorator="bar"
             * Indicates that the module Foo should be decorated with the Bar decorator.
             * Multiple decorators should be comma-separated. Optional.
             */
            const name = ctx.getAttribute('data-t-name');
            const decorator = ctx.getAttribute('data-t-decorator');
            const namespace = ctx.getAttribute('data-t-namespace');
            const module = this.registerModule(ctx, name, decorator, namespace);
            
            if (module) {
                modules[module._ctx.getAttribute('data-t-id')] = module;
            }
        });
    
        this._sandbox.dispatch('t.register.end');
    
        return modules;
    };

    /**
     * Unregisters the modules given by the module instances.
     *
     * @method unregisterModules
     * @param {Object} modules
     *      A collection containing the modules to unregister
     */
    unregisterModules(modules: Object) {
        const modulesToUnregister = modules || this._modules;
    
        this._sandbox.dispatch('t.unregister.start');

        const moduleIds = Object.keys(modulesToUnregister);

        // unregister the given modules        
        moduleIds.forEach(id => {
            const moduleToRemove = this._modules[id];
            if (moduleToRemove) {
                if(Utils.isNode(moduleToRemove._ctx)) {
                    moduleToRemove._ctx.removeAttribute('data-t-id');
                }
                delete this._modules[id];
            }
        });
    
        this._sandbox.dispatch('t.unregister.end');
    };

    /**
     * Starts (intializes) the registered modules.
     *
     * @method start
     * @param {Object} modules
     *      A collection of modules to start
     * @return {Promise}
     *      The synchronize Promise
     */
    start(modules: Object) {
        const modulesToStart = modules || this._modules;
    
        const promises = [];
    
        this._sandbox.dispatch('t.start');

        // start the modules
        const moduleIds = Object.keys(modulesToStart);
        moduleIds.forEach(id => {
            const moduleToStart = modulesToStart[id];
            const promise = new Promise((resolve, reject) => {
                moduleToStart.start(resolve, reject);
            });

            promises.push(promise);            
        });
    
        // synchronize modules
        const all = Promise.all(promises);
        all.then(() => {
            this._sandbox.dispatch('t.sync');
        })
        .catch(function (err) {
            throw err;
        });
    
        return all;
    };

    /**
     * Stops the registered modules.
     *
     * @method stop
     * @param {Object} modules
     *      A collection of modules to stop
     */
    stop(modules) {
        const modulesToStop = modules || this._modules;

        this._sandbox.dispatch('t.stop');

        // stop the modules
        const moduleKeys = Object.keys(modulesToStop);
        moduleKeys.forEach(moduleKey => modulesToStop[moduleKey].stop());
    }

    /**
     * Registers a module.
     *
     * @method registerModule
     * @param {Node} ctx
     *      The context node
     * @param {String} mod
     *      The module name. It must match the class name of the module
     * @param {Array} decorators
     *      A list of decorator names. Each entry must match a class name of a decorator
     * @param {String} namespace
     *      The module namespace
     * @return {Module}
     *      The reference to the registered module
     */
    registerModule(
        ctx: Element,
        mod: String,
        decorators: Array<any> | String | Object,
        namespace: String
    ) {    
        // validate params
        if(ctx.hasAttribute('data-t-id')) {
            return null; // prevent from registering twice
        }
    
        const newMod = Utils.capitalize(Utils.camelize(mod));
        let newDecorators = decorators;
        let newNamespace;
    
        if (Utils.isString(decorators)) {
            if (window[decorators]) {
                // decorators param is the namespace
                newNamespace = window[decorators];
                newDecorators = null;
            } else {
                // convert string to array
                newDecorators = decorators.split(',');
            }
        } else if (!Array.isArray(decorators) && Utils.isObject(decorators)) {
            // decorators is the namespace object
            newNamespace = decorators;
            newDecorators = null;
        }
    
        newDecorators = newDecorators || [];
        newDecorators = newDecorators.map(decorator => {
            const trimmed = decorator.trim();
            const camelized = Utils.camelize(trimmed);
            return Utils.capitalize(camelized);
        });
    
        newNamespace = newNamespace || this._config.namespace;

        const newModule = newNamespace[newMod];
        if (newModule) {
            // assign the module a unique id
            var id = this._id++;
            ctx.setAttribute('data-t-id', id);
    
            // instantiate module
            const modules = this._modules;
            modules[id] = new newModule(ctx, this._sandbox);
    
            // decorate it
            newDecorators.forEach(decorator => {
                if (newModule[decorator]) {
                    const valueToReturn = newModule[decorator](modules[id]);
                    // return valueToReturn;
                }
            });
    
            return modules[id];
        }
    
        this._sandbox.dispatch('t.missing', ctx, newMod, newDecorators, newNamespace);
    
        return null;
    };

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
        if (!this._modules[id]) {
            throw Error(`The module with the id ${id} does not exist`);
        }
        return this._modules[id];
    };
}
