'use client';

import React from 'react';
import { 
  Shield, 
  Layout, 
  Server, 
  Database, 
  Zap, 
  Search, 
  CheckSquare, 
  Bug, 
  Layers, 
  Cloud,
  ChevronRight,
  Sparkles,
  Command
} from 'lucide-react';

interface AgentInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  domain: string;
  skills: string[];
  status: 'ready' | 'active' | 'idle';
}

const AGENTS: AgentInfo[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    icon: Layers,
    domain: 'Coordination',
    description: 'Master coordinator for multi-domain tasks and parallel agent execution.',
    skills: ['Parallel Analysis', 'Task Synthesis', 'Architecture'],
    status: 'ready'
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    icon: Layout,
    domain: 'UI/UX',
    description: 'Expert in React, Next.js, and high-end monochromatic aesthetics.',
    skills: ['React Compiler', 'Tailwind CSS', 'Micro-interactions'],
    status: 'ready'
  },
  {
    id: 'backend-specialist',
    name: 'Backend Specialist',
    icon: Server,
    domain: 'Logic & API',
    description: 'Specializes in Node.js, enterprise API patterns, and business workflows.',
    skills: ['REST/GraphQL', 'Async Processing', 'Auth Flows'],
    status: 'ready'
  },
  {
    id: 'database-architect',
    name: 'Database Architect',
    icon: Database,
    domain: 'Data Layer',
    description: 'Deep knowledge of Prisma, Neon PostgreSQL, and schema optimization.',
    skills: ['Query Optimization', 'Migrations', 'Data Integrity'],
    status: 'ready'
  },
  {
    id: 'security-auditor',
    name: 'Security Auditor',
    icon: Shield,
    domain: 'Compliance',
    description: 'Focused on OWASP 2025, vulnerability scanning, and secure auth.',
    skills: ['Vulnerability Assessment', 'Audit Reports', 'Secrets Mgmt'],
    status: 'ready'
  },
  {
    id: 'performance-optimizer',
    name: 'Perf Optimizer',
    icon: Zap,
    domain: 'Web Vitals',
    description: 'Specializes in Lighthouse scores, bundle optimization, and caching.',
    skills: ['Core Web Vitals', 'Load Time', 'Runtime Analysis'],
    status: 'ready'
  },
  {
    id: 'test-engineer',
    name: 'Test Engineer',
    icon: CheckSquare,
    domain: 'Quality Assurance',
    description: 'Drives test coverage through Playwright E2E and Jest unit testing.',
    skills: ['TDD', 'Regression Testing', 'CI Validation'],
    status: 'ready'
  },
  {
    id: 'debugger',
    name: 'System Debugger',
    icon: Bug,
    domain: 'Troubleshooting',
    description: 'Systematic root cause analysis for complex runtime failures.',
    skills: ['Trace Analysis', 'Heap Dumps', 'Error Reproduction'],
    status: 'ready'
  },
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    icon: Search,
    domain: 'Visibility',
    description: 'Expert in Generative Engine Optimization (GEO) and search ranking.',
    skills: ['Meta Tag Mastery', 'Schema Markup', 'Keyword Strategy'],
    status: 'ready'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    icon: Cloud,
    domain: 'Infrastructure',
    description: 'Handles Vercel deployments, CI/CD pipelines, and environment configs.',
    skills: ['CI/CD Orchestration', 'Scaling', 'Server Management'],
    status: 'ready'
  }
];

export function AgentDashboard() {
  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENTS.map((agent) => (
          <div 
            key={agent.id}
            className="group relative p-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-[var(--color-brand-red)]/30 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-red)]/5 blur-[40px] -translate-y-16 translate-x-16 group-hover:bg-[var(--color-brand-red)]/10 transition-all" />
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--color-brand-red)]/30 transition-all shadow-lg">
                <agent.icon className="w-6 h-6 text-gray-400 group-hover:text-[var(--color-brand-red)] transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Ready</span>
                  </div>
                </div>
                
                <p className="text-[9px] font-bold text-[var(--color-brand-red)] uppercase tracking-widest opacity-80 mb-2">{agent.domain}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-3 pr-4">{agent.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.skills.map(skill => (
                    <span 
                      key={skill}
                      className="text-[8px] px-2 py-1 bg-white/5 border border-white/5 rounded-md text-gray-500 font-bold uppercase tracking-tight"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <button className="flex items-center gap-2 text-[9px] font-black text-white hover:text-[var(--color-brand-red)] transition-all uppercase tracking-widest group/btn">
                  Consult Specialist
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Info */}
      <div className="p-4 bg-gradient-to-r from-[var(--color-brand-red)]/10 to-transparent border-l-2 border-[var(--color-brand-red)] rounded-r-xl">
        <div className="flex items-center gap-3">
          <Command className="w-5 h-5 text-[var(--color-brand-red)]" />
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-wider">AI Orchestration Engine v2.5</p>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">All specialist bots are currently connected and idle. Ready for command execution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
