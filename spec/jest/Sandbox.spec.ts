import Sandbox from '../../src/new/Sandbox';
import Application from '../../src/new/Application';
import Module from '../../src/new/Module';

describe('Sandbox',  () => {
    it('should be instance of Sandbox',  () => {
        const sandbox = new Sandbox(null);
        expect(sandbox instanceof Sandbox).toBeTruthy();
    });

    it('getConfig should return the config object',  () => {
        const initialConfig = {
            foo: 'bar',
            bar: 'foo',
            namespace: 'App.Components'
        };
        const sandbox = new Application(null, initialConfig)._sandbox;

        const config = sandbox.getConfig();
        expect(config).toBeDefined();
        expect(config).toEqual(initialConfig);
    });

    it('getConfigParam should return the appropriate config param',  () => {
        const initialConfig = {
            foo: 'bar',
            bar: 'foo'
        };
        const sandbox = new Application(null, initialConfig)._sandbox;

        const foo = sandbox.getConfigParam('foo');
        expect(foo).toEqual(initialConfig.foo);

        const bar = sandbox.getConfigParam('bar');
        expect(bar).toEqual(initialConfig.bar);
    });

	it('getConfigParam("namespace") should return a default namespace',  () => {
		const sandbox = new Application(null, null)._sandbox;

		const namespace = sandbox.getConfigParam('namespace');
		expect(namespace).toEqual(Module);
	});

	describe('#addModules(ctx)', () => {
        let application = {
            registerModules: null,
            start: null
        };
        let sandbox;
        beforeEach( () => {
            application = {
                registerModules: jest.fn(),
                start: jest.fn()
            };
            sandbox = new Sandbox(application);
        });

        it('should delegate to the application when called with a Node',  () => {
            sandbox.addModules(document.createElement('div'));

            expect(application.registerModules).toBeCalled();
            expect(application.start).toBeCalled();
        });

        it('should not delegate to the application when called with anything others than a Node',  () => {
            sandbox.addModules({});
            sandbox.addModules('String');
            sandbox.addModules(1);

            expect(application.registerModules).not.toBeCalled();
            expect(application.start).not.toBeCalled();
        });
    });

    describe('#removeModules(modules)', () => {
        let application = {
            unregisterModules: null,
            stop: null
        };
        let sandbox;
        let ctx;
        beforeEach(function () {
            application = {
                unregisterModules: jest.fn(),
                stop: jest.fn()
            };
            sandbox = new Sandbox(application);
            ctx = document.createElement('div');
        });

        it('should delegate to the application when called with a Node', () => {
            sandbox.removeModules(ctx);

            expect(application.unregisterModules).toBeCalled();
            expect(application.stop).toBeCalled();
        });

        it('should delegate to the application when called with a module collection', () => {
            sandbox.removeModules({1 : true});

            expect(application.unregisterModules).toBeCalled();
            expect(application.stop).toBeCalled();
        });

        it('should not delegate to the application when called with anything else', () => {
			sandbox.removeModules([]);
			sandbox.removeModules('String');
            sandbox.removeModules(1);

            expect(application.unregisterModules).not.toBeCalled();
            expect(application.stop).not.toBeCalled();
        });
    });

    describe('.getModuleById(id)', () => {
        let application = {
            getModuleById: null
        };
        let sandbox;
        beforeEach(function () {
            application = {
                getModuleById: jest.fn()
            };
            sandbox = new Sandbox(application);
        });

        it('should delegate to the application', function () {
            sandbox.getModuleById(1);

            expect(application.getModuleById).toBeCalled();
            expect(application.getModuleById).toBeCalledWith(1);
        });
    });
});

