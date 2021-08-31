const fetch = require("node-fetch");

const { hostname } = require("./_config");

test("An unknown resource returns 404", async () => {
  const unknownResource = "/piet";

  const response = await fetch(hostname + unknownResource);

  expect(response.status).toBe(404);
  const json = await response.json();
  expect(json.message).toBe("'piet' is an unknown resource");
});

test("An invalid ID returns 404", async () => {
  const resourceWithShortId = "/songs/too_short_id";

  const response = await fetch(hostname + resourceWithShortId);

  expect(response.status).toBe(404);
  const json = await response.json();
  expect(json.message).toBe("ID 'too_short_id' not found");
});
