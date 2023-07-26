# Notes

Notes to self and contributors.

# Publishing a new version to NPM

Call `publish.sh` and provide either `patch`, `minor`, or `major`, example:

```
./publish.sh patch
```

This script updates the version, builds the code, and publishes to NPM.

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
