"use client";

import { BarChart3, Database, FileText, Filter, Layers, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { tokenOptimizer } from "@/utils/tokenOptimizer";

const TokenOptimizerPanel = () => {
  const [input, setInput] = useState("");
  const [optimized, setOptimized] = useState("");
  const [toonOutput, setToonOutput] = useState("");
  const [zonOutput, setZonOutput] = useState("");
  const [filteredOutput, setFilteredOutput] = useState("");
  const [filterPatterns, setFilterPatterns] = useState("extra-whitespace");
  const [cacheStats, setCacheStats] = useState({ size: 0, maxSize: 100 });
  const [zonError, setZonError] = useState("");

  const handleOptimize = () => {
    if (!input) return;

    // Optimize content
    const optimizedContent = tokenOptimizer.optimizeContent(input, "text");
    setOptimized(optimizedContent);

    // Update cache stats
    const stats = tokenOptimizer.getCacheStats();
    setCacheStats(stats);
  };

  const handleToonConvert = () => {
    if (!input) return;

    try {
      const toon = tokenOptimizer.jsonToToon(input);
      setToonOutput(toon);

      // Update cache stats
      const stats = tokenOptimizer.getCacheStats();
      setCacheStats(stats);
    } catch (_e) {
      setToonOutput("Invalid JSON input");
    }
  };

  const handleZonConvert = () => {
    if (!input) return;

    setZonError("");
    try {
      const zon = tokenOptimizer.jsonToZon(input);
      setZonOutput(zon);

      // Update cache stats
      const stats = tokenOptimizer.getCacheStats();
      setCacheStats(stats);
    } catch (e) {
      setZonError(e instanceof Error ? e.message : "Invalid JSON input");
      setZonOutput("");
    }
  };

  const handleFilter = () => {
    if (!input) return;

    const patterns = filterPatterns
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    const filtered = tokenOptimizer.filterOutput(input, patterns);
    setFilteredOutput(filtered);

    // Update cache stats
    const stats = tokenOptimizer.getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCache = () => {
    tokenOptimizer.clearCache();
    setCacheStats({ size: 0, maxSize: 100 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="text-amber-400" size={20} />
          <h3 className="text-sm font-semibold text-zinc-200">Token Optimization</h3>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-500"
        >
          Reduce LLM Costs
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              Input Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter JSON content to optimize..."
              className="bg-zinc-950 border-zinc-800 text-zinc-200 min-h-[200px] font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                onClick={handleOptimize}
              >
                Optimize Text
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs h-8 bg-zinc-800 text-zinc-300"
                onClick={handleToonConvert}
              >
                Convert to TOON
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleZonConvert}
              >
                Convert to ZON
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs h-8 bg-zinc-800 text-zinc-300"
                onClick={handleFilter}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-green-400" />
              Optimization Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Optimized Text
                </h4>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-3 min-h-[60px] text-sm text-zinc-300 font-mono">
                  {optimized || <span className="text-zinc-600">No optimized content yet</span>}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Layers size={12} className="text-purple-400" />
                  ZON Format (35-70% cheaper)
                </h4>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-3 min-h-[60px] text-sm text-zinc-300 font-mono whitespace-pre-wrap">
                  {zonError ? (
                    <span className="text-red-400">{zonError}</span>
                  ) : zonOutput ? (
                    zonOutput
                  ) : (
                    <span className="text-zinc-600">No ZON conversion yet</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  TOON Format
                </h4>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-3 min-h-[60px] text-sm text-zinc-300 font-mono whitespace-pre-wrap">
                  {toonOutput || <span className="text-zinc-600">No TOON conversion yet</span>}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Filtered Output
                </h4>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-3 min-h-[60px] text-sm text-zinc-300 font-mono">
                  {filteredOutput || <span className="text-zinc-600">No filtered output yet</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter size={16} className="text-purple-400" />
            Output Filtering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="filter-patterns"
                className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block"
              >
                Filter Patterns (comma separated)
              </label>
              <Textarea
                id="filter-patterns"
                value={filterPatterns}
                onChange={(e) => setFilterPatterns(e.target.value)}
                placeholder="extra-whitespace, repeated-lines, markdown-code-blocks"
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs min-h-[60px]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Common patterns: extra-whitespace, repeated-lines, markdown-code-blocks
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
                Cache Status
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-400">
                    {cacheStats.size} / {cacheStats.maxSize} items
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  onClick={handleClearCache}
                >
                  Clear Cache
                </Button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">
                Content is cached to avoid recomputation and reduce token usage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
          Format Comparison
        </h4>
        <div className="text-[11px] text-zinc-400 font-mono space-y-3">
          <div>
            <p className="text-zinc-500 mb-1">Standard JSON:</p>
            <pre className="bg-zinc-950 p-2 rounded">
              {`[
  {"id": 1, "name": "Alice", "role": "admin"},
  {"id": 2, "name": "Bob", "role": "user"},
  {"id": 3, "name": "Carol", "role": "user"}
]`}
            </pre>
          </div>
          <div>
            <p className="text-zinc-500 mb-1 flex items-center gap-2">
              <Layers size={12} className="text-purple-400" />
              ZON Format (Best):
            </p>
            <pre className="bg-zinc-950 p-2 rounded border-l-2 border-purple-500">
              {`@data(3):id,name,role
1,Alice,admin
2,Bob,user
3,Carol,user`}
            </pre>
            <p className="text-[10px] text-purple-400 mt-1">
              ✓ 35-70% fewer tokens than JSON • 4-35% fewer than TOON
            </p>
          </div>
          <div>
            <p className="text-zinc-500 mb-1">TOON Format:</p>
            <pre className="bg-zinc-950 p-2 rounded">
              {`[3]{id,name,role}:
1,Alice,admin
2,Bob,user
3,Carol,user`}
            </pre>
            <p className="text-[10px] text-zinc-500 mt-2">
              ZON is the most efficient format for LLM workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenOptimizerPanel;
