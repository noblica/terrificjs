/* global Application, Sandbox, Module, EventEmitter, Utils */
import Application from './Application';
import Sandbox from './Sandbox';
import Module from './Module';
import EventEmitter from './EventEmitter';
import Utils from './Utils';

window.T = {
	Application: Application,
	Sandbox: Sandbox,
	Module: Module,
	EventEmitter: EventEmitter,
	createModule: Utils.createModule,
	createDecorator: Utils.createDecorator,
	version: '<%= version %>'
};