import Module from '../../src/new/Module';
import Sandbox from '../../src/new/Sandbox';

describe('Module', () => {

    it('should be instance of Module', () => {
		const module = new Module(document.createElement('div'), new Sandbox(null));
        expect(module instanceof Module).toBeTruthy();
    });

    it('should set instance variables', () => {
        const ctx = document.createElement('div');
        const sandbox = new Sandbox(null);
        const module = new Module(ctx, sandbox);

        expect(module._ctx).toBe(ctx);
        expect(module._sandbox).toBe(sandbox);
    });

    describe('#start()', () => {
        it('should not throw an error if the start and stop methods are missing', function () {
			const module = new Module(document.createElement('div'), new Sandbox(null));

            expect(function() {
                module.start(function() {});
            }).not.toThrow();
        });
    });
});

