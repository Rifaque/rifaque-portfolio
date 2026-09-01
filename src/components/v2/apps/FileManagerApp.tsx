import { useState } from "react";
import { cn } from "@/lib/utils";
import { Folder, FileText, ChevronRight, ExternalLink } from "lucide-react";

interface FileNode {
    name: string;
    type: "folder" | "file";
    children?: FileNode[];
    link?: string;
    description?: string;
}

const FILE_TREE: FileNode[] = [
    {
        name: "projects",
        type: "folder",
        children: [
            { name: "rifaque-portfolio", type: "file", link: "https://github.com/Rifaque/rifaque-portfolio", description: "This site" },
            { name: "atlas", type: "file", link: "https://github.com/Rifaque/atlas", description: "Local-first RAG workspace" },
            { name: "querycraft", type: "file", link: "https://github.com/HubZeroHQ/querycraft", description: "NL2SQL, retired" },
            { name: "bhatkal-time-luxe", type: "file", link: "https://github.com/HubZeroHQ/bhatkal-time-luxe", description: "Client work, HubZero" },
        ],
    },
    {
        name: "documents",
        type: "folder",
        children: [
            { name: "resume.pdf", type: "file", description: "My latest resume" },
            { name: "linkedin.url", type: "file", link: "https://www.linkedin.com/in/rifaque-akrami/", description: "Professional Profile" },
        ],
    },
    {
        name: "downloads",
        type: "folder",
        children: [
            { name: "fonts.zip", type: "file", description: "Custom font pack" },
        ],
    },
    {
        name: ".config",
        type: "folder",
        children: [
            { name: "settings.json", type: "file", description: "User preferences" },
            { name: "theme.json", type: "file", description: "Theme configuration" },
        ],
    },
    { name: "README.md", type: "file", description: "Welcome to my filesystem" },
];

const FileManagerApp = () => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set(["projects"]));
    const [selected, setSelected] = useState<string | null>(null);

    const toggle = (path: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const renderNode = (node: FileNode, path: string, depth: number) => {
        const isExpanded = expanded.has(path);
        const isSelected = selected === path;
        const isFolder = node.type === "folder";

        return (
            <div key={path}>
                <button
                    onClick={() => {
                        setSelected(path);
                        if (isFolder) toggle(path);
                        if (node.link) window.open(node.link, "_blank");
                    }}
                    className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors",
                        isSelected ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                    )}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}
                >
                    {isFolder && (
                        <ChevronRight
                            size={12}
                            className={cn("transition-transform shrink-0", isExpanded && "rotate-90")}
                        />
                    )}
                    {isFolder ? (
                        <Folder size={14} className="text-amber-400/70 shrink-0" />
                    ) : (
                        <FileText size={14} className="text-white/30 shrink-0" />
                    )}
                    <span className="truncate">{node.name}</span>
                    {node.link && <ExternalLink size={10} className="ml-auto text-white/20 shrink-0" />}
                </button>
                {isFolder && isExpanded && node.children?.map((child) =>
                    renderNode(child, `${path}/${child.name}`, depth + 1)
                )}
            </div>
        );
    };

    const selectedNode = findNode(FILE_TREE, selected || "");

    return (
        <div className="h-full flex bg-[#0d0d0d]">
            {/* Tree */}
            <div className="w-[55%] border-r border-white/[0.06] overflow-auto py-2">
                <p className="px-3 py-1 text-[10px] text-white/30 uppercase tracking-wider">~/home/rifaque</p>
                {FILE_TREE.map((node) => renderNode(node, node.name, 0))}
            </div>

            {/* Detail Panel */}
            <div className="w-[45%] p-4 flex flex-col items-center justify-center text-center">
                {selectedNode ? (
                    <>
                        {selectedNode.type === "folder" ? (
                            <Folder size={36} className="text-amber-400/40 mb-3" />
                        ) : (
                            <FileText size={36} className="text-white/20 mb-3" />
                        )}
                        <p className="text-sm text-white/80 font-medium">{selectedNode.name}</p>
                        <p className="text-xs text-white/30 mt-1">{selectedNode.description || selectedNode.type}</p>
                        {selectedNode.link && (
                            <a
                                href={selectedNode.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 text-xs text-cyan-400/60 hover:text-cyan-400 flex items-center gap-1"
                            >
                                <ExternalLink size={10} /> Open on GitHub
                            </a>
                        )}
                    </>
                ) : (
                    <p className="text-xs text-white/20">Select a file or folder</p>
                )}
            </div>
        </div>
    );
};

function findNode(nodes: FileNode[], path: string): FileNode | null {
    for (const node of nodes) {
        if (node.name === path) return node;
        if (path.startsWith(node.name + "/") && node.children) {
            const rest = path.slice(node.name.length + 1);
            const found = findNode(node.children, rest);
            if (found) return found;
        }
    }
    return null;
}

export default FileManagerApp;
