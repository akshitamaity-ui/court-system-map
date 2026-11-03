'use client';

import dynamic from 'next/dynamic';
import nodesData from '@/data/nodes.json';
import edgesData from '@/data/edges.json';

const CausalLoopMap = dynamic(() => import('@/components/CausalLoopMap'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans text-sm">
      Loading causal loop canvas...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <CausalLoopMap initialNodes={nodesData} initialEdges={edgesData} />
    </main>
  );
}