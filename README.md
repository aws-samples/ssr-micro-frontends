# Micro-Frontends in AWS

## Context

Micro-Frontends are the technical representation of a business subdomain, they allow independent implementations with the same or different technology, they should minimize the code shared with other subdomains and they are own by a single team.

These characteristics might seem familiar if you have built distibuted systems in the past. Micro-Frontends are the answer when you need to scale your organizations having multiple teams working together in the same project.

In this repository we collect examples to implement Micro-Frontends in AWS, leveraging several AWS services that represents the building blocks for stitching together distributed architecterues not only for the backend but now for the frontend too.

## Server-side rendering Micro-Frontends

In this repository we have created a basic example that leverages the building blocks to create a server-side rendering (SSR) micro-frontends implementation.

The architecture characteristics we focus in these projects are:

- being framework agnostic
- using standards for communicating between micro-frontends and the UI composer using [HTML-over-the-wire](https://alistapart.com/article/the-future-of-web-software-is-html-over-websockets/)
- using the best practices for SSR workloads such as [progressive hydration](https://www.patterns.dev/posts/progressive-hydration/) and [streaming to the browser](https://www.patterns.dev/posts/ssr/)
- allowing teams to operate independently with little coordination for composing their micro-frontends inside a view
- implementing best practices once a micro-frontend is hydrated using a pub/sub system for communication inside the browser
- having the possibility to choose between client-side rendering and server-side rendering based on the needs

The architecture in this example is represented in the following diagram:

![SSR micro-frontends](./images/diagram.png)
