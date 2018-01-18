import Application from '../../src/new/Application';
import EventEmitter from '../../src/new/EventEmitter';
import T from '../../src/new/exports';

describe('Application', () => {

    it('should be instance of Application', () => {
        const application = new Application();
        expect(application instanceof Application).toBeTruthy();
    });

    it('should have default ctx when called with no args', () => {
        const application = new Application();
        expect(application._ctx).toEqual(document.documentElement);
    });

    it('should have default ctx when called with config only', () => {
        const config = {
            foo: 'bar'
        };
        const application = new Application(config);
        expect(application._ctx).toEqual(document.documentElement);
    });

    it('should support normal order of constructor arguments', () => {
        const config = {
            foo: 'bar'
        };
        const el = document.createElement('div');
        const application = new Application(el, config);
        expect(application._ctx).toEqual(el);
    });

    it('should support reverse order of constructor arguments', () => {
        const config = {
            foo: 'bar'
        };
        const el = document.createElement('div');
        const application = new Application(config, el);
        expect(application._ctx).toEqual(el);
    });

    const fooModuleConfig = {
        value: 'foo',
        foo: function() {
            return 'foo';
        },
        get : function () {
            return this.value;
        }
    };
    
    describe('.registerModules(ctx)', () => {
        let application;
        let ctx;

        beforeEach(() => {
            application = new T.Application();
            ctx = document.createElement('div');
            jest.spyOn(application, 'registerModule');
            T.Module.Foo = T.createModule(fooModuleConfig);
        });

        it('should register module on ctx node', () => {
            ctx.setAttribute('data-t-name', 'Foo');
            const modules = application.registerModules(ctx);

            expect(application.registerModule).toHaveBeenCalledTimes(1);
            expect(application.registerModule).toBeCalledWith(ctx, 'Foo', null, null);
            expect(modules['1']).toMatchObject(fooModuleConfig);
        });

        it('should register module on child node', () => {
            ctx.innerHTML = '<div data-t-name="Foo"></div>';
            var modules = application.registerModules(ctx);

            expect(application.registerModule).toHaveBeenCalledTimes(1);
            expect(application.registerModule).toHaveBeenCalledWith(ctx.firstChild, 'Foo', null, null);
            expect(modules['1']).toMatchObject(fooModuleConfig);
        });

        it('should register multiple modules on sibling nodes', () => {
            ctx.innerHTML = '<div data-t-name="Foo"></div><div data-t-name="Foo"></div>';
            var modules = application.registerModules(ctx);

            expect(application.registerModule).toHaveBeenCalledTimes(2);
            const keys = Object.keys(modules);
            keys.forEach(key => expect(modules[key]).toMatchObject(fooModuleConfig));
        });

        it('should register multiple modules on nested nodes', () => {
            ctx.innerHTML = '<div data-t-name="Foo"><div data-t-name="Foo"></div></div>';
            var modules = application.registerModules(ctx);

            expect(application.registerModule).toHaveBeenCalledTimes(2);
            const keys = Object.keys(modules);
            keys.forEach(key => expect(modules[key]).toMatchObject(fooModuleConfig));
        });

        describe('should emit lifecycle event', () => {
            let eventEmitter;

            beforeEach(() => {
                eventEmitter = new EventEmitter(application._sandbox);
            });

            it('t.register.start without arguments', (done) => {
                eventEmitter.on('t.register.start', (args) => {
                    expect(args).toBeUndefined();
                    done();
                });

                application.registerModules(ctx);
            });

            it('t.register.end without arguments', (done) => {
                eventEmitter.on('t.register.end', (args) => {
                    expect(args).toBeUndefined();
                    done();
                });

                application.registerModules(ctx);
            });
        });
    });

    describe('.unregisterModules()', () => {
        let application;
        beforeEach(() => {
            application = new Application();
        });

        it('should unregister all modules', () => {
            const modules = {1: true, 2: true, 3: true};
            application._modules = modules;
            application.unregisterModules();

            expect(Object.keys(application._modules).length).toEqual(0);
        });

        describe('should emit lifecycle event', () => {
            let eventEmitter;
            beforeEach(() => {
                eventEmitter = new EventEmitter(application._sandbox);
            });

            it('t.unregister.start without arguments', (done) => {
                eventEmitter.on('t.unregister.start', (args) => {
                    expect(args).toBeUndefined();
                    done();
                });

                application.unregisterModules();
            });

            it('t.unregister.end without arguments', (done) => {
                eventEmitter.on('t.unregister.end', (args) => {
                    expect(args).toBeUndefined();
                    done();
                });

                application.unregisterModules();
            });
        });
    });

    describe('.unregisterModules(modules)', () => {
        let application;

        beforeEach(() => {
            application = new Application();
        });

        it('should unregister the given modules', () => {
            application._modules = {1: true, 2: true, 3: true};
            application.unregisterModules({1: true, 2: true});

            expect(application._modules).toEqual({3: true});
        });

        describe('should emit lifecycle event', () => {
            let eventEmitter;
            beforeEach(() => {
                eventEmitter = new EventEmitter(application._sandbox);
            });

            it('t.unregister.start without arguments', (done) => {
                eventEmitter.on('t.unregister.start', (args) => {
                    expect(args).toBeUndefined();
                    done();
                });

                application.unregisterModules();
            });

            it('t.unregister.end without arguments', (done) => {
                eventEmitter.on('t.unregister.end', (args) => {
                    expect(args).toBeUndefined();
                    done();
                });

                application.unregisterModules();
            });
        });
    });

    describe('.getModuleById(id)', () => {
        let application;

        beforeEach(() => {
            application = new Application();
        });

        it('should throw an error for undefined id', () => {
            expect(() => {
                application.getModuleById();
            }).toThrow();
        });

        it('should not throw an error for invalid id', () => {
            expect(() => {
                application.getModuleById(1);
            }).toThrow();
        });

        it('should return registered module instance', () => {
            application._modules = {3: true};
            const instance = application.getModuleById(3);
            expect(instance).toBeTruthy();
        });

        it('should cast the id', () => {
            application._modules = {3: true};
            const instance = application.getModuleById('3');
            expect(instance).toBeTruthy();
        });
    });

    describe('.registerModule(ctx, mod, decorators, namespace)', () => {
        let application;
        let ctx;
        const fooStartConfig = {
            start: function(resolve) {
                resolve();
            }
        }
        const App = {
            Components: {
                Foo: T.createModule({
                    name: 'Foo',
                    bar: function () {
                        return 'bar';
                    }
                })
            }
        };

        beforeEach(() => {
            application = new T.Application();
            ctx = document.createElement('div');
            T.Module.Foo = T.createModule(fooModuleConfig);
            T.Module.FooStart = T.createModule(fooStartConfig);
            T.Module.Foo.Bar = T.createDecorator({
                value: 'bar',
                start : function (resolve, reject) {
                    this._parent.start(resolve, reject);
                },
            
                bar : function () {
                    return "bar";
                },
            
                foo : function () {
                    var value = this._parent.foo();
                    return 'bar-foo|' + value;
                },
            
                get : function () {
                    var value = this._parent.get();
                    return this.value + '|' + value;
                }
            });
            
            T.Module.Foo.FooBar = T.createDecorator({
                value: 'foobar',
                start : function (resolve, reject) {
                    this._parent.start(resolve, reject);
                },
            
                foobar : function () {
                    return "foobar";
                },
            
                foo : function () {
                    var value = this._parent.foo();
                    return 'foobar-foo|' + value;
                },
            
                get : function () {
                    var value = this._parent.get();
                    return this.value + '|' + value;
                }
            });
        });

        it('should allow to be called with ctx and module name only', () => {
            expect(() => {
                application.registerModule(ctx, 'DoesNotExist');
            }).not.toThrow();
        });

        it('should return null if the module does not exists', () => {
            const module = application.registerModule(ctx, 'DoesNotExist');
            expect(module).toBeNull();
        });

        it('should emit lifecycle event t.missing if the module does not exists', (done) => {
            const eventEmitter = new EventEmitter(application._sandbox);

            eventEmitter.on('t.missing', (ctx, mod, decorators) => {
                expect(ctx).toEqual(ctx);
                expect(mod).toEqual('DoesNotExist');
                expect(decorators).toEqual([]);
                done();
            });

            application.registerModule(ctx, 'DoesNotExist');
        });

        it('should return module instance if module does exists', () => {
            const module = application.registerModule(ctx, 'Foo');
            expect(module instanceof T.Module).toBeTruthy();
        });

        it('should support capitalized camelCase names', () => {
            const module = application.registerModule(ctx, 'FooStart');
            expect(module instanceof T.Module.FooStart).toBeTruthy();
        });

        it('should support camelCase names', () => {
            const module = application.registerModule(ctx, 'fooStart');
            expect(module instanceof T.Module.FooStart).toBeTruthy();
        });

        it('should support kebab-case names', () => {
            const module = application.registerModule(ctx, 'foo-start');
            expect(module instanceof T.Module.FooStart).toBeTruthy();
        });

        it('should support namespace as string', () => {
            const module = application.registerModule(ctx, 'Foo', 'App.Components');
            expect(module instanceof T.Module).toBeTruthy();
        });

        it('should support namespace as object', () => {
            const module = application.registerModule(ctx, 'Foo', App.Components);
            expect(module instanceof T.Module).toBeTruthy();
        });

        it('should assign ctx node and sandbox to the module instance', () => {
            const module = application.registerModule(ctx, 'Foo');
            expect(module._ctx instanceof Node).toBeTruthy();
            expect(module._sandbox instanceof T.Sandbox).toBeTruthy();
        });

        it('should set data-t-id on the ctx node', () => {
            const module = application.registerModule(ctx, 'Foo');
            expect(Number(module._ctx.getAttribute('data-t-id'))).toEqual(1);
        });

        it('should have default start and stop callbacks', () => {
            const module = application.registerModule(ctx, 'Foo');

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.start).toBeDefined();
            expect(module.stop).toBeDefined();
        });

        it('should not do anything if decorator does not exists', () => {
            expect(() => {
                module = application.registerModule(ctx, 'Foo', ['DoesNotExists']);
            }).not.toThrow();

            expect(module instanceof T.Module.Foo).toBeTruthy();
        });

        it.only('should decorate the module if decorator does exists', () => {
            const module = application.registerModule(ctx, 'Foo', ['Bar']);

            console.log(module);
            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();
            expect(module.bar()).toEqual('bar');
        });

		it('should delete temporary _parent property on decorator', function () {
			var module = application.registerModule(ctx, 'Foo', ['Bar', 'FooBar']);

			expect(module instanceof T.Module.Foo).toBeTruthy();
			expect(module._parent).not.toBeDefined();
		});

        it('should decorate the module with multiple decorators', function () {
            var module = application.registerModule(ctx, 'Foo', ['Bar', 'FooBar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();
            expect(module.bar()).toEqual('bar');
            expect(module.foobar).toBeDefined();
            expect(module.foobar()).toEqual('foobar');
        });

		it('should allow cascading calls with multiple decorators', function () {
			var module = application.registerModule(ctx, 'Foo', ['Bar', 'FooBar']);

			expect(module.foo()).toEqual('foobar-foo|bar-foo|foo');
		});

		it('should allow overriding properties', function () {
			var module = application.registerModule(ctx, 'Foo', ['Bar', 'FooBar']);

			expect(module.get()).toEqual('foobar|foobar|foobar');
		});

		it('should not throw an error if the start method does not exist on the decorated module', function () {
            var module = application.registerModule(ctx, 'Foo', ['Bar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();

            expect(function () {
                module.start(function () {
                });
            }).not.toThrow();
        });

        it('should increment the module id counter by one with every call', function () {
            var ctx1 = document.createElement('div');
            var ctx2 = document.createElement('div');
            var ctx3 = document.createElement('div');

            application.registerModule(ctx1, 'Foo');
            application.registerModule(ctx2, 'Foo');
            application.registerModule(ctx3, 'Foo');

            expect(Number(ctx1.getAttribute('data-t-id'))).toEqual(1);
            expect(Number(ctx2.getAttribute('data-t-id'))).toEqual(2);
            expect(Number(ctx3.getAttribute('data-t-id'))).toEqual(3);
        });
    });

    describe('.start()', function () {
        beforeEach(function () {
            application = new Application();
        });

        it('should return Promise if no modules are given', function () {
            var promise = application.start();

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should return Promise if valid modules are given', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            var modules = {1: module, 2: module};

            var promise = application.start(modules);

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should throw an error if invalid modules are given', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function () {
                return {};
            });
            var modules = {1: module, 2: module};

            expect(function () {
                application.start(modules);
            }).toThrow();
        });

        it('should call start on the given modules', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            var modules = {1: module, 2: module};

            application.start(modules);

            expect(module.start.calls.count()).toEqual(2);
        });

        it('should execute then callback if no modules are given', function (done) {
            var promise = application.start();

            promise.then(function () {
                done();
            });
        });

        it('should execute then callback if all modules (also async ones) are resolved', function (done) {
            var module = jasmine.createSpyObj('module', ['start']);
            var asyncModule = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function (resolve) {
                resolve();
            });
            asyncModule.start.and.callFake(function(resolve){
                setTimeout(function(){
                    resolve();
                }, 500);
            });

            var modules = {1: module, 2: asyncModule};
            var promise = application.start(modules);

            promise.then(function () {
                done();
            });
        });

        describe('should emit lifecycle event', function () {
            beforeEach(function () {
                eventEmitter = new T.EventEmitter(application._sandbox);
            });

            it('t.start without arguments', function (done) {
                eventEmitter.on('t.start', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                application.start();
            });

            it('t.sync without arguments', function (done) {
                eventEmitter.on('t.sync', function (args) {
                    expect(args).toBeUndefined();
                    done();
                });

                application.start();
            });
        });
    });

    describe('.stop()', function () {
        beforeEach(function () {
            application = new Application();
        });

        it('should call stop on the given modules', function () {
            var module = jasmine.createSpyObj('module', ['stop']);
            var modules = {1: module, 2: module};

            application.stop(modules);

            expect(module.stop.calls.count()).toEqual(2);
        });

        it('should emit lifecycle event t.stop', function (done) {
            var eventEmitter = new T.EventEmitter(application._sandbox);

            eventEmitter.on('t.stop', function (args) {
                expect(args).toBeUndefined();
                done();
            }.bind(this));

            application.stop();
        });
    });
});


