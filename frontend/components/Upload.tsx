"use client"

import { useState, useEffect } from "react"
import { Upload, AlertCircle, Info, FileText, Shield, Brain, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function Crisis() {
  const [isHovering, setIsHovering] = useState(false)
  const [animateBackground, setAnimateBackground] = useState(false)

  useEffect(() => {
    // Start background animation after component mounts
    setAnimateBackground(true)
  }, [])

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

      <div className="max-w-4xl w-full mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block relative">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 text-blue-400 opacity-70"
            >
              <Sparkles size={40} />
            </motion.div>
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 mb-2">
              SuAlcide
            </h1>
          </div>
          <p className="text-xl text-blue-400 max-w-2xl mx-auto">
            AI-powered suicide risk detection in suicide hotline
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-2xl overflow-hidden border border-gray-800/50">
            <CardHeader className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-900/95">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900/30 p-2 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Upload Transcripts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload conversation transcripts for AI-assisted risk assessment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <motion.div
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                whileHover={{ scale: 1.01 }}
                className="border-2 border-dashed border-gray-700 rounded-lg p-10 bg-gray-900/50 hover:border-blue-500 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Hover effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovering ? 0.1 : 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                />

                <div className="flex flex-col items-center justify-center gap-4 text-center relative z-10">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className="h-16 w-16 rounded-full bg-blue-900/30 flex items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-blue-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Upload file</h3>
                    <p className="text-gray-400 mt-1">Drag or drop your files here or click to upload</p>
                    <p className="text-gray-500 text-sm mt-2">Supported formats: .txt, .doc, .docx, .pdf</p>
                  </div>
                  <Button className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-900/20 group">
                    Select Files
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-gray-800/50 p-6 bg-gray-900/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400">
                  All data is processed securely and confidentially. No personal information is stored longer than
                  necessary for analysis.
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid gap-6 md:grid-cols-2"
        >
          <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-xl border border-gray-800/50 hover:border-blue-900/50 transition-all duration-300">
            <CardHeader className="pb-2 border-b border-gray-800/30">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <div className="bg-blue-900/20 p-1.5 rounded">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-400">
                Our AI analyzes conversation patterns and language to identify potential risk factors, providing
                real-time guidance to crisis support professionals.
              </p>
              <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-xl border border-gray-800/50 hover:border-blue-900/50 transition-all duration-300">
            <CardHeader className="pb-2 border-b border-gray-800/30">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <div className="bg-blue-900/20 p-1.5 rounded">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                </div>
                Important Note
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-400">
                This tool is designed to assist trained professionals only. It should not replace human judgment or
                professional assessment in crisis situations.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-blue-400">Secure & Confidential</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center text-sm text-gray-500"
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
