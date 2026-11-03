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
      const stakeholder = (stakeholdersData as any)[node.data.stakeholder] || {
        bg: '#F1F5F9',
        border: '#CBD5E1',
        text: '#0F172A',
        name: 'General',
      };
      const isInLoop = !activeLoop || activeLoop.keyNodes.includes(node.id);

      return {
        ...node,
        style: {
          backgroundColor: isInLoop ? stakeholder.bg : '#F8FAFC',
          borderColor: isInLoop ? stakeholder.border : '#E2E8F0',
          borderWidth: isInLoop ? '1.5px' : '1px',
          borderStyle: 'solid',
          color: isInLoop ? stakeholder.text : '#94A3B8',
          opacity: isInLoop ? 1 : 0.15,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: 600,
          lineHeight: '1.3',
          maxWidth: '180px',
          textAlign: 'center' as const,
          boxShadow: isInLoop ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.25s ease',
          cursor: 'grab',
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
          strokeWidth: isInLoop ? 3.5 : 1,
          opacity: !activeLoop || isInLoop ? 1 : 0.08,
          transition: 'all 0.25s ease',
        },
      };
    });
  }, [initialEdges, activeLoop]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#FDFDFE',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Floating Control Bar */}
      <header
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 20,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '8px 12px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          maxWidth: '85vw',
        }}
      >
        <button
          onClick={() => {
            setActiveLoopId(null);
            setSelectedFilter('ALL');
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: !activeLoopId && selectedFilter === 'ALL' ? '#0F172A' : '#F1F5F9',
            color: !activeLoopId && selectedFilter === 'ALL' ? '#FFFFFF' : '#475569',
            transition: 'all 0.2s ease',
          }}
        >
          All System
        </button>

        {/* Filter Segmented Pill */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '10px',
            padding: '2px',
            gap: '2px',
          }}
        >
          <button
            onClick={() => setSelectedFilter('ALL')}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: selectedFilter === 'ALL' ? '#FFFFFF' : 'transparent',
              color: selectedFilter === 'ALL' ? '#0F172A' : '#64748B',
              boxShadow: selectedFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('REINFORCING')}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: selectedFilter === 'REINFORCING' ? '#FFFFFF' : 'transparent',
              color: selectedFilter === 'REINFORCING' ? '#E11D48' : '#64748B',
              boxShadow: selectedFilter === 'REINFORCING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Reinforcing (R)
          </button>
          <button
            onClick={() => setSelectedFilter('BALANCING')}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: selectedFilter === 'BALANCING' ? '#FFFFFF' : 'transparent',
              color: selectedFilter === 'BALANCING' ? '#2563EB' : '#64748B',
              boxShadow: selectedFilter === 'BALANCING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Balancing (B)
          </button>
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0', margin: '0 4px' }} />

        {/* Loop Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            maxHeight: '80px',
            overflowY: 'auto',
          }}
        >
          {filteredLoops.map((loop) => {
            const isSelected = activeLoopId === loop.id;
            return (
              <button
                key={loop.id}
                onClick={() => setActiveLoopId(loop.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected
                    ? 'none'
                    : '1px solid #E2E8F0',
                  backgroundColor: isSelected
                    ? loop.type === 'Reinforcing'
                      ? '#E11D48'
                      : '#2563EB'
                    : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  boxShadow: isSelected ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.25)'
                      : loop.type === 'Reinforcing'
                      ? '#FFE4E6'
                      : '#DBEAFE',
                    color: isSelected
                      ? '#FFFFFF'
                      : loop.type === 'Reinforcing'
                      ? '#BE123C'
                      : '#1D4ED8',
                  }}
                >
                  {loop.badge}
                </span>
                <span
                  style={{
                    maxWidth: '150px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {loop.title}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Canvas */}
      <main style={{ width: '100%', height: '100%' }}>
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
          <MiniMap
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
        </ReactFlow>
      </main>

      {/* Right-hand Explainer Drawer */}
      {activeLoop && (
        <aside
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '380px',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderLeft: '1px solid #E2E8F0',
            padding: '24px',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.08)',
            overflowY: 'auto',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: activeLoop.type === 'Reinforcing' ? '#FFE4E6' : '#DBEAFE',
                  color: activeLoop.type === 'Reinforcing' ? '#BE123C' : '#1D4ED8',
                }}
              >
                {activeLoop.type} Loop ({activeLoop.badge})
              </span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>
                {activeLoop.nature}
              </span>
            </div>

            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#0F172A',
                marginTop: '4px',
                marginBottom: '14px',
                lineHeight: 1.3,
              }}
            >
              {activeLoop.title}
            </h2>

            {/* Path Box */}
            <div
              style={{
                marginBottom: '14px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#94A3B8',
                  marginBottom: '6px',
                }}
              >
                Causal Path
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                {activeLoop.path}
              </div>
            </div>

            {/* Mechanism */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#94A3B8',
                  marginBottom: '6px',
                }}
              >
                Mechanism & Context
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {activeLoop.mechanism}
              </p>
            </div>

            {/* Stakeholders */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#94A3B8',
                  marginBottom: '8px',
                }}
              >
                Primary Stakeholders
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeLoop.stakeholders.map((s) => {
                  const stakeholder = (stakeholdersData as any)[s];
                  return (
                    <span
                      key={s}
                      style={{
                        backgroundColor: stakeholder?.bg || '#F1F5F9',
                        borderColor: stakeholder?.border || '#CBD5E1',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: stakeholder?.text || '#0F172A',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {stakeholder?.name || s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Nodes Sequence */}
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#94A3B8',
                  marginBottom: '8px',
                }}
              >
                Nodes in Sequence
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {activeLoop.keyNodes.map((nodeKey, idx) => (
                  <div
                    key={nodeKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      fontSize: '11px',
                      color: '#334155',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#94A3B8',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {nodeKey.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveLoopId(null)}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '10px 0',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            Show Complete System Map
          </button>
        </aside>
      )}
    </div>
  );
}
