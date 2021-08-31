const fetch = require("node-fetch");

const { hostname } = require("./_config");

test("Create, update and delete a song", async () => {
  // Delete all songs.
  const deleteAllResponse = await fetch(hostname + "/songs", {
    method: "DELETE",
  });
  expect(deleteAllResponse.status).toBe(204);

  // Initially, there are no songs.
  const getAllResponse = await fetch(hostname + "/songs");
  expect(getAllResponse.status).toBe(200);
  const jsonNoSongs = await getAllResponse.json();
  expect(jsonNoSongs.length).toBe(0);

  // Create a new song.
  const newSong = { title: "newSong" };
  const createNewResponse = await fetch(hostname + "/songs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newSong),
  });
  expect(createNewResponse.status).toBe(201);
  const jsonCreatedSong = await createNewResponse.json();
  expect(jsonCreatedSong.title).toBe("newSong");
  expect(jsonCreatedSong.id.length).toBe(36);

  // Now there is one song. Get all songs.
  const getAllOneSongResponse = await fetch(hostname + "/songs/");
  expect(getAllOneSongResponse.status).toBe(200);
  const jsonOneSong = await getAllOneSongResponse.json();
  expect(jsonOneSong.length).toBe(1);
  expect(jsonOneSong[0].title).toBe("newSong");
  expect(jsonOneSong[0].id).toBe(jsonCreatedSong.id);

  // Get one song by ID.
  const getJustOneSongResponse = await fetch(
    hostname + "/songs/" + jsonCreatedSong.id
  );
  expect(getJustOneSongResponse.status).toBe(200);
  const jsonJustOneSong = await getJustOneSongResponse.json();
  expect(jsonJustOneSong.title).toBe("newSong");
  expect(jsonJustOneSong.id).toBe(jsonCreatedSong.id);

  // Update one song by ID.
  const updatedSong = { id: jsonCreatedSong.id, title: "updatedSong" };
  const updateResponse = await fetch(
    hostname + "/songs/" + jsonCreatedSong.id,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSong),
    }
  );
  // expect(updateResponse.status).toBe(200);
  const jsonUpdatedSong = await updateResponse.json();
  expect(jsonUpdatedSong.title).toBe("updatedSong");
  expect(jsonUpdatedSong.id.length).toBe(36);

  // Delete one song by ID.
  //...
});
