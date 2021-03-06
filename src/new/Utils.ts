/**
 * Utility functions.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Utils
 * @static
 */

import Module from './Module';
export default class Utils {
	/**
	 * Capitalizes the first letter of the given string.
	 *
	 * @method capitalize
	 * @param {String} str
	 *      The original string
	 * @return {String}
	 *      The capitalized string
	 */
	static capitalize(str) {
		return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
	}

	/**
	 * Camelizes the given string.
	 *
	 * @method camelize
	 * @param {String} str
	 *      The original string
	 * @return {String}
	 *      The camelized string
	 */
	static camelize(str) {
		return str.replace(/(\-[A-Za-z])/g, function ($1) {
			return $1.toUpperCase().replace('-', '');
		});
	}

	/**
	 * Check whether the given object is a string.
	 *
	 * @method isString
	 * @param {Object} obj
	 *      The object to check
	 * @return {Boolean}
	 */
	static isString(obj) {
		return (typeof obj) === 'string';
	}

	/**
	 * Check whether the given param is an object.
	 *
	 * @method isObject
	 * @param {Object} obj
	 *      The object to check
	 * @return {Boolean}
	 */
	static isObject(obj) {
		const type = typeof obj;
		return !!obj && (type === 'object' || type === 'function') && !Array.isArray(obj);
	}

	/**
	 * Check whether the given param is a function.
	 *
	 * @method isFunction
	 * @param {Object} obj
	 *      The object to check
	 * @return {Boolean}
	 */
	static isFunction(obj) {
		var type = typeof obj;
		return !!obj && type === 'function';
	}

	/**
	 * Check whether the given param is a valid node.
	 *
	 * @method isNode
	 * @param {Node} node
	 *      The node to check
	 * @return {Boolean}
	 */
	static isNode(node) {
		if (!node || !node.nodeType) {
			return false;
		}

		return node.nodeType === 1 || node.nodeType === 9;
	}

	/**
	 * Check whether the element matches the given selector.
	 *
	 * @method matches
	 * @param {Element} el
	 *      The element to check
	 * @param {String} selector
	 *        The selector to check against
	 * @return {Boolean}
	 */
	static matches(el, selector) {
		return el.matches(selector);
	}

	/**
	 * Extends an object with the given objects.
	 *
	 * @method extend
	 * @param {Object} obj
	 *      The object to extend
	 * @param {Object} ...
	 * @return {Object} the extended object
	 */
	static extend(obj, ...args) {
		if (!Utils.isObject(obj)) {
			return obj;
        }

        return args.reduce((acc, nextProp) => {
            return {
                ...acc,
                ...nextProp
            }
        }, obj);
	}

	/**
	 * Get the element from a given node.
	 *
	 * @method getElement
	 * @param {Node} node
	 *      The node to check
	 * @return {Element}
	 */
	static getElement(node) {
		if (!this.isNode(node)) {
			return null;
		}

		if (node.nodeType === 9 && node.documentElement) {
			return node.documentElement;
		} else {
			return node;
		}
	}

	/**
	 * Get the module nodes.
	 *
	 * @method getModuleNodes
	 * @param {Node} ctx
	 *      The ctx to check
	 * @return {Array}
	 */
	static getModuleNodes(ctx) {
		const nodes = Array.from(ctx.querySelectorAll('[data-t-name]'));
		// check context itself
		if (Utils.matches(ctx, '[data-t-name]')) {
			nodes.unshift(ctx);
		}

		return nodes;
	}

	/**
	 * Creates a module class given a class specification.
	 *
	 * @method createModule
	 * @param {object} spec Class specification.
	 * @return {function} Module constructor function
	 */
	static createModule(spec) {
		// validate params
		if (!spec || !Utils.isObject(spec)) {
			throw Error('Your module spec is not an object. Usage: T.createModule({ … })');
		}

		// Create an object without static params (if they exist)
		let specWithoutStatics = {...spec};
		if(spec.statics) {
			specWithoutStatics = {...specWithoutStatics}
			delete specWithoutStatics.statics;
		}

		// Extend the class with non-static params.
		class ExtendedModule extends Module {
			public _parent;

			constructor(_ctx, _sandbox) {
				super(_ctx, _sandbox);
				const propsToAdd = Object.keys(specWithoutStatics);
				propsToAdd.forEach(propKey => this[propKey] = specWithoutStatics[propKey]);
			}

			decorate(decorateParams) {
				// clone the current functions
				let parentClone;
				const keys = Object.keys(this);
				const functionKeys = keys.filter(key => typeof this[key] === 'function');

				// bind the parentClone object to the copied functions
				parentClone = functionKeys.reduce((acc, key) => ({
					...acc,
					[key]: this[key].bind(parentClone)
				}), {});
				
				// if a parent already exists, copy it over.
				if (this._parent) {
					parentClone._parent = {...this._parent};
				}
				// this._parent = parentClone;
				
				const decorateKeys = Object.keys(decorateParams);
				decorateKeys.forEach(key => {
					if (typeof decorateParams[key] === 'function') {
						this[key] = decorateParams[key];
						// if(this._parent._parent) {
						// 	console.log(this._parent._parent);
						// } else {
						// 	console.log(this._parent);
						// }
					} else if (key !== '_parent') {
						this[key] = decorateParams[key];
					}
				});

				this._parent = parentClone;

				return this;
			}
		};

		// Extend the class with static params
		if(spec.statics) {
			const staticKeys = Object.keys(spec.statics);
			staticKeys.forEach(staticKey => ExtendedModule[staticKey] = spec.statics[staticKey]);
		}
		return ExtendedModule;
	}

	/**
	 * Creates a decorator given a decorator specification.
	 *
	 * @method createDecorator
	 * @param {object} spec Decorator specification.
	 * @return {function} Decorator function
	 */
	static createDecorator(spec) {
		// validate params
		if (!spec || !Utils.isObject(spec)) {
			throw Error('Your decorator spec is not an object. Usage: T.createDecorator({ … })');
		}

		return orig => orig.decorate(spec);
	}
};

