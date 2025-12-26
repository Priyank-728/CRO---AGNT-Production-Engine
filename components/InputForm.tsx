import React from 'react';
import { LandingPageInput } from '../types';
import { Sparkles } from 'lucide-react';

interface InputFormProps {
  input: LandingPageInput;
  setInput: React.Dispatch<React.SetStateAction<LandingPageInput>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ input, setInput, onSubmit, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 text-emerald-400">
        <Sparkles size={20} />
        <h2 className="text-lg font-bold uppercase tracking-wider">Campaign Parameters</h2>
      </div>

      <form className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ad Platform</label>
            <input
              name="adPlatform"
              value={input.adPlatform}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Objective</label>
            <select
              name="campaignObjective"
              value={input.campaignObjective}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="purchase">Purchase (eCom)</option>
              <option value="lead">Lead Gen</option>
              <option value="signup">SaaS Signup</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ad Copy & Keywords</label>
          <textarea
            name="adCopy"
            value={input.adCopy}
            onChange={handleChange}
            rows={3}
            placeholder="Paste your ad headlines and descriptions here..."
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
           <input
              name="keywords"
              value={input.keywords}
              onChange={handleChange}
              placeholder="Keywords: e.g. best running shoes, cheap sneakers"
              className="w-full mt-2 bg-slate-800 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Product / Offer Details</label>
          <textarea
            name="productDetails"
            value={input.productDetails}
            onChange={handleChange}
            rows={3}
            placeholder="What are you selling? Price? Guarantee? USP?"
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Target Audience</label>
          <textarea
            name="audienceAttributes"
            value={input.audienceAttributes}
            onChange={handleChange}
            rows={2}
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Constraints</label>
          <input
            name="brandConstraints"
            value={input.brandConstraints}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
            isLoading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isLoading ? 'Optimizing...' : 'Generate Blueprint'}
        </button>
      </form>
    </div>
  );
};
