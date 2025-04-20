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

export default function ResultsPage({ onBack }: { onBack: () => void }) {
    const [animateBackground, setAnimateBackground] = useState(false)
    const [riskScore, setRiskScore] = useState(0)

    useEffect(() => {
        // Start background animation after component mounts
        setAnimateBackground(true)

        // Animate risk score
        const timer = setTimeout(() => {
            setRiskScore(78)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

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
                        <Button
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-gray-800 text-lg px-3 py-2 flex items-center gap-2"
                            onClick={() => window.location.href = '/'}
                        >
                            <ChevronLeft /> Back to Upload
                        </Button>
                        <p className="text-gray-400">
                            <Clock className="h-4 w-4 inline mr-1" /> Analyzed on {new Date().toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </p>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex md:col-span-2 justify-center"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Card className="border-blue-400 bg-gray-900/80 backdrop-blur-sm shadow-2xl overflow-hidden">
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
                                                <Badge className="bg-red-900/60 text-red-200 hover:bg-red-900/80 text-sm px-3 py-1">
                                                    High Risk
                                                </Badge>
                                            </div>
                                            <div className="relative pt-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <span className="text-sm font-semibold inline-block text-blue-400">{riskScore}%</span>
                                                    </div>
                                                </div>
                                                <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-800">
                                                    <motion.div
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: `${riskScore}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-yellow-500 via-red-500 to-red-700"
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-400 transform transition-transform duration-500 hover:scale-110">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageSquare className="h-5 w-5 text-blue-400" />
                                                <h4 className="text-base font-medium text-white">Language Patterns</h4>
                                            </div>
                                            <Progress value={85} className="h-2 bg-gray-800" indicatorClassName="bg-blue-500" />
                                            <p className="text-sm text-gray-400 mt-3">
                                                Detected concerning language patterns including expressions of hopelessness and finality.
                                            </p>
                                        </div>

                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-400 transform transition-transform duration-500 hover:scale-110">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                                                <h4 className="text-base font-medium text-white">Risk Factors</h4>
                                            </div>
                                            <Progress value={72} className="h-2 bg-gray-800" indicatorClassName="bg-amber-500" />
                                            <p className="text-sm text-gray-400 mt-3">
                                                Multiple risk factors identified including isolation, recent loss, and sleep disturbances.
                                            </p>
                                        </div>

                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-400 transform transition-transform duration-500 hover:scale-110">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="h-5 w-5 text-emerald-400" />
                                                <h4 className="text-base font-medium text-white">Protective Factors</h4>
                                            </div>
                                            <Progress value={25} className="h-2 bg-gray-800" indicatorClassName="bg-emerald-500" />
                                            <p className="text-sm text-gray-400 mt-3">
                                                Limited protective factors present. Some indication of family connections.
                                            </p>
                                        </div>

                                        <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-400 transform transition-transform duration-500 hover:scale-110">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Brain className="h-5 w-5 text-purple-400" />
                                                <h4 className="text-base font-medium text-white">Emotional State</h4>
                                            </div>
                                            <Progress value={88} className="h-2 bg-gray-800" indicatorClassName="bg-purple-500" />
                                            <p className="text-sm text-gray-400 mt-3">
                                                Significant emotional distress detected, including feelings of worthlessness and burden.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 bg-gray-900/60 rounded-lg p-4 border border-gray-800/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="h-5 w-5 text-blue-400" />
                                            <h4 className="text-base font-medium text-white">Key Transcript Excerpts</h4>
                                        </div>
                                        <div className="space-y-3 max-h-[180px]">
                                            <div className="bg-gray-400 rounded border-l-2 border-red-500">
                                                "I don't see the point anymore. Everyone would be better off without me."
                                            </div>
                                            <div className="bg-gray-400 p-3 rounded border-l-2 border-amber-500">
                                                "I've been thinking about how to end things. I've already started giving away my things."
                                            </div>
                                            <div className="bg-gray-400 p-3 rounded border-l-2 border-blue-500">
                                                "I haven't slept in three days. I can't stop thinking about everything I've done wrong."
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex md:col-span-2 justify-center"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-blue-400 bg-gray-900/80 backdrop-blur-sm shadow-xl">
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
                                        <div className="flex items-start gap-2">
                                            <div className="bg-red-900/20 p-1.5 rounded-full mt-0.5">
                                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white">Immediate Intervention</h4>
                                                <p className="text-sm text-gray-400">
                                                    This case requires immediate intervention. Do not leave the caller alone.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <div className="bg-blue-900/20 p-1.5 rounded-full mt-0.5">
                                                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white">Safety Planning</h4>
                                                <p className="text-sm text-gray-400">
                                                    Develop a concrete safety plan and remove access to means.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <div className="bg-blue-900/20 p-1.5 rounded-full mt-0.5">
                                                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white">Emergency Services</h4>
                                                <p className="text-sm text-gray-400">
                                                    Consider involving emergency services if unable to ensure safety.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-900/20 group">
                                        View Full Intervention Protocol
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-blue-400 bg-gray-900/80 backdrop-blur-sm shadow-xl">
                                <CardHeader className="pb-2 border-b border-gray-800/30">
                                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                                        <div className="bg-blue-900/20 p-1.5 rounded">
                                            <Brain className="h-4 w-4 text-blue-400" />
                                        </div>
                                        AI Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-gray-400">
                                        The conversation exhibits multiple high-risk indicators. The caller shows clear signs of suicidal
                                        ideation with a specific plan and timeline. Their language demonstrates hopelessness, perceived
                                        burdensomeness, and thwarted belongingness—all key factors in the interpersonal theory of suicide.
                                    </p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm text-blue-400">Confidence Level: 92%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>

                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-8 text-center text-sm text-gray-500"
                >
                    <div className="p-4 rounded-lg border border-gray-800/30 bg-gray-800 backdrop-blur-sm inline-block">
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
