const LOG_FILE = path.join(process.cwd(), 'temba-mcp.log')

export const createLogger = (debug = false) => {
  return (message) => {
    if (debug) {
      const timestamp = new Date().toISOString()
      const entry = `[${timestamp}] ${message}\n`
      fs.appendFileSync(LOG_FILE, entry)
    }
  }
}
