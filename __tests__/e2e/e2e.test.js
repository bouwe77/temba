const fetch = require("node-fetch");

const { hostname } = require("../_config");
const resource = "/songs/";

//TODO GET/:id 404
//TODO PUT/:id 404
//TODO DELETE/:id 404
//TODO POST id meegeven in body mag, maar wordt genegeerd
//TODO PUT id meegeven in body mag, maar wordt genegeerd

test("Create, update and delete an item", async () => {
  // Delete all items.
  const deleteAllResponse = await fetch(hostname + resource, {
    method: "DELETE",
  });
  expect(deleteAllResponse.status).toBe(204);

  // Initially, there are no items.
  const getAllResponse = await fetch(hostname + resource);
  expect(getAllResponse.status).toBe(200);
  const jsonNoItems = await getAllResponse.json();
  expect(jsonNoItems.length).toBe(0);

  // Create a new item.
  const newItem = { name: "newItem" };
  const createNewResponse = await fetch(hostname + resource, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newItem),
  });
  expect(createNewResponse.status).toBe(201);
  const jsonCreatedItem = await createNewResponse.json();
  expect(jsonCreatedItem.name).toBe("newItem");
  // expect(jsonCreatedItem.id.length).toBe(36);

  // Now there is one item. Get all items.
  const getAllOneItemResponse = await fetch(hostname + resource);
  expect(getAllOneItemResponse.status).toBe(200);
  const jsonOneItem = await getAllOneItemResponse.json();
  expect(jsonOneItem.length).toBe(1);
  expect(jsonOneItem[0].name).toBe("newItem");
  expect(jsonOneItem[0].id).toBe(jsonCreatedItem.id);

  // Get one item by ID.
  const getJustOneItemResponse = await fetch(
    hostname + resource + jsonCreatedItem.id
  );
  expect(getJustOneItemResponse.status).toBe(200);
  const jsonJustOneItem = await getJustOneItemResponse.json();
  expect(jsonJustOneItem.name).toBe("newItem");
  expect(jsonJustOneItem.id).toBe(jsonCreatedItem.id);

  // Update one item by ID.
  const updatedItem = { id: jsonCreatedItem.id, name: "updatedItem" };
  const updateResponse = await fetch(hostname + resource + jsonCreatedItem.id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedItem),
  });
  // expect(updateResponse.status).toBe(200);
  const jsonUpdatedItem = await updateResponse.json();
  expect(jsonUpdatedItem.name).toBe("updatedItem");
  // expect(jsonUpdatedItem.id.length).toBe(36);

  // Delete one item by ID.
  //...
});
