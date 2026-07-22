import { useRef, useState } from "react";
import Header from "./components/Header";
import ModeTabs from "./components/ModeTabs";
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import { streamGenerate } from "./lib/api";
import { motion } from "framer-motion";

const DEFAULT_FORM = {
  recipient: "",
  letterType: "formal",
  tone: "Professional",
  inputText: "",
};

export default function App() {
  const [mode, setMode] = useState("email");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);
  const lastRequestRef = useRef(null);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const runGeneration = async (payload) => {
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    lastRequestRef.current = payload;

    setIsLoading(true);
    setHasGenerated(true);
    setOutput("");
    setError("");

    try {
      await streamGenerate({
        ...payload,
        signal: controller.signal,
        onChunk: (chunk) =>
          setOutput((prev) => prev + chunk),
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(
          err.message ||
            "Something went wrong."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    runGeneration({
      mode,
      tone: form.tone,
      letterType: form.letterType,
      recipient: form.recipient,
      inputText: form.inputText,
    });
  };

  const handleRegenerate = () => {
    if (lastRequestRef.current) {
      runGeneration(lastRequestRef.current);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#0b1120] to-[#172554]">

  {/* Floating Orb 1 */}
  <div className="orb1 pointer-events-none absolute -top-40 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[170px]" />
  {/* Floating Orb 2 */}
  <div className="orb2 pointer-events-none absolute -bottom-24 -left-24 h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-[170px]" /> 

  {/* Floating Orb 3 */}
  <div className="orb3 pointer-events-none absolute top-32 -right-24 h-[450px] w-[450px] rounded-full bg-violet-500/20 blur-[170px]" /> 
  {/* Small Glow */}
  <div className="pointer-events-none absolute top-1/2 left-1/3 h-32 w-32 rounded-full bg-cyan-400/20 blur-[90px]" />

  {/* Small Glow */}
  <div className="pointer-events-none absolute bottom-24 right-1/4 h-24 w-24 rounded-full bg-indigo-400/20 blur-[70px]" /> 

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[180px]" />
      </div>

      <Header />

      <motion.main
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mx-auto -mt-2 max-w-6xl px-4 pb-12 sm:px-6"
      >
        {/* Glass Container */}
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">

          <ModeTabs
            mode={mode}
            onChange={handleModeChange}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

            <InputPanel
              mode={mode}
              form={form}
              setForm={setForm}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              error={error}
            />

            <OutputPanel
              output={output}
              isLoading={isLoading}
              hasGenerated={hasGenerated}
              onRegenerate={handleRegenerate}
              canRegenerate={!!lastRequestRef.current}
            />

          </div>
        </div>
      </motion.main>

      <footer className="relative z-10 py-10 text-center text-sm text-slate-400">
        © 2026 MailCraft AI • Powered by Gemini
      </footer>

    </div>
  );
} 