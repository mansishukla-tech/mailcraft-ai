import {
  Mail,
  FileText,
  RefreshCw,
  SpellCheck,
  Smile,
} from "lucide-react";
import { MODES } from "../constants";
import { motion } from "framer-motion";

const ICONS = {
  email: Mail,
  letter: FileText,
  rewrite: RefreshCw,
  grammar: SpellCheck,
  tone: Smile,
};

export default function ModeTabs({ mode, onChange }) {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-3">

      {MODES.map((m) => {
        const active = m.id === mode;
        const Icon = ICONS[m.id];

        return (
          <motion.button
            key={m.id}
            whileHover={{
              y: -3,
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
            onClick={() => onChange(m.id)}
            className={[
              "relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300",

              active
                ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white shadow-[0_15px_40px_rgba(59,130,246,.35)]"
                : "border border-white/10 bg-white/10 text-slate-300 backdrop-blur-xl hover:bg-white/20 hover:text-white",
            ].join(" ")}
          >
            {active && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon size={17} />}
              {m.label}
            </span>
          </motion.button>
        );
      })}

    </div>
  );
} 