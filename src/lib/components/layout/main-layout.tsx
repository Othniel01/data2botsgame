"use client";

import Link from "next/link";
import React from "react";

interface MainLayoutProps {
  children?: React.ReactNode;
}

// bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-white/60

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="w-full h-screen">
      <div className="w-full absolute top-0 left-0 flex pr-20 pl-20 items-center justify-between bg-white shadow-[-8px_10px_41px_-25px_rgba(0,0,0,0.75)] h-[70px]">
        <object
          className="w-[124px]"
          type="image/svg+xml"
          data={"/svg/data2bot-logo.svg"}
        ></object>

        <div className="flex text-sm gap-3 items-center">
          <p> Created with</p>
          <object
            className="w-[20px]"
            type="image/svg+xml"
            data={"/svg/heart.svg"}
          ></object>
          <p>by</p>
          <Link
            target="_blank"
            href="https://www.linkedin.com/in/othniel-abalaka-885b50243/"
            className="underline"
          >
            {" "}
            Othniel Abalaka
          </Link>
        </div>
      </div>

      <div className="absolute -translate-x-2/4 -translate-y-2/4 left-2/4  text-lg  bottom-[160px]">
        <p>
          Press <span className="font-bold"> SpaceBar </span> to jump
        </p>

        <p className="text-sm mt-2">
          If background hasnt loaded and music is not playing reload page, get a
          game over and restart to fix.
        </p>
      </div>
      {children}
    </div>
  );
}

export default MainLayout;
