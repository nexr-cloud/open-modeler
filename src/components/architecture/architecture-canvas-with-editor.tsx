'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Loader2, RotateCcw, ZoomIn, ZoomOut, Code, Eye, AlertCircle, X, Maximize2, Minimize2 } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { PiCubeTransparentFill } from 'react-icons/pi'
import { NexrModeler, NexrModelerHandle } from '@nexr-cloud/modeler'


// Dynamic import for Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface Architecture {
  title: string
  architectureJson: any
}

interface ArchitectureCanvasWithEditorProps {
  architectures: Architecture[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  className?: string
  onClose?: () => void
  isStreaming?: boolean
}

export default function ArchitectureCanvasWithEditor({ architectures, selectedIndex, onSelectIndex, className, onClose, isStreaming }: ArchitectureCanvasWithEditorProps) {
  const current = architectures[selectedIndex] ?? architectures[0]
  const data = current?.architectureJson
  const title = current?.title ?? 'Architecture Diagram'
  const cardRef = useRef<HTMLDivElement>(null)
  const modelerRef = useRef<NexrModelerHandle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const [jsonContent, setJsonContent] = useState<string>('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sync isFullscreen state with browser fullscreen events
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await cardRef.current?.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }, [])

  // Initialize JSON content when data changes
  useEffect(() => {
    if (data) {
      const formattedJson = JSON.stringify(data, null, 2)
      setJsonContent(formattedJson)
    }
  }, [data])

  // JSON Editor handlers
  const handleJsonChange = useCallback((value: string | undefined) => {
    if (value === undefined) return
    setJsonContent(value)

    // Validate JSON
    try {
      JSON.parse(value)
      setJsonError(null)
    } catch (e: any) {
      setJsonError(e.message)
    }
  }, [])

  // Component is now powered by NexrModeler
  const [isRendering, setIsRendering] = useState(false);

  const handleDownload = () => {
    if (showJsonEditor) {
      try {
        const jsonBlob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
        const jsonUrl = URL.createObjectURL(jsonBlob)
        const downloadLink = document.createElement('a')
        downloadLink.href = jsonUrl
        downloadLink.download = `${title}.json`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(jsonUrl)
        toast.success('Architecture JSON downloaded!')
      } catch (e) {
        toast.error('Failed to download JSON')
      }
    } else {
      // Delegate diagram download to the modeler component
      modelerRef.current?.downloadCanvas(title)
      toast.success('Architecture diagram download started!')
    }
  }

  return (
    <div ref={cardRef} className="w-full h-full">
      <Card className={`${className} w-full h-full border-none p-0 flex flex-col bg-background relative overflow-hidden rounded-none gap-0!`}>
        {/* Header */}
        <div className="p-3 h-16 border-b bg-muted/20 shrink-0 flex items-center justify-between z-20 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-md shrink-0">
              <PiCubeTransparentFill className="size-4 text-primary" />
            </div>
            {architectures.length > 1 ? (
              <Select
                value={String(selectedIndex)}
                onValueChange={(val) => onSelectIndex(Number(val))}
              >
                <SelectTrigger className="h-8 w-[180px] text-xs font-semibold border-none bg-background/60 shadow-sm">
                  <SelectValue placeholder="Select architecture" />
                </SelectTrigger>
                <SelectContent>
                  {architectures.map((arch, i) => (
                    <SelectItem key={i} value={String(i)} className="text-xs">
                      <span className="font-medium text-muted-foreground mr-1.5">#{i + 1}</span>
                      {arch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <h3 className="font-semibold text-sm line-clamp-1 tracking-tight">{title}</h3>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-md border shadow-sm text-[10px] font-bold">
              <Eye className={`size-3.5 ${!showJsonEditor ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="opacity-70">Diagram</span>
              <Switch
                checked={showJsonEditor}
                onCheckedChange={setShowJsonEditor}
                className="scale-75 data-[state=checked]:bg-primary"
              />
              <span className="opacity-70">JSON</span>
              <Code className={`size-3.5 ${showJsonEditor ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>

            <div className="w-px h-6 bg-border" />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="size-4" />
            </Button>

            {onClose && (
              <>
                <div className="w-px h-6 bg-border" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  title="Close preview"
                >
                  <X className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 bg-border overflow-hidden">
          {!showJsonEditor && (
            <TransformWrapper
              initialScale={0.5}
              initialPositionX={20}
              initialPositionY={20}
              minScale={0.1}
              maxScale={4}
              limitToBounds={false}
              wheel={{ step: 0.08 }}
              doubleClick={{ disabled: false }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Float Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => zoomIn()}
                    >
                      <ZoomIn className="size-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => zoomOut()}
                    >
                      <ZoomOut className="size-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => resetTransform()}
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  </div>

                  {isStreaming && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-background/40 backdrop-blur-[2px]">
                      <div className="p-4 bg-background/80 rounded-2xl shadow-xl flex flex-col items-center gap-3 border animate-in fade-in zoom-in duration-300">
                        <Loader2 className="animate-spin text-primary size-8" />
                        <p className="text-xs font-medium text-muted-foreground animate-pulse">Loading Architecture...</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 p-6">
                      <Alert variant="destructive" className="max-w-md shadow-2xl border-2 bg-destructive/10 backdrop-blur-md">
                        <AlertCircle className="size-5" />
                        <AlertDescription className="text-sm font-medium ml-2">{error}</AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <TransformComponent
                    wrapperStyle={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      cursor: 'grab',
                    }}
                    contentStyle={{
                      display: 'inline-block',
                    }}
                  >
                    <NexrModeler
                      ref={modelerRef}
                      provider="sap"
                      metaData={{ title }}
                      architectureJson={data}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          )}

          {showJsonEditor && (
            <div className="absolute inset-0 flex flex-col bg-[#1e1e1e] animate-in slide-in-from-right duration-300">
              <MonacoEditor
                height="100%"
                language="json"
                value={jsonContent}
                onChange={handleJsonChange}
                options={{
                  theme: 'vs-dark',
                  fontSize: 13,
                  lineHeight: 20,
                  padding: { top: 16 },
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                }}
              />
              {jsonError && (
                <div className="p-3 bg-red-500/10 text-red-400 text-[11px] border-t border-red-500/30 font-mono flex items-center gap-2">
                  <AlertCircle className="size-3 shrink-0" />
                  <span className="truncate">{jsonError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
