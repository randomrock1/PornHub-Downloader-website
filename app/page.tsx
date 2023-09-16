import ButtonCode from "@/components/ButtonCode";
import { cn } from "@/lib/utils";
import { Ubuntu } from "next/font/google";
import Image from "next/image";

const ubuntu = Ubuntu({
  weight: "400",
  subsets: ["latin-ext"],
});

export default function Home() {
  return (
    <main>
      <div className="w-full text-center mt-14">
        <h1 className={cn(ubuntu.className, "text-3xl")}>Download Videos</h1>
      </div>
      <div className="flex items-center justify-around mt-5">
        <div className="h-96 w-96 bg-zinc-500">
          <h2>Ads Here</h2>
        </div>
        <div className="flex flex-col gap-2 ">
          <h1 className={cn("w-full text-center", ubuntu.className)}>
            Enter The Link
          </h1>
          <div className="flex border border-gray-3 px-4 py-2 gap-3 rounded ">
            <ButtonCode />
          </div>
        </div>
        <div className="h-96 w-96 bg-zinc-500">
          <h2>Ads Here</h2>
        </div>
      </div>
    </main>
  );
}
