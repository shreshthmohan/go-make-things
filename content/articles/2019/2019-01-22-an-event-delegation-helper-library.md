---
title: "Vanilla JS event delegation across components"
date: 2019-01-22T10:30:00-05:00
draft: false
categories:
- Code
- JavaScript
- Web Performance
---

Yesterday, we looked at [two approaches to event delegation across a code base](/javascript-event-delegation-across-a-code-base/).

1. Use a single event listener for all components.
2. Use a separate event listener in each component.

I noted that I generally use option two because it's easier to manage and still has a pretty good performance impact.

Today, I wanted to share a technique for implementing the "single event listener" approach.

## What you don't want to do

You *could* manually add an event listener for all of your components, like this:

```js
/**
 * All-in-one
 */
document.addEventListener('click', function (event) {

	if (event.target.matches('.accordion')) {
		// Do accordion stuff
	}

	if (event.target.matches('.tab')) {
		// Do tab stuff
	}

	if (event.target.matches('.modal')) {
		// Do modal stuff
	}

}, false);
```

But maintaining this becomes harder as your code base grows. You need to remember to remove not just your component, but any event listeners which may be in a separate file or location.

Instead, you want to be able to add event listeners *directly in your components*, but have them all run in a single event listener.

## The Technique

To make this work, you would...

1. Add the event and it's callback to a list of events.
2. Create a single event listener for each event type.
3. When the event fires, loop through the list of callbacks and see if any should run.

This is effectively how the jQuery `on()` method works under-the-hood.

## A vanilla JS helper library

I created [a small vanilla JS event delegation library called Events](https://github.com/cferdinandi/events) to make this process super easy.

Let's look at our example from yesterday again.

You would register each event listener inside the component it goes with, like this.

```js
/**
 * Three Separate listeners
 */

var accordion = function () {
	// All the other code...
	events.on('click', '.accordion', myAccordionCallback);
};

var tabs = function () {
	// All the other code...
	events.on('click', '.tab', myTabCallback);
};

var modals = function () {
	// All the other code...
	events.on('click', '.modal', myModalCallback);
};
```

If you needed to remove the modals component, for example, the event listener just goes away with it. No extra work on your part.

But behind-the-scenes, Events sets up a listener like this.

```js
window.addEventListener('click', function (event) {

	if (event.target.closest('.accordion')) {
		myAccordionCallback(event);
	}

	if (event.target.closest('.tab')) {
		myTabCallback(event);
	}

	if (event.target.closest('.modal')) {
		myModalCallback(event);
	}

}, false);
```

And (almost) like with jQuery, you can attach the same callback to multiple events by passing them in as a comma-separate list.

The `saveFormField()` callback would run on both `click` and `input` events, in this example.

```js
events.on('click, input', '.form-saver', saveFormField);
```

## How does this all work?

Tomorrow, I'll walk you through the source code and how it all works under-the-hood. For now, feel free to [play around with it on GitHub](https://github.com/cferdinandi/events).