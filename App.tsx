import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Key, Lock, AlertCircle, LogOut, Settings, BarChart3, Shield } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { analyzeSurveyData } from './services/geminiService';
import { AppState, User } from './types';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    hasKey: false,
    isAnalyzing: false,
    data: null,
    fileName: null,
    error: null,
    currentView: 'workspace'
  });

  useEffect(() => {
    // Check for existing session
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setState(prev => ({ ...prev, user: currentUser }));
    }

    // Check for API key in environment
    if (process.env.API_KEY) {
      setState(prev => ({ ...prev, hasKey: true }));
    }
  }, []);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  const handleLogout = () => {
    authService.logout();
    setState(prev => ({ ...prev, user: null, data: null, fileName: null }));
  };

  const handleApiKeySelection = async () => {
    if ((window as any).aistudio) {
        try {
            await (window as any).aistudio.openSelectKey();
            setState(prev => ({ ...prev, hasKey: true }));
        } catch (e) {
            console.error("API Key selection failed", e);
            setState(prev => ({ ...prev, error: "Failed to select API key." }));
        }
    } else {
        setState(prev => ({ ...prev, error: "AI Studio environment not detected." }));
    }
  };

  const handleDataLoaded = async (comments: string[], fileName: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true, fileName, error: null }));
    
    try {
      const results = await analyzeSurveyData(comments);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        data: results 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: error.message || "An unexpected error occurred during analysis." 
      }));
    }
  };

  const handleReset = () => {
      setState(prev => ({ ...prev, data: null, fileName: null, error: null }));
  };

  const loadDemoData = () => {
      const demoComments = [
          "The new dashboard is incredibly fast, I love the layout!",
          "Customer support took 3 days to reply, this is unacceptable.",
          "I wish there was a dark mode feature.",
          "Pricing is too high for the value provided compared to Competitor X.",
          "Absolutely love the mobile app, works seamlessly.",
          "The export function is broken and crashes my browser.",
          "Can we get an integration with Slack?",
          "Sales team was very helpful during onboarding.",
          "The product is okay, but I'm thinking of cancelling due to bugs.",
          "Documentation is sparse and hard to understand."
      ];
      handleDataLoaded(demoComments, "Demo_Survey_Data.csv");
  };

  // 1. If not logged in, show Login
  if (!state.user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // 2. If logged in but no API Key (and supposed to be in workspace), prompt for key
  // We only require key for workspace, admin panel doesn't need Gemini
  const needsKey = state.currentView === 'workspace' && !state.hasKey;
  
  if (needsKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
           {/* Allow logout even if stuck on key screen */}
           <div className="absolute top-4 right-4">
              <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600">
                  <LogOut className="w-5 h-5" />
              </button>
           </div>
          <div className="bg-noelia-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-noelia-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Gemini Integration</h1>
          <p className="text-slate-500 mb-6">
            Welcome back, <strong>{state.user.name}</strong>.<br/>
            Please connect your Google Gemini API Key to proceed with analysis.
          </p>
          <button 
            onClick={handleApiKeySelection}
            className="w-full py-3 px-4 bg-noelia-600 hover:bg-noelia-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Key className="w-4 h-4" />
            Connect Gemini API
          </button>
          {state.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {state.error}
              </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-noelia-600 p-2 rounded-lg shadow-sm">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Noelia
                </span>
              </div>
              
              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                  <button 
                    onClick={() => setState(prev => ({ ...prev, currentView: 'workspace' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        state.currentView === 'workspace' 
                        ? 'bg-noelia-50 text-noelia-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                      <BarChart3 className="w-4 h-4" /> Workspace
                  </button>
                  {state.user.role === 'admin' && (
                    <button 
                        onClick={() => setState(prev => ({ ...prev, currentView: 'admin' }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            state.currentView === 'admin' 
                            ? 'bg-purple-50 text-purple-700' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Shield className="w-4 h-4" /> Admin Panel
                    </button>
                  )}
              </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-slate-800">{state.user.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{state.user.role}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                        {state.user.name.charAt(0)}
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {state.currentView === 'admin' && state.user.role === 'admin' ? (
            <AdminPanel />
        ) : (
            <>
                {state.error && (
                    <div className="max-w-4xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-red-800 font-medium">Analysis Failed</h3>
                            <p className="text-red-600 text-sm">{state.error}</p>
                            <button onClick={handleReset} className="mt-2 text-sm text-red-700 underline font-medium">Try Again</button>
                        </div>
                    </div>
                )}

                {!state.data ? (
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
                    <div className="text-center mb-10 max-w-3xl">
                        <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                            Voice of Customer <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-noelia-600 to-noelia-400">Intelligence Refined</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Noelia analyzes unstructured survey data to uncover revenue opportunities, 
                            predict churn, and categorize sentiment with precision.
                        </p>
                    </div>
                    
                    <FileUpload onDataLoaded={handleDataLoaded} isLoading={state.isAnalyzing} />
                    
                    {!state.isAnalyzing && (
                        <div className="mt-12 flex items-center gap-4">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Or try</span>
                            <button 
                                onClick={loadDemoData}
                                className="px-4 py-2 bg-white border border-slate-200 hover:border-noelia-300 text-slate-600 hover:text-noelia-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                            >
                                Load Demo Dataset
                            </button>
                        </div>
                    )}
                </div>
                ) : (
                <Dashboard data={state.data} fileName={state.fileName || 'Data'} onReset={handleReset} />
                )}
            </>
        )}
      </main>
    </div>
  );
};

export default App;