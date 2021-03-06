---
title: "Why event delegation is a better way to listen for events in vanilla JS"
date: 2018-02-14T10:30:00-05:00
draft: false
categories:
- Code
- JavaScript
- Web Performance
---

Yesterday, I shared my preferred approach to [listening for click events with vanilla JavaScript](/listening-for-click-events-with-vanilla-javascript/): *event delegation*.

> When an element in the DOM is clicked, the event bubbles all the way up to the parent element (the `document` and then the `window`). This allows you to listen for events on the parent item and still detect clicks that happen inside it.

Today, I want to share *why* I prefer this approach, and some cool things you can do with it.

## Listening to more than one element

Let's say you wanted to listen for clicks on an element with the `.click-me` class.

With jQuery, whether there's one element or 100, you do this.

```js
$('.click-me').click(function (event) {
	// Do things...
});
```

However, the vanilla JS `addEventListener()` method can only listen for events on a single element. This *won't* work.

```js
document.querySelectorAll('.click-me').addEventListener('click', function (event) {
	// Do stuff...
}, false);
```

And because the `i` variable in a `for` loop isn't scoped to the current loop, you *can't* do this either.

```js
var clickMe = document.querySelectorAll('.click-me');
for (var i = 0; i < clickMe.length; i++) {
	clickMe[i].addEventListener('click', function (event) {
		// Do stuff...
	}, false);
}
```

Event delegation provides the simplest way to listen for events on multiple elements.

## Web performance

It *feels* like listening to every click in the `document` would be bad for performance, but it's actually *more* performant than having a bunch of event listeners on individual items.

If you need to listen to clicks on a bunch of different elements and do different things with each one, you can also use event delegation to optimize performance.

In your listener function, check what the selector is on the clicked element, and conditionally run code based on it.

For example, if you wanted to open a modal when any button with the `.modal-open` class is clicked, and close modals when an element with the `.close` class is clicked, you would do this.

```js
document.addEventListener('click', function (event) {

	if (event.target.matches('.modal-open')) {
		// Run your code to open a modal
	}

	if (event.target.matches('.close')) {
		// Run your code to close a modal
	}

}, false);
```

## Dynamically rendered elements

If you attach an event listener to specific elements at the time the DOM loads, you'll need to repeat that process if you add elements to the DOM later with JavaScript.

For example, let's say you have a form where users can click a button to add additional text fields, and click a "remove me" button next to each field to remove it.

With a traditional approach, attaching listeners to specific elements, you would need to add a new listener every time you added a field. With event delegation, you can setup your listener once and not have to worry about it, since it checks selectors at time of click rather than when the DOM is initially rendered.
