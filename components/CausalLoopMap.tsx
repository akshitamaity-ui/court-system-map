'use client';

import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  MarkerType,
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

  const activeLoopStakeholders = useMemo(() => {
    if (!activeLoop) return [];
    const stakeholderKeys = new Set<string>();
    initialNodes.forEach((node) => {
      if (activeLoop.keyNodes.includes(node.id) && node.data?.stakeholder) {
        stakeholderKeys.add(node.data.stakeholder);
      }
    });
    return Array.from(stakeholderKeys);
  }, [activeLoop, initialNodes]);

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
          borderWidth: isInLoop ? '2px' : '1px',
          borderStyle: 'solid',
          color: isInLoop ? stakeholder.text : '#94A3B8',
          opacity: isInLoop ? 1 : 0.12,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: 650,
          lineHeight: '1.3',
          maxWidth: '180px',
          textAlign: 'center' as const,
          boxShadow: isInLoop ? '0 4px 14px rgba(0,0,0,0.08)' : 'none',
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

      const sign = edge.data?.sign || edge.label || '+';
      const isPositive = sign === '+';

      const strokeColor = isInLoop
        ? activeLoop.type === 'Reinforcing'
          ? '#E11D48'
          : '#2563EB'
        : '#94A3B8';

      return {
        ...edge,
        animated: !!isInLoop,
        label: sign,
        labelStyle: {
          fill: isPositive ? '#166534' : '#991B1B',
          fontWeight: 900,
          fontSize: 13,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: isPositive ? '#DCFCE7' : '#FEE2E2',
          fillOpacity: 0.95,
          stroke: isPositive ? '#86EFAC' : '#FCA5A5',
          strokeWidth: 1.5,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [6, 4] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 16,
          height: 16,
        },
        style: {
          stroke: strokeColor,
          strokeWidth: isInLoop ? 3.5 : 1.5,
          opacity: !activeLoop || isInLoop ? 1 : 0.12,
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
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 9999,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '8px 12px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.06)',
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
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: !activeLoopId && selectedFilter === 'ALL' ? '#0F172A' : '#F1F5F9',
            color: !activeLoopId && selectedFilter === 'ALL' ? '#FFFFFF' : '#475569',
            transition: 'all 0.15s ease',
          }}
        >
          All System
        </button>

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
              boxShadow: selectedFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
              boxShadow: selectedFilter === 'REINFORCING' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
              boxShadow: selectedFilter === 'BALANCING' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Balancing (B)
          </button>
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

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
                  border: isSelected ? 'none' : '1px solid #E2E8F0',
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
      <main style={{ width: '100vw', height: '100vh', position: 'relative', zIndex: 1 }}>
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          fitView
          fitViewOptions={{ padding: 0.12, minZoom: 0.25, maxZoom: 1.1 }}
          minZoom={0.12}
          maxZoom={2}
        >
          <Background color="#CBD5E1" gap={20} size={1} />
          <Controls position="bottom-left" style={{ bottom: '270px', zIndex: 9998 }} />
          <MiniMap
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              bottom: '270px',
              zIndex: 9998,
            }}
          />
        </ReactFlow>
      </main>

      {/* Persistent Bottom-Left Color Legend */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '14px',
          padding: '12px 14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          maxWidth: '360px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#64748B',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Stakeholder & System Legend</span>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#94A3B8' }}>Color Coding</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '6px',
          }}
        >
          {Object.entries(stakeholdersData).map(([key, item]: [string, any]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '10.5px',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: item.bg,
                  border: `1.5px solid ${item.border}`,
                  flexShrink: 0,
                }}
              />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Explainer Drawer */}
      {activeLoop && (
        <aside
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '380px',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderLeft: '1px solid #E2E8F0',
            padding: '24px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
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
                Closed Causal Circuit
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
                All Stakeholders in This Loop ({activeLoopStakeholders.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeLoopStakeholders.map((key) => {
                  const stakeholder = (stakeholdersData as any)[key];
                  return (
                    <span
                      key={key}
                      style={{
                        backgroundColor: stakeholder?.bg || '#F1F5F9',
                        borderColor: stakeholder?.border || '#CBD5E1',
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        color: stakeholder?.text || '#0F172A',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {stakeholder?.name || key}
                    </span>
                  );
                })}
              </div>
            </div>

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
                Nodes in Sequence ({activeLoop.keyNodes.length})
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
                {activeLoop.keyNodes.map((nodeKey: string, idx: number) => (
                  <div
                    key={nodeKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
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
                      {String(idx + 1).padStart(2, '0')}
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
