"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, AlertCircle, Info, FileText, Shield, Brain, Sparkles, ChevronRight, File, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { motion } from "framer-motion"

// --- Define the structure of the expected analysis results ---
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
  ai_insights: string; // Assuming it includes confidence level as text
  recommended_actions: string[];
}
// -----------------------------------------------------------

export default function Crisis() {
  const [isHovering, setIsHovering] = useState(false)
  const [animateBackground, setAnimateBackground] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null); // Add state for results

  useEffect(() => {
    // Start background animation after component mounts
    setAnimateBackground(true)
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const file = files[0]
    // Validate file type
    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3') && !file.type.includes('text/plain') && !file.name.endsWith('.txt')) {
      setUploadError("Only MP3  or TXT files are supported")
      setSelectedFile(null)
      return
    }

    setUploadError(null)
    setSelectedFile(file)
    setUploadComplete(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsHovering(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsHovering(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsHovering(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const file = files[0]
    // Validate file type
    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3') && !file.type.includes('text/plain') && !file.name.endsWith('.txt')) {
      setUploadError("Only MP3  or TXT files are supported")
      setSelectedFile(null)
      return
    }

    setUploadError(null)
    setSelectedFile(file)
    setUploadComplete(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setAnalysisResult(null); // Clear previous results
    setUploadComplete(false);

    try {
      const formData = new FormData();

      // Different API endpoints and form field names based on file type
      const endpoint = selectedFile.name.endsWith('.txt') || selectedFile.type.includes('text/plain')
        ? 'http://localhost:8000/analyze-text-file'
        : 'http://localhost:8000/convert-audio-to-text';
      
      // Add the file to form data with the correct field name
      if (selectedFile.name.endsWith('.txt') || selectedFile.type.includes('text/plain')) {
        formData.append('file', selectedFile);
      } else {
        formData.append('audio_file', selectedFile);
      }

      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to get error details from backend response body
        let errorDetail = 'Upload failed';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || `Upload failed with status: ${response.status}`;
        } catch (parseError) {
          errorDetail = `Upload failed with status: ${response.status}`;
        }
        throw new Error(errorDetail);
      }

      // Handle the response data
      const data = await response.json();

      // Check if we have the expected structure
      if (data && typeof data.overall_risk_score === 'number') {
        // Store the analysis result in localStorage for the next page
        localStorage.setItem('analysisResult', JSON.stringify(data));
        setAnalysisResult(data);
        setUploadComplete(true);

        // Navigate to the results page after a short delay
        setTimeout(() => {
          window.location.href = '/result';
        }, 500);
      } else {
        console.error('Invalid analysis data in response:', data);
        setUploadError("Upload successful, but received invalid analysis format from server.");
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || "Failed to upload file. Please try again.");
      setUploadComplete(false);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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

      <div className="max-w-4xl w-full mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block relative">
            <motion.div
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute -right-12 text-blue-400 opacity-70"
            >
              <Sparkles size={40} />
            </motion.div>
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 mb-2">
              CrisisVoice
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
          <Card className="border-blue-400 bg-gray-900/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-gray-800/50 bg-gray-900/95">
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
              <input
                type="file"
                ref={fileInputRef}
                accept=".mp3,audio/mpeg,.txt,text/plain"
                onChange={handleFileChange}
                className="hidden"
                title="Upload an MP3 file"
              />

              <motion.div
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                whileHover={{ scale: 1.01 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-lg p-10 bg-gray-900/50 hover:border-blue-500 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Hover effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovering ? 0.1 : 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                />

                <div className="flex flex-col items-center justify-center gap-4 text-center relative z-10">
                  {!selectedFile ? (
                    <>
                      <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                        className="h-16 w-16 rounded-full bg-blue-900/30 flex items-center justify-center"
                      >
                        <Upload className="h-8 w-8 text-blue-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Select file</h3>
                        <p className="text-gray-400 mt-1">Drag or drop your file HERE or click 'Select File' to upload</p>
                        <p className="text-gray-500 text-sm mt-2">Supported format: .mp3, .txt</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-900/30 p-2 rounded-lg">
                            <File className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-white font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                            <p className="text-gray-500 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSelection();
                          }}
                          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800/50"
                          title="Clear selection"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {uploadError && (
                        <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm p-2 rounded-md flex items-center gap-2 mb-4">
                          <AlertCircle className="h-4 w-4" />
                          {uploadError}
                        </div>
                      )}

                      {uploadComplete && (
                        <div
                          className="clickable-div"
                        >
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpload(); // Just call handleUpload
                          }}
                          disabled={isUploading || uploadComplete}
                          className="flex-1 bg-indigo-700 hover:bg-blue-950 hover:text-gray-600 transition-colors"
                        >
                          {isUploading ? 'Processing...' : uploadComplete ? 'Redirecting...' : 'Upload & Analyze'}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="text-gray-900 bg-white hover:bg-gray-700 hover:text-gray-900 transition-colors"
                        >
                          Change File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {uploadError && !selectedFile && (
                <div className="mt-2 bg-red-900/20 border border-red-800 text-red-400 text-sm p-2 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {uploadError}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-gray-800/50 p-6 bg-gray-900/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400">
                  All data is processed securely and confidentially. Personally identifiable information is never stored. With organizational consent, anonymized data may be retained to improve system accuracy and support model retraining.
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
          <Card className="border-blue-400 bg-gray-900/80 backdrop-blur-sm shadow-xl hover:border-blue-900/50 duration-300">
            <CardHeader className="border-b border-gray-800/30">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <div className="bg-blue-900/20 p-1.5 rounded">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Our AI analyzes conversation patterns and language to identify potential suicide risk factors, providing
                meaningful insights to crisis support professionals.
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

          <Card className="border-blue-400 bg-gray-900/80 backdrop-blur-sm shadow-xl hover:border-blue-900/50 duration-300">
            <CardHeader className="pb-2 border-b border-gray-800/30">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <div className="bg-blue-900/20 p-1.5 rounded">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                </div>
                Important Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                This tool is designed to assist trained professionals only. It should not replace human judgment or
                professional assessment in crisis situations.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400">Secure & Confidential</span>
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
          <div className="p-4 rounded-lg border border-gray-800/30 bg-gray-800 backdrop-blur-sm inline-block">
            <p>
              If you're experiencing a crisis, please call the National Suicide Prevention Lifeline:{" "}
              <span className="font-medium text-blue-400">988</span>
            </p>
          </div>
          <p className="mt-4">© 2025 CrisisVoice. All rights reserved.</p>
        </motion.footer>
      </div>
    </div>
  )
}

