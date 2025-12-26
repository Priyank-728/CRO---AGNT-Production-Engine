import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { InputForm } from './components/InputForm';
import { BlueprintDisplay } from './components/BlueprintDisplay';
import { INITIAL_INPUT, LandingPageInput, LandingPageBlueprint, PageSection, Feedback } from './types';
import { generateLandingPage, regenerateSection } from './services/geminiService';
import { Zap, Activity, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState<LandingPageInput>(INITIAL_INPUT);
  const [blueprint, setBlueprint] = useState<LandingPageBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setBlueprint(null);

    try {
      const result = await generateLandingPage(input);
      setBlueprint(result);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate blueprint. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = (updatedSection: PageSection) => {
    if (!blueprint) return;
    const newSections = blueprint.sections.map(s => 
      s.id === updatedSection.id ? updatedSection : s
    );
    setBlueprint({ ...blueprint, sections: newSections });
  };

  const handleRegenerateRequest = async (sectionId: string, feedback: Feedback) => {
    if (!blueprint) return;
    
    // Optimistic UI update or simple loading state
    setRegeneratingId(sectionId);
    
    try {
      const currentSection = blueprint.sections.find(s => s.id === sectionId);
      if (!currentSection) throw new Error("Section not found");

      const newSection = await regenerateSection(currentSection, feedback, input);
      
      // Update blueprint with new section
      setBlueprint(prev => {
        if (!prev) return null;
        return {
            ...prev,
            sections: prev.sections.map(s => s.id === sectionId ? newSection : s)
        };
      });
    } catch (e) {
      console.error("Regeneration failed", e);
      // Optional: Show toast error
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20">
              <Zap size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">CRO-AGNT</h1>
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Production Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
             <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-slate-400"><ShieldCheck size={14} className="text-emerald-500"/> Human-in-the-Loop Active</span>
             </div>
             <div className="h-4 w-px bg-slate-800"></div>
             <div className="flex items-center gap-3">
               <span className="flex items-center gap-1.5"><Activity size={14} className="text-blue-500"/> Gemini Pro</span>
               <span className="flex items-center gap-1.5"><Zap size={14} className="text-yellow-500"/> Gemini Flash</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto px-6 py-8 w-full grid grid-cols-12 gap-8 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Panel: Inputs */}
        <div className="col-span-12 lg:col-span-4 h-full flex flex-col overflow-hidden">
          <InputForm 
            input={input} 
            setInput={setInput} 
            onSubmit={handleSubmit} 
            isLoading={loading}
          />
        </div>

        {/* Right Panel: Output */}
        <div className="col-span-12 lg:col-span-8 h-full flex flex-col relative overflow-hidden">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-4 text-sm flex items-center gap-2">
              <Activity className="text-red-500" size={16} />
              {error}
            </div>
          )}

          {!blueprint && !loading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
              <Zap size={48} className="mb-4 text-slate-700 opacity-50" />
              <h2 className="text-xl font-bold text-slate-300 mb-2">Ready to Build</h2>
              <p className="text-sm max-w-md text-center">Enter your campaign details to generate a production-ready landing page specification with continuous optimization.</p>
            </div>
          )}

          {loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/50">
               <div className="relative w-16 h-16 mb-6">
                 <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping"></div>
                 <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
               </div>
               <div className="space-y-2 text-center">
                 <p className="text-emerald-400 font-bold animate-pulse">Constructing Hierarchy...</p>
                 <p className="text-xs text-slate-500 font-mono">Writing Copy • Applying UX Patterns • Optimizing Conversion</p>
               </div>
             </div>
          )}

          {blueprint && !loading && (
             <div className="h-full overflow-hidden">
                <BlueprintDisplay 
                  data={blueprint} 
                  onUpdateSection={handleUpdateSection}
                  onRegenerateRequest={handleRegenerateRequest}
                  isRegenerating={regeneratingId}
                />
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
