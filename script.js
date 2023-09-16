const fs = require("fs");
const path = require("path");

async function main() {
  const downloadedTs = await fs.readdirSync("temp_ts").sort((a, b) => a - b);
  let filesStr = "concat:";
  for (const tsFilename of downloadedTs) {
    filesStr += path.join("temp_ts", tsFilename) + "|";
  }
  console.log(filesStr);
}

main();
