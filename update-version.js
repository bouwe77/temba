#!/usr/bin/env node

import fs from "fs";
import path from "path";

const [version, folder] = process.argv.slice(2);

if (!version || !folder) {
  console.error("Usage: update-version.js <version> <folder>");
  process.exit(1);
}

const versionNumber = version.replace(/^v/, "");
const packageJsonPath = path.join(folder, "package.json");

if (!fs.existsSync(packageJsonPath)) {
  console.error(`❌ package.json not found in: ${folder}`);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
packageJson.dependencies = packageJson.dependencies || {};

if ("temba" in packageJson.dependencies) {
  packageJson.dependencies.temba = versionNumber;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );
  console.log(`✅ Updated ${folder}/package.json to temba@${versionNumber}`);
} else {
  console.log(
    `❌ ERROR: Skipping ${folder}/package.json: no temba dependency found`
  );
}
