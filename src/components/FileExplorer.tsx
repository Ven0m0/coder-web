"use client";

import { ChevronDown, File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

const FileExplorer = () => {
  const files = [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "components",
          type: "folder",
          children: [
            { name: "Chat.tsx", type: "file" },
            { name: "Terminal.tsx", type: "file" },
          ],
        },
        { name: "App.tsx", type: "file" },
        { name: "main.tsx", type: "file" },
      ],
    },
    { name: "package.json", type: "file" },
    { name: "tsconfig.json", type: "file" },
  ];

  const renderItem = (item: any, depth = 0) => (
    <div key={item.name}>
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 hover:bg-zinc-800 cursor-pointer text-zinc-400 text-sm transition-colors",
          depth > 0 && "pl-8",
        )}
      >
        {item.type === "folder" ? (
          <>
            <ChevronDown size={14} />
            <Folder size={16} className="text-blue-400" />
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <File size={16} className="text-zinc-500" />
          </>
        )}
        <span>{item.name}</span>
      </div>
      {item.children?.map((child: any) => renderItem(child, depth + 1))}
    </div>
  );

  return (
    <div className="w-64 bg-[#121212] border-r border-zinc-800 flex flex-col h-full hidden md:flex">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Explorer</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">{files.map((file) => renderItem(file))}</div>
    </div>
  );
};

export default FileExplorer;
