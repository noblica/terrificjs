import Utils from '../../src/new/Utils';
import Module from '../../src/new/Module';

describe('Utils', () => {
    describe('#createModule()', () => {
        it('should throw an error if no spec is given', () => {
            expect(() => Utils.createModule()).toThrow();
        });

        it('should not throw an error if a valid spec is given', () => {
			expect(function () {
				Utils.createModule({});
			}).not.toThrow();
        });

        it('should return module constructor function', function () {
			const Module = Utils.createModule({});
			expect(Module instanceof Function).toBeTruthy();
		});

		it('should allow creation of prototype properties', function () {
			const Module = Utils.createModule({
				foo: 'foo',
				bar: function() {
					return 'bar';
				}
			});

			expect(new Module().foo).toBe('foo');
			expect(new Module().bar()).toBe('bar');
		});


		it('should allow creation of static properties', function () {
			const Module = Utils.createModule({
				name: 'Foo',
				statics: {
					foo: function () {
						return 'foo';
					},
					bar: 'bar'
				}
			});

			expect(Module.foo()).toBe('foo');
			expect(Module.bar).toBe('bar');
		});
	});
});