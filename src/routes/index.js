import { createGetRoutes } from './get'
import { createPostRoutes } from './post'
import { createPutRoutes } from './put'
import { createDeleteRoutes } from './delete'

function handleMethodNotAllowed(_, res) {
  res.status(405).json({ message: 'Method Not Allowed' })
}

function createRoutes(queries) {
  const getRoutes = createGetRoutes(queries)
  const postRoutes = createPostRoutes(queries)
  const putRoutes = createPutRoutes(queries)
  const deleteRoutes = createDeleteRoutes(queries)

  return {
    ...getRoutes,
    ...postRoutes,
    ...putRoutes,
    ...deleteRoutes,
    handleMethodNotAllowed,
  }
}

export { createRoutes }
