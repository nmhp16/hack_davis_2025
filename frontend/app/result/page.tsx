"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming you have these
import { AlertCircle, Brain, CheckCircle, Languages, ListChecks, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'; // Example icons

// --- Use the same interface defined earlier ---
interface AnalysisResult {
  overall_risk_score: number;
  risk_category: string;
  language_patterns: {
    description: string;
    intensity_score: number;
  };
  risk_factors: {
    list: string[];
    prevalence_score: number;
  };
  protective_factors: {
    list: string[];
    strength_score: number;
  };
  emotional_state: {
    description: string;
    intensity_score: number;
  };
  key_excerpts: string[];
  ai_insights: string;
  recommended_actions: string[];
}
// -------------------------------------------

export default function ResultPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedResult = localStorage.getItem('analysisResult');
      if (storedResult) {
        const parsedResult = JSON.parse(storedResult);
        // Basic validation (optional but recommended)
        if (parsedResult && typeof parsedResult.overall_risk_score === 'number') {
           setResult(parsedResult);
        } else {
            setError("Invalid analysis data found.");
        }
        // Optional: Clear storage after reading if you don't need it again
        // localStorage.removeItem('analysisResult');
      } else {
        setError("No analysis data found. Please upload a file first.");
      }
    } catch (e) {
      console.error("Failed to load or parse analysis result:", e);
      setError("Failed to load analysis data.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading results...</div>;
  }

  if (error) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-red-400 p-4">
             <AlertCircle className="h-12 w-12 mb-4" />
             <p className="text-xl">{error}</p>
             <a href="/" className="mt-4 text-blue-400 hover:underline">Go back to upload</a>
        </div>
    );
  }

  if (!result) {
     // Should ideally be caught by the error state, but as a fallback
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">No results available.</div>;
  }

  // --- Dynamic Display Section ---
  // Use the 'result' state object here to render your UI
  // Example structure matching the image provided earlier:
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-950 to-gray-900 p-8 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Risk Assessment</h1>

      {/* Overall Score */}
      <Card className="mb-6 bg-gray-900/80 border-gray-700">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Overall Risk Score</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                result.risk_category === 'High' || result.risk_category === 'Critical' ? 'bg-red-600' :
                result.risk_category === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
            }`}>
                {result.risk_category} Risk
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold mb-2">{result.overall_risk_score}%</div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            {/* Simple progress bar - adjust colors based on score */}
            <div
              className={`progressBar ${
                result.overall_risk_score > 75 ? 'progressBarHigh' :
                result.overall_risk_score > 50 ? 'progressBarMedium' : 'progressBarLow'
              } progressBarWidth-${result.overall_risk_score}`}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Grid for other sections */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Language Patterns */}
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Languages className="text-blue-400"/> Language Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-3">{result.language_patterns.description}</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className={`bg-blue-500 h-2.5 rounded-full intensity-bar`} data-width={result.language_patterns.intensity_score}></div>
            </div>
            </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="text-yellow-400"/> Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-gray-300 mb-3">
                {result.risk_factors.list.length > 0 ? result.risk_factors.list.join(', ') : 'None explicitly mentioned.'}
             </p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className={`bg-yellow-500 h-2.5 rounded-full prevalence-bar`} data-width={result.risk_factors.prevalence_score}></div>
            </div>
          </CardContent>
        </Card>

        {/* Protective Factors */}
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-green-400"/> Protective Factors</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-gray-300 mb-3">
                {result.protective_factors.list.length > 0 ? result.protective_factors.list.join(', ') : 'Limited factors mentioned.'}
             </p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className={`bg-green-500 h-2.5 rounded-full width-${result.protective_factors.strength_score}`}></div>
            </div>
          </CardContent>
        </Card>

        {/* Emotional State */}
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="text-purple-400"/> Emotional State</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-3">{result.emotional_state.description}</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className={`bg-purple-500 h-2.5 rounded-full intensity-bar`} data-width={result.emotional_state.intensity_score}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Excerpts */}
      <Card className="mb-6 bg-gray-900/80 border-gray-700">
        <CardHeader>
          <CardTitle>Key Transcript Excerpts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.key_excerpts.length > 0 ? (
             result.key_excerpts.map((excerpt, index) => (
                <p key={index} className="bg-gray-800 p-3 rounded border border-gray-700 text-gray-300 italic">"{excerpt}"</p>
             ))
          ) : (
             <p className="text-gray-500">No specific excerpts highlighted by the analysis.</p>
          )}
        </CardContent>
      </Card>

       {/* AI Insights & Recommendations */}
       <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-blue-400"/> AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">{result.ai_insights}</p>
                </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks className="text-green-400"/> Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {result.recommended_actions.map((action, index) => (
                            <li key={index}>{action}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
       </div>

       <div className="mt-8 text-center">
            <a href="/" className="text-blue-400 hover:underline">Upload another file</a>
       </div>
    </div>
  );
}
