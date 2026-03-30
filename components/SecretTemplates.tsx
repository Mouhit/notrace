"use client";
import { Wifi, Key, Code, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Template {
  id: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  content: string;
}

const TEMPLATES: Template[] = [
  {
    id: "wifi",
    icon: <Wifi className="w-3.5 h-3.5" />,
    label: "WiFi",
    title: "WiFi Credentials",
    content: "Network: \nPassword: \nSecurity: WPA2",
  },
  {
    id: "password",
    icon: <Key className="w-3.5 h-3.5" />,
    label: "Password",
    title: "Login Credentials",
    content: "Website: \nUsername: \nPassword: \n2FA Backup: ",
  },
  {
    id: "apikey",
    icon: <Code className="w-3.5 h-3.5" />,
    label: "API Key",
    title: "API Key",
    content: "Service: \nAPI Key: \nSecret: \nEnvironment: Production",
  },
  {
    id: "note",
    icon: <FileText className="w-3.5 h-3.5" />,
    label: "Private Note",
    title: "",
    content: "",
  },
];

interface TemplatesProps {
  onSelect: (title: string, content: string) => void;
}

export default function SecretTemplates({ onSelect }: TemplatesProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Use a template
      </button>

      {open && (
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                onSelect(tpl.title, tpl.content);
                setOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-card text-xs text-slate-400 hover:border-brand-border hover:text-brand transition-all duration-150"
            >
              {tpl.icon}
              {tpl.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
