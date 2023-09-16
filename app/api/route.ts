import { NextRequest, NextResponse } from "next/server";
import React from "react";
import axios from "axios";
import cheerio from "cheerio";
import vm from "vm";
import fs from "fs";
import path from "path";
import util from "util";
import { spawn } from "child_process";

interface Video {
  defaultQuality: boolean;
  format: string;
  videoUrl: string;
  quality: string | string[];
  remote?: boolean;
}

async function download(m3u8Link: string, mergedMp4: string) {
  const m3u8HttpBase = m3u8Link.substring(0, m3u8Link.lastIndexOf("/") + 1);
  const m3u8Response = await axios.get(m3u8Link, {
    // proxy: {
    //   protocol: "http",
    //   host: "209.208.28.86",
    //   port: 13129,
    //   auth: {
    //     username: "tortedug",
    //     password: "alonebraid",
    //   },
    // },
    headers: {
      authority: "ev-h.phncdn.com",
      accept: "*/*",
      "accept-language": "it-IT,it;q=0.9",
      dnt: "1",
      origin: "https://it.pornhub.com",
      referer: "https://it.pornhub.com/",
      "sec-ch-ua": '"Not/A)Brand";v="99", "Opera";v="101", "Chromium";v="115"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    },
  });
  const m3u8Content = m3u8Response.data.split("\n");
  const tsUrlList = [];
  const tsNames = [];

  for (let i = 0; i < m3u8Content.length; i++) {
    const line = m3u8Content[i];
    if (line.startsWith("#EXTINF")) {
      const tsUrl = m3u8Content[i + 1];
      tsNames.push(path.basename(tsUrl));
      tsUrlList.push(tsUrl.startsWith("http") ? tsUrl : m3u8HttpBase + tsUrl);
    }
  }

  if (tsUrlList.length !== 0) {
    await fs.promises.mkdir("temp_ts", { recursive: true });
    const downloadTasks = tsUrlList.map((tsUrl) =>
      downloadTsFile(tsUrl, "temp_ts")
    );
    await Promise.all(downloadTasks);
    const downloadedTs = fs.readdirSync("temp_ts").sort((a: any, b: any) => {
      const aNum = parseInt(a.match(/(\d+)/)[0]);
      const bNum = parseInt(b.match(/(\d+)/)[0]);
      return aNum - bNum;
    });

    let filesStr = "concat:";
    let FilesToDelete: string[] = [];
    for (const tsFilename of downloadedTs) {
      filesStr += path.join("temp_ts", tsFilename) + "|";
      FilesToDelete.push(path.join("temp_ts", tsFilename));
    }

    console.log(filesStr);
    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      filesStr,
      "-c",
      "copy",
      "-bsf:a",
      "aac_adtstoasc",
      mergedMp4,
    ]);

    return new Promise<void>((resolve, reject) => {
      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          // FilesToDelete.forEach((filePath) => {
          //   fs.unlink(filePath, (err) => {
          //     if (err) {
          //       console.error(
          //         `Error deleting file ${filePath}: ${err.message}`
          //       );
          //     } else {
          //       console.log(`File ${filePath} deleted successfully`);
          //     }
          //   });
          // });
          resolve();
          return true;
        } else {
          console.log(code);
          // FilesToDelete.forEach((filePath) => {
          //   fs.unlink(filePath, (err) => {
          //     if (err) {
          //       console.error(
          //         `Error deleting file ${filePath}: ${err.message}`
          //       );
          //     } else {
          //       console.log(`File ${filePath} deleted successfully`);
          //     }
          //   });
          // });
          reject(`FFmpeg process exited with code ${code}`);
        }
      });
    });
  } else {
    console.log("No file to download");
  }
}
async function downloadTsFile(tsUrl: string, storeDir: string): Promise<void> {
  const tsResponse = await axios.get(tsUrl, { responseType: "stream" });
  const sanFileName = sanitizeFilename(tsUrl);
  if (!sanFileName) {
    return;
  }
  const tsFilename = path.join(storeDir, sanFileName);
  const writeStream = fs.createWriteStream(tsFilename);
  tsResponse.data.pipe(writeStream);

  return new Promise<void>((resolve, reject) => {
    writeStream.on("finish", () => {
      resolve();
    });
    writeStream.on("error", (error) => {
      reject(error);
    });
  });
}

function sanitizeFilename(filename: string) {
  const regex = /\/([^/]+)\.ts\?/;
  const match = filename.match(regex);
  const tsName = match ? match[1] : null;
  return tsName;
}
export async function GET(req: NextRequest, res: NextResponse) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ message: "no link provided" });
  }

  const result = await axios.get(url, {
    proxy: {
      protocol: "http",
      host: "209.208.28.86",
      port: 13129,
      auth: {
        username: "tortedug",
        password: "alonebraid",
      },
    },
  });

  const data = result.data;
  const $ = cheerio.load(data);
  let script: string | null = null;
  let idConsole = "";
  $("script").each((index, element) => {
    const scriptContent = $(element).html();
    if (scriptContent && scriptContent.includes("flashvars")) {
      const scriptText = scriptContent.trim();
      const scriptParts = scriptText.split(" ");
      for (const e of scriptParts) {
        if (e.includes("flashvars")) {
          idConsole = e;
          break;
        }
      }
      script =
        "playerObjList = [];" +
        scriptContent +
        `console.log(JSON.stringify(${idConsole}, null, 4));`;
    }
  });
  if (!script) {
    return NextResponse.json({ message: "no flashvars found" });
  }

  const context = vm.createContext({});
  vm.runInContext(script, context);
  const content = JSON.parse(JSON.stringify(context[idConsole]));
  const title =
    content.video_title
      .replace(/[\/\\,&]/g, "")
      .trim()
      .replace(/ /g, "_") + ".mp4";
  console.log(title);
  const mediaDefinitions = content.mediaDefinitions as Video[];
  const mainContent = mediaDefinitions.find(
    (video) => video.defaultQuality === false
  ) as { videoUrl: string };
  const videoUrl = mainContent.videoUrl;
  const resVideoUrl = await axios.get(videoUrl, {
    // proxy: {
    //   protocol: "http",
    //   host: "209.208.28.86",
    //   port: 13129,
    //   auth: {
    //     username: "tortedug",
    //     password: "alonebraid",
    //   },
    // },
  });
  let newURL = videoUrl.slice(0, videoUrl.lastIndexOf("/") + 1);
  const lines = resVideoUrl.data.split("\n") as Array<string>;
  const m3u8_url = newURL + lines.at(2);
  console.log(m3u8_url);
  const check = await download(m3u8_url, title);

  return NextResponse.json({ title });
}
