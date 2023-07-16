# Notes

This document contains instructions and commands I like to use when working on building Temba.

I tend to forget these kind of things so I decided to write them down here.

It's also a way I can get feedback on how I do things, because many of these things undoubtly can be done way easier. :)

# Publishing a new version to NPM

- Change the version number: `npm version patch|minor|major -"description of the change..."`

- `npm run build`

- `npm publish ./dist`
