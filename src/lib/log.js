
import { util } from './util';
import { getWindowType, jsonStringify } from './windows';
import { CONFIG } from '../conf';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

if (Function.prototype.bind && window.console && typeof console.log === 'object') {
    [ 'log', 'info', 'warn', 'error' ].forEach(function(method) {
        console[method] = this.bind(console[method], console);
    }, Function.prototype.call);
}

export let log = {

    clearLogs() {

        if (window.console && window.console.clear) {
            window.console.clear();
        }

        if (CONFIG.LOG_TO_PAGE) {
            let container = document.getElementById('postRobotLogs');

            if (container) {
                container.parentNode.removeChild(container);
            }
        }
    },

    writeToPage(level, args) {
        setTimeout(() => {
            let container = document.getElementById('postRobotLogs');

            if (!container) {
                container = document.createElement('div');
                container.id = 'postRobotLogs';
                container.style.cssText = 'width: 800px; font-family: monospace; white-space: pre-wrap;';
                document.body.appendChild(container);
            }

            let el = document.createElement('div');

            let date = (new Date()).toString().split(' ')[4];

            let payload = util.map(args, item => {
                if (typeof item === 'string') {
                    return item;
                }
                if (!item) {
                    return Object.prototype.toString.call(item);
                }
                let json;
                try {
                    json = jsonStringify(item, 0, 2);
                } catch (e) {
                    json = '[object]';
                }

                return `\n\n${json}\n\n`;
            }).join(' ');


            let msg = `${date} ${level} ${payload}`;
            el.innerHTML = msg;

            let color = {
                log: '#ddd',
                warn: 'orange',
                error: 'red',
                info: 'blue',
                debug: '#aaa'
            }[level];

            el.style.cssText = `margin-top: 10px; color: ${color};`;

            if (!container.childNodes.length) {
                container.appendChild(el);
            } else {
                container.insertBefore(el, container.childNodes[0]);
            }

        });
    },

    logLevel(level, args) {

        try {
            if (LOG_LEVELS.indexOf(level) < LOG_LEVELS.indexOf(CONFIG.LOG_LEVEL)) {
                return;
            }

            args = Array.prototype.slice.call(args);

            args.unshift(`${window.location.host}${window.location.pathname}`);
            args.unshift(`::`);
            args.unshift(`${getWindowType().toLowerCase()}`);
            args.unshift('[post-robot]');

            if (CONFIG.LOG_TO_PAGE) {
                log.writeToPage(level, args);
            }

            if (!window.console) {
                return;
            }

            if (!window.console[level]) {
                level = 'log';
            }

            if (!window.console[level]) {
                return;
            }

            window.console[level].apply(window.console, args);

        } catch (err) {
            // pass
        }
    },

    debug() {
        log.logLevel('debug', arguments);
    },

    info() {
        log.logLevel('info', arguments);
    },

    warn() {
        log.logLevel('warn', arguments);
    },

    error() {
        log.logLevel('error', arguments);
    }
};