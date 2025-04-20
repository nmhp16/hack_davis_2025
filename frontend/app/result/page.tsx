"use client"

import { useState, useEffect } from "react"
import {
    AlertTriangle,
    Info,
    FileText,
    Shield,
    Brain,
    Sparkles,
    ChevronLeft,
    BarChart3,
    MessageSquare,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

// Define the data structure that matches the API response
interface AnalysisResult {
    overall_risk_score: number
    risk_category: "Low" | "Medium" | "High" | "Critical"
    language_patterns: {
        description: string
        intensity_score: number
    }
    risk_factors: {
        list: string[]
        prevalence_score: number
    }
    protective_factors: {
        list: string[]
        strength_score: number
    }
    emotional_state: {
        description: string
        intensity_score: number
    }
    key_excerpts: string[]
    ai_insights: string
    recommended_actions: string[]
    confidence_level?: string
}

// Helper function to get appropriate colors based on risk category
function getRiskCategoryColor(category: string) {
    switch (category) {
        case "Critical":
            return "bg-red-900/60 text-red-200 hover:bg-red-900/80"
        case "High":
            return "bg-orange-800/60 text-orange-200 hover:bg-orange-800/80"
        case "Medium":
            return "bg-yellow-700/60 text-yellow-200 hover:bg-yellow-700/80"
        case "Low":
            return "bg-green-800/60 text-green-200 hover:bg-green-800/80"
        default:
            return "bg-gray-700/60 text-gray-200 hover:bg-gray-700/80"
    }
}

// Helper function for progress bar colors
function getRiskScoreBarColor(category: string) {
    switch (category) {
        case "Critical":
            return "bg-red-600"
        case "High":
            return "bg-orange-500"
        case "Medium":
            return "bg-yellow-500"
        case "Low":
            return "bg-green-500"
        default:
            return "bg-blue-500"
    }
}

export default function ResultsPage({
    onBack,
    analysisData,
}: {
    onBack: () => void
    analysisData?: AnalysisResult
}) {
    const [animateBackground, setAnimateBackground] = useState(false)
    const [loading, setLoading] = useState(!analysisData)
    const [data, setData] = useState<AnalysisResult | null>(analysisData || null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Start background animation after component mounts
        setAnimateBackground(true)

        // If analysisData is provided as a prop, use it
        if (analysisData) {
            setData(analysisData)
            setLoading(false)
            return
        }

        // Otherwise fetch from API
        const fetchData = async () => {
            try {
                // Get the text from session storage or props
                const textToAnalyze = sessionStorage.getItem("transcriptText") ||
                    localStorage.getItem("transcriptText") ||
                    "Sample text for analysis";

                // Call your backend API directly with correct URL
                const response = await fetch("http://localhost:8000/gemini-analyze-text", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text: textToAnalyze }),
                });

                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                const responseData = await response.json();

                // Parse the generated_text field which contains the JSON
                if (responseData.generated_text) {
                    try {
                        // Extract clean JSON from response text (might contain code blocks)
                        const jsonContent = responseData.generated_text.replace(/```json|```/g, '').trim();
                        const parsedData = JSON.parse(jsonContent);
                        setData(parsedData);
                    } catch (parseError) {
                        console.error("Error parsing JSON:", parseError);
                        throw new Error("Failed to parse analysis data");
                    }
                } else {
                    setData(responseData); // In case the response is already parsed JSON
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error instanceof Error ? error.message : "Failed to load assessment");
                // Add fallback data for development if needed
            } finally {
                setLoading(false);
            }
        }

        fetchData()
    }, [analysisData])

    // Extract confidence level from AI insights if not explicitly provided
    const confidenceLevel =
        data?.confidence_level || (data?.ai_insights?.match(/Confidence Level: (\d+)%/) || [])[1] || "92"

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-950 to-gray-900 flex flex-col items-center justify-center p-4 md:p-8">
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
                            className="absolute -top-12 -right-12 text-blue-400 opacity-70"
                        >
                            <Sparkles size={40} />
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 mb-2">
                            Analysis Results
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <Button
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-gray-800 text-lg px-3 py-2 flex items-center gap-2"
                            onClick={onBack}
                        >
                            <ChevronLeft /> Back to Upload
                        </Button>
                        <p className="text-gray-400">
                            <Clock className="h-4 w-4 inline mr-1" /> Analyzed on{" "}
                            {new Date().toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                    </div>
                </motion.header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center p-6 bg-red-900/20 border border-red-800 rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                        <p className="text-red-400">{error}</p>
                        <Button className="mt-4" variant="outline" onClick={onBack}>
                            Return to Upload
                        </Button>
                    </div>
                ) : data ? (
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
                                                <Badge className={`${getRiskCategoryColor(data.risk_category)} text-sm px-3 py-1`}>
                                                    {data.risk_category} Risk
                                                </Badge>
                                            </div>
                                            <div className="relative pt-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <span className="text-sm font-semibold inline-block text-blue-400">
                                                            {data.overall_risk_score}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-800">
                                                    <motion.div
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: `${data.overall_risk_score}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getRiskScoreBarColor(
                                                            data.risk_category,
                                                        )}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/50 transform transition-transform duration-300 hover:scale-105">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageSquare className="h-5 w-5 text-blue-400" />
                                                <h4 className="text-base font-medium text-white">Language Patterns</h4>
                                            </div>
                                            <Progress
                                                value={data.language_patterns.intensity_score}
                                                className="h-2 bg-gray-800"
                                                indicatorClassName="bg-blue-500"
                                            />
                                            <p className="text-sm text-gray-400 mt-3">{data.language_patterns.description}</p>
                                        </div>

                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/50 transform transition-transform duration-300 hover:scale-105">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                                                <h4 className="text-base font-medium text-white">Risk Factors</h4>
                                            </div>
                                            <Progress
                                                value={data.risk_factors.prevalence_score}
                                                className="h-2 bg-gray-800"
                                                indicatorClassName="bg-amber-500"
                                            />
                                            <div className="space-y-1 mt-3">
                                                {data.risk_factors.list && data.risk_factors.list.length > 0 ? (
                                                    data.risk_factors.list.map((factor, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                                                            <span className="text-sm text-gray-300">{factor}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">No risk factors identified</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/50 transform transition-transform duration-300 hover:scale-105">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="h-5 w-5 text-emerald-400" />
                                                <h4 className="text-base font-medium text-white">Protective Factors</h4>
                                            </div>
                                            <Progress
                                                value={data.protective_factors.strength_score}
                                                className="h-2 bg-gray-800"
                                                indicatorClassName="bg-emerald-500"
                                            />
                                            <div className="space-y-1 mt-3">
                                                {data.protective_factors.list && data.protective_factors.list.length > 0 ? (
                                                    data.protective_factors.list.map((factor, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5" />
                                                            <span className="text-sm text-gray-300">{factor}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">Limited protective factors identified</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-800/50 transform transition-transform duration-300 hover:scale-105">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Brain className="h-5 w-5 text-purple-400" />
                                                <h4 className="text-base font-medium text-white">Emotional State</h4>
                                            </div>
                                            <Progress
                                                value={data.emotional_state.intensity_score}
                                                className="h-2 bg-gray-800"
                                                indicatorClassName="bg-purple-500"
                                            />
                                            <p className="text-sm text-gray-400 mt-3">{data.emotional_state.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 bg-gray-900/60 rounded-lg p-4 border border-gray-800/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="h-5 w-5 text-blue-400" />
                                            <h4 className="text-base font-medium text-white">Key Transcript Excerpts</h4>
                                        </div>
                                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
                                            {data.key_excerpts && data.key_excerpts.length > 0 ? (
                                                data.key_excerpts.map((excerpt, index) => {
                                                    // Alternate border colors for visual distinction
                                                    const borderColors = ["border-red-500", "border-amber-500", "border-blue-500"]
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`bg-gray-800/50 p-3 rounded border-l-2 ${borderColors[index % borderColors.length]
                                                                }`}
                                                        >
                                                            "{excerpt}"
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <p className="text-gray-400">No key excerpts available</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-xl border border-gray-800/50 hover:border-blue-900/50 transition-all duration-300 h-full">
                                    <CardHeader className="pb-2 border-b border-gray-800/30">
                                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                                            <div className="bg-red-900/20 p-1.5 rounded">
                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                            </div>
                                            Recommended Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            {data.recommended_actions && data.recommended_actions.length > 0 ? (
                                                data.recommended_actions.map((action, index) => {
                                                    // Use different icons based on action priority
                                                    const isHighPriority = index === 0
                                                    return (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <div
                                                                className={`${isHighPriority ? "bg-red-900/20" : "bg-blue-900/20"
                                                                    } p-1.5 rounded-full mt-0.5`}
                                                            >
                                                                {isHighPriority ? (
                                                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-white">{action}</h4>
                                                                <p className="text-sm text-gray-400">
                                                                    {index === 0 &&
                                                                        "This case requires immediate intervention. Do not leave the caller alone."}
                                                                    {index === 1 && "Develop a concrete safety plan and remove access to means."}
                                                                    {index === 2 && "Consider involving emergency services if unable to ensure safety."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <p className="text-gray-400">No recommended actions available</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-xl border border-gray-800/50 hover:border-blue-900/50 transition-all duration-300 h-full">
                                    <CardHeader className="pb-2 border-b border-gray-800/30">
                                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                                            <div className="bg-blue-900/20 p-1.5 rounded">
                                                <Brain className="h-4 w-4 text-blue-400" />
                                            </div>
                                            AI Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-gray-400">{data.ai_insights}</p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-blue-400" />
                                            <span className="text-sm text-blue-400">Confidence Level: {confidenceLevel}%</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-6">
                        <p className="text-red-400">No assessment data available</p>
                    </div>
                )}

                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-8 text-center text-sm text-gray-500"
                >
                    <div className="p-4 rounded-lg border border-gray-800/30 bg-gray-900/30 backdrop-blur-sm inline-block">
                        <p>
                            If you're experiencing a crisis, please call the National Suicide Prevention Lifeline:{" "}
                            <span className="font-medium text-blue-400">988</span>
                        </p>
                    </div>
                    <p className="mt-4">© 2025 SuAlcide. All rights reserved.</p>
                </motion.footer>
            </div>
        </div>
    )
}
