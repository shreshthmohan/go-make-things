---
title: "What's the difference between JavaScript event delegation, bubbling, and capturing?"
date: 2018-12-12T10:30:00-05:00
draft: false
categories:
- Code
- JavaScript
---

Yesterday, I wrote about [why event delegation is better than attaching events to specific elements](/why-is-javascript-event-delegation-better-than-attaching-events-to-each-element/). In response, my buddy [Andrew Borstein](https://andrewborstein.com/) asked:

> What’s the difference between event delegation/bubbling/capturing?

This is a great question that I get fairly often. The terms are often used interchangeably (sometimes by me, oops!), which can cause some confusion.

So let's clear that up today.

*__tl;dr:__ event delegation is the technique, bubbling is what the event itself does, and capturing is a way of using event delgation on events that don't bubble.*

## Event Delegation

Event delegation is a technique for listening to events where you *delegate* a parent element as the listener for all of the events that happen inside it.

I often use listening to all clicks in the `document` as an example, but it can be any element on the page.

For example, if you wanted to detect any time any field changed in value inside a specific form, you could do this:

```js
var form = document.querySelector('#hogwarts-application');

// Listen for changes to fields inside the form
form.addEventListener('input', function (event) {

	// Log the field that was changed
	console.log(event.target);

}, false);
```

## Event Bubbling

*Bubbling* is what the event itself does.

If you've ever watched the bubbles in a glass of soda, you'll understand how event bubbling works.

The event starts are the element that triggered it (saying, changing the `#email` field in our example above). Then, it *bubbles* up to each of it's parent elements until it reaches the `html` element.

Using a form field as an example, the event would bubble up to the parent form, then any containers or divs the form was in, then the `body`, then the `html` element, then the `document`, then the `window`.

Any listeners on any of those parent elements would get triggered as it bubbles up.

[Here's a demo.](https://codepen.io/cferdinandi/pen/YdXjxy)

## Event Capturing

Most events bubble. But some, like the `focus` event, do not.

[Here's an example.](https://codepen.io/cferdinandi/pen/pqJZdK)

```js
document.addEventListener('focus', function (event) {
	console.log(event.target);
}, false);
```

You can focus on things over and over again, but the event callback will never run.

There's a trick you can use to *capture* the event, though. The last argument in `addEventListener()` is called `useCapture`. We almost always set it to false.

For events that don't bubble, set it to `true` to capture the event anyways.

[Here's an updated example.](https://codepen.io/cferdinandi/pen/aPOjqg)

```js
document.addEventListener('focus', function (event) {
	console.log(event.target);
}, true);
```

And [here's more detail on when and how to use it](https://gomakethings.com/when-do-you-need-to-use-usecapture-with-addeventlistener/).

## A quick recap

Just to review: *event delegation* is the technique, *bubbling* is what the event itself does, and *capturing* is a way of using event delegation on events that don't bubble.

Hope that clears things up!