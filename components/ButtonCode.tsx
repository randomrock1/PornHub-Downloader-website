"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ButonCode = () => {
  const [link, setLink] = useState("");
  const [download, setDownload] = useState<any>();

  const router = useRouter();
  async function handleClick() {
    var req = await fetch(`/api?url=${link}`);
    var res = await req.json();
    const title = res.title;
    // var req = await fetch(`http://localhost:3001/video?path=${title}`);
    router.push(`http://localhost:3001/video?path=${title}`);
  }

  return (
    <>
      <input
        type="text"
        className="w-96 bg-transparent outline-none"
        placeholder="https://www.pornhub.com/view_video.php?viewkey=ph639a9819bb337"
        onChange={(e) => setLink(e.target.value)}
        value={link}
      />

      <button
        className=" text-center "
        onClick={() => {
          handleClick();
        }}
      >
        {" "}
        Download
      </button>
    </>
  );
};

export default ButonCode;
