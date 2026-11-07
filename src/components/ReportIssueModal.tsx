import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  IssueCategory,
  AIAnalysisResult,
  DuplicateCheckResult,
  PriorityBreakdown
} from '../types/index.ts';
import { InteractiveMap } from './InteractiveMap.tsx';
import {
  X,
  UploadCloud,
  Camera,
  MapPin,
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  Info,
  Loader2
} from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: IssueCategory[] = [
  'Road Damage',
  'Garbage Overflow',
  'Water Leakage',
  'Drainage Blockage',
  'Streetlight Failure',
  'Public Infrastructure Damage',
  'Water Stagnation',
  'Other Civic Issues'
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Road Damage');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    landmark?: string;
  }>({
    latitude: 12.9719,
    longitude: 77.6412,
    address: '100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    landmark: 'Near 12th Main Junction'
  });

  // AI & Processing States
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | null>(null);
  const [priorityPreview, setPriorityPreview] = useState<PriorityBreakdown | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'kn'>('en');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceClarification, setVoiceClarification] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech Recognition for voice reporting
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = voiceLanguage === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        processVoiceDraft(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [voiceLanguage]);

  // Priority prediction update on field changes
  useEffect(() => {
    if (title.length > 3) {
      api.predictPriority({
        category,
        title,
        description: description || title,
        safetyRisk: aiAnalysis?.safetyRisk || 'Medium',
        populationDensity: 'High',
        supportCount: 1
      }).then(res => setPriorityPreview(res)).catch(() => {});
    }
  }, [title, category, description, aiAnalysis]);

  // Duplicate detection check
  useEffect(() => {
    if (location.latitude && location.longitude && category) {
      setIsCheckingDuplicate(true);
      api.detectDuplicates({
        latitude: location.latitude,
        longitude: location.longitude,
        category,
        title,
        description
      }).then(res => {
        setDuplicateCheck(res);
      }).catch(() => {}).finally(() => {
        setIsCheckingDuplicate(false);
      });
    }
  }, [location.latitude, location.longitude, category]);

  if (!isOpen) return null;

  // Handle Photo Upload & trigger AI Vision
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size must be under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImages(prev => [base64, ...prev]);

      // Run AI Computer Vision
      setIsAnalyzingImage(true);
      try {
        const result = await api.analyzeImage(base64, title || category);
        setAiAnalysis(result);
        if (result.category && CATEGORIES.includes(result.category)) {
          setCategory(result.category);
        }
        if (!title && result.detectedIssue) {
          setTitle(result.detectedIssue);
        }
        if (!description && result.explanation) {
          setDescription(result.explanation);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset Sample Images for Fast Testing
  const applyPresetImage = async (type: 'pothole' | 'sanitation') => {
    const url =
      type === 'pothole'
        ? '/src/assets/images/issue_pothole_detection_1794055372612.jpg'
        : '/src/assets/images/issue_sanitation_bin_1794055372976.jpg';

    setImages([url]);
    setIsAnalyzingImage(true);

    try {
      const mockResult = await api.analyzeImage(
        'data:image/jpeg;base64,preset',
        type === 'pothole' ? 'pothole asphalt road' : 'garbage waste overflow'
      );
      setAiAnalysis(mockResult);
      if (mockResult.category) setCategory(mockResult.category);
      setTitle(mockResult.detectedIssue);
      setDescription(mockResult.explanation);
    } catch {
      // Fallback
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLocation({
          latitude: lat,
          longitude: lng,
          address: `Current GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          city: 'Bengaluru',
          landmark: 'Auto-detected via GPS sensor'
        });
      },
      () => {
        setErrorMsg('Unable to retrieve your location. You can pick it on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Voice Assistant Flow
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          // Fallback simulation for environments without Web Speech API
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const simulatedText =
        voiceLanguage === 'kn'
          ? 'ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ಸರ್ಕಾರಿ ಶಾಲೆ ಹತ್ತಿರ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ ಮತ್ತು ನೀರು ನಿಂತಿದೆ.'
          : 'There is a deep road pothole near Indiranagar metro station causing two-wheelers to slip.';
      setVoiceTranscript(simulatedText);
      processVoiceDraft(simulatedText);
    }, 2500);
  };

  const processVoiceDraft = async (spokenText: string) => {
    setIsProcessingVoice(true);
    try {
      const draft = await api.voiceDraft(spokenText, voiceLanguage);
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.category && CATEGORIES.includes(draft.category as IssueCategory)) {
        setCategory(draft.category as IssueCategory);
      }
      if (draft.missingInformationPrompt) {
        setVoiceClarification(draft.missingInformationPrompt);
      }
    } catch {
      setTitle(spokenText.slice(0, 50));
      setDescription(spokenText);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an issue title');
      return;
    }
    if (!location.latitude || !location.longitude) {
      setErrorMsg('Please confirm issue location');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createComplaint({
        title,
        description: description || 'Civic issue reported via CivicPulse AI app.',
        category,
        images: images.length > 0 ? images : ['/src/assets/images/issue_pothole_detection_1794055372612.jpg'],
        location,
        citizenId: user?.id || 'user-cit-1',
        citizenName: user?.name || 'Keerthi Rao',
        citizenPhone: user?.phone || '+91 98451 22334',
        aiAnalysis: aiAnalysis || undefined
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Support duplicate complaint instead
  const handleSupportDuplicate = async () => {
    if (!duplicateCheck?.existingComplaint) return;
    try {
      await api.supportComplaint(duplicateCheck.existingComplaint.id, user?.id);
      onSuccess();
      onClose();
    } catch {
      setErrorMsg('Failed to endorse existing complaint');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Report a Civic Problem
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI computer vision auto-detects category, severity, and potential duplicates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Photo Upload & AI Vision */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                1. Infrastructure Photograph
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Sample test images:</span>
                <button
                  type="button"
                  onClick={() => applyPresetImage('pothole')}
                  className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  Pothole
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetImage('sanitation')}
                  className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                >
                  Garbage Bin
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-950/40 transition-colors"
              >
                <UploadCloud className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Click to upload complaint photograph
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG or WebP up to 8MB. YOLO & Gemini will immediately identify the hazard.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center max-h-64">
                  <img
                    src={images[0]}
                    alt="Uploaded Civic Problem"
                    referrerPolicy="no-referrer"
                    className="max-h-64 w-full object-contain"
                  />

                  {/* YOLO Bounding Box Overlay if detected */}
                  {aiAnalysis?.boundingBoxes && aiAnalysis.boundingBoxes.map((box, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                        border: '2px solid #3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        pointerEvents: 'none'
                      }}
                    >
                      <span className="absolute -top-5 left-0 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-semibold">
                        {box.label} ({box.confidence}%)
                      </span>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setImages([]);
                      setAiAnalysis(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Detection Summary Banner */}
                {isAnalyzingImage ? (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-3 text-xs text-blue-800 dark:text-blue-200">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Analyzing image with Computer Vision and YOLO Civic Model...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          AI Detection: {aiAnalysis.detectedIssue}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded">
                        {aiAnalysis.confidence}% Confidence
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {aiAnalysis.explanation}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Suggested Severity: <strong className="text-red-600 dark:text-red-400">{aiAnalysis.suggestedSeverity}</strong></span>
                      <span>·</span>
                      <span>Safety Risk: <strong className="text-slate-700 dark:text-slate-300">{aiAnalysis.safetyRisk}</strong></span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Section 2: AI Voice Assistant Option */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  AI Voice Assistant (English / ಕನ್ನಡ)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setVoiceLanguage('en')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    voiceLanguage === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLanguage('kn')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    voiceLanguage === 'kn'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ಕನ್ನಡ (Kannada)
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Listening... Click to stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Speak Issue Description</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Describe the problem aloud; AI auto-drafts the title, category & notes.
              </span>
            </div>

            {isProcessingVoice && (
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting civic parameters from speech...</span>
              </div>
            )}

            {voiceTranscript && (
              <p className="mt-2 text-xs italic text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                "{voiceTranscript}"
              </p>
            )}

            {voiceClarification && (
              <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-900 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{voiceClarification}</span>
              </div>
            )}
          </div>

          {/* Section 3: Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Deep Pothole on 100 Feet Road"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category (Citizen Verified) <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description & Hazards
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the problem, affected area, and immediate danger to pedestrians or vehicles..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Section 5: Location & Map Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                2. Geolocation & Street Address
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Detect GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="px-2.5 py-1 text-xs rounded-md bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {showLocationPicker ? 'Hide Map Picker' : 'Pick on Map'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                value={location.address}
                onChange={e => setLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address or junction"
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={location.landmark || ''}
                onChange={e => setLocation(prev => ({ ...prev, landmark: e.target.value }))}
                placeholder="Nearby Landmark (e.g. Near Metro Pillar 148)"
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {showLocationPicker && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <InteractiveMap
                  complaints={[]}
                  isPickerMode={true}
                  pickerCoords={{ latitude: location.latitude, longitude: location.longitude }}
                  onLocationPick={coords => {
                    setLocation(prev => ({
                      ...prev,
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      address: prev.address || coords.address || 'Selected Location'
                    }));
                  }}
                  height="260px"
                  showFilters={false}
                />
              </div>
            )}
          </div>

          {/* Section 6: Duplicate Alert Banner */}
          {duplicateCheck?.isDuplicateSuspected && duplicateCheck.existingComplaint && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Similar civic issue already reported nearby ({duplicateCheck.distanceMeters}m away)
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    <strong>#{duplicateCheck.existingComplaint.complaintNumber}</strong>: {duplicateCheck.existingComplaint.title}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    Status: <span className="font-semibold">{duplicateCheck.existingComplaint.status}</span> · Support Count: <span className="font-semibold">{duplicateCheck.existingComplaint.supportCount} citizens</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSupportDuplicate}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Support Existing Complaint (+1)</span>
                </button>
                <span className="text-xs text-amber-700 dark:text-amber-400">or proceed with your new report below.</span>
              </div>
            </div>
          )}

          {/* Section 7: Priority Engine Preview */}
          {priorityPreview && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Predicted Priority Score:
                </span>{' '}
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {priorityPreview.score}/100 ({priorityPreview.level})
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculated from safety hazard, public density, and category severity.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded font-bold text-[11px] ${
                  priorityPreview.level === 'Critical'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : priorityPreview.level === 'High'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {priorityPreview.level}
              </span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Logging Complaint...</span>
                </>
              ) : (
                <span>Submit Complaint</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
