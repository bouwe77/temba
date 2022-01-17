# Notes

This document contains instructions and commands I like to use when working on building Temba.

I tend to forget these kind of things so I decided to write them down here.

It's also a way I can get feedback on how I do things, because many of these things undoubtly can be done way easier. :)

# Publishing a new version to NPM

- Change the version number in `package.json`

- `npm run build`

- `npm publish`

# Testing HTTP requests

I like to use [HTTPie](https://httpie.io/), but any HTTP client will suffice of course.

The requests below go to `localhost` on port 3000:

## GET resource collection:

`http :3000/movies`

## POST to create a resource:

`http POST :3000/movies title="Home Alone"`

Or with raw JSON: `http --raw '{"title": "Home Alone 2"}' POST :3000/movies`

## GET one resource

`http :3000/movies/YOUR_ID_HERE`

## PUT to replace a resource

`http PUT :3000/movies/YOUR_ID_HERE title="Star Trek"`

## DELETE to delete a resource

`http DELETE :3000/movies/YOUR_ID_HERE`

## DELETE all resources

`http DELETE :3000/movies`
