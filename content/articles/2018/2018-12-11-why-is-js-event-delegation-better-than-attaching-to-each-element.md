---
title: "Why is JavaScript event delegation better than attaching events to each element?"
date: 2018-12-11T10:30:00-05:00
draft: false
categories:
- Code
- JavaScript
- Web Performance
---

I typically recommend using [event delegation for event listeners](/checking-event-target-selectors-with-event-bubbling-in-vanilla-javascript/) instead of attaching them to individual elements.

Let's say wanted to listen to clicks on every element with the `.sandwich` class. You might do this.

```js
var sandwiches = document.querySelectorAll('.sandwich');
sandwiches.forEach(function (sandwich) {
	sandwich.addEventListener('click', function (event) {
		console.log(sandwich);
	}, false);
});
```

But with event delegation, you would listen for all clicks on the document and ignore ones on elements without the `.sandwich` class.

```js
document.addEventListener('click', function (event) {
	if (!event.target.matches('.sandwich')) return;
	console.log(event.target);
}, false);
```

When I share this approach, one of the first things most people ask is:

> Isn't it bad for performance to listen to *every* click in the document.

Amazingly, it's actually *better* for performance to use this approach.

Every event listener you create uses memory in the browser. It's "cheaper" for the browser to track one event and fire it on every click that it is to manage multiple events.

If you're only listening for events on a single element, feel free to attach directly to that element. But if you're listening for events on multiple elements, I'd recommend using event delegation.

As an added benefit, you can dynamically add elements to the DOM later and your event listener will catch them, too, since it checks for the selector when the event fires rather than ahead of time.