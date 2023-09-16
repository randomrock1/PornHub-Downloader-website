import { Montserrat, Poppins } from "next/font/google";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Github, Send } from "lucide-react";
const poppins = Poppins({
  weight: "400",
  subsets: ["latin-ext"],
});

const font = Montserrat({
  weight: "400",
  subsets: ["latin-ext"],
});
const NavBar = () => {
  return (
    <nav className="flex justify-around bg-emerald-600 py-2 text-center items-center">
      <div>
        <h2 className={cn(font.className, "text-2xl")}>ポルノハブ</h2>
      </div>
      <div className={cn("flex gap-5 ", poppins.className)}>
        <Link
          href={"http://github.com/r0ld3x/"}
          className="relative p-[10px] before:h-full before:w-full before:absolute before:top-[2px] before:left-[2px] before:border-t-emerald-200 before:border-t-2 before:border-l-emerald-200 before:border-l-2 after:h-full after:w-full after:absolute after:bottom-[2px] after:right-[2px] after:border-b-emerald-200 after:border-b-2 after:border-r-emerald-200 after:border-r-2 text-center hover:after:w-[10%] hover:after:h-[20%]  hover:before:w-[10%] hover:before:h-[20%] before:transition-all before:rounded-tl-sm hover:before:rounded-tl-none after:rounded-br-sm hover:after:rounded-br-none  before:duration-[0.4s] before:ease-in-out after:transition-all after:duration-[0.4s] after:ease-in-out flex items-center justify-center gap-1 hover:bg-[#565d68] hover:transition-all hover:duration-&lsqb;0.4s&rsqb; hover:ease-in-out"
        >
          <Github className="h-[20px] w-[20px]" />
          Github
        </Link>
        <Link
          href={"http://t.me/RoldexVerse"}
          className={cn(
            "relative p-[10px] before:h-full before:w-full before:absolute before:top-[2px] before:left-[2px] before:border-t-emerald-200 before:border-t-2 before:border-l-emerald-200 before:border-l-2 after:h-full after:w-full after:absolute after:bottom-[2px] after:right-[2px] after:border-b-emerald-200 after:border-b-2 after:border-r-emerald-200 after:border-r-2 text-center hover:after:w-[10%] hover:after:h-[20%]  hover:before:w-[10%] hover:before:h-[20%] before:transition-all before:rounded-tl-sm hover:before:rounded-tl-none after:rounded-br-sm hover:after:rounded-br-none  before:duration-[0.4s] before:ease-in-out after:transition-all after:duration-[0.4s] after:ease-in-out flex items-center justify-center hover:bg-[#0088cc] hover:transition-all hover:duration-&lsqb;0.4s&rsqb; hover:ease-in-out gap-1"
          )}
        >
          <Send className="h-4 w-4" />
          Telegram
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
