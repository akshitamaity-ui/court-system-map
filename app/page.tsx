'use client';

import dynamic from 'next/dynamic';
import nodesData from '@/data/nodes.json';
import edgesData from '@/data/edges.json';

const CausalLoopMap = dynamic(() => import('@/components/CausalLoopMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        color: '#64748B',
        fontFamily: 'sans-serif',
        fontSize: '14px',
      }}
    >
      Loading system map...
    </div>
  ),
});

export default function Home() {
  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <CausalLoopMap initialNodes={nodesData} initialEdges={edgesData} />
    </main>
  );
}
