const { parseUrl } = require("./urlParser");

const noResourceAndNoId = { resourceName: null, id: null };
const resourceOnly = { resourceName: "stuff", id: null };
const resourceAndId = { resourceName: "stuff", id: "foo" };

test.each([
  ["stuff", resourceOnly],
  ["/stuff", resourceOnly],
  ["stuff/", resourceOnly],
  ["/stuff/", resourceOnly],
  ["//stuff/", resourceOnly],
  ["/stuff//", resourceOnly],
])("URL '%s' only has a resourceName: %o", (url, expected) => {
  const actual = parseUrl(url);
  expect(actual).toEqual(expected);
});

test.each([
  ["stuff/foo", resourceAndId],
  ["/stuff/foo", resourceAndId],
  ["stuff/foo/", resourceAndId],
  ["/stuff/foo/", resourceAndId],
  ["/stuff//foo/", resourceAndId],
])("URL '%s' has both a resource and id: %o", (url, expected) => {
  const actual = parseUrl(url);
  expect(actual).toEqual(expected);
});

test.each([
  ["stuff/foo/bar", resourceAndId],
  ["/stuff/foo/bar", resourceAndId],
  ["stuff/foo/bar/", resourceAndId],
  ["/stuff/foo/bar/", resourceAndId],
])(
  "URL '%s' has additional path items next to a resource and id: %o",
  (url, expected) => {
    const actual = parseUrl(url);
    expect(actual).toEqual(expected);
  }
);

test.each([
  [undefined, noResourceAndNoId],
  [null, noResourceAndNoId],
  ["", noResourceAndNoId],
  [" ", noResourceAndNoId],
])("URL '%s' has no resource and id: %o", (url, expected) => {
  const actual = parseUrl(url);
  expect(actual).toEqual(expected);
});
