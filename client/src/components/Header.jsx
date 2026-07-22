import { Sparkles, ShieldCheck, Zap, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

const BADGES = [
  { icon: Zap, label: "Instant Drafts" },
  { icon: Wand2, label: "AI Tone Perfection" },
  { icon: ShieldCheck, label: "Private & Secure" },
];

export default function Header() {
  return (
    <header className="relative overflow-hidden">

      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#172554]" />

      {/* Glow 1 */}
      <div className="absolute left-1/2 top-[-180px] h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-cyan-500/25 blur-[140px]" />

      {/* Glow 2 */}
      <div className="absolute right-0 top-20 h-[280px] w-[280px] rounded-full bg-violet-500/20 blur-[120px]" />

      {/* Glow 3 */}
      <div className="absolute left-0 bottom-0 h-[250px] w-[250px] rounded-full bg-blue-500/15 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-14">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-cyan-200 backdrop-blur-md"
        >
          <Sparkles size={15}/>
          Powered by Google Gemini
        </motion.div>

        <motion.div
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:.2, duration:.8 }}
          className="mt-8 flex items-center gap-5"
        >

          <motion.div
  animate={{
    y:[0,-8,0]
  }}
  transition={{
    repeat:Infinity,
    duration:4,
    ease:"easeInOut"
  }}
  className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white shadow-[0_0_45px_rgba(59,130,246,.5)]"
>
            MC
          </motion.div> 

          <div>

            <h1 className="text-5xl font-black tracking-tight text-white">

              MailCraft{" "}

              <span className="animate-pulse bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent"> 
                AI

              </span>

            </h1>

            <motion.p
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ delay:.5 }}
              className="mt-3 max-w-xl text-lg leading-relaxed text-slate-300"
            >
              Create professional emails and letters with AI in seconds.
              Fast, elegant and incredibly smart.
            </motion.p>

          </div>

        </motion.div>

        <motion.div
  initial={{ opacity:0, y:30 }}
  animate={{
    opacity:1,
    y:0
  }}
  transition={{
    delay:.2,
    duration:.8
  }} 
          className="mt-10 flex flex-wrap gap-5"
        >

          {BADGES.map(({ icon: Icon, label }) => (

            <div
              key={label}
              className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-md"
            >
              <Icon size={16} className="text-cyan-300"/>
              {label}
            </div>

          ))}

        </motion.div>

      </div>

    </header>
  );
} 