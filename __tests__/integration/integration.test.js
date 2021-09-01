// These tests check the routers and middleware and do not reach the database.

const fetch = require("node-fetch");

const { hostname } = require("../_config");

test("GET on root URL returns welcome text", async () => {
  const response = await fetch(hostname);

  expect(response.status).toBe(200);

  const text = await response.text();
  expect(text).toBe("It works! (ツ)");
});

test("POST on root URL returns Method Not Allowed error", async () => {
  const response = await fetch(hostname, {
    method: "POST",
  });

  expect(response.status).toBe(405);

  const json = await response.json();
  expect(json.message).toBe("Method Not Allowed");
});

test("PUT on root URL returns Method Not Allowed error", async () => {
  const response = await fetch(hostname, {
    method: "PUT",
  });

  expect(response.status).toBe(405);

  const json = await response.json();
  expect(json.message).toBe("Method Not Allowed");
});

test("DELETE on root URL returns Method Not Allowed error", async () => {
  const response = await fetch(hostname, {
    method: "DELETE",
  });

  expect(response.status).toBe(405);

  const json = await response.json();
  expect(json.message).toBe("Method Not Allowed");
});

// There are so many HTTP methods, but just check PATCH here only.
test("PATCH on root URL returns Method Not Allowed error", async () => {
  const response = await fetch(hostname, {
    method: "PATCH",
  });

  expect(response.status).toBe(405);

  const json = await response.json();
  expect(json.message).toBe("Method Not Allowed");
});

// There are so many HTTP methods, but just check PATCH here only.
test("PATCH on resource URL returns Method Not Allowed error", async () => {
  const response = await fetch(hostname + "/something", {
    method: "PATCH",
  });

  expect(response.status).toBe(405);

  const json = await response.json();
  expect(json.message).toBe("Method Not Allowed");
});

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
