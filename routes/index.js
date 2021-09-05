import { createGetRoutes } from "./get";
import { createPostRoutes } from "./post";
import { createPutRoutes } from "./put";
import { createDeleteRoutes } from "./delete";

function handleMethodNotAllowed(_, res) {
  res.status(405).json({ message: "Method Not Allowed" });
}

function createRoutes(query) {
  const getRoutes = createGetRoutes(query);
  const postRoutes = createPostRoutes(query);
  const putRoutes = createPutRoutes(query);
  const deleteRoutes = createDeleteRoutes(query);

  return {
    ...getRoutes,
    ...postRoutes,
    ...putRoutes,
    ...deleteRoutes,
    handleMethodNotAllowed,
  };
}

export default {
  createRoutes,
};
