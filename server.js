const express = require("express");
const fs = require("fs");
const app = express();

app.get("/video", (req, res) => {
  const videoPath = req.query.path;
  if (!videoPath) {
    return res
      .status(400)
      .send("Video path not provided in the query parameter.");
  }

  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found.");
  }
  const range = req.headers.range || "";
  const videoSize = fs.statSync(videoPath).size;
  const chunkSize = 1 * 1e6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const stream = fs.createReadStream(videoPath, {
    start,
    end,
  });
  stream.pipe(res);
  //   stream.on("end", () => {
  //     fs.unlinkSync(videoPath);
  //   });
});
app.listen(3001, () => {
  console.log("Server running on port 3000");
});
