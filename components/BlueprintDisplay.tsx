import React, { useState } from 'react';
import { LandingPageBlueprint, PageSection, Feedback } from '../types';
import {
  MessageSquarePlus,
  Lock,
  Unlock,
  RefreshCw,
  Check,
  ArrowRight,
  Star,
  Smartphone,
  Image as ImageIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface BlueprintDisplayProps {
  data: LandingPageBlueprint;
  onUpdateSection: (updatedSection: PageSection) => void;
  onRegenerateRequest: (sectionId: string, feedback: Feedback) => Promise<void>;
  isRegenerating: string | null;
}

export const BlueprintDisplay: React.FC<BlueprintDisplayProps> = ({
  data,
  onUpdateSection,
  onRegenerateRequest,
  isRegenerating,
}) => {
  return (
    <div className="flex flex-col h-full bg-black rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
      {/* Live Preview Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center z-10">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-emerald-400 mb-1">
            Live Preview
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">
              {data.primaryIntent}
            </span>
            <span className="text-xs text-slate-500">
              {data.designHints.visualStyle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
          <Smartphone size={14} />
          <span>Mobile View</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-8 bg-zinc-950">
        <div className="max-w-md mx-auto bg-black min-h-full border border-slate-800 shadow-2xl relative">
          
          {/* Status Bar Mockup */}
          <div className="h-6 w-full flex justify-between px-4 items-center mb-2 pt-2">
             <span className="text-[10px] text-white font-mono">9:41</span>
             <div className="flex gap-1">
               <div className="w-4 h-2 bg-white rounded-[1px]"></div>
               <div className="w-1 h-2 bg-white rounded-[1px]"></div>
             </div>
          </div>

          {data.sections.map((section, idx) => (
            <SectionRenderer
              key={section.id}
              section={section}
              onUpdate={(s) => onUpdateSection(s)}
              onRegenerate={(f) => onRegenerateRequest(section.id, f)}
              isLoading={isRegenerating === section.id}
              isFirst={idx === 0}
            />
          ))}

          {/* Footer Mockup */}
          <div className="py-8 bg-zinc-900 text-center border-t border-zinc-800">
             <p className="text-xs text-zinc-600">© 2024 Brand Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SectionRendererProps {
  section: PageSection;
  onUpdate: (section: PageSection) => void;
  onRegenerate: (feedback: Feedback) => void;
  isLoading: boolean;
  isFirst: boolean;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  onUpdate,
  onRegenerate,
  isLoading,
  isFirst,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] =
    useState<Feedback['feedbackType']>('copy_edit');

  const handleLockToggle = () => {
    onUpdate({ ...section, isLocked: !section.isLocked });
  };

  const handleSubmitFeedback = () => {
    if (!comment && feedbackType !== 'lock') return;
    onRegenerate({
      sectionId: section.id,
      feedbackType,
      comment,
      priority: 'high',
    });
    setShowFeedback(false);
    setComment('');
  };

  // Dark mode layout classes
  const containerClasses = `relative px-6 py-12 border-b border-zinc-900 ${
    isFirst
      ? 'bg-gradient-to-b from-zinc-900 to-black pb-16 pt-10'
      : 'bg-black'
  }`;

  return (
    <div className={containerClasses}>
      {/* RIBBON */}
      {section.content.ribbon && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-red-500 flex items-center gap-1 whitespace-nowrap">
            <Zap size={10} fill="currentColor" /> {section.content.ribbon}
          </span>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={handleLockToggle}
          className={`p-1.5 rounded-md border ${
            section.isLocked
              ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          {section.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        {!section.isLocked && (
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="p-1.5 bg-zinc-800 text-blue-400 border border-zinc-700 rounded-md"
          >
            <MessageSquarePlus size={12} />
          </button>
        )}
      </div>

      {/* Feedback Input */}
      {showFeedback && (
        <div className="absolute inset-x-4 top-10 z-30 bg-zinc-800 p-3 rounded-lg border border-zinc-700 shadow-xl">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-zinc-900 text-sm text-white p-2 rounded border border-zinc-700 focus:outline-none focus:border-blue-500 mb-2"
            rows={2}
            placeholder="Feedback..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowFeedback(false)}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitFeedback}
              className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-emerald-500" size={24} />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
              Optimizing...
            </span>
          </div>
        </div>
      )}

      {/* CONTENT RENDERER */}
      <div className={`space-y-6 ${section.layout === 'centered' || isFirst ? 'text-center' : 'text-left'}`}>
      
        {/* Headline */}
        <h2 className={`${isFirst ? 'text-4xl' : 'text-3xl'} font-bold text-white leading-[1.1] tracking-tight`}>
          {section.content.headline}
        </h2>

        {/* Image Placeholder */}
        {section.content.image && (
          <div className="my-6 w-full aspect-video bg-zinc-900 rounded-lg border border-zinc-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-800 opacity-50"></div>
            <ImageIcon className="text-zinc-600 mb-3 relative z-10" size={32} />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wide mb-1 relative z-10">
              {section.content.image.purpose}
            </p>
            <p className="text-sm text-zinc-400 italic max-w-[80%] relative z-10">
              "{section.content.image.description}"
            </p>
          </div>
        )}

        {/* Description (Body Copy) */}
        {section.content.description && (
          <p className="text-lg text-zinc-300 leading-relaxed font-normal max-w-lg mx-auto">
            {section.content.description}
          </p>
        )}

        {/* Bullets */}
        {section.content.bullets && section.content.bullets.length > 0 && (
          <div className={`flex flex-col gap-3 mt-4 ${section.layout === 'centered' ? 'items-center' : 'items-start'}`}>
            {section.content.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-3 text-left">
                <div className="mt-1 min-w-[16px]">
                   <Check size={16} className="text-emerald-500" />
                </div>
                <span className="text-sm text-zinc-400 font-medium">{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* Social Proof specific render */}
        {section.type === 'SocialProof' && (
          <div className="flex justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} className="text-yellow-500" fill="currentColor" />
            ))}
          </div>
        )}

        {/* Guarantee specific icon */}
        {section.type === 'Guarantee' && (
           <div className="flex justify-center mb-4">
             <ShieldCheck size={48} className="text-zinc-700" />
           </div>
        )}

        {/* CTA */}
        {section.content.cta && (
          <div className="pt-4">
            <button className="w-full bg-white text-black hover:bg-zinc-200 transition-colors py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {section.content.cta}
              <ArrowRight size={20} />
            </button>
            <p className="text-[10px] text-zinc-600 mt-3 uppercase tracking-wide">
              Free Shipping • Money Back Guarantee
            </p>
          </div>
        )}
      </div>

      {/* Section ID Label */}
      <span className="absolute left-2 top-2 text-[8px] font-mono text-zinc-800 uppercase pointer-events-none">
        {section.id}
      </span>
    </div>
  );
};