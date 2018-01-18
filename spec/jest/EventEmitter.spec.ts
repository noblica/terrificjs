import Sandbox from '../../src/new/Sandbox';
import Application from '../../src/new/Sandbox';
import EventEmitter from '../../src/new/EventEmitter';

describe('EventEmitter', () => {
    let sandbox;
    let eventEmitter;
	beforeEach( () => {
		sandbox = new Sandbox(new Application());
        eventEmitter = new EventEmitter(sandbox);
	});

	describe('.on(event, listener)', () => {
		it('should call connect', () => {
            eventEmitter.connect = jest.fn();

			eventEmitter.on('foo', () => {});

			expect(eventEmitter.connect).toBeCalled();
		});

		it('should add listeners', () => {
			const calls = [];

			eventEmitter.on('foo', (val) => {
				calls.push('one', val);
			});

			eventEmitter.on('foo', (val) => {
				calls.push('two', val);
			});

			eventEmitter.emit('foo', 1);
			eventEmitter.emit('bar', 1);
			eventEmitter.emit('foo', 2);

			expect(calls).toEqual([ 'one', 1, 'two', 1, 'one', 2, 'two', 2 ]);
		});

		it('should add listeners for events which are same names with methods of Object.prototype', () => {
			const calls = [];

			eventEmitter.on('constructor', (val) => {
				calls.push('one', val);
			});

			eventEmitter.on('__proto__', (val) => {
				calls.push('two', val);
			});

			eventEmitter.emit('constructor', 1);
			eventEmitter.emit('__proto__', 2);

			expect(calls).toEqual([ 'one', 1, 'two', 2 ]);
		});
	});

	describe('.once(event, listener)', () =>{
		it('should call connect', () => {
			eventEmitter.connect = jest.fn();

			eventEmitter.on('foo', () => {});

			expect(eventEmitter.connect).toBeCalled();
		});

		it('should add a single-shot listener', () => {
			const calls = [];

			eventEmitter.once('foo', (val) => {
				calls.push('one', val);
			});

			eventEmitter.emit('foo', 1);
			eventEmitter.emit('foo', 2);
			eventEmitter.emit('foo', 3);
			eventEmitter.emit('bar', 1);

			expect(calls).toEqual([ 'one', 1 ]);
		});
	});

	describe('.off(event, listener)', () => {
		it('should remove a listener', () => {
			const calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			eventEmitter.on('foo', one);
			eventEmitter.on('foo', two);
			eventEmitter.off('foo', two);

			eventEmitter.emit('foo');

			expect(calls).toEqual(['one']);
		});

		it('should work with .once()', () => {
			const calls = [];

			function one() { calls.push('one'); }

			eventEmitter.once('foo', one);
			eventEmitter.once('fee', one);
			eventEmitter.off('foo', one);

			eventEmitter.emit('foo');

			expect(calls).toEqual([]);
		});

		it('should work when called from an event', () => {
			let called;

			function b() {
				called = true;
			}

			eventEmitter.on('foo', () => {
				eventEmitter.off('foo', b);
			});

			eventEmitter.on('foo', b);
			eventEmitter.emit('foo');
			expect(called).toBeTruthy();

			called = false;
			eventEmitter.emit('foo');
			expect(called).toBeFalsy();
		});
	});

	describe('.off(event)', () => {
		it('should remove all listeners for an event', () => {
			var calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			eventEmitter.on('foo', one);
			eventEmitter.on('foo', two);
			eventEmitter.off('foo');

			eventEmitter.emit('foo');
			eventEmitter.emit('foo');

			expect(calls).toEqual([]);
		});
	});

	describe('.off()', () => {
		it('should remove all listeners', () => {
			const calls = [];

			function one() { calls.push('one'); }
			function two() { calls.push('two'); }

			eventEmitter.on('foo', one);
			eventEmitter.on('bar', two);

			eventEmitter.emit('foo');
			eventEmitter.emit('bar');

			eventEmitter.off();

			eventEmitter.emit('foo');
			eventEmitter.emit('bar');

			expect(calls).toEqual(['one', 'two']);
		});
	});

	describe('.emit(event, arguments)', () => {
		it('should call connect', () => {
			eventEmitter.connect = jest.fn();

			eventEmitter.on('foo', () => {});

			expect(eventEmitter.connect).toBeCalled();
		});

		it('should delegate to the sandbox dispatch method', () => {
			sandbox.dispatch = jest.fn();

			eventEmitter.emit('foo', 1, 'foo', { foo: 'bar'});

			expect(sandbox.dispatch).toBeCalledWith('foo', 1, 'foo', { foo: 'bar'});
		});
	});

	describe('.handle(event, arguments)', () => {
		it('should handle the emitted event', () =>  {
			eventEmitter.handle = jest.fn();

			eventEmitter.emit('foo', 1, 'foo', { foo: 'bar'});

			expect(eventEmitter.handle).toBeCalledWith('foo', 1, 'foo', { foo: 'bar'});
		});
	});

	describe('.connect()', () => {
		it('should add itself to the sandbox', () => {
			sandbox.addEventEmitter = jest.fn();

			eventEmitter.connect();

			expect(sandbox.addEventEmitter).toBeCalledWith(eventEmitter);
		});

		it('should add itself only once to the sandbox', () => {
			sandbox.addEventEmitter = jest.fn();

			eventEmitter.connect();
			eventEmitter.connect();

			expect(sandbox.addEventEmitter).toHaveBeenCalledTimes(1);
		});

		it('should set _connected to true', () => {
			eventEmitter.connect();

			expect(eventEmitter._connected).toBeTruthy();
		});
	});

	describe('.disconnect()', () => {
		it('should remove itself from the sandbox', () => {
			sandbox.removeEventEmitter = jest.fn();

			eventEmitter.connect();
			eventEmitter.disconnect();

			expect(sandbox.removeEventEmitter).toBeCalledWith(eventEmitter);
		});

		it('should set _connected to false', () => {
			eventEmitter.connect();
			eventEmitter.disconnect();

			expect(eventEmitter._connected).toBeFalsy();
		});

		it('should do nothing if not already connected', () => {
			eventEmitter.disconnect();

			expect(eventEmitter._connected).toBeFalsy();
		});
	});

	describe('.listeners(event)', () => {
		describe('when handlers are present', () => {
			it('should return an array of callbacks', () => {
				function foo(){}
				eventEmitter.on('foo', foo);
				expect(eventEmitter.listeners('foo')).toEqual([foo]);
			});
		});

		describe('when no handlers are present', () => {
			it('should return an empty array', () => {
				expect(eventEmitter.listeners('foo')).toEqual([]);
			});
		});
	});

	describe('.hasListeners(event)', () => {
		describe('when handlers are present', () => {
			it('should return true', () => {
				eventEmitter.on('foo', () => {});
				expect(eventEmitter.hasListeners('foo')).toBeTruthy();
			});
		});

		describe('when no handlers are present', () => {
			it('should return false', () => {
				expect(eventEmitter.hasListeners('foo')).toBeFalsy();
			});
		});
	});
});