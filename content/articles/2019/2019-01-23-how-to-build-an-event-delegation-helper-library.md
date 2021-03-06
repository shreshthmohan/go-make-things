---
title: "How to build an event delegation helper library"
date: 2019-01-23T10:30:00-05:00
draft: false
categories:
- Code
- JavaScript
- Web Performance
---

Yesterday, I shared [my new vanilla JS event delegation library](/vanilla-js-event-delegation-across-components/). Today, I wanted to walk you through how it works under-the-hood.

## Setup

Events is built on a [revealing module pattern](https://vanillajstoolkit.com/boilerplates/revealing-module-pattern/) wrapped in a [UMD module](https://vanillajstoolkit.com/boilerplates/umd/).

```js
(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], function () {
			return factory(root);
		});
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.events = factory(root);
	}
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

	'use strict';

	//
	// Variables
	//

	var publicAPIs = {};


	//
	// Return public APIs
	//

	return publicAPIs;

});
```

We'll also setup an `activeEvents` object to hold any event listeners that get registered.

```js
//
// Variables
//

var publicAPIs = {};
var activeEvents = {};
```

## Adding events

First, let's setup an `on()` method to add events.

We'll pass in the event type(s), a selector to apply the events to, and the callback to run for the event as arguments. We'll also make sure a `selector` and `callback` were provided before continuing.

```js
/**
 * Add an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to run the event on
 * @param  {Function} callback The function to run when the event fires
 */
publicAPIs.on = function (types, selector, callback) {

	// Make sure there's a selector and callback
	if (!selector || !callback) return;

};
```

Events allows you to pass in multiple event types as a comma-separate list, like this: `scroll, click`.

We'll use the `split()` method to convert that string into an array, and loop through each event type with the `forEach()` method.

```js
/**
 * Add an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to run the event on
 * @param  {Function} callback The function to run when the event fires
 */
publicAPIs.on = function (types, selector, callback) {

	// Make sure there's a selector and callback
	if (!selector || !callback) return;

	// Loop through each event type
	types.split(',').forEach(function (type) {
		// Our code will go here...
	});

};
```

We'll use the `trim()` method to remove any leading or trailing whitespace from the event type.

If there's no event of this type in the `activeEvents` object yet, we'll create one and assign an empty array. We'll also set an event listener on the `window`, passing in the `type`.

We'll use an internal `eventHandler` method (which we'll look at soon) as the callback, and [set `useCapture` to `true` to make sure we can use event delegation](/when-do-you-need-to-use-usecapture-with-addeventlistener/) with events that don't naturally bubble.

```js
/**
 * Add an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to run the event on
 * @param  {Function} callback The function to run when the event fires
 */
publicAPIs.on = function (types, selector, callback) {

	// Make sure there's a selector and callback
	if (!selector || !callback) return;

	// Loop through each event type
	types.split(',').forEach(function (type) {

		// Remove whitespace
		type = type.trim();

		// If no event of this type yet, setup
		if (!activeEvents[type]) {
			activeEvents[type] = [];
			window.addEventListener(type, eventHandler, true);
		}

	});

};
```

Finally, we'll push a new object to the event type array in `activeEvents`, with the `selector` and `callback` as keys.

Now we have a single event listener running for that event type, and a key in `activeEvents` with all of the listeners/callbacks that should run with it.

```js
/**
 * Add an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to run the event on
 * @param  {Function} callback The function to run when the event fires
 */
publicAPIs.on = function (types, selector, callback) {

	// Make sure there's a selector and callback
	if (!selector || !callback) return;

	// Loop through each event type
	types.split(',').forEach(function (type) {

		// Remove whitespace
		type = type.trim();

		// If no event of this type yet, setup
		if (!activeEvents[type]) {
			activeEvents[type] = [];
			window.addEventListener(type, eventHandler, true);
		}

		// Push to active events
		activeEvents[type].push({
			selector: selector,
			callback: callback
		});

	});

};
```

## Running our callbacks

We passed an `eventHandler` method in to the event listener. Let's create that method and use it to run all of our callbacks for that event.

```js
/**
 * Handle listeners after event fires
 * @param {Event} event The event
 */
var eventHandler = function (event) {
	// Code will go here...
};
```

Before doing anything else, let's check if the `event.type` exists in the `activeEvents` object, and bail if it doesn't.

```js
/**
 * Handle listeners after event fires
 * @param {Event} event The event
 */
var eventHandler = function (event) {
	if (!activeEvents[event.type]) return;
};
```

Next, we'll use the `forEach()` method to loop through each listener in `activeEvents` for the `event.type`.

```js
/**
 * Handle listeners after event fires
 * @param {Event} event The event
 */
var eventHandler = function (event) {
	if (!activeEvents[event.type]) return;
	activeEvents[event.type].forEach(function (listener) {
		// Run the callback
	});
};
```

We need to check if the callback method should run, and, if it should, run it.

To help, let's create a `doRun()` method to handle that for us. If it passes, we'll run the `callback`.

```js
/**
 * Handle listeners after event fires
 * @param {Event} event The event
 */
var eventHandler = function (event) {
	if (!activeEvents[event.type]) return;
	activeEvents[event.type].forEach(function (listener) {
		if (!doRun(event.target, listener.selector)) return;
		listener.callback(event);
	});
};
```

## Checking if the event should run

In the `doRun()` method, we'll use the `closest()` method to check if the clicked element matches the `selector` for the callback, or is inside an element that does.

```js
/**
 * Check if the listener callback should run or not
 * @param  {Node}         target   The event.target
 * @param  {String|Node}  selector The selector to check the target against
 * @return {Boolean}               If true, run listener
 */
var doRun = function (target, selector) {
	return target.closest(selector);
};
```

This works great in most cases, but will fail if run on the `window`, `document`, or `document.documentElement`. Those elements don't have a `closest()` method on them.

We'll first check to see if the `selector` is one of those, and if so, always `return true`.

```js
/**
 * Check if the listener callback should run or not
 * @param  {Node}         target   The event.target
 * @param  {String|Node}  selector The selector to check the target against
 * @return {Boolean}               If true, run listener
 */
var doRun = function (target, selector) {
	if ([
		'*',
		'window',
		'document',
		'document.documentElement',
		window,
		document,
		document.documentElement
	].indexOf(selector) > -1) return true;
	return target.closest(selector);
};
```

Finally, to add a bit more flexibility to our library, we'll also let users pass in an element instead of a selector.

We'll check if the `typeof` for the `selector` is a `string`. If not, we'll check to see if the element *is* the `target`, or contains the `target` inside it using the `contains()` method.

```js
/**
 * Check if the listener callback should run or not
 * @param  {Node}         target   The event.target
 * @param  {String|Node}  selector The selector to check the target against
 * @return {Boolean}               If true, run listener
 */
var doRun = function (target, selector) {
	if ([
		'*',
		'window',
		'document',
		'document.documentElement',
		window,
		document,
		document.documentElement
	].indexOf(selector) > -1) return true;
	if (typeof selector !== 'string' && selector.contains) {
		return selector === target || selector.contains(target);
	}
	return target.closest(selector);
};
```

We can now add various events in various components and attach them all to a single event listener.

## Removing an event listener

One last thing to do is let users remove event listeners later.

Let's create an `off()` method. It will accept the same arguments as `on()`.

```js
/**
 * Remove an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to remove the event from
 * @param  {Function} callback The function to remove
 */
publicAPIs.off = function (types, selector, callback) {
	// Code goes here...
};
```

We'll once again use `split()` to get an array of `types`, and use `forEach()` to loop through them. Then we'll `trim()` the whitespace off of the `type`.

```js
/**
 * Remove an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to remove the event from
 * @param  {Function} callback The function to remove
 */
publicAPIs.off = function (types, selector, callback) {

	// Loop through each event type
	types.split(',').forEach(function (type) {

		// Remove whitespace
		type = type.trim();

	});

};
```

If the `type` isn't in the `activeEvents` object, we'll bail.

Otherwise, we'll check the `length` of the `type` array in the `activeEvents` object. If there's only one event left, we'll use the `delete` operator to remove the key entirely from the object. We'll also remove the event listener.

If no selector is provided, we'll do the same thing.

```js
/**
 * Remove an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to remove the event from
 * @param  {Function} callback The function to remove
 */
publicAPIs.off = function (types, selector, callback) {

	// Loop through each event type
	types.split(',').forEach(function (type) {

		// Remove whitespace
		type = type.trim();

		// if event type doesn't exist, bail
		if (!activeEvents[type]) return;

		// If it's the last event of it's type, remove entirely
		if (activeEvents[type].length < 2 || !selector) {
			delete activeEvents[type];
			window.removeEventListener(type, eventHandler, true);
			return;
		}

	});

};
```

Otherwise, we want to get the index of that listener in the `type` array in the `activeEvents` object. We'll use `splice()` to remove the listener from the array.

To get the index, we'll create a helper method, `getIndex()`, and pass in the array, `selector`, and `callback`.

```js
/**
 * Remove an event
 * @param  {String}   types    The event type or types (space separated)
 * @param  {String}   selector The selector to remove the event from
 * @param  {Function} callback The function to remove
 */
publicAPIs.off = function (types, selector, callback) {

	// Loop through each event type
	types.split(',').forEach(function (type) {

		// Remove whitespace
		type = type.trim();

		// if event type doesn't exist, bail
		if (!activeEvents[type]) return;

		// If it's the last event of it's type, remove entirely
		if (activeEvents[type].length < 2 || !selector) {
			delete activeEvents[type];
			window.removeEventListener(type, eventHandler, true);
			return;
		}

		// Otherwise, remove event
		var index = getIndex(activeEvents[type], selector, callback);
		if (index < 0) return;
		activeEvents[type].splice(index, 1);

	});

};
```

### Getting the index

In the `getIndex()` method, we'll loop through each item in the array. If the array's `selector` and `callback` match those from the event listener we're trying to remove, we'll return that items index.

We use the `toString()` method to get a string representation of the function that we can compare.

If there's no match, we'll return `-1`.

```js
/**
 * Get the index for the listener
 * @param  {Array}   arr      The listeners for an event
 * @param  {Array}   listener The listener details
 * @return {Integer}          The index of the listener
 */
var getIndex = function (arr, selector, callback) {
	for (var i = 0; i < arr.length; i++) {
		if (
			arr[i].selector === selector &&
			arr[i].callback.toString() === callback.toString()
		) return i;
	}
	return -1;
};
```

And with that, we've got a complete library. [You can find Events on GitHub.](https://github.com/cferdinandi/events)