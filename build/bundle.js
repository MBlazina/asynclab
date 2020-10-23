
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const MATCH_PARAM = RegExp(/\:([^/()]+)/g);

    function handleScroll (element) {
      if (navigator.userAgent.includes('jsdom')) return false
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash () {
      if (navigator.userAgent.includes('jsdom')) return false
      const { hash } = window.location;
      if (hash) {
        const validElementIdRegex = /^[A-Za-z]+[\w\-\:\.]*$/;
        if (validElementIdRegex.test(hash.substring(1))) {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView();
        }
      }
    }

    function scrollAncestorsToTop (element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock' &&
        element.dataset['routify-scroll'] !== 'lock'
      ) {
        element.style['scroll-behavior'] = 'auto';
        element.scrollTo({ top: 0, behavior: 'auto' });
        element.style['scroll-behavior'] = '';
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParamKeys = string => {
      const paramsKeys = [];
      let matches;
      while ((matches = MATCH_PARAM.exec(string))) paramsKeys.push(matches[1]);
      return paramsKeys
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings () {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function (msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    function currentLocation () {
      const pathMatch = window.location.search.match(/__routify_path=([^&]+)/);
      const prefetchMatch = window.location.search.match(/__routify_prefetch=\d+/);
      window.routify = window.routify || {};
      window.routify.prefetched = prefetchMatch ? true : false;
      const path = pathMatch && pathMatch[1].replace(/[#?].+/, ''); // strip any thing after ? and #
      return path || window.location.pathname
    }

    window.routify = window.routify || {};

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const route = writable(null); // the actual route being rendered

    /** @type {import('svelte/store').Writable<RouteNode[]>} */
    const routes = writable([]); // all routes
    routes.subscribe(routes => (window.routify.routes = routes));

    let rootContext = writable({ component: { params: {} } });

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const urlRoute = writable(null);  // the route matching the url

    /** @type {import('svelte/store').Writable<String>} */
    const basepath = (() => {
        const { set, subscribe } = writable("");

        return {
            subscribe,
            set(value) {
                if (value.match(/^[/(]/))
                    set(value);
                else console.warn('Basepaths must start with / or (');
            },
            update() { console.warn('Use assignment or set to update basepaths.'); }
        }
    })();

    const location$1 = derived( // the part of the url matching the basepath
        [basepath, urlRoute],
        ([$basepath, $route]) => {
            const [, base, path] = currentLocation().match(`^(${$basepath})(${$route.regex})`) || [];
            return { base, path }
        }
    );

    const prefetchPath = writable("");

    function onAppLoaded({ path, metatags }) {
        metatags.update();
        const prefetchMatch = window.location.search.match(/__routify_prefetch=(\d+)/);
        const prefetchId = prefetchMatch && prefetchMatch[1];

        dispatchEvent(new CustomEvent('app-loaded'));
        parent.postMessage({
            msg: 'app-loaded',
            prefetched: window.routify.prefetched,
            path,
            prefetchId
        }, "*");
        window['routify'].appLoaded = true;
    }

    var defaultConfig = {
        queryHandler: {
            parse: search => fromEntries(new URLSearchParams(search)),
            stringify: params => '?' + (new URLSearchParams(params)).toString()
        }
    };


    function fromEntries(iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj
        }, {})
    }

    /**
     * @param {string} url 
     * @return {ClientNode}
     */
    function urlToRoute(url) {
        /** @type {RouteNode[]} */
        const routes$1 = get_store_value(routes);
        const basepath$1 = get_store_value(basepath);
        const route = routes$1.find(route => url.match(`^${basepath$1}${route.regex}`));
        if (!route)
            throw new Error(
                `Route could not be found for "${url}".`
            )

        const [, base] = url.match(`^(${basepath$1})${route.regex}`);
        const path = url.slice(base.length);

        if (defaultConfig.queryHandler)
            route.params = defaultConfig.queryHandler.parse(window.location.search);

        if (route.paramKeys) {
            const layouts = layoutByPos(route.layouts);
            const fragments = path.split('/').filter(Boolean);
            const routeProps = getRouteProps(route.path);

            routeProps.forEach((prop, i) => {
                if (prop) {
                    route.params[prop] = fragments[i];
                    if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
                    else route.param = { [prop]: fragments[i] };
                }
            });
        }

        route.leftover = url.replace(new RegExp(base + route.regex), '');

        return route
    }


    /**
     * @param {array} layouts
     */
    function layoutByPos(layouts) {
        const arr = [];
        layouts.forEach(layout => {
            arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
        });
        return arr
    }


    /**
     * @param {string} url
     */
    function getRouteProps(url) {
        return url
            .split('/')
            .filter(Boolean)
            .map(f => f.match(/\:(.+)/))
            .map(f => f && f[1])
    }

    /* node_modules\@sveltech\routify\runtime\Prefetcher.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file = "node_modules\\@sveltech\\routify\\runtime\\Prefetcher.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (93:2) {#each $actives as prefetch (prefetch.options.prefetch)}
    function create_each_block(key_1, ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			iframe = element("iframe");
    			if (iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "title", "routify prefetcher");
    			add_location(iframe, file, 93, 4, 2705);
    			this.first = iframe;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$actives*/ 1 && iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(93:2) {#each $actives as prefetch (prefetch.options.prefetch)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$actives*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*prefetch*/ ctx[1].options.prefetch;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "__routify_iframes");
    			set_style(div, "display", "none");
    			add_location(div, file, 91, 0, 2591);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$actives*/ 1) {
    				const each_value = /*$actives*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const iframeNum = 2;

    const defaults = {
    	validFor: 60,
    	timeout: 5000,
    	gracePeriod: 1000
    };

    /** stores and subscriptions */
    const queue = writable([]);

    const actives = derived(queue, q => q.slice(0, iframeNum));

    actives.subscribe(actives => actives.forEach(({ options }) => {
    	setTimeout(() => removeFromQueue(options.prefetch), options.timeout);
    }));

    function prefetch(path, options = {}) {
    	prefetch.id = prefetch.id || 1;

    	path = !path.href
    	? path
    	: path.href.replace(/^(?:\/\/|[^/]+)*\//, "/");

    	//replace first ? since were mixing user queries with routify queries
    	path = path.replace("?", "&");

    	options = { ...defaults, ...options, path };
    	options.prefetch = prefetch.id++;

    	//don't prefetch within prefetch or SSR
    	if (window.routify.prefetched || navigator.userAgent.match("jsdom")) return false;

    	// add to queue
    	queue.update(q => {
    		if (!q.some(e => e.options.path === path)) q.push({
    			url: `/__app.html?${optionsToQuery(options)}`,
    			options
    		});

    		return q;
    	});
    }

    /**
     * convert options to query string
     * {a:1,b:2} becomes __routify_a=1&routify_b=2
     * @param {defaults & {path: string, prefetch: number}} options
     */
    function optionsToQuery(options) {
    	return Object.entries(options).map(([key, val]) => `__routify_${key}=${val}`).join("&");
    }

    /**
     * @param {number|MessageEvent} idOrEvent
     */
    function removeFromQueue(idOrEvent) {
    	const id = idOrEvent.data ? idOrEvent.data.prefetchId : idOrEvent;
    	if (!id) return null;
    	const entry = get_store_value(queue).find(entry => entry && entry.options.prefetch == id);

    	// removeFromQueue is called by both eventListener and timeout,
    	// but we can only remove the item once
    	if (entry) {
    		const { gracePeriod } = entry.options;
    		const gracePromise = new Promise(resolve => setTimeout(resolve, gracePeriod));

    		const idlePromise = new Promise(resolve => {
    				window.requestIdleCallback
    				? window.requestIdleCallback(resolve)
    				: setTimeout(resolve, gracePeriod + 1000);
    			});

    		Promise.all([gracePromise, idlePromise]).then(() => {
    			queue.update(q => q.filter(q => q.options.prefetch != id));
    		});
    	}
    }

    // Listen to message from child window
    addEventListener("message", removeFromQueue, false);

    function instance($$self, $$props, $$invalidate) {
    	let $actives;
    	validate_store(actives, "actives");
    	component_subscribe($$self, actives, $$value => $$invalidate(0, $actives = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Prefetcher", slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prefetcher> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		writable,
    		derived,
    		get: get_store_value,
    		iframeNum,
    		defaults,
    		queue,
    		actives,
    		prefetch,
    		optionsToQuery,
    		removeFromQueue,
    		$actives
    	});

    	return [$actives];
    }

    class Prefetcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefetcher",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /// <reference path="../typedef.js" />

    /** @ts-check */
    /**
     * @typedef {Object} RoutifyContext
     * @prop {ClientNode} component
     * @prop {ClientNode} layout
     * @prop {any} componentFile 
     * 
     *  @returns {import('svelte/store').Readable<RoutifyContext>} */
    function getRoutifyContext() {
      return getContext('routify') || rootContext
    }

    /**
     * @callback AfterPageLoadHelper
     * @param {function} callback
     * 
     * @typedef {import('svelte/store').Readable<AfterPageLoadHelper> & {_hooks:Array<function>}} AfterPageLoadHelperStore
     * @type {AfterPageLoadHelperStore}
     */
    const afterPageLoad = {
      _hooks: [],
      subscribe: hookHandler
    };

    /** 
     * @callback BeforeUrlChangeHelper
     * @param {function} callback
     *
     * @typedef {import('svelte/store').Readable<BeforeUrlChangeHelper> & {_hooks:Array<function>}} BeforeUrlChangeHelperStore
     * @type {BeforeUrlChangeHelperStore}
     **/
    const beforeUrlChange = {
      _hooks: [],
      subscribe: hookHandler
    };

    function hookHandler(listener) {
      const hooks = this._hooks;
      const index = hooks.length;
      listener(callback => { hooks[index] = callback; });
      return () => delete hooks[index]
    }

    /**
     * @callback UrlHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @return {String}
     *
     * @typedef {import('svelte/store').Readable<UrlHelper>} UrlHelperStore
     * @type {UrlHelperStore} 
     * */
    const url = {
      subscribe(listener) {
        const ctx = getRoutifyContext();
        return derived(
          [ctx, route, routes, location$1],
          args => makeUrlHelper(...args)
        ).subscribe(
          listener
        )
      }
    };

    /** 
     * @param {{component: ClientNode}} $ctx 
     * @param {RouteNode} $oldRoute 
     * @param {RouteNode[]} $routes 
     * @param {{base: string, path: string}} $location
     * @returns {UrlHelper}
     */
    function makeUrlHelper($ctx, $oldRoute, $routes, $location) {
      return function url(path, params, options) {
        const { component } = $ctx;
        path = path || './';

        const strict = options && options.strict !== false;
        if (!strict) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          let [, breadcrumbs, relativePath] = path.match(/^([\.\/]+)(.*)/);
          let dir = component.path.replace(/\/$/, '');
          const traverse = breadcrumbs.match(/\.\.\//g) || [];
          traverse.forEach(() => dir = dir.replace(/\/[^\/]+\/?$/, ''));
          path = `${dir}/${relativePath}`.replace(/\/$/, '');

        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = $routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        /** @type {Object<string, *>} Parameters */
        const allParams = Object.assign({}, $oldRoute.params, component.params, params);
        let pathWithParams = path;
        for (const [key, value] of Object.entries(allParams)) {
          pathWithParams = pathWithParams.replace(`:${key}`, value);
        }

        const fullPath = $location.base + pathWithParams + _getQueryString(path, params);
        return fullPath.replace(/\?$/, '')
      }
    }

    /**
     * 
     * @param {string} path 
     * @param {object} params 
     */
    function _getQueryString(path, params) {
      if (!defaultConfig.queryHandler) return ""
      const pathParamKeys = pathToParamKeys(path);
      const queryParams = {};
      if (params) Object.entries(params).forEach(([key, value]) => {
        if (!pathParamKeys.includes(key))
          queryParams[key] = value;
      });
      return defaultConfig.queryHandler.stringify(queryParams)
    }

    /**
     * @callback IsActiveHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @returns {Boolean}
     * 
     * @typedef {import('svelte/store').Readable<IsActiveHelper>} IsActiveHelperStore
     * @type {IsActiveHelperStore} 
     * */
    const isActive = {
      subscribe(run) {
        return derived(
          [url, route],
          ([url, route]) => function isActive(path = "", params = {}, { strict } = { strict: true }) {
            path = url(path, null, { strict });
            const currentPath = url(route.path, null, { strict });
            const re = new RegExp('^' + path + '($|/)');
            return !!currentPath.match(re)
          }
        ).subscribe(run)
      },
    };



    const _metatags = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _metatags.getLongest(_metatags.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _metatags.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _metatags.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = metatags.services[serviceName] || metatags.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _metatags.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _metatags.getOrigin();
        _metatags.templates[name] = _metatags.templates[name] || {};
        _metatags.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_metatags.props).forEach((prop) => {
          let value = (_metatags.getLongest(_metatags.props, prop));
          _metatags.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_metatags._pendingUpdate) {
          _metatags._pendingUpdate = true;
          setTimeout(() => {
            _metatags._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getRoutifyContext();
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };


    /**
     * metatags
     * @prop {Object.<string, string>}
     */
    const metatags = new Proxy(_metatags, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }

        if (window['routify'].appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    const isChangingPage = (function () {
      const store = writable(false);
      beforeUrlChange.subscribe(fn => fn(event => {
        store.set(true);
        return true
      }));
      
      afterPageLoad.subscribe(fn => fn(event => store.set(false)));

      return store
    })();

    /* node_modules\@sveltech\routify\runtime\Route.svelte generated by Svelte v3.29.0 */
    const file$1 = "node_modules\\@sveltech\\routify\\runtime\\Route.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    // (120:0) {#if $context}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$context*/ ctx[6].component.isLayout === false) return 0;
    		if (/*remainingLayouts*/ ctx[5].length) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(120:0) {#if $context}",
    		ctx
    	});

    	return block;
    }

    // (132:36) 
    function create_if_block_3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout, remainingLayouts, decorator, Decorator, scopeToChild*/ 100663415) {
    				const each_value_1 = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(132:36) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $context.component.isLayout === false}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout*/ 85) {
    				const each_value = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(121:2) {#if $context.component.isLayout === false}",
    		ctx
    	});

    	return block;
    }

    // (134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>
    function create_default_slot(ctx) {
    	let route_1;
    	let t;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[5]],
    				Decorator: typeof /*decorator*/ ctx[26] !== "undefined"
    				? /*decorator*/ ctx[26]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*layout*/ ctx[4].isDecorator,
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[25]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 32) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[5]];

    			if (dirty & /*decorator, Decorator*/ 67108866) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== "undefined"
    			? /*decorator*/ ctx[26]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*layout*/ 16) route_1_changes.childOfDecorator = /*layout*/ ctx[4].isDecorator;

    			if (dirty & /*scoped, scopeToChild*/ 33554433) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[25]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>",
    		ctx
    	});

    	return block;
    }

    // (133:4) {#each [$context] as { component, componentFile }
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 25: scopeToChild, 26: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 33554432 : 0) | (decorator ? 67108864 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, layout, scoped, scopeToChild*/ 234881075) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(133:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#each [$context] as { component, componentFile }
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(122:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (152:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$1, 152, 2, 4450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(setParent_action = /*setParent*/ ctx[8].call(null, span));
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(152:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$context*/ ctx[6] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$context*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$context*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[3]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $route;
    	let $context;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(14, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, []);
    	let { layouts = [] } = $$props;
    	let { scoped = {} } = $$props;
    	let { Decorator = null } = $$props;
    	let { childOfDecorator = false } = $$props;
    	let { isRoot = false } = $$props;
    	let scopedSync = {};
    	let isDecorator = false;

    	/** @type {HTMLElement} */
    	let parentElement;

    	/** @type {LayoutOrDecorator} */
    	let layout = null;

    	/** @type {LayoutOrDecorator} */
    	let lastLayout = null;

    	/** @type {LayoutOrDecorator[]} */
    	let remainingLayouts = [];

    	const context = writable(null);
    	validate_store(context, "context");
    	component_subscribe($$self, context, value => $$invalidate(6, $context = value));

    	/** @type {import("svelte/store").Writable<Context>} */
    	const parentContextStore = getContext("routify");

    	isDecorator = Decorator && !childOfDecorator;
    	setContext("routify", context);

    	/** @param {HTMLElement} el */
    	function setParent(el) {
    		$$invalidate(3, parentElement = el.parentElement);
    	}

    	/** @param {SvelteComponent} componentFile */
    	function onComponentLoaded(componentFile) {
    		/** @type {Context} */
    		const parentContext = get_store_value(parentContextStore);

    		$$invalidate(2, scopedSync = { ...scoped });
    		lastLayout = layout;
    		if (remainingLayouts.length === 0) onLastComponentLoaded();

    		const ctx = {
    			layout: isDecorator ? parentContext.layout : layout,
    			component: layout,
    			route: $route,
    			componentFile,
    			child: isDecorator
    			? parentContext.child
    			: get_store_value(context) && get_store_value(context).child
    		};

    		context.set(ctx);
    		if (isRoot) rootContext.set(ctx);

    		if (parentContext && !isDecorator) parentContextStore.update(store => {
    			store.child = layout || store.child;
    			return store;
    		});
    	}

    	/**  @param {LayoutOrDecorator} layout */
    	function setComponent(layout) {
    		let PendingComponent = layout.component();
    		if (PendingComponent instanceof Promise) PendingComponent.then(onComponentLoaded); else onComponentLoaded(PendingComponent);
    	}

    	async function onLastComponentLoaded() {
    		afterPageLoad._hooks.forEach(hook => hook(layout.api));
    		await tick();
    		handleScroll(parentElement);

    		if (!window["routify"].appLoaded) {
    			const pagePath = $context.component.path;
    			const routePath = $route.path;
    			const isOnCurrentRoute = pagePath === routePath; //maybe we're getting redirected

    			// Let everyone know the last child has rendered
    			if (!window["routify"].stopAutoReady && isOnCurrentRoute) {
    				onAppLoaded({ path: pagePath, metatags });
    			}
    		}
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "childOfDecorator", "isRoot"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		get: get_store_value,
    		metatags,
    		afterPageLoad,
    		route,
    		routes,
    		rootContext,
    		handleScroll,
    		onAppLoaded,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		isRoot,
    		scopedSync,
    		isDecorator,
    		parentElement,
    		layout,
    		lastLayout,
    		remainingLayouts,
    		context,
    		parentContextStore,
    		setParent,
    		onComponentLoaded,
    		setComponent,
    		onLastComponentLoaded,
    		$route,
    		$context
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    		if ("scopedSync" in $$props) $$invalidate(2, scopedSync = $$props.scopedSync);
    		if ("isDecorator" in $$props) $$invalidate(12, isDecorator = $$props.isDecorator);
    		if ("parentElement" in $$props) $$invalidate(3, parentElement = $$props.parentElement);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("lastLayout" in $$props) lastLayout = $$props.lastLayout;
    		if ("remainingLayouts" in $$props) $$invalidate(5, remainingLayouts = $$props.remainingLayouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isDecorator, Decorator, layouts*/ 4610) {
    			 if (isDecorator) {
    				const decoratorLayout = {
    					component: () => Decorator,
    					path: `${layouts[0].path}__decorator`,
    					isDecorator: true
    				};

    				$$invalidate(9, layouts = [decoratorLayout, ...layouts]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 512) {
    			 $$invalidate(4, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(5, remainingLayouts), $$invalidate(9, layouts)), $$invalidate(12, isDecorator)), $$invalidate(1, Decorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 16) {
    			 setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		scopedSync,
    		parentElement,
    		layout,
    		remainingLayouts,
    		$context,
    		context,
    		setParent,
    		layouts,
    		childOfDecorator,
    		isRoot
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			layouts: 9,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 10,
    			isRoot: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRoot() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRoot(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function init$1(routes, callback) {
      /** @type { ClientNode | false } */
      let lastRoute = false;

      function updatePage(proxyToUrl, shallow) {
        const url = proxyToUrl || currentLocation();
        const route$1 = urlToRoute(url);
        const currentRoute = shallow && urlToRoute(currentLocation());
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        if (lastRoute) delete lastRoute.last; //todo is a page component the right place for the previous route?
        route$1.last = lastRoute;
        lastRoute = route$1;

        //set the route in the store
        if (!proxyToUrl)
          urlRoute.set(route$1);
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state = {}, title, url) {
          const { id, path, params } = get_store_value(route);
          state = { id, path, params, ...state };
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of beforeUrlChange._hooks.filter(Boolean)) {
        // return false if the hook returns false
        const result = await hook(event, route$1); //todo remove route from hook. Its API Can be accessed as $page
        if (!result) return false
      }
      return true
    }

    /* node_modules\@sveltech\routify\runtime\Router.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$1 } = globals;

    // (64:0) {#if layouts && $route !== null}
    function create_if_block$1(ctx) {
    	let route_1;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: /*layouts*/ ctx[0],
    				isRoot: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*layouts*/ 1) route_1_changes.layouts = /*layouts*/ ctx[0];
    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(64:0) {#if layouts && $route !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let prefetcher;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null && create_if_block$1(ctx);
    	prefetcher = new Prefetcher({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(prefetcher.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(prefetcher, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*layouts, $route*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(prefetcher.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(prefetcher.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(prefetcher, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes: routes$1 } = $$props;
    	let { config = {} } = $$props;
    	let layouts;
    	let navigator;
    	window.routify = window.routify || {};
    	window.routify.inBrowser = !window.navigator.userAgent.match("jsdom");

    	Object.entries(config).forEach(([key, value]) => {
    		defaultConfig[key] = value;
    	});

    	suppressWarnings();
    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext("routifyupdatepage", updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	let initTimeout = null;

    	// init is async to prevent a horrible bug that completely disable reactivity
    	// in the host component -- something like the component's update function is
    	// called before its fragment is created, and since the component is then seen
    	// as already dirty, it is never scheduled for update again, and remains dirty
    	// forever... I failed to isolate the precise conditions for the bug, but the
    	// faulty update is triggered by a change in the route store, and so offseting
    	// store initialization by one tick gives the host component some time to
    	// create its fragment. The root cause it probably a bug in Svelte with deeply
    	// intertwinned store and reactivity.
    	const doInit = () => {
    		clearTimeout(initTimeout);

    		initTimeout = setTimeout(() => {
    			cleanup();
    			navigator = init$1(routes$1, callback);
    			routes.set(routes$1);
    			navigator.updatePage();
    		});
    	};

    	onDestroy(cleanup);
    	const writable_props = ["routes", "config"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		Prefetcher,
    		init: init$1,
    		route,
    		routesStore: routes,
    		prefetchPath,
    		suppressWarnings,
    		defaultConfig,
    		routes: routes$1,
    		config,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		initTimeout,
    		doInit,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("navigator" in $$props) navigator = $$props.navigator;
    		if ("initTimeout" in $$props) initTimeout = $$props.initTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 4) {
    			 if (routes$1) doInit();
    		}
    	};

    	return [layouts, $route, routes$1, config];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { routes: 2, config: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[2] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /** 
     * Node payload
     * @typedef {Object} NodePayload
     * @property {RouteNode=} file current node
     * @property {RouteNode=} parent parent of the current node
     * @property {StateObject=} state state shared by every node in the walker
     * @property {Object=} scope scope inherited by descendants in the scope
     *
     * State Object
     * @typedef {Object} StateObject
     * @prop {TreePayload=} treePayload payload from the tree
     * 
     * Node walker proxy
     * @callback NodeWalkerProxy
     * @param {NodePayload} NodePayload
     */


    /**
     * Node middleware
     * @description Walks through the nodes of a tree
     * @example middleware = createNodeMiddleware(payload => {payload.file.name = 'hello'})(treePayload))
     * @param {NodeWalkerProxy} fn 
     */
    function createNodeMiddleware(fn) {

        /**    
         * NodeMiddleware payload receiver
         * @param {TreePayload} payload
         */
        const inner = async function execute(payload) {
            return await nodeMiddleware(payload.tree, fn, { state: { treePayload: payload } })
        };

        /**    
         * NodeMiddleware sync payload receiver
         * @param {TreePayload} payload
         */
        inner.sync = function executeSync(payload) {
            return nodeMiddlewareSync(payload.tree, fn, { state: { treePayload: payload } })
        };

        return inner
    }

    /**
     * Node walker
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    async function nodeMiddleware(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        await fn(payload);

        if (file.children) {
            payload.parent = file;
            await Promise.all(file.children.map(_file => nodeMiddleware(_file, fn, payload)));
        }
        return payload
    }

    /**
     * Node walker (sync version)
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    function nodeMiddlewareSync(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        fn(payload);

        if (file.children) {
            payload.parent = file;
            file.children.map(_file => nodeMiddlewareSync(_file, fn, payload));
        }
        return payload
    }


    /**
     * Clone with JSON
     * @param {T} obj 
     * @returns {T} JSON cloned object
     * @template T
     */
    function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

    const setRegex = createNodeMiddleware(({ file }) => {
        if (file.isPage || file.isFallback)
            file.regex = pathToRegex(file.path, file.isFallback);
    });
    const setParamKeys = createNodeMiddleware(({ file }) => {
        file.paramKeys = pathToParamKeys(file.path);
    });

    const setShortPath = createNodeMiddleware(({ file }) => {
        if (file.isFallback || file.isIndex)
            file.shortPath = file.path.replace(/\/[^/]+$/, '');
        else file.shortPath = file.path;
    });
    const setRank = createNodeMiddleware(({ file }) => {
        file.ranking = pathToRank(file);
    });


    // todo delete?
    const addMetaChildren = createNodeMiddleware(({ file }) => {
        const node = file;
        const metaChildren = file.meta && file.meta.children || [];
        if (metaChildren.length) {
            node.children = node.children || [];
            node.children.push(...metaChildren.map(meta => ({ isMeta: true, ...meta, meta })));
        }
    });

    const setIsIndexable = createNodeMiddleware(payload => {
        const { file } = payload;
        const { isLayout, isFallback, meta } = file;
        file.isIndexable = !isLayout && !isFallback && meta.index !== false;
        file.isNonIndexable = !file.isIndexable;
    });


    const assignRelations = createNodeMiddleware(({ file, parent }) => {
        Object.defineProperty(file, 'parent', { get: () => parent });
        Object.defineProperty(file, 'nextSibling', { get: () => _getSibling(file, 1) });
        Object.defineProperty(file, 'prevSibling', { get: () => _getSibling(file, -1) });
        Object.defineProperty(file, 'lineage', { get: () => _getLineage(parent) });
    });

    function _getLineage(node, lineage = []){
        if(node){
            lineage.unshift(node);
            _getLineage(node.parent, lineage);
        }
        return lineage
    }

    /**
     * 
     * @param {RouteNode} file 
     * @param {Number} direction 
     */
    function _getSibling(file, direction) {
        if (!file.root) {
            const siblings = file.parent.children.filter(c => c.isIndexable);
            const index = siblings.indexOf(file);
            return siblings[index + direction]
        }
    }

    const assignIndex = createNodeMiddleware(({ file, parent }) => {
        if (file.isIndex) Object.defineProperty(parent, 'index', { get: () => file });
        if (file.isLayout)
            Object.defineProperty(parent, 'layout', { get: () => file });
    });

    const assignLayout = createNodeMiddleware(({ file, scope }) => {
        Object.defineProperty(file, 'layouts', { get: () => getLayouts(file) });
        function getLayouts(file) {
            const { parent } = file;
            const layout = parent && parent.layout;
            const isReset = layout && layout.isReset;
            const layouts = (parent && !isReset && getLayouts(parent)) || [];
            if (layout) layouts.push(layout);
            return layouts
        }
    });


    const createFlatList = treePayload => {
        createNodeMiddleware(payload => {
            if (payload.file.isPage || payload.file.isFallback)
            payload.state.treePayload.routes.push(payload.file);
        }).sync(treePayload);    
        treePayload.routes.sort((c, p) => (c.ranking >= p.ranking ? -1 : 1));
    };

    const setPrototype = createNodeMiddleware(({ file }) => {
        const Prototype = file.root
            ? Root
            : file.children
                ? file.isFile ? PageDir : Dir
                : file.isReset
                    ? Reset
                    : file.isLayout
                        ? Layout
                        : file.isFallback
                            ? Fallback
                            : Page;
        Object.setPrototypeOf(file, Prototype.prototype);

        function Layout() { }
        function Dir() { }
        function Fallback() { }
        function Page() { }
        function PageDir() { }
        function Reset() { }
        function Root() { }
    });

    var miscPlugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setRegex: setRegex,
        setParamKeys: setParamKeys,
        setShortPath: setShortPath,
        setRank: setRank,
        addMetaChildren: addMetaChildren,
        setIsIndexable: setIsIndexable,
        assignRelations: assignRelations,
        assignIndex: assignIndex,
        assignLayout: assignLayout,
        createFlatList: createFlatList,
        setPrototype: setPrototype
    });

    const assignAPI = createNodeMiddleware(({ file }) => {
        file.api = new ClientApi(file);
    });

    class ClientApi {
        constructor(file) {
            this.__file = file;
            Object.defineProperty(this, '__file', { enumerable: false });
            this.isMeta = !!file.isMeta;
            this.path = file.path;
            this.title = _prettyName(file);
            this.meta = file.meta;
        }

        get parent() { return !this.__file.root && this.__file.parent.api }
        get children() {
            return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
                .filter(c => !c.isNonIndexable)
                .sort((a, b) => {
                    if(a.isMeta && b.isMeta) return 0
                    a = (a.meta.index || a.meta.title || a.path).toString();
                    b = (b.meta.index || b.meta.title || b.path).toString();
                    return a.localeCompare((b), undefined, { numeric: true, sensitivity: 'base' })
                })
                .map(({ api }) => api)
        }
        get next() { return _navigate(this, +1) }
        get prev() { return _navigate(this, -1) }
        preload() {
            this.__file.layouts.forEach(file => file.component());
            this.__file.component(); 
        }
    }

    function _navigate(node, direction) {
        if (!node.__file.root) {
            const siblings = node.parent.children;
            const index = siblings.indexOf(node);
            return node.parent.children[index + direction]
        }
    }


    function _prettyName(file) {
        if (typeof file.meta.title !== 'undefined') return file.meta.title
        else return (file.shortPath || file.path)
            .split('/')
            .pop()
            .replace(/-/g, ' ')
    }

    const plugins = {...miscPlugins, assignAPI};

    function buildClientTree(tree) {
      const order = [
        // pages
        "setParamKeys", //pages only
        "setRegex", //pages only
        "setShortPath", //pages only
        "setRank", //pages only
        "assignLayout", //pages only,
        // all
        "setPrototype",
        "addMetaChildren",
        "assignRelations", //all (except meta components?)
        "setIsIndexable", //all
        "assignIndex", //all
        "assignAPI", //all
        // routes
        "createFlatList"
      ];

      const payload = { tree, routes: [] };
      for (let name of order) {
        const syncFn = plugins[name].sync || plugins[name];
        syncFn(payload);
      }
      return payload
    }

    /* src\pages\_fallback.svelte generated by Svelte v3.29.0 */
    const file$2 = "src\\pages\\_fallback.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "404";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Page not found. \r\n  \r\n  ");
    			a = element("a");
    			t3 = text("Go back");
    			attr_dev(div0, "class", "huge svelte-13vv9s6");
    			add_location(div0, file$2, 18, 2, 927);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../"));
    			add_location(a, file$2, 21, 2, 1053);
    			attr_dev(div1, "class", "big");
    			add_location(div1, file$2, 19, 2, 958);
    			attr_dev(div2, "class", "e404 svelte-13vv9s6");
    			add_location(div2, file$2, 17, 0, 905);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.29.0 */
    const file$3 = "src\\components\\Header.svelte";

    function create_fragment$4(ctx) {
    	let div10;
    	let div0;
    	let t0;
    	let div9;
    	let div2;
    	let div1;
    	let t1;
    	let div8;
    	let ul0;
    	let li0;
    	let a0;
    	let t2;
    	let a0_href_value;
    	let t3;
    	let div3;
    	let t4;
    	let li1;
    	let a1;
    	let t5;
    	let a1_href_value;
    	let t6;
    	let div4;
    	let t7;
    	let li2;
    	let a2;
    	let t8;
    	let a2_href_value;
    	let t9;
    	let div5;
    	let t10;
    	let li3;
    	let a3;
    	let t11;
    	let a3_href_value;
    	let t12;
    	let div6;
    	let t13;
    	let li4;
    	let a4;
    	let t14;
    	let a4_href_value;
    	let t15;
    	let div7;
    	let t16;
    	let ul1;
    	let li5;
    	let a5;
    	let t17;
    	let a5_href_value;
    	let t18;
    	let li6;
    	let a6;
    	let t19;
    	let a6_href_value;
    	let t20;
    	let li7;
    	let a7;
    	let t21;
    	let a7_href_value;
    	let t22;
    	let header;
    	let div13;
    	let div12;
    	let a8;
    	let img;
    	let img_src_value;
    	let a8_href_value;
    	let t23;
    	let div11;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div9 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t1 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t2 = text("Home");
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t5 = text("Projects");
    			t6 = space();
    			div4 = element("div");
    			t7 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t8 = text("About");
    			t9 = space();
    			div5 = element("div");
    			t10 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t11 = text("Services");
    			t12 = space();
    			div6 = element("div");
    			t13 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t14 = text("Contact");
    			t15 = space();
    			div7 = element("div");
    			t16 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			a5 = element("a");
    			t17 = text("Careers");
    			t18 = space();
    			li6 = element("li");
    			a6 = element("a");
    			t19 = text("Team");
    			t20 = space();
    			li7 = element("li");
    			a7 = element("a");
    			t21 = text("Blog");
    			t22 = space();
    			header = element("header");
    			div13 = element("div");
    			div12 = element("div");
    			a8 = element("a");
    			img = element("img");
    			t23 = space();
    			div11 = element("div");
    			attr_dev(div0, "class", "mainMenuBackground svelte-1di05pk");
    			toggle_class(div0, "open", /*menuOpen*/ ctx[0]);
    			add_location(div0, file$3, 12083, 2, 208948);
    			attr_dev(div1, "class", "closeIcon svelte-1di05pk");
    			add_location(div1, file$3, 12089, 6, 209183);
    			attr_dev(div2, "class", "row d-flex justify-content-end svelte-1di05pk");
    			add_location(div2, file$3, 12088, 4, 209131);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[1]("/index"));
    			attr_dev(a0, "class", "svelte-1di05pk");
    			add_location(a0, file$3, 12094, 10, 209362);
    			attr_dev(div3, "class", "menuArrow svelte-1di05pk");
    			add_location(div3, file$3, 12095, 10, 209407);
    			attr_dev(li0, "class", "svelte-1di05pk");
    			add_location(li0, file$3, 12093, 8, 209346);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[1]("/projects"));
    			attr_dev(a1, "class", "svelte-1di05pk");
    			add_location(a1, file$3, 12098, 10, 209473);
    			attr_dev(div4, "class", "menuArrow svelte-1di05pk");
    			add_location(div4, file$3, 12099, 10, 209525);
    			attr_dev(li1, "class", "svelte-1di05pk");
    			add_location(li1, file$3, 12097, 8, 209457);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[1]("/about"));
    			attr_dev(a2, "class", "svelte-1di05pk");
    			add_location(a2, file$3, 12102, 10, 209591);
    			attr_dev(div5, "class", "menuArrow svelte-1di05pk");
    			add_location(div5, file$3, 12103, 10, 209637);
    			attr_dev(li2, "class", "svelte-1di05pk");
    			add_location(li2, file$3, 12101, 8, 209575);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[1]("/services"));
    			attr_dev(a3, "class", "svelte-1di05pk");
    			add_location(a3, file$3, 12106, 10, 209703);
    			attr_dev(div6, "class", "menuArrow svelte-1di05pk");
    			add_location(div6, file$3, 12107, 10, 209755);
    			attr_dev(li3, "class", "svelte-1di05pk");
    			add_location(li3, file$3, 12105, 8, 209687);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[1]("/contact"));
    			attr_dev(a4, "class", "svelte-1di05pk");
    			add_location(a4, file$3, 12110, 10, 209821);
    			attr_dev(div7, "class", "menuArrow svelte-1di05pk");
    			add_location(div7, file$3, 12111, 10, 209871);
    			attr_dev(li4, "class", "svelte-1di05pk");
    			add_location(li4, file$3, 12109, 8, 209805);
    			attr_dev(ul0, "class", "mainNav offset-lg-2 col-lg-4 svelte-1di05pk");
    			add_location(ul0, file$3, 12092, 6, 209273);
    			attr_dev(a5, "href", a5_href_value = /*$url*/ ctx[1]("/careers"));
    			attr_dev(a5, "class", "svelte-1di05pk");
    			toggle_class(a5, "active", /*$isActive*/ ctx[2]("/careers"));
    			add_location(a5, file$3, 12116, 10, 210024);
    			attr_dev(li5, "class", "svelte-1di05pk");
    			add_location(li5, file$3, 12115, 8, 210008);
    			attr_dev(a6, "href", a6_href_value = /*$url*/ ctx[1]("/team"));
    			attr_dev(a6, "class", "svelte-1di05pk");
    			toggle_class(a6, "active", /*$isActive*/ ctx[2]("/team"));
    			add_location(a6, file$3, 12121, 10, 210166);
    			attr_dev(li6, "class", "svelte-1di05pk");
    			add_location(li6, file$3, 12120, 8, 210150);
    			attr_dev(a7, "href", a7_href_value = /*$url*/ ctx[1]("/blog"));
    			attr_dev(a7, "class", "svelte-1di05pk");
    			toggle_class(a7, "active", /*$isActive*/ ctx[2]("/blog"));
    			add_location(a7, file$3, 12124, 10, 210273);
    			attr_dev(li7, "class", "svelte-1di05pk");
    			add_location(li7, file$3, 12123, 8, 210257);
    			attr_dev(ul1, "class", "utilityNav offset-lg-1 col-lg-4 svelte-1di05pk");
    			add_location(ul1, file$3, 12114, 6, 209932);
    			attr_dev(div8, "class", "row svelte-1di05pk");
    			add_location(div8, file$3, 12091, 4, 209248);
    			attr_dev(div9, "id", "mainMenu");
    			attr_dev(div9, "class", "col col-md-8 offset-md-4 h-100 svelte-1di05pk");
    			toggle_class(div9, "open", /*menuOpen*/ ctx[0]);
    			add_location(div9, file$3, 12084, 2, 209030);
    			attr_dev(div10, "class", "menuWrapper svelte-1di05pk");
    			add_location(div10, file$3, 12082, 0, 208919);
    			attr_dev(img, "alt", "logo");
    			if (img.src !== (img_src_value = "/assets/logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "105");
    			attr_dev(img, "class", "svelte-1di05pk");
    			add_location(img, file$3, 12138, 8, 210650);
    			attr_dev(a8, "href", a8_href_value = /*$url*/ ctx[1]("/index"));
    			attr_dev(a8, "class", "pl-15 pl-md-0 svelte-1di05pk");
    			toggle_class(a8, "active", /*$isActive*/ ctx[2]("/index"));
    			add_location(a8, file$3, 12134, 6, 210531);
    			attr_dev(div11, "id", "menuIcon");
    			attr_dev(div11, "class", "mr-15 mr-md-0 d-flex flex-column align-items-end svelte-1di05pk");
    			add_location(div11, file$3, 12140, 6, 210723);
    			attr_dev(div12, "class", "row d-flex justify-content-between align-items-center svelte-1di05pk");
    			add_location(div12, file$3, 12133, 4, 210456);
    			attr_dev(div13, "class", "container svelte-1di05pk");
    			add_location(div13, file$3, 12132, 2, 210427);
    			attr_dev(header, "class", "pt-30 svelte-1di05pk");
    			add_location(header, file$3, 12131, 0, 210401);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div0);
    			append_dev(div10, t0);
    			append_dev(div10, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div1);
    			append_dev(div9, t1);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t2);
    			append_dev(li0, t3);
    			append_dev(li0, div3);
    			append_dev(ul0, t4);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t5);
    			append_dev(li1, t6);
    			append_dev(li1, div4);
    			append_dev(ul0, t7);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t8);
    			append_dev(li2, t9);
    			append_dev(li2, div5);
    			append_dev(ul0, t10);
    			append_dev(ul0, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t11);
    			append_dev(li3, t12);
    			append_dev(li3, div6);
    			append_dev(ul0, t13);
    			append_dev(ul0, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t14);
    			append_dev(li4, t15);
    			append_dev(li4, div7);
    			append_dev(div8, t16);
    			append_dev(div8, ul1);
    			append_dev(ul1, li5);
    			append_dev(li5, a5);
    			append_dev(a5, t17);
    			append_dev(ul1, t18);
    			append_dev(ul1, li6);
    			append_dev(li6, a6);
    			append_dev(a6, t19);
    			append_dev(ul1, t20);
    			append_dev(ul1, li7);
    			append_dev(li7, a7);
    			append_dev(a7, t21);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, div13);
    			append_dev(div13, div12);
    			append_dev(div12, a8);
    			append_dev(a8, img);
    			append_dev(div12, t23);
    			append_dev(div12, div11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*handleMenu*/ ctx[3], false, false, false),
    					listen_dev(div1, "click", /*handleMenu*/ ctx[3], false, false, false),
    					listen_dev(ul0, "click", /*handleMenu*/ ctx[3], false, false, false),
    					listen_dev(ul1, "click", /*handleMenu*/ ctx[3], false, false, false),
    					listen_dev(div11, "click", /*handleMenu*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*menuOpen*/ 1) {
    				toggle_class(div0, "open", /*menuOpen*/ ctx[0]);
    			}

    			if (dirty & /*$url*/ 2 && a0_href_value !== (a0_href_value = /*$url*/ ctx[1]("/index"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*$url*/ 2 && a1_href_value !== (a1_href_value = /*$url*/ ctx[1]("/projects"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*$url*/ 2 && a2_href_value !== (a2_href_value = /*$url*/ ctx[1]("/about"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (dirty & /*$url*/ 2 && a3_href_value !== (a3_href_value = /*$url*/ ctx[1]("/services"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (dirty & /*$url*/ 2 && a4_href_value !== (a4_href_value = /*$url*/ ctx[1]("/contact"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}

    			if (dirty & /*$url*/ 2 && a5_href_value !== (a5_href_value = /*$url*/ ctx[1]("/careers"))) {
    				attr_dev(a5, "href", a5_href_value);
    			}

    			if (dirty & /*$isActive*/ 4) {
    				toggle_class(a5, "active", /*$isActive*/ ctx[2]("/careers"));
    			}

    			if (dirty & /*$url*/ 2 && a6_href_value !== (a6_href_value = /*$url*/ ctx[1]("/team"))) {
    				attr_dev(a6, "href", a6_href_value);
    			}

    			if (dirty & /*$isActive*/ 4) {
    				toggle_class(a6, "active", /*$isActive*/ ctx[2]("/team"));
    			}

    			if (dirty & /*$url*/ 2 && a7_href_value !== (a7_href_value = /*$url*/ ctx[1]("/blog"))) {
    				attr_dev(a7, "href", a7_href_value);
    			}

    			if (dirty & /*$isActive*/ 4) {
    				toggle_class(a7, "active", /*$isActive*/ ctx[2]("/blog"));
    			}

    			if (dirty & /*menuOpen*/ 1) {
    				toggle_class(div9, "open", /*menuOpen*/ ctx[0]);
    			}

    			if (dirty & /*$url*/ 2 && a8_href_value !== (a8_href_value = /*$url*/ ctx[1]("/index"))) {
    				attr_dev(a8, "href", a8_href_value);
    			}

    			if (dirty & /*$isActive*/ 4) {
    				toggle_class(a8, "active", /*$isActive*/ ctx[2]("/index"));
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(header);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $url;
    	let $isActive;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(2, $isActive = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let menuOpen = false;

    	function handleMenu() {
    		$$invalidate(0, menuOpen = !menuOpen);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		url,
    		isActive,
    		menuOpen,
    		handleMenu,
    		$url,
    		$isActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("menuOpen" in $$props) $$invalidate(0, menuOpen = $$props.menuOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menuOpen, $url, $isActive, handleMenu];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Link.svelte generated by Svelte v3.29.0 */
    const file$4 = "src\\components\\Link.svelte";

    function create_fragment$5(ctx) {
    	let a;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(a, "class", "LinkComponent svelte-11b0oyu");
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2](/*link*/ ctx[1]));
    			add_location(a, file$4, 11938, 0, 206448);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);

    			if (dirty & /*$url, link*/ 6 && a_href_value !== (a_href_value = /*$url*/ ctx[2](/*link*/ ctx[1]))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, []);
    	let { text = "link text" } = $$props;
    	let { link = "/index" } = $$props;
    	const writable_props = ["text", "link"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("link" in $$props) $$invalidate(1, link = $$props.link);
    	};

    	$$self.$capture_state = () => ({ url, text, link, $url });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("link" in $$props) $$invalidate(1, link = $$props.link);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, link, $url];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { text: 0, link: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get text() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.29.0 */
    const file$5 = "src\\components\\Footer.svelte";

    function create_fragment$6(ctx) {
    	let footer;
    	let div2;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let a0_href_value;
    	let t0;
    	let ul0;
    	let li0;
    	let link0;
    	let t1;
    	let li1;
    	let link1;
    	let t2;
    	let li2;
    	let link2;
    	let t3;
    	let li3;
    	let link3;
    	let t4;
    	let ul1;
    	let li4;
    	let a1;
    	let t6;
    	let li5;
    	let a2;
    	let t8;
    	let li6;
    	let a3;
    	let t10;
    	let li7;
    	let a4;
    	let t12;
    	let p0;
    	let t13;
    	let br0;
    	let t14;
    	let br1;
    	let t15;
    	let br2;
    	let t16;
    	let t17;
    	let a5;
    	let t19;
    	let div1;
    	let p1;
    	let current;

    	link0 = new Link({
    			props: { text: "About", link: "/about" },
    			$$inline: true
    		});

    	link1 = new Link({
    			props: { text: "Projects", link: "/projects" },
    			$$inline: true
    		});

    	link2 = new Link({
    			props: { text: "Blog", link: "/blog" },
    			$$inline: true
    		});

    	link3 = new Link({
    			props: { text: "Contact", link: "/contact" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			create_component(link0.$$.fragment);
    			t1 = space();
    			li1 = element("li");
    			create_component(link1.$$.fragment);
    			t2 = space();
    			li2 = element("li");
    			create_component(link2.$$.fragment);
    			t3 = space();
    			li3 = element("li");
    			create_component(link3.$$.fragment);
    			t4 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			a1 = element("a");
    			a1.textContent = "Facebook";
    			t6 = space();
    			li5 = element("li");
    			a2 = element("a");
    			a2.textContent = "LinkedIn";
    			t8 = space();
    			li6 = element("li");
    			a3 = element("a");
    			a3.textContent = "Twitter";
    			t10 = space();
    			li7 = element("li");
    			a4 = element("a");
    			a4.textContent = "Instagram";
    			t12 = space();
    			p0 = element("p");
    			t13 = text("Async d.o.o.");
    			br0 = element("br");
    			t14 = text("\r\n        Lipovečka 1,");
    			br1 = element("br");
    			t15 = text("\r\n        10000 Zagreb,");
    			br2 = element("br");
    			t16 = text("\r\n        Croatia");
    			t17 = space();
    			a5 = element("a");
    			a5.textContent = "hello@asynclabs.co";
    			t19 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "© Async Labs. All rights reserved 2020.";
    			attr_dev(img, "alt", "logo");
    			if (img.src !== (img_src_value = "/assets/logo-white.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "105");
    			attr_dev(img, "class", "svelte-lb03yy");
    			add_location(img, file$5, 11974, 8, 207104);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("/index"));
    			attr_dev(a0, "class", "col-12 col-md-2 text-center mb-30 align-self-start svelte-lb03yy");
    			add_location(a0, file$5, 11973, 6, 207010);
    			attr_dev(li0, "class", "svelte-lb03yy");
    			add_location(li0, file$5, 11977, 8, 207241);
    			attr_dev(li1, "class", "svelte-lb03yy");
    			add_location(li1, file$5, 11978, 8, 207294);
    			attr_dev(li2, "class", "svelte-lb03yy");
    			add_location(li2, file$5, 11979, 8, 207353);
    			attr_dev(li3, "class", "svelte-lb03yy");
    			add_location(li3, file$5, 11980, 8, 207404);
    			attr_dev(ul0, "class", "col-6 col-sm-4 col-md-2 offset-md-1 svelte-lb03yy");
    			add_location(ul0, file$5, 11976, 6, 207183);
    			attr_dev(a1, "href", "https://www.facebook.com/");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-lb03yy");
    			add_location(a1, file$5, 11983, 12, 207522);
    			attr_dev(li4, "class", "svelte-lb03yy");
    			add_location(li4, file$5, 11983, 8, 207518);
    			attr_dev(a2, "href", "https://www.linkedin.com/");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-lb03yy");
    			add_location(a2, file$5, 11984, 12, 207605);
    			attr_dev(li5, "class", "svelte-lb03yy");
    			add_location(li5, file$5, 11984, 8, 207601);
    			attr_dev(a3, "href", "https://twitter.com/");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "svelte-lb03yy");
    			add_location(a3, file$5, 11985, 12, 207688);
    			attr_dev(li6, "class", "svelte-lb03yy");
    			add_location(li6, file$5, 11985, 8, 207684);
    			attr_dev(a4, "href", "https://www.instagram.com/");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "class", "svelte-lb03yy");
    			add_location(a4, file$5, 11986, 12, 207765);
    			attr_dev(li7, "class", "svelte-lb03yy");
    			add_location(li7, file$5, 11986, 8, 207761);
    			attr_dev(ul1, "class", "col-6 col-sm-4 col-md-2 svelte-lb03yy");
    			add_location(ul1, file$5, 11982, 6, 207472);
    			attr_dev(br0, "class", "svelte-lb03yy");
    			add_location(br0, file$5, 11988, 61, 207912);
    			attr_dev(br1, "class", "svelte-lb03yy");
    			add_location(br1, file$5, 11989, 20, 207940);
    			attr_dev(br2, "class", "svelte-lb03yy");
    			add_location(br2, file$5, 11990, 21, 207969);
    			attr_dev(p0, "class", "col-sm-4 col-md-2 mb-30 mb-md-0 svelte-lb03yy");
    			add_location(p0, file$5, 11988, 6, 207857);
    			attr_dev(a5, "class", "col-md-2 offset-lg-1 text-center align-self-start svelte-lb03yy");
    			attr_dev(a5, "href", "mailto:hello@asynclabs.co");
    			add_location(a5, file$5, 11993, 6, 208012);
    			attr_dev(div0, "class", "row svelte-lb03yy");
    			add_location(div0, file$5, 11972, 4, 206985);
    			attr_dev(p1, "class", "w-100 text-center text-md-left svelte-lb03yy");
    			add_location(p1, file$5, 11996, 6, 208173);
    			attr_dev(div1, "class", "row svelte-lb03yy");
    			add_location(div1, file$5, 11995, 4, 208148);
    			attr_dev(div2, "class", "container svelte-lb03yy");
    			add_location(div2, file$5, 11971, 2, 206956);
    			attr_dev(footer, "class", "bg-primary svelte-lb03yy");
    			add_location(footer, file$5, 11970, 0, 206925);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div0, t0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			mount_component(link0, li0, null);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			mount_component(link1, li1, null);
    			append_dev(ul0, t2);
    			append_dev(ul0, li2);
    			mount_component(link2, li2, null);
    			append_dev(ul0, t3);
    			append_dev(ul0, li3);
    			mount_component(link3, li3, null);
    			append_dev(div0, t4);
    			append_dev(div0, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a1);
    			append_dev(ul1, t6);
    			append_dev(ul1, li5);
    			append_dev(li5, a2);
    			append_dev(ul1, t8);
    			append_dev(ul1, li6);
    			append_dev(li6, a3);
    			append_dev(ul1, t10);
    			append_dev(ul1, li7);
    			append_dev(li7, a4);
    			append_dev(div0, t12);
    			append_dev(div0, p0);
    			append_dev(p0, t13);
    			append_dev(p0, br0);
    			append_dev(p0, t14);
    			append_dev(p0, br1);
    			append_dev(p0, t15);
    			append_dev(p0, br2);
    			append_dev(p0, t16);
    			append_dev(div0, t17);
    			append_dev(div0, a5);
    			append_dev(div2, t19);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("/index"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, isActive, Link, $url });
    	return [$url];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\pages\_layout.svelte generated by Svelte v3.29.0 */
    const file$6 = "src\\pages\\_layout.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "flex-grow-1 svelte-otkdac");
    			add_location(main, file$6, 11931, 8, 206369);
    			attr_dev(div, "class", "wrapper h-100 d-flex flex-column svelte-otkdac");
    			add_location(div, file$6, 11929, 4, 206293);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(header, div, null);
    			append_dev(div, t0);
    			append_dev(div, main);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			append_dev(div, t1);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(header);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Header, Footer });
    	return [$$scope, slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\pages\about.svelte generated by Svelte v3.29.0 */

    const file$7 = "src\\pages\\about.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;
    	let h1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ABOUT";
    			attr_dev(h1, "class", "svelte-occiaa");
    			add_location(h1, file$7, 11846, 4, 204938);
    			attr_dev(div0, "class", "row svelte-occiaa");
    			add_location(div0, file$7, 11845, 2, 204915);
    			attr_dev(div1, "class", "container svelte-occiaa");
    			attr_dev(div1, "data-aos", "fade-up");
    			add_location(div1, file$7, 11844, 0, 204869);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\AddressBox.svelte generated by Svelte v3.29.0 */

    const file$8 = "src\\components\\AddressBox.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let p2;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*city*/ ctx[0]);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(/*address*/ ctx[1]);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*email*/ ctx[2]);
    			t5 = space();
    			p2 = element("p");
    			t6 = text(/*phone*/ ctx[3]);
    			attr_dev(h3, "class", "svelte-1bm7zlc");
    			add_location(h3, file$8, 11963, 4, 206901);
    			attr_dev(p0, "class", "svelte-1bm7zlc");
    			add_location(p0, file$8, 11964, 4, 206922);
    			attr_dev(p1, "class", "svelte-1bm7zlc");
    			add_location(p1, file$8, 11965, 4, 206944);
    			attr_dev(p2, "class", "svelte-1bm7zlc");
    			add_location(p2, file$8, 11966, 4, 206964);
    			attr_dev(div, "class", "svelte-1bm7zlc");
    			toggle_class(div, "gray", /*background*/ ctx[4] == "gray");
    			toggle_class(div, "black", /*background*/ ctx[4] == "black");
    			add_location(div, file$8, 11962, 0, 206816);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, t4);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(p2, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*city*/ 1) set_data_dev(t0, /*city*/ ctx[0]);
    			if (dirty & /*address*/ 2) set_data_dev(t2, /*address*/ ctx[1]);
    			if (dirty & /*email*/ 4) set_data_dev(t4, /*email*/ ctx[2]);
    			if (dirty & /*phone*/ 8) set_data_dev(t6, /*phone*/ ctx[3]);

    			if (dirty & /*background*/ 16) {
    				toggle_class(div, "gray", /*background*/ ctx[4] == "gray");
    			}

    			if (dirty & /*background*/ 16) {
    				toggle_class(div, "black", /*background*/ ctx[4] == "black");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddressBox", slots, []);
    	let { city = "London, UK" } = $$props;
    	let { address = "Vlaška ulica, 70 E" } = $$props;
    	let { email = "hello@asynclabs.co" } = $$props;
    	let { phone = "+385 99 4936 071" } = $$props;
    	let { background = "gray" } = $$props;
    	const writable_props = ["city", "address", "email", "phone", "background"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddressBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("city" in $$props) $$invalidate(0, city = $$props.city);
    		if ("address" in $$props) $$invalidate(1, address = $$props.address);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("phone" in $$props) $$invalidate(3, phone = $$props.phone);
    		if ("background" in $$props) $$invalidate(4, background = $$props.background);
    	};

    	$$self.$capture_state = () => ({ city, address, email, phone, background });

    	$$self.$inject_state = $$props => {
    		if ("city" in $$props) $$invalidate(0, city = $$props.city);
    		if ("address" in $$props) $$invalidate(1, address = $$props.address);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("phone" in $$props) $$invalidate(3, phone = $$props.phone);
    		if ("background" in $$props) $$invalidate(4, background = $$props.background);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [city, address, email, phone, background];
    }

    class AddressBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			city: 0,
    			address: 1,
    			email: 2,
    			phone: 3,
    			background: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddressBox",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get city() {
    		throw new Error("<AddressBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set city(value) {
    		throw new Error("<AddressBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get address() {
    		throw new Error("<AddressBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set address(value) {
    		throw new Error("<AddressBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error("<AddressBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<AddressBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get phone() {
    		throw new Error("<AddressBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phone(value) {
    		throw new Error("<AddressBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get background() {
    		throw new Error("<AddressBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error("<AddressBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\BackgroundTitle.svelte generated by Svelte v3.29.0 */

    const file$9 = "src\\components\\BackgroundTitle.svelte";

    function create_fragment$a(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*title*/ ctx[0]);
    			attr_dev(p, "class", "svelte-1l0nen6");
    			add_location(p, file$9, 11934, 0, 206420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BackgroundTitle", slots, []);
    	let { title = "Page title" } = $$props;
    	const writable_props = ["title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackgroundTitle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ title });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title];
    }

    class BackgroundTitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundTitle",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get title() {
    		throw new Error("<BackgroundTitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<BackgroundTitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Button.svelte generated by Svelte v3.29.0 */
    const file$a = "src\\components\\Button.svelte";

    function create_fragment$b(ctx) {
    	let a;
    	let button;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(button, "class", "d-flex justify-content-center align-items-center svelte-1bdilb0");
    			toggle_class(button, "btn-white", /*color*/ ctx[2] == "white");
    			add_location(button, file$a, 11946, 21, 206690);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[3](/*link*/ ctx[1]));
    			attr_dev(a, "class", "svelte-1bdilb0");
    			add_location(a, file$a, 11946, 0, 206669);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
    			append_dev(button, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);

    			if (dirty & /*color*/ 4) {
    				toggle_class(button, "btn-white", /*color*/ ctx[2] == "white");
    			}

    			if (dirty & /*$url, link*/ 10 && a_href_value !== (a_href_value = /*$url*/ ctx[3](/*link*/ ctx[1]))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(3, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { text = "text" } = $$props;
    	let { link = "/index" } = $$props;
    	let { color = "black" } = $$props;
    	const writable_props = ["text", "link", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("link" in $$props) $$invalidate(1, link = $$props.link);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ text, link, color, url, isActive, $url });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("link" in $$props) $$invalidate(1, link = $$props.link);
    		if ("color" in $$props) $$invalidate(2, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, link, color, $url];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { text: 0, link: 1, color: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ContactForm.svelte generated by Svelte v3.29.0 */
    const file$b = "src\\components\\ContactForm.svelte";

    function create_fragment$c(ctx) {
    	let div19;
    	let div18;
    	let form;
    	let div4;
    	let div1;
    	let input0;
    	let t0;
    	let div0;
    	let t1_value = /*formErrors*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let div3;
    	let input1;
    	let t3;
    	let div2;
    	let t4_value = /*formErrors*/ ctx[1].email + "";
    	let t4;
    	let t5;
    	let div9;
    	let div6;
    	let input2;
    	let t6;
    	let div5;
    	let t7_value = /*formErrors*/ ctx[1].phone + "";
    	let t7;
    	let t8;
    	let div8;
    	let input3;
    	let t9;
    	let div7;
    	let t10_value = /*formErrors*/ ctx[1].company + "";
    	let t10;
    	let t11;
    	let div12;
    	let div11;
    	let input4;
    	let t12;
    	let div10;
    	let t13_value = /*formErrors*/ ctx[1].title + "";
    	let t13;
    	let t14;
    	let div15;
    	let div14;
    	let input5;
    	let t15;
    	let div13;
    	let t16_value = /*formErrors*/ ctx[1].message + "";
    	let t16;
    	let t17;
    	let div17;
    	let div16;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: { text: "Submit" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div19 = element("div");
    			div18 = element("div");
    			form = element("form");
    			div4 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div9 = element("div");
    			div6 = element("div");
    			input2 = element("input");
    			t6 = space();
    			div5 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			div8 = element("div");
    			input3 = element("input");
    			t9 = space();
    			div7 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div12 = element("div");
    			div11 = element("div");
    			input4 = element("input");
    			t12 = space();
    			div10 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			div15 = element("div");
    			div14 = element("div");
    			input5 = element("input");
    			t15 = space();
    			div13 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			div17 = element("div");
    			div16 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Your name*");
    			attr_dev(input0, "class", "svelte-o6pk");
    			add_location(input0, file$b, 12024, 10, 208454);
    			attr_dev(div0, "class", "error svelte-o6pk");
    			add_location(div0, file$b, 12028, 10, 208580);
    			attr_dev(div1, "class", "col-md-6 svelte-o6pk");
    			add_location(div1, file$b, 12023, 8, 208420);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "placeholder", "Email address*");
    			attr_dev(input1, "class", "svelte-o6pk");
    			add_location(input1, file$b, 12032, 10, 208684);
    			attr_dev(div2, "class", "error svelte-o6pk");
    			add_location(div2, file$b, 12036, 10, 208816);
    			attr_dev(div3, "class", "col-md-6 svelte-o6pk");
    			add_location(div3, file$b, 12031, 8, 208650);
    			attr_dev(div4, "class", "row svelte-o6pk");
    			add_location(div4, file$b, 12022, 6, 208393);
    			attr_dev(input2, "type", "phone");
    			attr_dev(input2, "placeholder", "Phone number");
    			attr_dev(input2, "class", "svelte-o6pk");
    			add_location(input2, file$b, 12042, 10, 208960);
    			attr_dev(div5, "class", "error svelte-o6pk");
    			add_location(div5, file$b, 12046, 10, 209090);
    			attr_dev(div6, "class", "col-md-6 svelte-o6pk");
    			add_location(div6, file$b, 12041, 8, 208926);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Company");
    			attr_dev(input3, "class", "svelte-o6pk");
    			add_location(input3, file$b, 12050, 10, 209195);
    			attr_dev(div7, "class", "error svelte-o6pk");
    			add_location(div7, file$b, 12054, 10, 209321);
    			attr_dev(div8, "class", "col-md-6 svelte-o6pk");
    			add_location(div8, file$b, 12049, 8, 209161);
    			attr_dev(div9, "class", "row svelte-o6pk");
    			add_location(div9, file$b, 12040, 6, 208899);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "placeholder", "Title*");
    			attr_dev(input4, "class", "svelte-o6pk");
    			add_location(input4, file$b, 12060, 10, 209465);
    			attr_dev(div10, "class", "error svelte-o6pk");
    			add_location(div10, file$b, 12064, 10, 209588);
    			attr_dev(div11, "class", "col-12 svelte-o6pk");
    			add_location(div11, file$b, 12059, 8, 209433);
    			attr_dev(div12, "class", "row svelte-o6pk");
    			add_location(div12, file$b, 12058, 6, 209406);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "placeholder", "Message*");
    			attr_dev(input5, "class", "svelte-o6pk");
    			add_location(input5, file$b, 12070, 10, 209730);
    			attr_dev(div13, "class", "error svelte-o6pk");
    			add_location(div13, file$b, 12074, 10, 209857);
    			attr_dev(div14, "class", "col-12 svelte-o6pk");
    			add_location(div14, file$b, 12069, 8, 209698);
    			attr_dev(div15, "class", "row svelte-o6pk");
    			add_location(div15, file$b, 12068, 6, 209671);
    			attr_dev(div16, "class", "btnSubmit col d-flex justify-content-center svelte-o6pk");
    			add_location(div16, file$b, 12078, 10, 209969);
    			attr_dev(div17, "class", "row svelte-o6pk");
    			add_location(div17, file$b, 12077, 6, 209940);
    			attr_dev(form, "action", "");
    			form.noValidate = true;
    			attr_dev(form, "class", "svelte-o6pk");
    			add_location(form, file$b, 12021, 4, 208318);
    			attr_dev(div18, "class", "container svelte-o6pk");
    			add_location(div18, file$b, 12020, 2, 208289);
    			attr_dev(div19, "class", "formWrapper col-12 svelte-o6pk");
    			add_location(div19, file$b, 12019, 0, 208253);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div19, anchor);
    			append_dev(div19, div18);
    			append_dev(div18, form);
    			append_dev(form, div4);
    			append_dev(div4, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*formFields*/ ctx[0].name);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, input1);
    			set_input_value(input1, /*formFields*/ ctx[0].email);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(form, t5);
    			append_dev(form, div9);
    			append_dev(div9, div6);
    			append_dev(div6, input2);
    			set_input_value(input2, /*formFields*/ ctx[0].phone);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, t7);
    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			append_dev(div8, input3);
    			set_input_value(input3, /*formFields*/ ctx[0].company);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, t10);
    			append_dev(form, t11);
    			append_dev(form, div12);
    			append_dev(div12, div11);
    			append_dev(div11, input4);
    			set_input_value(input4, /*formFields*/ ctx[0].title);
    			append_dev(div11, t12);
    			append_dev(div11, div10);
    			append_dev(div10, t13);
    			append_dev(form, t14);
    			append_dev(form, div15);
    			append_dev(div15, div14);
    			append_dev(div14, input5);
    			set_input_value(input5, /*formFields*/ ctx[0].message);
    			append_dev(div14, t15);
    			append_dev(div14, div13);
    			append_dev(div13, t16);
    			append_dev(form, t17);
    			append_dev(form, div17);
    			append_dev(div17, div16);
    			mount_component(button, div16, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[6]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[7]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[8]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formFields*/ 1 && input0.value !== /*formFields*/ ctx[0].name) {
    				set_input_value(input0, /*formFields*/ ctx[0].name);
    			}

    			if ((!current || dirty & /*formErrors*/ 2) && t1_value !== (t1_value = /*formErrors*/ ctx[1].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*formFields*/ 1 && input1.value !== /*formFields*/ ctx[0].email) {
    				set_input_value(input1, /*formFields*/ ctx[0].email);
    			}

    			if ((!current || dirty & /*formErrors*/ 2) && t4_value !== (t4_value = /*formErrors*/ ctx[1].email + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*formFields*/ 1) {
    				set_input_value(input2, /*formFields*/ ctx[0].phone);
    			}

    			if ((!current || dirty & /*formErrors*/ 2) && t7_value !== (t7_value = /*formErrors*/ ctx[1].phone + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*formFields*/ 1 && input3.value !== /*formFields*/ ctx[0].company) {
    				set_input_value(input3, /*formFields*/ ctx[0].company);
    			}

    			if ((!current || dirty & /*formErrors*/ 2) && t10_value !== (t10_value = /*formErrors*/ ctx[1].company + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*formFields*/ 1 && input4.value !== /*formFields*/ ctx[0].title) {
    				set_input_value(input4, /*formFields*/ ctx[0].title);
    			}

    			if ((!current || dirty & /*formErrors*/ 2) && t13_value !== (t13_value = /*formErrors*/ ctx[1].title + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*formFields*/ 1 && input5.value !== /*formFields*/ ctx[0].message) {
    				set_input_value(input5, /*formFields*/ ctx[0].message);
    			}

    			if ((!current || dirty & /*formErrors*/ 2) && t16_value !== (t16_value = /*formErrors*/ ctx[1].message + "")) set_data_dev(t16, t16_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div19);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContactForm", slots, []);

    	let formFields = {
    		name: "",
    		email: "",
    		phone: "",
    		company: "",
    		title: "",
    		message: ""
    	};

    	let formErrors = {
    		name: "",
    		email: "",
    		phone: "",
    		company: "",
    		title: "",
    		message: ""
    	};

    	let valid = false;

    	function handleSubmit() {
    		valid = true;

    		//CUSTOM VALIDATION
    		if (formFields.name.trim().length < 5) {
    			valid = false;
    			$$invalidate(1, formErrors.name = "Name must not be shorter than 5 characters", formErrors);
    		} else {
    			$$invalidate(1, formErrors.name = "", formErrors);
    		}

    		if (formFields.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    			$$invalidate(1, formErrors.email = "", formErrors);
    		} else {
    			valid = false;
    			$$invalidate(1, formErrors.email = "Please insert a valid emial address", formErrors);
    		}

    		if (formFields.title.trim().length < 5) {
    			valid = false;
    			$$invalidate(1, formErrors.title = "Please insert a valid title", formErrors);
    		} else {
    			$$invalidate(1, formErrors.title = "", formErrors);
    		}

    		if (formFields.message.trim().length < 5) {
    			valid = false;
    			$$invalidate(1, formErrors.message = "Please insert a longer messa", formErrors);
    		} else {
    			$$invalidate(1, formErrors.message = "", formErrors);
    		}

    		//IF form data is valid
    		if (valid) {
    			alert("Success" + JSON.stringify(formFields));
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		formFields.name = this.value;
    		$$invalidate(0, formFields);
    	}

    	function input1_input_handler() {
    		formFields.email = this.value;
    		$$invalidate(0, formFields);
    	}

    	function input2_input_handler() {
    		formFields.phone = this.value;
    		$$invalidate(0, formFields);
    	}

    	function input3_input_handler() {
    		formFields.company = this.value;
    		$$invalidate(0, formFields);
    	}

    	function input4_input_handler() {
    		formFields.title = this.value;
    		$$invalidate(0, formFields);
    	}

    	function input5_input_handler() {
    		formFields.message = this.value;
    		$$invalidate(0, formFields);
    	}

    	$$self.$capture_state = () => ({
    		Button,
    		formFields,
    		formErrors,
    		valid,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("formFields" in $$props) $$invalidate(0, formFields = $$props.formFields);
    		if ("formErrors" in $$props) $$invalidate(1, formErrors = $$props.formErrors);
    		if ("valid" in $$props) valid = $$props.valid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		formFields,
    		formErrors,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	];
    }

    class ContactForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactForm",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\pages\contact.svelte generated by Svelte v3.29.0 */
    const file$c = "src\\pages\\contact.svelte";

    function create_fragment$d(ctx) {
    	let title_value;
    	let t0;
    	let div8;
    	let div2;
    	let div0;
    	let h1;
    	let t2;
    	let p;
    	let t4;
    	let div1;
    	let backgroundtitle;
    	let t5;
    	let div3;
    	let contactform;
    	let t6;
    	let div7;
    	let div4;
    	let addressbox0;
    	let t7;
    	let div5;
    	let addressbox1;
    	let t8;
    	let div6;
    	let addressbox2;
    	let current;
    	document.title = title_value = pageTitle;

    	backgroundtitle = new BackgroundTitle({
    			props: { title: pageTitle },
    			$$inline: true
    		});

    	contactform = new ContactForm({ $$inline: true });
    	addressbox0 = new AddressBox({ $$inline: true });

    	addressbox1 = new AddressBox({
    			props: { background: "gray" },
    			$$inline: true
    		});

    	addressbox2 = new AddressBox({
    			props: { background: "black" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			div8 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Let’s talk";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Deep light land beginning form fish there brought fifth forth earth us\r\n        make cattle seasons every spirit one can't behold, creepeth fish thing\r\n        male his him.";
    			t4 = space();
    			div1 = element("div");
    			create_component(backgroundtitle.$$.fragment);
    			t5 = space();
    			div3 = element("div");
    			create_component(contactform.$$.fragment);
    			t6 = space();
    			div7 = element("div");
    			div4 = element("div");
    			create_component(addressbox0.$$.fragment);
    			t7 = space();
    			div5 = element("div");
    			create_component(addressbox1.$$.fragment);
    			t8 = space();
    			div6 = element("div");
    			create_component(addressbox2.$$.fragment);
    			attr_dev(h1, "class", "svelte-6jai5x");
    			add_location(h1, file$c, 11953, 6, 206786);
    			attr_dev(p, "class", "introText svelte-6jai5x");
    			add_location(p, file$c, 11954, 6, 206813);
    			attr_dev(div0, "class", "col-md-6 offset-md-1 svelte-6jai5x");
    			add_location(div0, file$c, 11952, 4, 206744);
    			attr_dev(div1, "class", "col-md-3 offset-md-1 svelte-6jai5x");
    			add_location(div1, file$c, 11960, 4, 207047);
    			attr_dev(div2, "class", "row svelte-6jai5x");
    			add_location(div2, file$c, 11951, 2, 206721);
    			attr_dev(div3, "class", "row formWrapper svelte-6jai5x");
    			add_location(div3, file$c, 11964, 2, 207152);
    			attr_dev(div4, "class", "col-lg-4 mb-20 mb-lg-0 svelte-6jai5x");
    			add_location(div4, file$c, 11968, 4, 207254);
    			attr_dev(div5, "class", "col-lg-4 mb-20 mb-lg-0 svelte-6jai5x");
    			add_location(div5, file$c, 11971, 4, 207330);
    			attr_dev(div6, "class", "col-lg-4 mb-20 mb-lg-0 svelte-6jai5x");
    			add_location(div6, file$c, 11974, 4, 207424);
    			attr_dev(div7, "class", "row addressSection svelte-6jai5x");
    			add_location(div7, file$c, 11967, 2, 207216);
    			attr_dev(div8, "class", "container svelte-6jai5x");
    			attr_dev(div8, "data-aos", "fade-up");
    			add_location(div8, file$c, 11950, 0, 206675);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			mount_component(backgroundtitle, div1, null);
    			append_dev(div8, t5);
    			append_dev(div8, div3);
    			mount_component(contactform, div3, null);
    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			mount_component(addressbox0, div4, null);
    			append_dev(div7, t7);
    			append_dev(div7, div5);
    			mount_component(addressbox1, div5, null);
    			append_dev(div7, t8);
    			append_dev(div7, div6);
    			mount_component(addressbox2, div6, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*pageTitle*/ 0) && title_value !== (title_value = pageTitle)) {
    				document.title = title_value;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backgroundtitle.$$.fragment, local);
    			transition_in(contactform.$$.fragment, local);
    			transition_in(addressbox0.$$.fragment, local);
    			transition_in(addressbox1.$$.fragment, local);
    			transition_in(addressbox2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backgroundtitle.$$.fragment, local);
    			transition_out(contactform.$$.fragment, local);
    			transition_out(addressbox0.$$.fragment, local);
    			transition_out(addressbox1.$$.fragment, local);
    			transition_out(addressbox2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div8);
    			destroy_component(backgroundtitle);
    			destroy_component(contactform);
    			destroy_component(addressbox0);
    			destroy_component(addressbox1);
    			destroy_component(addressbox2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const pageTitle = "Contact Page";

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AddressBox,
    		BackgroundTitle,
    		ContactForm,
    		pageTitle
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    var getImageSrc = (imageName, imageFormat, maxSize) => {
            let setsrc = [50, 100, 200,
                320,
                420,
                520,
                620,
                720,
                920,
                1020,
                1220,
                1420,
                1920,
                1920,
                1920
            ];
            let sizes = [25, 50, 100,
                200,
                320,
                420,
                520,
                620,
                720,
                920,
                1020,
                1220,
                1420,
                1920
            ];
            let str = "";
            let i = 0;
            sizes.forEach(currentSize => {
                if ((currentSize) <= maxSize.containerWidth) {
                    str = str.concat(
                        `./images/${imageFormat}/${imageName.src}-${setsrc[i]}.${imageFormat} ${currentSize}w, `
                    );
                }
                i++;
            });
            return str
        };

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\svelte-responsive-images\runtime\Image.svelte generated by Svelte v3.29.0 */
    const file$d = "node_modules\\svelte-responsive-images\\runtime\\Image.svelte";

    // (18:8) {#if !loaded}
    function create_if_block$2(ctx) {
    	let img;
    	let img_src_value;
    	let img_outro;
    	let current;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "placeholder blur svelte-lm6vyu");
    			if (img.src !== (img_src_value = "./images/jpg/" + /*src*/ ctx[2] + "-10.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "placeholder");
    			add_location(img, file$d, 18, 8, 478);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*src*/ 4 && img.src !== (img_src_value = "./images/jpg/" + /*src*/ ctx[2] + "-10.jpg")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (img_outro) img_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			img_outro = create_out_transition(img, fade, { duration: 300 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching && img_outro) img_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:8) {#if !loaded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let picture;
    	let source0;
    	let source0_srcset_value;
    	let t1;
    	let source1;
    	let source1_srcset_value;
    	let t2;
    	let img;
    	let img_class_value;
    	let img_srcset_value;
    	let load_action;
    	let div0_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*loaded*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			picture = element("picture");
    			source0 = element("source");
    			t1 = space();
    			source1 = element("source");
    			t2 = space();
    			img = element("img");
    			attr_dev(source0, "type", "image/webp");

    			attr_dev(source0, "srcset", source0_srcset_value = getImageSrc({ src: /*src*/ ctx[2] }, "webp", {
    				containerWidth: /*containerWidth*/ ctx[4]
    			}));

    			add_location(source0, file$d, 21, 4, 617);

    			attr_dev(source1, "srcset", source1_srcset_value = getImageSrc({ src: /*src*/ ctx[2] }, "jpg", {
    				containerWidth: /*containerWidth*/ ctx[4]
    			}));

    			add_location(source1, file$d, 22, 4, 704);
    			attr_dev(img, "class", img_class_value = "main " + /*c*/ ctx[1] + " svelte-lm6vyu");
    			attr_dev(img, "alt", "alt");
    			attr_dev(img, "srcset", img_srcset_value = "./images/jpg/" + /*src*/ ctx[2] + "-10.jpg");
    			attr_dev(img, "onerror", "this.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMszXpSDwAFYwJEhxButQAAAABJRU5ErkJggg==';");
    			attr_dev(img, "loading", "lazy");
    			add_location(img, file$d, 23, 4, 772);
    			add_location(picture, file$d, 20, 3, 602);
    			set_style(div0, "overflow", "hidden");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[6].call(div0));
    			add_location(div0, file$d, 16, 4, 380);
    			attr_dev(div1, "class", "wrapper svelte-lm6vyu");
    			set_style(div1, "max-width", /*w*/ ctx[0]);
    			toggle_class(div1, "loaded", /*loaded*/ ctx[3]);
    			add_location(div1, file$d, 15, 0, 318);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, picture);
    			append_dev(picture, source0);
    			append_dev(picture, t1);
    			append_dev(picture, source1);
    			append_dev(picture, t2);
    			append_dev(picture, img);
    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[6].bind(div0));
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(load_action = /*load*/ ctx[5].call(null, img));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*loaded*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loaded*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*src, containerWidth*/ 20 && source0_srcset_value !== (source0_srcset_value = getImageSrc({ src: /*src*/ ctx[2] }, "webp", {
    				containerWidth: /*containerWidth*/ ctx[4]
    			}))) {
    				attr_dev(source0, "srcset", source0_srcset_value);
    			}

    			if (!current || dirty & /*src, containerWidth*/ 20 && source1_srcset_value !== (source1_srcset_value = getImageSrc({ src: /*src*/ ctx[2] }, "jpg", {
    				containerWidth: /*containerWidth*/ ctx[4]
    			}))) {
    				attr_dev(source1, "srcset", source1_srcset_value);
    			}

    			if (!current || dirty & /*c*/ 2 && img_class_value !== (img_class_value = "main " + /*c*/ ctx[1] + " svelte-lm6vyu")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (!current || dirty & /*src*/ 4 && img_srcset_value !== (img_srcset_value = "./images/jpg/" + /*src*/ ctx[2] + "-10.jpg")) {
    				attr_dev(img, "srcset", img_srcset_value);
    			}

    			if (!current || dirty & /*w*/ 1) {
    				set_style(div1, "max-width", /*w*/ ctx[0]);
    			}

    			if (dirty & /*loaded*/ 8) {
    				toggle_class(div1, "loaded", /*loaded*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			div0_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Image", slots, []);
    	let { w = "100%" } = $$props;
    	let { c = "" } = $$props;
    	let loaded = false;
    	let { src = "" } = $$props;
    	let containerWidth;

    	function load(img) {
    		img.onload = () => $$invalidate(3, loaded = true);
    	}

    	const writable_props = ["w", "c", "src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		containerWidth = this.offsetWidth;
    		$$invalidate(4, containerWidth);
    	}

    	$$self.$$set = $$props => {
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("c" in $$props) $$invalidate(1, c = $$props.c);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({
    		getImageSrc,
    		fade,
    		w,
    		c,
    		loaded,
    		src,
    		containerWidth,
    		load
    	});

    	$$self.$inject_state = $$props => {
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("c" in $$props) $$invalidate(1, c = $$props.c);
    		if ("loaded" in $$props) $$invalidate(3, loaded = $$props.loaded);
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("containerWidth" in $$props) $$invalidate(4, containerWidth = $$props.containerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [w, c, src, loaded, containerWidth, load, div0_elementresize_handler];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { w: 0, c: 1, src: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get w() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set w(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get c() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set c(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\index.svelte generated by Svelte v3.29.0 */
    const file$e = "src\\pages\\index.svelte";

    function create_fragment$f(ctx) {
    	let div1;
    	let div0;
    	let h1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "HOME";
    			attr_dev(h1, "class", "svelte-plyvmh");
    			add_location(h1, file$e, 11845, 8, 204995);
    			attr_dev(div0, "class", "row svelte-plyvmh");
    			add_location(div0, file$e, 11844, 4, 204968);
    			attr_dev(div1, "class", "container svelte-plyvmh");
    			attr_dev(div1, "data-aos", "fade-up");
    			add_location(div1, file$e, 11843, 0, 204920);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pages", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\pages\services\digital-design.svelte generated by Svelte v3.29.0 */

    function create_fragment$g(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("DIGITAL DESIGN");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Digital_design", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Digital_design> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Digital_design extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Digital_design",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\ImageGroup.svelte generated by Svelte v3.29.0 */
    const file$f = "src\\components\\ImageGroup.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (12032:6) {#each listItems as item}
    function create_each_block$2(ctx) {
    	let li;
    	let t_value = /*item*/ ctx[6] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1ui7i5e");
    			add_location(li, file$f, 12032, 8, 208628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*listItems*/ 32 && t_value !== (t_value = /*item*/ ctx[6] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(12032:6) {#each listItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div1;
    	let h2;
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let t5;
    	let ul;
    	let t6;
    	let button;
    	let current;
    	let each_value = /*listItems*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	button = new Button({
    			props: { text: "View service" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t2 = text(/*title*/ ctx[1]);
    			t3 = space();
    			p = element("p");
    			t4 = text(/*text*/ ctx[2]);
    			t5 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			create_component(button.$$.fragment);
    			attr_dev(img0, "class", "imgMain svelte-1ui7i5e");
    			if (img0.src !== (img0_src_value = /*imageMain*/ ctx[3])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$f, 12020, 4, 208164);
    			attr_dev(img1, "class", "imgSecondary svelte-1ui7i5e");
    			if (img1.src !== (img1_src_value = /*imageSecondary*/ ctx[4])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$f, 12021, 4, 208216);
    			attr_dev(div0, "class", "imageContainer col-md-6 p-0 mb-20 mb-md-0 svelte-1ui7i5e");
    			add_location(div0, file$f, 12019, 2, 208103);
    			attr_dev(h2, "class", "svelte-1ui7i5e");
    			add_location(h2, file$f, 12024, 4, 208363);
    			attr_dev(p, "class", "svelte-1ui7i5e");
    			add_location(p, file$f, 12025, 4, 208385);
    			attr_dev(ul, "class", "servicesList svelte-1ui7i5e");
    			add_location(ul, file$f, 12026, 4, 208404);
    			attr_dev(div1, "class", "serviceInfo col-md-6 d-flex flex-column align-items-start svelte-1ui7i5e");
    			add_location(div1, file$f, 12023, 2, 208286);
    			attr_dev(div2, "class", "imageGroupWrapper row d-flex align-items-center svelte-1ui7i5e");
    			toggle_class(div2, "left", /*position*/ ctx[0] == "left");
    			toggle_class(div2, "right", /*position*/ ctx[0] == "right");
    			add_location(div2, file$f, 12015, 0, 207963);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div1, t5);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div1, t6);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*imageMain*/ 8 && img0.src !== (img0_src_value = /*imageMain*/ ctx[3])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (!current || dirty & /*imageSecondary*/ 16 && img1.src !== (img1_src_value = /*imageSecondary*/ ctx[4])) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (!current || dirty & /*title*/ 2) set_data_dev(t2, /*title*/ ctx[1]);
    			if (!current || dirty & /*text*/ 4) set_data_dev(t4, /*text*/ ctx[2]);

    			if (dirty & /*listItems*/ 32) {
    				each_value = /*listItems*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*position*/ 1) {
    				toggle_class(div2, "left", /*position*/ ctx[0] == "left");
    			}

    			if (dirty & /*position*/ 1) {
    				toggle_class(div2, "right", /*position*/ ctx[0] == "right");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ImageGroup", slots, []);
    	let { position = "right" } = $$props;
    	let { title = "title" } = $$props;
    	let { text = "insert some profound text here" } = $$props;
    	let { imageMain = "assets/images/services/1.jpg" } = $$props;
    	let { imageSecondary = "assets/images/services/2.jpg" } = $$props;
    	let { listItems = ["one", "two", "three"] } = $$props;
    	const writable_props = ["position", "title", "text", "imageMain", "imageSecondary", "listItems"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImageGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("imageMain" in $$props) $$invalidate(3, imageMain = $$props.imageMain);
    		if ("imageSecondary" in $$props) $$invalidate(4, imageSecondary = $$props.imageSecondary);
    		if ("listItems" in $$props) $$invalidate(5, listItems = $$props.listItems);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		position,
    		title,
    		text,
    		imageMain,
    		imageSecondary,
    		listItems
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(0, position = $$props.position);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("imageMain" in $$props) $$invalidate(3, imageMain = $$props.imageMain);
    		if ("imageSecondary" in $$props) $$invalidate(4, imageSecondary = $$props.imageSecondary);
    		if ("listItems" in $$props) $$invalidate(5, listItems = $$props.listItems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [position, title, text, imageMain, imageSecondary, listItems];
    }

    class ImageGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			position: 0,
    			title: 1,
    			text: 2,
    			imageMain: 3,
    			imageSecondary: 4,
    			listItems: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageGroup",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get position() {
    		throw new Error("<ImageGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<ImageGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ImageGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ImageGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ImageGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ImageGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageMain() {
    		throw new Error("<ImageGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageMain(value) {
    		throw new Error("<ImageGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageSecondary() {
    		throw new Error("<ImageGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageSecondary(value) {
    		throw new Error("<ImageGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listItems() {
    		throw new Error("<ImageGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listItems(value) {
    		throw new Error("<ImageGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\NumbersText.svelte generated by Svelte v3.29.0 */

    const file$g = "src\\components\\NumbersText.svelte";

    function create_fragment$i(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let p;
    	let t4;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			span = element("span");
    			t2 = text(/*number*/ ctx[2]);
    			t3 = space();
    			p = element("p");
    			t4 = text(/*text*/ ctx[1]);
    			attr_dev(span, "class", "svelte-1u0e9lg");
    			add_location(span, file$g, 11956, 12, 206872);
    			attr_dev(h3, "class", "svelte-1u0e9lg");
    			add_location(h3, file$g, 11956, 0, 206860);
    			attr_dev(p, "class", "svelte-1u0e9lg");
    			add_location(p, file$g, 11957, 0, 206900);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, span);
    			append_dev(span, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*number*/ 4) set_data_dev(t2, /*number*/ ctx[2]);
    			if (dirty & /*text*/ 2) set_data_dev(t4, /*text*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NumbersText", slots, []);
    	let { title = "Title" } = $$props;
    	let { text = "Some text" } = $$props;
    	let { number = "01" } = $$props;
    	const writable_props = ["title", "text", "number"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NumbersText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("number" in $$props) $$invalidate(2, number = $$props.number);
    	};

    	$$self.$capture_state = () => ({ title, text, number });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("number" in $$props) $$invalidate(2, number = $$props.number);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, text, number];
    }

    class NumbersText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { title: 0, text: 1, number: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumbersText",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get title() {
    		throw new Error("<NumbersText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<NumbersText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<NumbersText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<NumbersText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get number() {
    		throw new Error("<NumbersText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<NumbersText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\services\index.svelte generated by Svelte v3.29.0 */
    const file$h = "src\\pages\\services\\index.svelte";

    function create_fragment$j(ctx) {
    	let div5;
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let backgroundtitle;
    	let t2;
    	let div2;
    	let imagegroup0;
    	let t3;
    	let div3;
    	let imagegroup1;
    	let t4;
    	let div4;
    	let imagegroup2;
    	let t5;
    	let div11;
    	let div10;
    	let div9;
    	let div6;
    	let numberstext0;
    	let t6;
    	let div7;
    	let numberstext1;
    	let t7;
    	let div8;
    	let numberstext2;
    	let t8;
    	let div18;
    	let div17;
    	let div16;
    	let div15;
    	let h2;
    	let t10;
    	let div12;
    	let p;
    	let t12;
    	let div14;
    	let div13;
    	let button;
    	let current;

    	backgroundtitle = new BackgroundTitle({
    			props: { title: pageTitle$1 },
    			$$inline: true
    		});

    	imagegroup0 = new ImageGroup({
    			props: {
    				title: "Software & App Development",
    				text: "Delivering tailored engineering solutions to your \r\n            business challenges, whether it is architectural \r\n            design or web application development.",
    				position: "left",
    				listItems: [
    					"Frontend Development",
    					"Backend Development",
    					"Mobile Development",
    					"Blockchain Development"
    				],
    				imageMain: "assets/images/services/1.jpg",
    				imageSecondary: "assets/images/services/2.jpg"
    			},
    			$$inline: true
    		});

    	imagegroup1 = new ImageGroup({
    			props: {
    				title: "Product Marketing",
    				text: "Your potential users are already here. We can \r\n      help you reach them through different marketing \r\n      channels and convert them to profitable customers.",
    				position: "right",
    				listItems: [
    					"SEO & Search Marketing",
    					"Social Media Marketing",
    					"Content Marketing",
    					"Inbound Marketing",
    					"Paid Advertising"
    				],
    				imageMain: "assets/images/services/3.jpg",
    				imageSecondary: "assets/images/services/4.jpg"
    			},
    			$$inline: true
    		});

    	imagegroup2 = new ImageGroup({
    			props: {
    				title: "Digital Design",
    				text: "From UX to visual design, we create digital \r\n      products people love to use.",
    				position: "left",
    				listItems: ["User Interface Design", "User Experience Design", "Graphic Design"],
    				imageMain: "assets/images/services/5.jpg",
    				imageSecondary: "assets/images/services/6.jpg"
    			},
    			$$inline: true
    		});

    	numberstext0 = new NumbersText({
    			props: {
    				title: "Analysis & Idea",
    				text: "Branding and digital are forte, given \r\n        the state of the world, think.",
    				number: "01"
    			},
    			$$inline: true
    		});

    	numberstext1 = new NumbersText({
    			props: {
    				title: "Design & Development",
    				text: "Dominion it air bearing subdue seed \r\n          very wherein, moving seas.",
    				number: "02"
    			},
    			$$inline: true
    		});

    	numberstext2 = new NumbersText({
    			props: {
    				title: "Testing & Launch",
    				text: "Land very had you and god make void \r\n          forth said all and greater.",
    				number: "03"
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				color: "white",
    				text: "Get in touch",
    				link: "/contact"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Building from idea to implementation";
    			t1 = space();
    			div0 = element("div");
    			create_component(backgroundtitle.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(imagegroup0.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			create_component(imagegroup1.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			create_component(imagegroup2.$$.fragment);
    			t5 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div6 = element("div");
    			create_component(numberstext0.$$.fragment);
    			t6 = space();
    			div7 = element("div");
    			create_component(numberstext1.$$.fragment);
    			t7 = space();
    			div8 = element("div");
    			create_component(numberstext2.$$.fragment);
    			t8 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			div15 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Interested in discussing a project?";
    			t10 = space();
    			div12 = element("div");
    			p = element("p");
    			p.textContent = "Do you have a creative challenge for us? Get in touch with a member\r\n            of the team.";
    			t12 = space();
    			div14 = element("div");
    			div13 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(h1, "class", "col-md-8 offset-md-1 svelte-39725s");
    			add_location(h1, file$h, 11965, 4, 207133);
    			attr_dev(div0, "class", "col-md-3 svelte-39725s");
    			add_location(div0, file$h, 11966, 4, 207213);
    			attr_dev(div1, "class", "row svelte-39725s");
    			add_location(div1, file$h, 11964, 2, 207110);
    			attr_dev(div2, "class", "serviceSection svelte-39725s");
    			add_location(div2, file$h, 11972, 2, 207349);
    			attr_dev(div3, "class", "serviceSection svelte-39725s");
    			add_location(div3, file$h, 11985, 2, 207904);
    			attr_dev(div4, "class", "serviceSection svelte-39725s");
    			add_location(div4, file$h, 11998, 2, 208462);
    			attr_dev(div5, "class", "container svelte-39725s");
    			attr_dev(div5, "data-aos", "fade-up");
    			add_location(div5, file$h, 11963, 0, 207064);
    			attr_dev(div6, "class", "col-md-4 svelte-39725s");
    			add_location(div6, file$h, 12013, 6, 208967);
    			attr_dev(div7, "class", "col-md-4 svelte-39725s");
    			add_location(div7, file$h, 12021, 6, 209193);
    			attr_dev(div8, "class", "col-md-4 svelte-39725s");
    			add_location(div8, file$h, 12029, 6, 209420);
    			attr_dev(div9, "class", "row svelte-39725s");
    			add_location(div9, file$h, 12012, 4, 208942);
    			attr_dev(div10, "class", "container svelte-39725s");
    			add_location(div10, file$h, 12011, 2, 208913);
    			attr_dev(div11, "class", "bg-primary numbersSection svelte-39725s");
    			add_location(div11, file$h, 12010, 0, 208870);
    			attr_dev(h2, "class", "svelte-39725s");
    			add_location(h2, file$h, 12044, 8, 209862);
    			attr_dev(p, "class", "col-md-6 offset-md-3 svelte-39725s");
    			add_location(p, file$h, 12046, 10, 209945);
    			attr_dev(div12, "class", "row svelte-39725s");
    			add_location(div12, file$h, 12045, 8, 209916);
    			attr_dev(div13, "class", "col d-flex justify-content-center svelte-39725s");
    			add_location(div13, file$h, 12052, 10, 210155);
    			attr_dev(div14, "class", "row svelte-39725s");
    			add_location(div14, file$h, 12051, 8, 210126);
    			attr_dev(div15, "class", "col-md-8 offset-md-2 text-center svelte-39725s");
    			add_location(div15, file$h, 12043, 6, 209806);
    			attr_dev(div16, "class", "row svelte-39725s");
    			add_location(div16, file$h, 12042, 4, 209781);
    			attr_dev(div17, "class", "container svelte-39725s");
    			add_location(div17, file$h, 12041, 2, 209752);
    			attr_dev(div18, "class", "interestedSection d-flex justify-content-center align-items-center svelte-39725s");
    			add_location(div18, file$h, 12040, 0, 209668);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(backgroundtitle, div0, null);
    			append_dev(div5, t2);
    			append_dev(div5, div2);
    			mount_component(imagegroup0, div2, null);
    			append_dev(div5, t3);
    			append_dev(div5, div3);
    			mount_component(imagegroup1, div3, null);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			mount_component(imagegroup2, div4, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div6);
    			mount_component(numberstext0, div6, null);
    			append_dev(div9, t6);
    			append_dev(div9, div7);
    			mount_component(numberstext1, div7, null);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			mount_component(numberstext2, div8, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, h2);
    			append_dev(div15, t10);
    			append_dev(div15, div12);
    			append_dev(div12, p);
    			append_dev(div15, t12);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			mount_component(button, div13, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backgroundtitle.$$.fragment, local);
    			transition_in(imagegroup0.$$.fragment, local);
    			transition_in(imagegroup1.$$.fragment, local);
    			transition_in(imagegroup2.$$.fragment, local);
    			transition_in(numberstext0.$$.fragment, local);
    			transition_in(numberstext1.$$.fragment, local);
    			transition_in(numberstext2.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backgroundtitle.$$.fragment, local);
    			transition_out(imagegroup0.$$.fragment, local);
    			transition_out(imagegroup1.$$.fragment, local);
    			transition_out(imagegroup2.$$.fragment, local);
    			transition_out(numberstext0.$$.fragment, local);
    			transition_out(numberstext1.$$.fragment, local);
    			transition_out(numberstext2.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(backgroundtitle);
    			destroy_component(imagegroup0);
    			destroy_component(imagegroup1);
    			destroy_component(imagegroup2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div11);
    			destroy_component(numberstext0);
    			destroy_component(numberstext1);
    			destroy_component(numberstext2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div18);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const pageTitle$1 = "Services Page";

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Services", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		pageTitle: pageTitle$1,
    		BackgroundTitle,
    		Button,
    		ImageGroup,
    		NumbersText
    	});

    	return [];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    //tree
    const _tree = {
      "name": "root",
      "filepath": "/",
      "root": true,
      "ownMeta": {},
      "absolutePath": "src/pages",
      "children": [
        {
          "isFile": true,
          "isDir": false,
          "file": "_fallback.svelte",
          "filepath": "/_fallback.svelte",
          "name": "_fallback",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/_fallback.svelte",
          "importPath": "../../../../src/pages/_fallback.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": true,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/_fallback",
          "id": "__fallback",
          "component": () => Fallback
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "_layout.svelte",
          "filepath": "/_layout.svelte",
          "name": "_layout",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/_layout.svelte",
          "importPath": "../../../../src/pages/_layout.svelte",
          "isLayout": true,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/",
          "id": "__layout",
          "component": () => Layout
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "about.svelte",
          "filepath": "/about.svelte",
          "name": "about",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/about.svelte",
          "importPath": "../../../../src/pages/about.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/about",
          "id": "_about",
          "component": () => About
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "contact.svelte",
          "filepath": "/contact.svelte",
          "name": "contact",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/contact.svelte",
          "importPath": "../../../../src/pages/contact.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/contact",
          "id": "_contact",
          "component": () => Contact
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/index.svelte",
          "importPath": "../../../../src/pages/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/index",
          "id": "_index",
          "component": () => Pages
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "services",
          "filepath": "/services",
          "name": "services",
          "ext": "",
          "badExt": false,
          "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/services",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "digital-design.svelte",
              "filepath": "/services/digital-design.svelte",
              "name": "digital-design",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/services/digital-design.svelte",
              "importPath": "../../../../src/pages/services/digital-design.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/services/digital-design",
              "id": "_services_digitalDesign",
              "component": () => Digital_design
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/services/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "C:/DEV/AsyncLab/basic/src/pages/services/index.svelte",
              "importPath": "../../../../src/pages/services/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/services/index",
              "id": "_services_index",
              "component": () => Services
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/services"
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/"
    };


    const {tree, routes: routes$1} = buildClientTree(_tree);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var aos = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e){function t(o){if(n[o])return n[o].exports;var i=n[o]={exports:{},id:o,loaded:!1};return e[o].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="dist/",t(0)}([function(e,t,n){function o(e){return e&&e.__esModule?e:{default:e}}var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o]);}return e},r=n(1),a=(o(r),n(6)),u=o(a),c=n(7),f=o(c),s=n(8),d=o(s),l=n(9),p=o(l),m=n(10),b=o(m),v=n(11),y=o(v),g=n(14),h=o(g),w=[],k=!1,x={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,startEvent:"DOMContentLoaded",throttleDelay:99,debounceDelay:50,disableMutationObserver:!1},j=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(e&&(k=!0),k)return w=(0, y.default)(w,x),(0, b.default)(w,x.once),w},O=function(){w=(0, h.default)(),j();},_=function(){w.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay");});},S=function(e){return e===!0||"mobile"===e&&p.default.mobile()||"phone"===e&&p.default.phone()||"tablet"===e&&p.default.tablet()||"function"==typeof e&&e()===!0},z=function(e){x=i(x,e),w=(0, h.default)();var t=document.all&&!window.atob;return S(x.disable)||t?_():(document.querySelector("body").setAttribute("data-aos-easing",x.easing),document.querySelector("body").setAttribute("data-aos-duration",x.duration),document.querySelector("body").setAttribute("data-aos-delay",x.delay),"DOMContentLoaded"===x.startEvent&&["complete","interactive"].indexOf(document.readyState)>-1?j(!0):"load"===x.startEvent?window.addEventListener(x.startEvent,function(){j(!0);}):document.addEventListener(x.startEvent,function(){j(!0);}),window.addEventListener("resize",(0, f.default)(j,x.debounceDelay,!0)),window.addEventListener("orientationchange",(0, f.default)(j,x.debounceDelay,!0)),window.addEventListener("scroll",(0, u.default)(function(){(0, b.default)(w,x.once);},x.throttleDelay)),x.disableMutationObserver||(0, d.default)("[data-aos]",O),w)};e.exports={init:z,refresh:j,refreshHard:O};},function(e,t){},,,,,function(e,t){(function(t){function n(e,t,n){function o(t){var n=b,o=v;return b=v=void 0,k=t,g=e.apply(o,n)}function r(e){return k=e,h=setTimeout(s,t),_?o(e):g}function a(e){var n=e-w,o=e-k,i=t-n;return S?j(i,y-o):i}function c(e){var n=e-w,o=e-k;return void 0===w||n>=t||n<0||S&&o>=y}function s(){var e=O();return c(e)?d(e):void(h=setTimeout(s,a(e)))}function d(e){return h=void 0,z&&b?o(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),k=0,b=w=v=h=void 0;}function p(){return void 0===h?g:d(O())}function m(){var e=O(),n=c(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(s,t),o(w)}return void 0===h&&(h=setTimeout(s,t)),g}var b,v,y,g,h,w,k=0,_=!1,S=!1,z=!0;if("function"!=typeof e)throw new TypeError(f);return t=u(t)||0,i(n)&&(_=!!n.leading,S="maxWait"in n,y=S?x(u(n.maxWait)||0,t):y,z="trailing"in n?!!n.trailing:z),m.cancel=l,m.flush=p,m}function o(e,t,o){var r=!0,a=!0;if("function"!=typeof e)throw new TypeError(f);return i(o)&&(r="leading"in o?!!o.leading:r,a="trailing"in o?!!o.trailing:a),n(e,t,{leading:r,maxWait:t,trailing:a})}function i(e){var t="undefined"==typeof e?"undefined":c(e);return !!e&&("object"==t||"function"==t)}function r(e){return !!e&&"object"==("undefined"==typeof e?"undefined":c(e))}function a(e){return "symbol"==("undefined"==typeof e?"undefined":c(e))||r(e)&&k.call(e)==d}function u(e){if("number"==typeof e)return e;if(a(e))return s;if(i(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=i(t)?t+"":t;}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(l,"");var n=m.test(e);return n||b.test(e)?v(e.slice(2),n?2:8):p.test(e)?s:+e}var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},f="Expected a function",s=NaN,d="[object Symbol]",l=/^\s+|\s+$/g,p=/^[-+]0x[0-9a-f]+$/i,m=/^0b[01]+$/i,b=/^0o[0-7]+$/i,v=parseInt,y="object"==("undefined"==typeof t?"undefined":c(t))&&t&&t.Object===Object&&t,g="object"==("undefined"==typeof self?"undefined":c(self))&&self&&self.Object===Object&&self,h=y||g||Function("return this")(),w=Object.prototype,k=w.toString,x=Math.max,j=Math.min,O=function(){return h.Date.now()};e.exports=o;}).call(t,function(){return this}());},function(e,t){(function(t){function n(e,t,n){function i(t){var n=b,o=v;return b=v=void 0,O=t,g=e.apply(o,n)}function r(e){return O=e,h=setTimeout(s,t),_?i(e):g}function u(e){var n=e-w,o=e-O,i=t-n;return S?x(i,y-o):i}function f(e){var n=e-w,o=e-O;return void 0===w||n>=t||n<0||S&&o>=y}function s(){var e=j();return f(e)?d(e):void(h=setTimeout(s,u(e)))}function d(e){return h=void 0,z&&b?i(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),O=0,b=w=v=h=void 0;}function p(){return void 0===h?g:d(j())}function m(){var e=j(),n=f(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(s,t),i(w)}return void 0===h&&(h=setTimeout(s,t)),g}var b,v,y,g,h,w,O=0,_=!1,S=!1,z=!0;if("function"!=typeof e)throw new TypeError(c);return t=a(t)||0,o(n)&&(_=!!n.leading,S="maxWait"in n,y=S?k(a(n.maxWait)||0,t):y,z="trailing"in n?!!n.trailing:z),m.cancel=l,m.flush=p,m}function o(e){var t="undefined"==typeof e?"undefined":u(e);return !!e&&("object"==t||"function"==t)}function i(e){return !!e&&"object"==("undefined"==typeof e?"undefined":u(e))}function r(e){return "symbol"==("undefined"==typeof e?"undefined":u(e))||i(e)&&w.call(e)==s}function a(e){if("number"==typeof e)return e;if(r(e))return f;if(o(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=o(t)?t+"":t;}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(d,"");var n=p.test(e);return n||m.test(e)?b(e.slice(2),n?2:8):l.test(e)?f:+e}var u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},c="Expected a function",f=NaN,s="[object Symbol]",d=/^\s+|\s+$/g,l=/^[-+]0x[0-9a-f]+$/i,p=/^0b[01]+$/i,m=/^0o[0-7]+$/i,b=parseInt,v="object"==("undefined"==typeof t?"undefined":u(t))&&t&&t.Object===Object&&t,y="object"==("undefined"==typeof self?"undefined":u(self))&&self&&self.Object===Object&&self,g=v||y||Function("return this")(),h=Object.prototype,w=h.toString,k=Math.max,x=Math.min,j=function(){return g.Date.now()};e.exports=n;}).call(t,function(){return this}());},function(e,t){function n(e,t){var n=window.document,r=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver,a=new r(o);i=t,a.observe(n.documentElement,{childList:!0,subtree:!0,removedNodes:!0});}function o(e){e&&e.forEach(function(e){var t=Array.prototype.slice.call(e.addedNodes),n=Array.prototype.slice.call(e.removedNodes),o=t.concat(n).filter(function(e){return e.hasAttribute&&e.hasAttribute("data-aos")}).length;o&&i();});}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){};t.default=n;},function(e,t){function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(){return navigator.userAgent||navigator.vendor||window.opera||""}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o);}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),r=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,a=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,u=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,c=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,f=function(){function e(){n(this,e);}return i(e,[{key:"phone",value:function(){var e=o();return !(!r.test(e)&&!a.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=o();return !(!u.test(e)&&!c.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}}]),e}();t.default=new f;},function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(e,t,n){var o=e.node.getAttribute("data-aos-once");t>e.position?e.node.classList.add("aos-animate"):"undefined"!=typeof o&&("false"===o||!n&&"true"!==o)&&e.node.classList.remove("aos-animate");},o=function(e,t){var o=window.pageYOffset,i=window.innerHeight;e.forEach(function(e,r){n(e,i+o,t);});};t.default=o;},function(e,t,n){function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(12),r=o(i),a=function(e,t){return e.forEach(function(e,n){e.node.classList.add("aos-init"),e.position=(0, r.default)(e.node,t.offset);}),e};t.default=a;},function(e,t,n){function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(13),r=o(i),a=function(e,t){var n=0,o=0,i=window.innerHeight,a={offset:e.getAttribute("data-aos-offset"),anchor:e.getAttribute("data-aos-anchor"),anchorPlacement:e.getAttribute("data-aos-anchor-placement")};switch(a.offset&&!isNaN(a.offset)&&(o=parseInt(a.offset)),a.anchor&&document.querySelectorAll(a.anchor)&&(e=document.querySelectorAll(a.anchor)[0]),n=(0, r.default)(e).top,a.anchorPlacement){case"top-bottom":break;case"center-bottom":n+=e.offsetHeight/2;break;case"bottom-bottom":n+=e.offsetHeight;break;case"top-center":n+=i/2;break;case"bottom-center":n+=i/2+e.offsetHeight;break;case"center-center":n+=i/2+e.offsetHeight/2;break;case"top-top":n+=i;break;case"bottom-top":n+=e.offsetHeight+i;break;case"center-top":n+=e.offsetHeight/2+i;}return a.anchorPlacement||a.offset||isNaN(t)||(o=t),n+o};t.default=a;},function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){for(var t=0,n=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),n+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return {top:n,left:t}};t.default=n;},function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){return e=e||document.querySelectorAll("[data-aos]"),Array.prototype.map.call(e,function(e){return {node:e}})};t.default=n;}])});
    });

    /* src\App.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;

    function create_fragment$k(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $afterPageLoad;
    	validate_store(afterPageLoad, "afterPageLoad");
    	component_subscribe($$self, afterPageLoad, $$value => $$invalidate(0, $afterPageLoad = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	$afterPageLoad(page => {
    		console.log("loaded " + page.title);

    		/*  var prevScrollpos = window.pageYOffset; */
    		window.onscroll = function () {
    			console.log(window.scrollY);
    		}; /* var currentScrollPos = window.pageYOffset; */ /* if (prevScrollpos > currentScrollPos) {
      document.getElementsByTagName("header")[0].style.top = "0";
    } else {
      document.getElementsByTagName("header")[0].style.top = "-50px";
    }
    prevScrollpos = currentScrollPos; */
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		routes: routes$1,
    		afterPageLoad,
    		$afterPageLoad
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
