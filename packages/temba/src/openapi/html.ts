export const getOpenApiHtml = () => {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
  </head>
  <body>
    <rapi-doc spec-url="openapi.json"> </rapi-doc>
  </body>
</html>
  `
}
