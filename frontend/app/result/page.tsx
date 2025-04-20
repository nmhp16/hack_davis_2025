"use client"

import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, AlertCircle, BarChart3, Brain, CheckCircle, Languages, ListChecks, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Interface definition ---
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

export default function ResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [animateBackground, setAnimateBackground] = useState(false);

    // Function to handle going back
    const onBack = () => {
        router.push('/');
    };

    useEffect(() => {
        // Start background animation after component mounts
        setAnimateBackground(true);
    }, []);

    useEffect(() => {
        try {
            const storedResult = localStorage.getItem('analysisResult');
            if (storedResult) {
                const parsedResult = JSON.parse(storedResult);
                // Basic validation
                if (parsedResult && typeof parsedResult.overall_risk_score === 'number') {
                    setResult(parsedResult);
                } else {
                    setError("Invalid analysis data found.");
                }
            } else {
                setError("No analysis data found. Please upload a file first.");
            }
        } catch (e) {
            console.error("Failed to load or parse analysis result:", e);
            setError("Failed to load analysis data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading results...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-red-400 p-4">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p className="text-xl">{error}</p>
                <Button variant="link" className="mt-4 text-blue-400 hover:underline" onClick={onBack}>Go back to upload</Button>
            </div>
        );
    }

    if (!result) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">No results available.</div>;
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-950 to-gray-900 flex flex-col items-center justify-center p-4 md:p-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {animateBackground && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, x: -100, y: -100 }}
                            animate={{ opacity: 0.05, x: 0, y: 0 }}
                            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                            className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-blue-500 blur-[120px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 100, y: 100 }}
                            animate={{ opacity: 0.05, x: 0, y: 0 }}
                            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 2 }}
                            className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-indigo-500 blur-[100px]"
                        />
                    </>
                )}
            </div>

            <div className="max-w-5xl w-full mx-auto relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="inline-block relative">
                        <motion.div
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            className="absolute -right-12 text-blue-400 opacity-70"
                            >
                            <Sparkles size={40} />
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 mb-2">
                            Analysis Results
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800" onClick={onBack}>
                            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Upload
                        </Button>
                        <p className="text-gray-400">
                            <Clock className="h-4 w-4 inline mr-1" /> 
                            {(() => {
                                const now = new Date();
                                return `Analyzed on ${now.toLocaleDateString()} at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                            })()}
                        </p>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-2xl overflow-hidden border border-gray-800/50">
                            <CardHeader className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-900/95">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-900/30 p-2 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl text-white">Risk Assessment</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            AI-powered analysis of suicide risk indicators
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="p-[1px] rounded-lg relative animated-border w-full mb-6">
                                    <div className="bg-gray-900/80 rounded-lg p-5">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xl text-white font-medium">Overall Risk Score</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${result.risk_category === 'High' || result.risk_category === 'Critical' ? 'bg-red-600' :
                                                    result.risk_category === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                                                }`}>
                                                {result.risk_category} Risk
                                            </span>
                                        </div>
                                        <div className={`text-5xl font-bold mb-2 ${
                                            result.risk_category === 'High' || result.risk_category === 'Critical' ? 'text-red-500' :
                                            result.risk_category === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                        }`}>{result.overall_risk_score}%</div>
                                        <div className="w-full bg-gray-700 rounded-full h-4">
                                            <div
                                                style={{ width: `${result.overall_risk_score}%` }}
                                                className={`h-full rounded-full ${result.overall_risk_score > 75 ? 'bg-red-500' :
                                                        result.overall_risk_score > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grid for other sections */}
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    {/* Language Patterns */}
                                    <Card className="bg-gray-900/80 border-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-white">
                                                <Languages className="text-blue-400" /> Language Patterns
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-400 mb-3">{result.language_patterns.description}</p>
                                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-500 h-2.5 rounded-full"
                                                    style={{ width: `${result.language_patterns.intensity_score}%` }}
                                                ></div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Risk Factors */}
                                    <Card className="bg-gray-900/80 border-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-white">
                                                <AlertCircle className="text-yellow-400" /> Risk Factors
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-400 mb-3">
                                                {result.risk_factors.list.length > 0 ? result.risk_factors.list.join(', ') : 'None explicitly mentioned.'}
                                            </p>
                                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-yellow-500 h-2.5 rounded-full"
                                                    style={{ width: `${result.risk_factors.prevalence_score}%` }}
                                                ></div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Protective Factors */}
                                    <Card className="bg-gray-900/80 border-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-white">
                                                <ShieldCheck className="text-green-400 h-6 w-6" /> Protective Factors
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-400 mb-3">
                                                {result.protective_factors.list.length > 0 ? result.protective_factors.list.join(', ') : 'Limited factors mentioned.'}
                                            </p>
                                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-green-500 h-2.5 rounded-full"
                                                    style={{ width: `${result.protective_factors.strength_score}%` }}
                                                ></div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Emotional State */}
                                    <Card className="bg-gray-900/80 border-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-white">
                                                <Brain className="text-purple-400" /> Emotional State
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-400 mb-3">{result.emotional_state.description}</p>
                                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-purple-500 h-2.5 rounded-full"
                                                    style={{ width: `${result.emotional_state.intensity_score}%` }}
                                                ></div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Key Excerpts */}
                                <Card className="mb-6 bg-gray-900/80 border-gray-700 text-white">
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
                                            <CardTitle className="flex items-center gap-2 text-white">
                                                <Sparkles className="text-blue-400" /> AI Insights
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>   
                                            <div className="text-gray-300">
                                                {result.ai_insights.split(/(Confidence Level: \d+%)/).map((part, i) => {
                                                    if (part.match(/Confidence Level: \d+%/)) {
                                                        return (
                                                            <span 
                                                                key={i}
                                                                className={`font-semibold ${
                                                                    result.risk_category === 'High' || result.risk_category === 'Critical' 
                                                                        ? 'text-red-500' 
                                                                        : result.risk_category === 'Medium' 
                                                                            ? 'text-yellow-500' 
                                                                            : 'text-green-500'
                                                                }`}
                                                            >
                                                                {part}
                                                            </span>
                                                        );
                                                    }
                                                    return <Fragment key={i}>{part}</Fragment>;
                                                })}
                                            </div>
                                            </CardContent>
                                    </Card>
                                    <Card className="bg-gray-900/80 border-gray-700">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-white">
                                                <ListChecks className="text-green-400" /> Recommended Actions
                                            </CardTitle>
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

                                <motion.footer
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="mt-12 text-center text-sm text-gray-500"
                                >
                                    <div className="p-4 rounded-lg border border-gray-800/30 bg-gray-800 backdrop-blur-sm inline-block">
                                        <p>
                                            If you're experiencing a crisis, please call the National Suicide Prevention Lifeline:{" "}
                                            <span className="font-medium text-blue-400">988</span>
                                        </p>
                                    </div>
                                    <p className="mt-4">© 2025 CrisisVoice. All rights reserved.</p>
                                </motion.footer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
