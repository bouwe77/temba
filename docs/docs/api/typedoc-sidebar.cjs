// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: "category",
      label: "Type Aliases",
      items: [
        {
          type: "doc",
          id: "api/type-aliases/UserConfig",
          label: "UserConfig"
        }
      ]
    },
    {
      type: "category",
      label: "Functions",
      items: [
        {
          type: "doc",
          id: "api/functions/create",
          label: "create"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;