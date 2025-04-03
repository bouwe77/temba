type PageInfo = {
  version: string
  title: string
}

export const getHtml = (pageInfo: PageInfo) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageInfo.title}</title>    
</head>
<body>
  <main>
    <h1>${pageInfo.title}</h1>
  </main>

  <footer>
    Powered by <a href="https://github.com/bouwe77/temba" target="_blank" rel="noopener noreferrer">Temba</a> ${pageInfo.version}
  </footer>
</body>
</html>`
}
