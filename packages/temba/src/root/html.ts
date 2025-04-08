type PageInfo = {
  version: string
  title: string
  openapi?: Record<'json' | 'yaml' | 'html', string>
}

export const getHtml = (pageInfo: PageInfo) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageInfo.title}</title>    
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #333;
      background-color: #fff;
      padding: 0.5rem;
      font-size: 1rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #111;
    }

    a, a:visited {
      color: #007acc;
    }
  </style>
</head>
<body>
  <main>
    <h1>${pageInfo.title}</h1>
    
    ${
      pageInfo.openapi
        ? `<p>
            OpenAPI specification:
            <a href="${pageInfo.openapi.html}">HTML</a> · 
            <a href="${pageInfo.openapi.json}">JSON</a> · 
            <a href="${pageInfo.openapi.yaml}">YAML</a>
          </p>`
        : ''
    }
  </main>
  
  <footer>
    Powered by <a href="https://github.com/bouwe77/temba" target="_blank" rel="noopener noreferrer">Temba</a> ${pageInfo.version}
  </footer>
</body>
</html>`
}
