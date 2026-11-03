'use client';

import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import loopsData from '@/data/loops.json';
import stakeholdersData from '@/data/stakeholders.json';

interface Props {
  initialNodes: any[];
  initialEdges: any[];
}

export default function CausalLoopMap({ initialNodes, initialEdges }: Props) {
  const [activeLoopId, setActiveLoopId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'REINFORCING' | 'BALANCING'>('ALL');

  const activeLoop = useMemo(
    () => loopsData.find((l) => l.id === activeLoopId) || null,
    [activeLoopId]
  );

  const filteredLoops = useMemo(() => {
    if (selectedFilter === 'REINFORCING') return loopsData.filter((l) => l.type === 'Reinforcing');
    if (selectedFilter === 'BALANCING') return loopsData.filter((l) => l.type === 'Balancing');
    return loopsData;
  }, [selectedFilter]);

  const styledNodes = useMemo(() => {
    return initialNodes.map((node) => {
      const stakeholder = (stakeholdersData as any)[node.data.stakeholder] || stakeholdersData.system_metric;
      const isInLoop = !activeLoop || activeLoop.keyNodes.includes(node.id);

      return {
        ...node,
        style: {
          backgroundColor: isInLoop ? stakeholder.bg : '#F8FAFC',
          borderColor: isInLoop ? stakeholder.border : '#E2E8F0',
          borderWidth: isInLoop ? '1.5px' : '1px',
          color: isInLoop ? stakeholder.text : '#94A3B8',
          opacity: isInLoop ? 1 : 0.12,
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '10px',
          fontWeight: 600,
          lineHeight: '1.25',
          maxWidth: '175px',
          textAlign: 'center' as const,
          boxShadow: isInLoop ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.25s ease',
        },
      };
    });
  }, [initialNodes, activeLoop]);

  const styledEdges = useMemo(() => {
    return initialEdges.map((edge) => {
      const isInLoop =
        activeLoop &&
        activeLoop.keyNodes.includes(edge.source) &&
        activeLoop.keyNodes.includes(edge.target);

      return {
        ...edge,
        animated: !!isInLoop,
        style: {
          stroke: isInLoop
            ? activeLoop.type === 'Reinforcing'
              ? activeLoop.color
              : '#2563EB'
            : '#CBD5E1',
          strokeWidth: isInLoop ? 3 : 1,
          opacity: !activeLoop || isInLoop ? 1 : 0.08,
          transition: 'all 0.25s ease',
        },
      };
    });
  }, [initialEdges, activeLoop]);

  return (
    <div className="relative w-screen h-screen bg-[#FDFDFE] flex overflow-hidden font-sans">
      {/* Top Floating Loop Bar */}
      <header className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200/80 max-w-[85vw]">
        <button
          onClick={() => { setActiveLoopId(null); setSelectedFilter('ALL'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            !activeLoopId && selectedFilter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All System
        </button>

        <div className="flex bg-slate-100 rounded-xl p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-2 py-1 rounded-lg transition ${selectedFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('REINFORCING')}
            className={`px-2 py-1 rounded-lg transition ${selectedFilter === 'REINFORCING' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
          >
            Reinforcing (R)
          </button>
          <button
            onClick={() => setSelectedFilter('BALANCING')}
            className={`px-2 py-1 rounded-lg transition ${selectedFilter === 'BALANCING' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Balancing (B)
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
          {filteredLoops.map((loop) => (
            <button
              key={loop.id}
              onClick={() => setActiveLoopId(loop.id)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeLoopId === loop.id
                  ? loop.type === 'Reinforcing'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span
                className={`text-[10px] px-1 rounded font-bold ${
                  activeLoopId === loop.id
                    ? 'bg-white/20 text-white'
                    : loop.type === 'Reinforcing'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {loop.badge}
              </span>
              <span className="truncate max-w-[130px]">{loop.title}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Canvas Viewport */}
      <main className="flex-1 h-full">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          fitView
          fitViewOptions={{ padding: 0.1, minZoom: 0.25, maxZoom: 1.1 }}
          minZoom={0.12}
          maxZoom={2}
        >
          <Background color="#CBD5E1" gap={20} size={1} />
          <Controls position="bottom-left" />
          <MiniMap className="!bg-white !border !border-slate-200 !rounded-xl !shadow-sm" />
        </ReactFlow>
      </main>

      {/* Right-hand Explainer Drawer */}
      {activeLoop && (
        <aside className="w-[380px] bg-white/95 backdrop-blur-md border-l border-slate-200 p-5 z-20 flex flex-col justify-between shadow-2xl overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  activeLoop.type === 'Reinforcing' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {activeLoop.type} Loop ({activeLoop.badge})
              </span>
              <span className="text-[11px] font-medium text-slate-500">{activeLoop.nature}</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mt-1 mb-3 leading-snug">{activeLoop.title}</h2>

            <div className="mb-3.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Causal Path</h4>
              <p className="text-[11px] font-mono text-slate-700 leading-relaxed">{activeLoop.path}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mechanism & Reason</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeLoop.mechanism}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Stakeholders</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeLoop.stakeholders.map((s) => {
                  const stakeholder = (stakeholdersData as any)[s];
                  return (
                    <span
                      key={s}
                      style={{ backgroundColor: stakeholder?.bg, borderColor: stakeholder?.border, color: stakeholder?.text }}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                    >
                      {stakeholder?.name || s}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nodes in Sequence</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                {activeLoop.keyNodes.map((nodeKey, idx) => (
                  <div key={nodeKey} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                    <span className="text-[10px] text-slate-400 font-mono font-bold">0{idx + 1}</span>
                    <span className="capitalize text-[11px]">{nodeKey.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveLoopId(null)}
            className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            Show Complete System Map
          </button>
        </aside>
      )}
    </div>
  );
}