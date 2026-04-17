import { useState, useRef, useEffect } from 'react';
import { CURRICULUM, Lesson } from './constants';
import { 
  BookOpen, 
  MessageSquare, 
  Play, 
  Volume2, 
  Image as ImageIcon, 
  Terminal,
  Cpu,
  Loader2,
  X,
  Send,
  Zap,
  Sparkles,
  Code2,
  Copy,
  Check,
  RefreshCcw,
  Monitor,
  Download,
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateTTS, generateConceptImage, getChatMentor, getComplexExplanation, simulateCRun, generateQuiz } from './lib/gemini';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/themes/prism-tomorrow.css';

// Custom Highlighter Component
const CodeBlock = ({ code, language = 'c', className = "" }: { code: string; language?: string; className?: string }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <pre className={`line-numbers ${className} !bg-transparent !m-0 !p-0`}>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};

export default function App() {
  const [viewMode, setViewMode] = useState<'learn' | 'playground'>('learn');
  const [currentLesson, setCurrentLesson] = useState<Lesson>(CURRICULUM[0]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isProLoading, setIsProLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [proExplanation, setProExplanation] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Quiz State
  const [quiz, setQuiz] = useState<any>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Progress State
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Playground state
  const [playgroundCode, setPlaygroundCode] = useState(CURRICULUM[0].codeExample || "");
  const [playgroundOutput, setPlaygroundOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('c-master-progress');
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('c-master-progress', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    Prism.highlightAll();
  }, [currentLesson, viewMode]);

  const toggleComplete = (id: string) => {
    setCompletedLessons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setPlaygroundOutput("");
    try {
      const result = await simulateCRun(playgroundCode);
      setPlaygroundOutput(result || "Pas de sortie générée.");
    } catch (err) {
      setPlaygroundOutput("Erreur lors de la simulation de l'exécution.");
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(playgroundCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([playgroundCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "master.c";
    document.body.appendChild(element);
    element.click();
  };

  const handleQuiz = async () => {
    setIsQuizLoading(true);
    setQuiz(null);
    setSelectedOption(null);
    setQuizFeedback(null);
    const data = await generateQuiz(currentLesson.title, currentLesson.content);
    setQuiz(data);
    setIsQuizLoading(false);
  };

  const handleQuizSubmit = (index: number) => {
    setSelectedOption(index);
    if (index === quiz.correctIndex) {
      setQuizFeedback("Correct ! " + quiz.explanation);
      if (!completedLessons.includes(currentLesson.id)) {
        toggleComplete(currentLesson.id);
      }
    } else {
      setQuizFeedback("Incorrect. Essayez encore !");
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await getChatMentor(messages, chatInput);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "Je n'ai pas pu générer de réponse." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTTS = async () => {
    if (isTTSLoading) return;
    setIsTTSLoading(true);
    const audioUrl = await generateTTS(currentLesson.content);
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
    setIsTTSLoading(false);
  };

  const handleGenerateVisual = async () => {
    setIsImageLoading(true);
    setGeneratedImageUrl(null);
    const url = await generateConceptImage(`Visual representation of ${currentLesson.title} in C programming: ${currentLesson.content}`, imageSize);
    setGeneratedImageUrl(url);
    setIsImageLoading(false);
  };

  const handleProExplain = async () => {
    setIsProLoading(true);
    setProExplanation(null);
    const explanation = await getComplexExplanation(currentLesson.title);
    setProExplanation(explanation);
    setIsProLoading(false);
  };

  const progressPercentage = Math.round((completedLessons.length / CURRICULUM.length) * 100);

  return (
    <div className="flex h-screen bg-[#0D1117] text-gray-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <audio ref={audioRef} hidden />

      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-800 bg-[#161B22] flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
              <Cpu size={24} className="text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">C-Master</h1>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-800">
          <div className="bg-gray-800/50 rounded-xl p-3 mb-4 border border-gray-700">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
               <span>Progression</span>
               <span className="text-indigo-400">{progressPercentage}%</span>
             </div>
             <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-indigo-500" 
               />
             </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('learn')}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                viewMode === 'learn' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <BookOpen size={18} />
              <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Cours</span>
            </button>
            <button 
              onClick={() => setViewMode('playground')}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                viewMode === 'playground' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Code2 size={18} />
              <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">Playground</span>
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {['Bases', 'Logique', 'Fonctions', 'Tableaux', 'Pointeurs', 'Structs & Co', 'Mémoire', 'Avancé', 'E/S', 'Organisation'].map(category => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">{category}</h3>
              <div className="space-y-1">
                {CURRICULUM.filter(l => l.category === category).map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setProExplanation(null);
                      setGeneratedImageUrl(null);
                      setQuiz(null);
                      if (viewMode === 'learn') {
                        const main = document.getElementById('main-content');
                        if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group ${
                      currentLesson.id === lesson.id 
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {completedLessons.includes(lesson.id) ? (
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    ) : (
                      <BookOpen size={16} className="shrink-0 group-hover:text-indigo-400" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => setChatOpen(true)}
            className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <MessageSquare size={18} />
            <span>AI Mentor</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-y-auto bg-[#0D1117] relative">
        {viewMode === 'learn' ? (
          <div className="max-w-4xl mx-auto p-8 lg:p-16">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16 border-b border-gray-800 pb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold tracking-widest uppercase rounded-full border border-indigo-500/20">
                    {currentLesson.category}
                  </span>
                  {completedLessons.includes(currentLesson.id) && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold tracking-widest uppercase rounded-full border border-green-500/20 flex items-center gap-1">
                      <Award size={12} /> Complété
                    </span>
                  )}
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  {currentLesson.title}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleTTS}
                  disabled={isTTSLoading}
                  title="Lecture audio"
                  className="p-3 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl transition-all group"
                >
                  {isTTSLoading ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} className="text-gray-400 group-hover:text-white" />}
                </button>
                <button 
                  onClick={handleProExplain}
                  disabled={isProLoading}
                  className="flex items-center gap-2 px-5 py-3 bg-indigo-900/40 border border-indigo-700/50 hover:bg-indigo-900/60 rounded-xl transition-all text-sm font-bold group text-indigo-300"
                >
                  {isProLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-indigo-400" />}
                  Expertise Pro
                </button>
                <button 
                  onClick={handleGenerateVisual}
                  disabled={isImageLoading}
                  title="Générer un schéma technique"
                  className="p-3 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl transition-all group"
                >
                  {isImageLoading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} className="text-gray-400 group-hover:text-white" />}
                </button>
                <button 
                  onClick={() => toggleComplete(currentLesson.id)}
                  title={completedLessons.includes(currentLesson.id) ? "Marquer comme non-fait" : "Marquer comme terminé"}
                  className={`p-3 border rounded-xl transition-all group ${completedLessons.includes(currentLesson.id) ? 'bg-green-600/20 border-green-500 text-green-500' : 'bg-gray-800 border-gray-700 hover:border-green-500 text-gray-400'}`}
                >
                  <Check size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-16">
              {/* Content Description */}
              <section className="relative">
                <div className="absolute -left-8 top-0 bottom-0 w-1 bg-indigo-600/20 rounded-full" />
                <div className="prose prose-invert max-w-none">
                  <p className="text-2xl leading-relaxed text-gray-300 font-light font-serif">
                    {currentLesson.content}
                  </p>
                </div>
              </section>

              {/* Code Panel with Highlighting */}
              {currentLesson.codeExample && (
                <section className="group relative">
                  <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setPlaygroundCode(currentLesson.codeExample!);
                        setViewMode('playground');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold shadow-xl shadow-indigo-600/40 translate-y-2 group-hover:translate-y-0"
                    >
                      <Terminal size={14} /> Tester dans le Playground
                    </button>
                  </div>
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-[#161B22] border border-gray-800 rounded-md text-[10px] uppercase font-bold tracking-widest text-indigo-400 z-10 shadow-lg">
                    {currentLesson.id}.c
                  </div>
                  <div className="bg-[#05070a] rounded-3xl border border-gray-800/80 overflow-hidden shadow-2xl relative">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800/50 bg-[#0d1117]/50 backdrop-blur">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono ml-4 tracking-tighter italic">C SOURCE - PRISM HIGHLIGHTING</span>
                    </div>
                    <div className="p-8 font-mono text-base overflow-x-auto custom-scrollbar">
                      <CodeBlock code={currentLesson.codeExample} />
                    </div>
                  </div>
                </section>
              )}

              {/* Quiz Section */}
              <section className="border-t border-gray-800 pt-16">
                 {!quiz && !isQuizLoading ? (
                   <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-12 text-center">
                     <HelpCircle size={48} className="mx-auto text-gray-700 mb-6" />
                     <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Prêt pour un Quiz ?</h3>
                     <p className="text-gray-400 mb-8 max-w-sm mx-auto">Testez vos connaissances sur cette leçon avec un QCM généré instantanément par l'IA.</p>
                     <button 
                       onClick={handleQuiz}
                       className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                     >
                       Démarrer le Quiz
                     </button>
                   </div>
                 ) : isQuizLoading ? (
                   <div className="h-64 flex flex-col items-center justify-center gap-4 text-indigo-400 italic font-mono uppercase tracking-widest text-xs">
                     <Loader2 className="animate-spin" size={32} />
                     Génération du quiz IA...
                   </div>
                 ) : (
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 lg:p-12 shadow-2xl"
                   >
                     <div className="flex items-center gap-3 mb-8">
                       <HelpCircle size={28} className="text-indigo-400" />
                       <h3 className="text-2xl font-bold text-white tracking-tight">{quiz.question}</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {quiz.options.map((opt: string, i: number) => (
                         <button
                           key={i}
                           onClick={() => !selectedOption && handleQuizSubmit(i)}
                           disabled={selectedOption !== null}
                           className={`p-5 rounded-2xl text-left border-2 transition-all ${
                             selectedOption === null 
                               ? 'border-gray-800 bg-gray-800/30 hover:border-indigo-500/50 hover:bg-indigo-900/10 hover:translate-y-[-2px]' 
                               : i === quiz.correctIndex 
                                 ? 'border-green-500 bg-green-500/10 text-green-400 shadow-lg shadow-green-500/20' 
                                 : selectedOption === i 
                                   ? 'border-red-500 bg-red-500/10 text-red-400' 
                                   : 'border-gray-800 opacity-50'
                           }`}
                         >
                           <div className="flex items-center gap-4 text-lg">
                             <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                               {String.fromCharCode(65 + i)}
                             </div>
                             {opt}
                           </div>
                         </button>
                       ))}
                     </div>
                     <AnimatePresence>
                       {quizFeedback && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: 'auto', opacity: 1 }}
                           className={`mt-10 p-6 rounded-2xl border ${selectedOption === quiz.correctIndex ? 'bg-green-600/10 border-green-500/30 text-green-300' : 'bg-red-600/10 border-red-500/30 text-red-300'}`}
                         >
                           <div className="flex items-start gap-4">
                             <div className="p-2 rounded-full bg-white/10">
                               {selectedOption === quiz.correctIndex ? <Check size={20} /> : <X size={20} />}
                             </div>
                             <p className="text-lg leading-relaxed">{quizFeedback}</p>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </motion.div>
                 )}
              </section>

              {/* Visualizer and Pro Analysis (Reuse existing logic) */}
              <AnimatePresence>
                {isImageLoading || generatedImageUrl ? (
                  <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 overflow-hidden relative"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Zap size={20} className="text-yellow-400" />
                         </div>
                         <h3 className="text-xl font-bold text-white tracking-widest uppercase">Visualisation Conceptuelle</h3>
                      </div>
                      <div className="flex bg-gray-800 p-1 rounded-lg">
                         {(['1K', '2K', '4K'] as const).map(size => (
                           <button 
                              key={size}
                              onClick={() => setImageSize(size)}
                              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${imageSize === size ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                           >
                             {size}
                           </button>
                         ))}
                      </div>
                    </div>
                    <div className="relative aspect-auto min-h-[400px] bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800 shadow-inner">
                      {isImageLoading ? (
                        <div className="flex flex-col items-center gap-6">
                          <Loader2 className="animate-spin text-indigo-500" size={64} />
                          <div className="text-center">
                            <p className="text-indigo-400 font-bold animate-pulse text-lg mb-1 tracking-widest uppercase">Rendu de la scène technique...</p>
                            <p className="text-gray-600 text-sm font-mono tracking-tighter uppercase">Mode {imageSize} / Gemini Imaging Engine</p>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={generatedImageUrl!} 
                          className="max-w-full h-auto object-contain" 
                          referrerPolicy="no-referrer"
                          alt="Visualisation technique"
                        />
                      )}
                    </div>
                  </motion.section>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {isProLoading || proExplanation ? (
                  <motion.section 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-950/20 border border-indigo-500/30 rounded-3xl p-10 lg:p-14 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-4 mb-8 text-indigo-400">
                      <Sparkles size={32} />
                      <h3 className="text-3xl font-bold font-serif italic tracking-tight">Focus Expert : Profondeurs du Langage</h3>
                    </div>
                    {isProLoading ? (
                      <div className="py-20 flex flex-col items-center gap-6">
                        <div className="flex gap-3">
                          {[0, 1, 2].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                              }} 
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                              className="w-3 h-3 rounded-full bg-indigo-500" 
                            />
                          ))}
                        </div>
                        <p className="text-indigo-400/50 text-xs font-mono tracking-[0.3em] font-bold uppercase">Synthesising Advanced Data Model...</p>
                      </div>
                    ) : (
                      <div className="text-gray-300 leading-relaxed text-xl space-y-6 whitespace-pre-wrap font-serif selection:bg-indigo-500/50">
                        {proExplanation}
                      </div>
                    )}
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Playground View with Highlighted Output simulation */
          <div className="flex flex-col h-full bg-[#0D1117] overflow-hidden">
            <header className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0 bg-[#161B22]/50 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-2xl text-white shadow-xl shadow-green-600/20">
                  <Play size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">PLAYGROUND PRO</h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Environnement Isolé v3.1</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPlaygroundCode("#include <stdio.h>\n\nint main() {\n    printf(\"Bienvenue dans C-Master!\\n\");\n    return 0;\n}")}
                  className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all"
                  title="Réinitialiser"
                >
                  <RefreshCcw size={18} />
                </button>
                <button 
                  onClick={handleDownloadCode}
                  className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all"
                  title="Télécharger .c"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={copyCode}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-gray-700"
                >
                  {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  <span className="text-xs font-bold uppercase">Copier</span>
                </button>
                <button 
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-3 px-8 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black transition-all shadow-xl shadow-green-600/20 active:scale-95 disabled:opacity-50"
                >
                  {isRunning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                  RUN
                </button>
              </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
              {/* Editor */}
              <div className="flex flex-col border-r border-gray-800 bg-[#0d1117] relative">
                <div className="flex items-center justify-between px-6 py-3 bg-[#11161e] border-b border-gray-800 text-[10px] uppercase tracking-widest font-bold text-gray-500 shadow-sm shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-indigo-400" />
                    <span>main.c</span>
                  </div>
                  <span className="font-mono">{playgroundCode.split('\n').length} lignes</span>
                </div>
                <div className="flex-1 relative group bg-[#0d1117] h-full overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d1117]/50 border-r border-gray-800 flex flex-col items-center pt-8 text-[11px] font-mono text-gray-700 select-none z-10">
                     {Array.from({length: Math.max(playgroundCode.split('\n').length, 50)}).map((_, i) => (
                       <div key={i} className="h-6 flex items-center">{i+1}</div>
                     ))}
                   </div>
                   <textarea 
                    value={playgroundCode}
                    onChange={(e) => setPlaygroundCode(e.target.value)}
                    spellCheck={false}
                    className="absolute inset-0 pl-16 pr-8 pt-8 font-mono text-base bg-transparent border-none focus:ring-0 text-indigo-300 resize-none leading-6 h-full w-full z-20 custom-scrollbar scroll-smooth"
                    placeholder="// Écrivez votre code C maître ici..."
                  />
                </div>
              </div>

              {/* Console Output */}
              <div className="flex flex-col bg-[#010409]">
                <div className="flex items-center justify-between px-6 py-3 bg-black border-b border-gray-800 text-[10px] uppercase tracking-widest font-bold text-gray-500 shrink-0">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-green-500" />
                    <span>Sortie Console</span>
                  </div>
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    LIVE
                  </span>
                </div>
                <div className="flex-1 p-10 font-mono text-base text-green-400 overflow-y-auto whitespace-pre-wrap selection:bg-green-500/20 custom-scrollbar leading-7">
                  {isRunning ? (
                    <div className="flex flex-col gap-6">
                       <p className="text-gray-600 opacity-50 animate-pulse">$ gcc -Wall main.c -o current_app && ./current_app</p>
                       <div className="flex items-center gap-3 text-indigo-400 font-black italic">
                          <Loader2 className="animate-spin" size={24} />
                          ALGORITHME IA EN PARCOURS...
                       </div>
                    </div>
                  ) : playgroundOutput ? (
                    <div className="space-y-6">
                       <p className="text-gray-700 select-none font-bold">$ ./main.exe</p>
                       <div className="text-green-400 p-4 border-l-4 border-green-500 bg-green-500/5 rounded-r-xl">
                          {playgroundOutput}
                       </div>
                       <p className="text-[10px] text-gray-600 pt-8 font-bold border-t border-gray-900">PROCESS COMPLETED IN 0.04s - EXIT CODE 0</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <Terminal size={64} className="text-gray-800 mb-6 opacity-40" />
                      <p className="text-gray-700 font-black text-sm uppercase tracking-[0.3em]">En attente d'exécution...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Bot Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0d1117] border-l border-indigo-500/20 shadow-[0_0_100px_rgba(79,70,229,0.2)] z-50 flex flex-col"
            >
              <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-[#161B22]/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                    <Cpu size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-xl tracking-tight">MENTOR EXPERT C</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">IA Active / Gemini 3.1</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-3 hover:bg-gray-800 rounded-2xl transition-all text-gray-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="p-6 bg-indigo-600/10 rounded-full mb-6">
                      <MessageSquare size={64} className="text-indigo-600" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Comment puis-je vous aider ?</h4>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Je connais chaque ligne de la norme C11. Posez-moi vos questions les plus complexes.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-5 rounded-3xl text-base leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/20' 
                        : 'bg-gray-800/80 border border-gray-700 text-gray-100 rounded-tl-none backdrop-blur shadow-xl'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/80 p-5 rounded-3xl rounded-tl-none border border-gray-700 flex gap-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div id="chat-end" />
              </div>

              <div className="p-8 border-t border-gray-800 bg-[#0d1117]">
                <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl focus-within:border-indigo-500 transition-all shadow-inner focus-within:shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                  <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre question technique ici..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-base text-white px-2 placeholder:text-gray-600"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
        
        pre[class*="language-"] {
          background: transparent !important;
          margin: 0 !important;
          text-shadow: none !important;
        }
        code[class*="language-"] {
          background: transparent !important;
          text-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
