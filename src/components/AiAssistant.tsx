import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mic, ImagePlus, Leaf, MessageSquareText, X, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AI_API_URL = "http://127.0.0.1:5055/ai/assistant";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  diseaseInfo?: any;
};

export const AiAssistant = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [stagedImage, setStagedImage] = useState<File | null>(null);
  const [stagedImagePreview, setStagedImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎤 audio recording state
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, stagedImagePreview, loading]);

  const closeAssistant = () => {
    setIsOpen(false);
    setText("");
    setMessages([]);
    discardStagedImage();
  };

  const minimizeAssistant = () => {
    setIsOpen(false);
  };

  const discardStagedImage = () => {
    setStagedImage(null);
    if (stagedImagePreview) {
      URL.revokeObjectURL(stagedImagePreview);
    }
    setStagedImagePreview(null);
  };

  const handleSend = async () => {
    if (!text.trim() && !stagedImage) {
      return;
    }

    const currentText = text.trim();
    const currentImage = stagedImage;
    const currentPreview = stagedImagePreview;

    // Reset input
    setText("");
    setStagedImage(null);
    setStagedImagePreview(null);

    const userMsgId = Date.now().toString();
    const newMessages: Message[] = [...messages, {
      id: userMsgId,
      role: 'user',
      text: currentText,
      imageUrl: currentPreview || undefined,
    }];
    setMessages(newMessages);

    setLoading(true);

    if (currentImage) {
      // 🌿 User uploaded an image (and optionally typed text). 
      // Skip text evaluation, just do disease recognition.
      try {
        const formData = new FormData();
        formData.append("image", currentImage);

        const res = await fetch("http://127.0.0.1:5000/api/predict", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to recognize disease");

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          diseaseInfo: data,
        }]);
      } catch (error) {
        toast.error("Disease recognition service not reachable. Make sure it's running on port 5000.");
      } finally {
        setLoading(false);
      }
    } else {
      // 🤖 Text ONLY -> AI Assistant
      try {
        const formData = new FormData();
        formData.append("text", currentText);

        const res = await fetch(AI_API_URL, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        // If the AI updated the question (e.g., transcription), update the user message
        if (data.question && data.question !== currentText) {
           setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, text: data.question } : m));
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          text: data.answer,
          audioUrl: data.audio_url || undefined,
        }]);
      } catch {
        toast.error("AI service not reachable");
      } finally {
        setLoading(false);
      }
    }
  };

  // ------------------------
  // 🎤 START RECORDING
  // ------------------------
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      toast.error("Microphone not supported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendAudioToAI(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch {
      toast.error("Microphone permission denied");
    }
  };

  // ------------------------
  // ⏹ STOP RECORDING
  // ------------------------
  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  // ------------------------
  // AUDIO → AI
  // ------------------------
  const sendAudioToAI = async (audioBlob: Blob) => {
    setLoading(true);
    
    // Add a placeholder user message for audio
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      text: '🎤 (Voice message)'
    }]);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");

      const res = await fetch(AI_API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Update the user message to show the actual transcription instead of placeholder
      setMessages(prev => prev.map(m => 
        m.id === userMsgId ? { ...m, text: `🎤 ${data.question}` } : m
      ));

      // Append AI response
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: data.answer,
        audioUrl: data.audio_url || undefined,
      }]);
    } catch {
      toast.error("AI service not reachable");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // 🌿 RECOGNIZE DISEASE
  // ------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStagedImage(file);
    setStagedImagePreview(URL.createObjectURL(file));

    // Reset the file input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 🔴 Chat Window */}
      {isOpen && (
        <Card className={cn(
          "w-[350px] sm:w-[400px] shadow-2xl mb-4 transition-all duration-300 origin-bottom-right flex flex-col",
          "h-[500px] max-h-[80vh]",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" /> AI Farming Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={closeAssistant} className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive" title="Clear chat & close">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={minimizeAssistant} className="h-8 w-8 rounded-full" title="Minimize">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10">
                <MessageSquareText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Hello! How can I help you with your crops today?</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === 'user' ? "ml-auto" : "mr-auto"
                )}>
                  <div className={cn(
                    "p-3 rounded-lg text-sm",
                    msg.role === 'user' 
                      ? "bg-green-600 text-white rounded-br-none" 
                      : msg.diseaseInfo 
                        ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-bl-none text-black dark:text-gray-200"
                        : "bg-muted rounded-bl-none text-foreground"
                  )}>
                    {msg.role === 'assistant' && !msg.diseaseInfo && (
                      <p className="font-semibold mb-1 flex items-center gap-1 text-xs opacity-70">
                        🤖 AI:
                      </p>
                    )}
                    
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Uploaded crop" className="w-full h-auto rounded mb-2 max-h-40 object-cover" />
                    )}

                    {msg.text && (
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    )}
                    
                    {msg.audioUrl && (
                      <audio controls className="w-full mt-2 h-8">
                        <source src={msg.audioUrl} type="audio/mpeg" />
                      </audio>
                    )}

                    {msg.diseaseInfo && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold border-b border-green-200/50 pb-2">
                          <Leaf className="w-4 h-4" />
                          {msg.diseaseInfo.title}
                        </div>
                        <div className="text-xs space-y-2 text-gray-700 dark:text-gray-300">
                          <div>
                            <span className="font-semibold block mb-0.5">Description:</span>
                            <span className="opacity-90">{msg.diseaseInfo.description}</span>
                          </div>
                          <div>
                            <span className="font-semibold block mb-0.5">Prevention/Cure:</span>
                            <span className="opacity-90 whitespace-pre-line">{msg.diseaseInfo.prevent}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-3 border-t bg-background flex flex-col gap-2 rounded-b-xl">
            {stagedImagePreview && (
              <div className="relative inline-block self-start mb-1 bg-muted p-1 rounded">
                <img src={stagedImagePreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
                <button 
                  onClick={discardStagedImage}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 w-full">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading || recording}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Upload Image"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={loading || recording}
                  className="shrink-0 rounded-full h-9 w-9"
                  type="button"
                >
                  <ImagePlus className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              <Textarea
                placeholder="Ask or describe an image..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none min-h-[40px] max-h-[120px] rounded-xl flex-1 overflow-hidden"
                rows={1}
              />

              {text.trim() || stagedImage ? (
                <Button 
                  onClick={handleSend} 
                  disabled={loading} 
                  size="icon" 
                  className="shrink-0 rounded-full h-9 w-9 bg-green-600 hover:bg-green-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              ) : (
                <Button
                  variant={recording ? "destructive" : "outline"}
                  onClick={recording ? stopRecording : startRecording}
                  disabled={loading}
                  size="icon"
                  className={cn("shrink-0 rounded-full h-9 w-9", recording && "animate-pulse")}
                >
                  {recording ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}

      {/* 🟢 Floating Button */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-transform hover:scale-105"
        >
          <MessageSquareText className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};
