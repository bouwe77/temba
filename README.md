# Temba

[![Temba on NPM](https://img.shields.io/npm/v/temba)](https://www.npmjs.com/package/temba) [![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-) [![Documentation](https://img.shields.io/badge/Documentation-orange?logo=read-the-docs)](https://temba.bouwe.io)



**Create a simple REST API with zero coding in less than 30 seconds (seriously).**

For developers that need a **quick NodeJS backend** for small projects.

**No need for any coding**, unless you want to opt-out of the defaults, or want to do more customization.

An **OpenAPI specification** is generated and enabled by default, providing **interactive documentation** and allowing you to generate client code from it.

Data is kept **in memory**, but you can also store it in a **JSON file** or **MongoDB database**.

## Getting Started

Create your own Temba server instantly:

```
npx temba-cli create my-rest-api
```

This command will:

* Create a new folder called `my-rest-api`
* Install Temba as a dependency
* Generate a `server.js` file
* Automatically start your brand-new Temba API

You’ll see:

```
✅ Server listening on port 3000
```

Now you can send any HTTP request to any resource on localhost:3000 — and it just works.

Or headover to the interactive OpenAPI specification of your API in your browser at `/openapi`.

## Documentation

Find full usage guides, configuration options, API reference, JSON Schema validation examples, interceptor recipes, MongoDB integration tips, and more on our dedicated docs site: [https://temba.bouwe.io](https://temba.bouwe.io)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://bouwe.io"><img src="https://avatars.githubusercontent.com/u/4126793?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bouwe K. Westerdijk</b></sub></a><br /><a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Code">💻</a> <a href="https://github.com/bouwe77/temba/issues?q=author%3Abouwe77" title="Bug reports">🐛</a> <a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Documentation">📖</a> <a href="#ideas-bouwe77" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/bouwe77/temba/commits?author=bouwe77" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

# License

MIT, see [LICENSE](https://github.com/bouwe77/temba/blob/main/LICENSE).