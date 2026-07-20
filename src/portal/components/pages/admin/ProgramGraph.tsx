import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  type ReactFlowInstance,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/portal/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/portal/components/ui/card';
import { Button } from '@/portal/components/ui/button';
import { Input } from '@/portal/components/ui/input';
import { X, Building2, Briefcase, Network, Minimize2, Search } from 'lucide-react';

interface ProgramNodeData {
  label: string;
  status: string;
}

interface PersonNodeData {
  label: string;
  role: string;
  company: string;
}

type NodeKind = 'program' | 'cxo' | 'startup' | 'startup-company' | 'startup-member';

type SelectedNode = {
  id: string;
  type: NodeKind;
  data: ProgramNodeData | PersonNodeData;
};

function isProgramNode(n: SelectedNode): n is SelectedNode & { data: ProgramNodeData } {
  return n.type === 'program';
}

function isCxoNode(n: SelectedNode): n is SelectedNode & { data: PersonNodeData } {
  return n.type === 'cxo';
}

const ASSIGNMENT_EDGE_STYLE = { strokeDasharray: '6 3', stroke: '#6366f1' } as const;
const ARROW_MARKER = { type: 'arrowclosed' } as Edge['markerEnd'];

// Custom nodes

function ProgramNode({ data }: NodeProps) {
  const d = data as unknown as ProgramNodeData;
  return (
    <div className="flex min-w-[180px] flex-col items-center gap-1 rounded-xl border-2 border-blue-400 bg-blue-50 px-4 py-3 shadow-md">
      {/* Two source handles — one going left (to CxOs) and one going right
          (to companies), plus a bottom source for any downstream links. */}
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Network className="h-5 w-5 text-blue-600" />
      <span className="text-sm font-semibold text-blue-900">{d.label}</span>
      <Badge className="bg-blue-100 text-blue-700 text-xs">{d.status}</Badge>
    </div>
  );
}

function CxoNode({ data }: NodeProps) {
  const d = data as unknown as PersonNodeData;
  return (
    <div className="flex min-w-[170px] flex-col gap-0.5 rounded-xl border-2 border-amber-400 bg-amber-50 px-3 py-2.5 shadow-md">
      {/* Target on the top (from program) and source on the right
          (to startup companies). Straight lines honor both. */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div className="flex items-center gap-1.5">
        <Briefcase className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-900">{d.label}</span>
      </div>
      <span className="text-xs text-amber-700">{d.role}</span>
      <span className="text-xs text-amber-500">{d.company}</span>
    </div>
  );
}

function StartupNode({ data }: NodeProps) {
  // Legacy "person-as-startup" node, kept so existing saved layouts still
  // parse. No new graphs should use this; the graph builder now emits
  // StartupCompanyNode for companies and StartupMemberNode for people.
  const d = data as unknown as PersonNodeData;
  return (
    <div className="flex min-w-[150px] flex-col gap-0.5 rounded-xl border-2 border-cyan-400 bg-cyan-50 px-3 py-2.5 shadow-md">
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="flex items-center gap-1.5">
        <Building2 className="h-4 w-4 text-cyan-600" />
        <span className="text-sm font-semibold text-cyan-900">{d.label}</span>
      </div>
      <span className="text-xs text-cyan-700">{d.role}</span>
      <span className="text-xs text-cyan-500">{d.company}</span>
    </div>
  );
}

function StartupCompanyNode({ data }: NodeProps) {
  const d = data as unknown as ProgramNodeData;
  return (
    <div className="flex min-w-[170px] flex-col items-center gap-0.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 shadow-md">
      {/* Targets on left (from program / CxOs) and top (from program).
          Source on right (to member nodes). */}
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Building2 className="h-5 w-5 text-emerald-600" />
      <span className="text-sm font-bold text-emerald-900">{d.label}</span>
      <span className="text-[10px] text-emerald-600">{d.status}</span>
    </div>
  );
}

function StartupMemberNode({ data }: NodeProps) {
  const d = data as unknown as PersonNodeData;
  return (
    <div className="flex min-w-[140px] flex-col gap-0.5 rounded-lg border border-emerald-300 bg-white px-2.5 py-2 shadow-sm">
      {/* Target on the left — member nodes sit to the right of their company. */}
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <span className="text-xs font-medium text-emerald-900">{d.label}</span>
      <span className="text-[10px] text-emerald-600">{d.role}</span>
    </div>
  );
}

const nodeTypes = { program: ProgramNode, cxo: CxoNode, startup: StartupNode, 'startup-company': StartupCompanyNode, 'startup-member': StartupMemberNode };

function NodeSidebar({ node, onClose }: { node: SelectedNode; onClose: () => void }) {
  const typeLabel = isProgramNode(node) ? 'Program' : isCxoNode(node) ? 'CxO Advisor' : node.type === 'startup-company' ? 'Startup Company' : node.type === 'startup-member' ? 'Team Member' : 'Startup';
  const accentClass = isProgramNode(node)
    ? 'border-blue-400 bg-blue-50'
    : isCxoNode(node)
      ? 'border-amber-400 bg-amber-50'
      : 'border-emerald-400 bg-emerald-50';

  return (
    <Card className={`absolute right-4 top-16 z-10 w-64 border-2 shadow-lg ${accentClass}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-3">
        <CardTitle className="text-sm font-semibold">{typeLabel}</CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1 pb-4 text-sm">
        <p className="font-medium">{node.data.label}</p>
        {isProgramNode(node) && (
          <p className="text-slate-600">Status: <span className="font-medium">{node.data.status}</span></p>
        )}
        {!isProgramNode(node) && (
          <>
            <p className="text-slate-600">Role: <span className="font-medium">{(node.data as PersonNodeData).role}</span></p>
            <p className="text-slate-600">Company: <span className="font-medium">{(node.data as PersonNodeData).company}</span></p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Legend({ focusActive }: { focusActive: boolean }) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 rounded-lg border bg-white/90 p-3 text-xs shadow-sm backdrop-blur-sm">
      <p className="font-semibold text-slate-700">Legend</p>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded border-2 border-blue-400 bg-blue-50" />
        <span className="text-slate-600">Program</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded border-2 border-amber-400 bg-amber-50" />
        <span className="text-slate-600">CxO Advisor</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded border-2 border-emerald-400 bg-emerald-50" />
        <span className="text-slate-600">Startup Company</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded border border-emerald-300 bg-emerald-50/50" />
        <span className="text-slate-600">Team Member</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-0.5 w-6 border-t-2 border-dashed border-indigo-400" />
        <span className="text-slate-600">Assignment</span>
      </div>
      {focusActive && (
        <p className="mt-1 border-t border-slate-200 pt-1.5 text-slate-400 italic">
          Click background to reset
        </p>
      )}
    </div>
  );
}

// Data-driven props interface. These types mirror the program model —
// CXO enrollments, startup companies (grouped), and per-pairing assignments.

export interface GraphCxo {
  userId: string;
  name: string;
  email: string;
}

export interface GraphStartupMember {
  userId: string;
  name: string;
  email: string;
}

export interface GraphStartupCompany {
  id: string;
  name: string;
  members: GraphStartupMember[];
}

export interface GraphAssignment {
  cxoUserId: string;
  startupCompanyId: string;
}

export interface ProgramGraphProps {
  programId: string;
  programName: string;
  programStatus: string;
  cxos: GraphCxo[];
  startupCompanies: GraphStartupCompany[];
  assignments: GraphAssignment[];
  /**
   * Called when the user clicks the "Exit Fullscreen" button in the top-right
   * corner of the graph. If omitted, the button is hidden.
   */
  onExitFullscreen?: () => void;
}

export default function ProgramGraph({
  programId: _programId,
  programName,
  programStatus,
  cxos,
  startupCompanies,
  assignments,
  onExitFullscreen,
}: ProgramGraphProps) {
  // NOTE: we deliberately do NOT persist node positions across visits.
  //
  // The graph is fully data-driven from assignment rows, which means any
  // schema change (or even just adding/removing an enrollee) generates a
  // different set of node ids. Persisting positions keyed on the old ids
  // caused a "works once, blank on reload" bug: the first view saved
  // initial layout to localStorage, then on reload the saved positions
  // for now-stale node ids were silently dropped and the new nodes ended
  // up overlapping or off-screen relative to whatever fitView decided.
  //
  // The computed fallback coordinates below are deterministic per
  // (cxo_count, company_count, member_count) so every reload produces
  // the same clean layout. If we ever want persistent drag positions,
  // we should key them on a (programId, schemaVersion) tuple so schema
  // changes invalidate the cache.
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Deterministic position helper — no saved-position lookup anymore.
    const pos = (_id: string, fallback: { x: number; y: number }) => fallback;

    nodes.push({
      id: 'program-root',
      type: 'program',
      data: { label: programName, status: programStatus } satisfies ProgramNodeData,
      position: pos('program-root', { x: 400, y: 30 }),
    });

    // Layout geometry — three columns: CxOs (left), companies + members (right).
    // Companies sit in a middle column, members branch further right.
    const CXO_X = 80;
    const COMPANY_X = 640;
    const MEMBER_X = 900;
    const CXO_ROW_STEP = 160;
    const COMPANY_ROW_STEP = 220;
    const MEMBER_ROW_STEP = 56;

    // CxO nodes on the left column — every CxO gets a straight line from the program.
    cxos.forEach((cxo, i) => {
      const nodeId = `cxo-${cxo.userId}`;
      nodes.push({
        id: nodeId,
        type: 'cxo',
        data: { label: cxo.name, role: 'CXO Advisor', company: cxo.email } satisfies PersonNodeData,
        position: pos(nodeId, { x: CXO_X, y: 200 + i * CXO_ROW_STEP }),
      });
      edges.push({
        id: `e-root-${nodeId}`,
        source: 'program-root',
        target: nodeId,
        type: 'straight',
      });
    });

    // Startup COMPANY nodes (NOT people) — these are the real company profiles.
    // Each company gets a straight line from the program and from every CxO in
    // the cohort (any-to-any advisory relationship). Explicit assignment rows,
    // if present, are drawn as thicker highlighted edges on top.
    startupCompanies.forEach((company, ci) => {
      const companyNodeId = `company-${company.id}`;
      const memberCount = company.members.length;
      nodes.push({
        id: companyNodeId,
        type: 'startup-company',
        data: {
          label: company.name,
          status: `${memberCount} member${memberCount !== 1 ? 's' : ''}`,
        } satisfies ProgramNodeData,
        position: pos(companyNodeId, { x: COMPANY_X, y: 200 + ci * COMPANY_ROW_STEP }),
      });
      edges.push({
        id: `e-root-${companyNodeId}`,
        source: 'program-root',
        target: companyNodeId,
        type: 'straight',
      });

      // Team member nodes — real people connected to their company.
      company.members.forEach((member, mi) => {
        const memberNodeId = `member-${company.id}-${member.userId}`;
        nodes.push({
          id: memberNodeId,
          type: 'startup-member',
          data: {
            label: member.name,
            role: member.email,
            company: company.name,
          } satisfies PersonNodeData,
          position: pos(memberNodeId, {
            x: MEMBER_X,
            y: 180 + ci * COMPANY_ROW_STEP + mi * MEMBER_ROW_STEP,
          }),
        });
        edges.push({
          id: `e-${companyNodeId}-${memberNodeId}`,
          source: companyNodeId,
          target: memberNodeId,
          type: 'straight',
          style: { stroke: '#10b981' },
        });
      });
    });

    // Assignment edges.
    //
    // If the program has explicit ProgramAssignment rows, use those and draw
    // them as dashed animated lines with an arrow — exactly the one-to-one
    // pairings the admin set up.
    //
    // If there are NO assignment rows, fall back to the any-to-any default:
    // every CXO advises every startup in the cohort. This reflects the CxO
    // Advisory Program model where a cohort of 10 CXOs advises a cohort of
    // 10 startups with no pre-set pairings.
    if (assignments.length > 0) {
      assignments.forEach((a) => {
        const sourceId = `cxo-${a.cxoUserId}`;
        const targetId = `company-${a.startupCompanyId}`;
        edges.push({
          id: `assign-${a.cxoUserId}-${a.startupCompanyId}`,
          source: sourceId,
          target: targetId,
          type: 'straight',
          style: ASSIGNMENT_EDGE_STYLE,
          animated: true,
          markerEnd: ARROW_MARKER,
        });
      });
    } else {
      // Any-to-any fallback: every CXO ↔ every startup company.
      cxos.forEach((cxo) => {
        startupCompanies.forEach((company) => {
          edges.push({
            id: `anytoany-${cxo.userId}-${company.id}`,
            source: `cxo-${cxo.userId}`,
            target: `company-${company.id}`,
            type: 'straight',
            style: { stroke: '#c7d2fe', strokeWidth: 1 },
          });
        });
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [programName, programStatus, cxos, startupCompanies, assignments]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<SelectedNode | null>(null);
  const [focusedNodeIds, setFocusedNodeIds] = useState<Set<string>>(new Set());
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; label: string }[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Graph search: find ALL matching nodes and zoom to encompass them.
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setFocusedNodeIds(new Set());
      setShowSearchDropdown(false);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const matches = nodes.filter((n) => {
      const label = (n.data as any)?.label ?? '';
      const company = (n.data as any)?.company ?? '';
      return label.toLowerCase().includes(q) || company.toLowerCase().includes(q);
    });
    setSearchResults(matches.map((n) => ({ id: n.id, label: (n.data as any)?.label || n.id })));
    setFocusedNodeIds(new Set(matches.map((n) => n.id)));
    setShowSearchDropdown(matches.length > 0);
    if (matches.length > 0 && rfInstance) {
      rfInstance.fitView({ nodes: matches.map((n) => ({ id: n.id })), padding: 0.3, duration: 500 });
    }
  }, [searchQuery, nodes, rfInstance]);

  // Re-sync React Flow state when the computed layout changes, and
  // re-fit the viewport so the new nodes are actually visible.
  //
  // useNodesState and useEdgesState only read their initial arguments on
  // the first render — they don't observe changes to initialNodes/
  // initialEdges. If the parent component feeds us new data (e.g. the
  // React Query hook for assignments resolves after this component has
  // already mounted, or the user switches to a different program), we
  // need to explicitly push the new arrays into React Flow's state.
  //
  // Re-fitting the viewport after the state update is the second half of
  // the fix: the default `fitView` prop only runs once on mount, so if
  // the graph mounted with one node (program root) and later got six
  // more nodes, the viewport would still be framed on just the root
  // with the new nodes sitting off-screen. We defer the fitView call
  // with requestAnimationFrame so React Flow has time to measure the
  // new node dimensions before calculating the bounding box.
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    if (rfInstance) {
      const raf = requestAnimationFrame(() => {
        rfInstance.fitView({ padding: 0.15, duration: 300 });
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [initialNodes, initialEdges, setNodes, setEdges, rfInstance]);

  // One-shot cleanup for legacy localStorage position caches.
  //
  // Earlier versions of this component persisted drag positions to
  // localStorage under `gcio_graph_positions_${programId}`. Those caches
  // are no longer read by any code path, but they're still sitting in
  // users' browsers from before the "works once, blank on reload" fix.
  // Remove them on mount so browsers don't accumulate dead keys.
  useEffect(() => {
    try {
      const stale: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gcio_graph_positions_')) {
          stale.push(key);
        }
      }
      stale.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Private mode or quota errors — safe to ignore.
    }
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected({ id: node.id, type: (node.type ?? 'program') as NodeKind, data: node.data as unknown as SelectedNode['data'] });
    setFocusedNodeIds((prev) => {
      if (prev.size === 1 && prev.has(node.id)) return new Set();
      return new Set([node.id]);
    });
  }, []);

  const onPaneClick = useCallback(() => {
    setSelected(null);
    setFocusedNodeIds(new Set());
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  }, []);

  const connectedNodeIds = useMemo(() => {
    if (focusedNodeIds.size === 0) return null;
    const connected = new Set<string>(focusedNodeIds);
    edges.forEach((e) => {
      if (focusedNodeIds.has(e.source)) connected.add(e.target);
      if (focusedNodeIds.has(e.target)) connected.add(e.source);
    });
    return connected;
  }, [focusedNodeIds, edges]);

  const displayNodes = useMemo(() => {
    const hasSearchFocus = focusedNodeIds.size > 0;
    if (!connectedNodeIds && !hasSearchFocus) return nodes;
    return nodes.map((n) => {
      const isSearchMatch = hasSearchFocus && focusedNodeIds.has(n.id);
      const isConnected = connectedNodeIds?.has(n.id) ?? true;
      return {
        ...n,
        style: {
          ...n.style,
          opacity: isConnected ? 1 : 0.15,
          transition: 'opacity 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease',
          ...(isSearchMatch
            ? { boxShadow: '0 0 12px 4px rgba(99, 102, 241, 0.5)', borderRadius: '12px', zIndex: 10 }
            : {}),
          ...(hasSearchFocus && !isSearchMatch ? { filter: 'saturate(0.3)' } : {}),
        },
      };
    });
  }, [nodes, connectedNodeIds, focusedNodeIds]);

  const displayEdges = useMemo(() => {
    if (!connectedNodeIds) return edges;
    return edges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: connectedNodeIds.has(e.source) && connectedNodeIds.has(e.target) ? 1 : 0.08,
        transition: 'opacity 0.3s ease',
      },
    }));
  }, [edges, connectedNodeIds]);

  if (cxos.length === 0 && startupCompanies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>No members enrolled yet. Enroll CXOs and startups to see the relationship graph.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg border bg-slate-50">
      {/* Graph search */}
      <div className="absolute left-4 top-4 z-20 w-64">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search person or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchResults.length > 0 && rfInstance) {
                rfInstance.fitView({ nodes: searchResults.map((r) => ({ id: r.id })), padding: 0.3, duration: 500 });
              }
              if (e.key === 'Escape') {
                setShowSearchDropdown(false);
              }
            }}
            className="pl-8 h-8 text-xs bg-white/90 backdrop-blur shadow-sm"
          />
          {searchQuery.trim() && searchResults.length > 0 && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-indigo-600">
              {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="mt-1 bg-white rounded-lg shadow-lg border max-h-40 overflow-y-auto z-50">
            <div className="px-3 py-1.5 text-xs text-slate-500 border-b font-medium">
              {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found
            </div>
            {searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setFocusedNodeIds(new Set([r.id]));
                  rfInstance?.fitView({ nodes: [{ id: r.id }], padding: 0.5, duration: 500 });
                  setShowSearchDropdown(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 truncate transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="#e2e8f0" />
        <Controls position="bottom-right" />
      </ReactFlow>
      {selected && <NodeSidebar node={selected} onClose={() => { setSelected(null); setFocusedNodeIds(new Set()); }} />}
      <Legend focusActive={focusedNodeIds.size > 0} />
      {onExitFullscreen && (
        <Button
          variant="outline"
          size="sm"
          className="absolute right-4 top-4 z-20 gap-1.5 shadow-md"
          onClick={onExitFullscreen}
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Exit Fullscreen
        </Button>
      )}
    </div>
  );
}
