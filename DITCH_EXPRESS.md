# Ditch Express

Let's make Temba simpler and lightweight. And learn from implementing my own HTTP server by just using Node's HTTP server.

# Middleware

We use the following middleware through Express' `app.use`:

* JSON
* Etags
* Morgan (logging)
* CORS
* Static
* Auth (but this is a temporary hack)
* Delay

# Supertest

Supertest should work with any server created with `createServer`.

# Custom routes

This feature relies fully on Express. This feature will either disappear, or rebuilt within the new setup. If you build a server with Temba, can you not just add routes another way, not through Temba, and still make both work? Because then we can just ditch it.