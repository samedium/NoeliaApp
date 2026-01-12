import React, { useState, useMemo } from 'react';
import { AnalysisResult, SentimentType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, TrendingUp, Zap, Lightbulb, Users, Target, Activity, Filter, X } from 'lucide-react';
import WordHeatmap from './WordHeatmap';

interface DashboardProps {
  data: AnalysisResult;
  fileName: string;
  onReset: () => void;
}

// Noelia Branding Colors
const COLORS = {
  [SentimentType.POSITIVE]: '#008854', // Green Masters
  [SentimentType.NEUTRAL]: '#94a3b8',
  [SentimentType.NEGATIVE]: '#ef4444',
  [SentimentType.INSIGHTFUL]: '#4a1d46', // Purple Accent
  [SentimentType.URGENT]: '#eab308', // Gold Accent
};

const Dashboard: React.FC<DashboardProps> = ({ data, fileName, onReset }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  const sentimentChartData = Object.entries(data.sentimentCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const handleWordClick = (word: string) => {
    setSelectedWord(prev => prev === word ? null : word);
  };

  const displayRows = useMemo(() => {
    if (selectedWord) {
      return data.processedRows.filter(row => 
        row.original.toLowerCase().includes(selectedWord.toLowerCase())
      );
    }
    return data.processedRows.slice(0, 8); // Default preview limit
  }, [data.processedRows, selectedWord]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Analysis for <span className="font-medium text-slate-700">{fileName}</span> • {data.totalAnalyzed} responses processed
          </p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
                Upload New File
            </button>
            <button 
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-white bg-noelia-600 rounded-lg hover:bg-noelia-700 shadow-sm"
            >
                Export Report
            </button>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall Sentiment</h3>
                <Users className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sentimentChartData}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {sentimentChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as SentimentType] || '#ccc'} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 text-xs flex-wrap">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-noelia-500 mr-1"></div>Pos</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>Neg</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-accent-gold mr-1"></div>Urg</div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-1 md:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
                 <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Strategic Correlations</h3>
                 <Activity className="w-5 h-5 text-noelia-500" />
            </div>
            <ul className="space-y-3 mt-4">
                {data.keyCorrelations.map((corr, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent-purple flex-shrink-0" />
                        {corr}
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl shadow-sm border border-orange-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider">Churn Risk / Urgent</h3>
                 <AlertTriangle className="w-5 h-5 text-orange-600" />
             </div>
             <div className="text-4xl font-bold text-orange-700 mb-1">
                 {data.sentimentCounts[SentimentType.URGENT] || 0}
             </div>
             <p className="text-sm text-orange-600 mb-4">Critical flags detected requiring immediate attention.</p>
             <button className="text-xs font-semibold text-orange-700 bg-white/50 px-2 py-1 rounded hover:bg-white/80 transition-colors">
                 View Urgent Rows
             </button>
        </div>
      </div>

      {/* Heatmap & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <WordHeatmap 
            words={data.wordCloud} 
            onWordClick={handleWordClick}
            selectedWord={selectedWord}
         />
         
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-noelia-500" />
                Actionable Items
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[400px]">
                {data.actionItems.map((item, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-lg hover:border-noelia-200 transition-colors bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                item.priority === 'High' ? 'bg-red-100 text-red-700' :
                                item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {item.priority}
                            </span>
                            <span className="text-xs text-slate-400 uppercase font-semibold">{item.department}</span>
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Opportunities & Marketing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent-gold" />
                New Business Opportunities
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
                {data.opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:bg-noelia-50/20 transition-colors">
                        <h4 className="font-semibold text-slate-800 mb-2">{opp.title}</h4>
                        <p className="text-sm text-slate-600 mb-3">{opp.description}</p>
                        <div className="flex items-center text-xs font-medium text-slate-500">
                            Potential Impact: 
                            <span className={`ml-2 px-1.5 py-0.5 rounded ${
                                opp.potentialRevenueImpact === 'High' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {opp.potentialRevenueImpact}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-gradient-to-b from-accent-purple/5 to-white p-6 rounded-xl shadow-sm border border-indigo-50">
            <h3 className="text-lg font-semibold text-accent-purple mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-purple" />
                Marketing Hooks
            </h3>
            <p className="text-xs text-slate-500 mb-4">Ad copy generated from positive feedback.</p>
            <div className="space-y-4">
                {data.marketingHooks.map((hook, idx) => (
                    <div key={idx} className="relative p-4 bg-white rounded-lg border border-slate-100 italic text-slate-700 text-sm shadow-sm">
                        "{hook}"
                        <div className="absolute -top-2 -left-2 text-4xl text-accent-purple opacity-20 font-serif">“</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Data Grid Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">Analysis Details</h3>
                  {selectedWord ? (
                       <span className="flex items-center gap-2 px-3 py-1 bg-noelia-100 text-noelia-700 rounded-full text-xs font-medium border border-noelia-200">
                           <Filter className="w-3 h-3" />
                           Contains: "{selectedWord}"
                           <button onClick={() => setSelectedWord(null)} className="hover:text-noelia-900 ml-1">
                               <X className="w-3 h-3" />
                           </button>
                       </span>
                  ) : (
                      <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">Preview Mode</span>
                  )}
              </div>
          </div>
          <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500">
                      <tr>
                          <th className="px-6 py-3">Sentiment</th>
                          <th className="px-6 py-3">Comment Preview</th>
                          <th className="px-6 py-3">Category</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {displayRows.length > 0 ? (
                        displayRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-6 py-3 whitespace-nowrap">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                      row.sentiment === 'Positive' ? 'bg-noelia-500' :
                                      row.sentiment === 'Negative' ? 'bg-red-500' :
                                      row.sentiment === 'Urgent' ? 'bg-orange-500' :
                                      row.sentiment === 'Insightful' ? 'bg-accent-purple' : 'bg-slate-400'
                                  }`}></span>
                                  {row.sentiment}
                              </td>
                              <td className="px-6 py-3 max-w-lg" title={row.original}>
                                  <div className="line-clamp-2">{row.original}</div>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{row.category}</span>
                              </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                                <p>No comments found containing <span className="font-semibold">"{selectedWord}"</span></p>
                                <button onClick={() => setSelectedWord(null)} className="text-noelia-600 hover:underline mt-2 text-xs">Clear filter</button>
                            </td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 mt-auto">
              {selectedWord 
                ? `Showing ${displayRows.length} matches found`
                : "Showing top 8 most relevant rows. Full export available."
              }
          </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 20px;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;