import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Paperclip,
  Image,
  Shield,
  Phone,
  FileText,
  Sparkles,
} from 'lucide-react';

export const MessagingView: React.FC = () => {
  const {
    conversations,
    sendMessage,
    selectedPet,
    clinics,
    startOrGetConversationWithClinic,
    currentCountry,
  } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ type: 'image' | 'record'; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    if (activeConv) {
      sendMessage(activeConv.id, inputText.trim() || 'Attached document', attachedFile || undefined);
      setInputText('');
      setAttachedFile(null);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Secure Veterinary Messaging Portal
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Direct encrypted communication with attending veterinarians and clinic desks in {currentCountry.name}.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden h-[680px] grid grid-cols-1 md:grid-cols-3">
        {/* Left Column: Conversations List */}
        <div className="border-r border-stone-200 flex flex-col h-full bg-stone-50/50">
          <div className="p-4 border-b border-stone-200 bg-white">
            <h2 className="text-xs font-bold uppercase text-stone-500">Clinic Inboxes</h2>
            <div className="text-[11px] text-stone-400 mt-0.5">Encrypted Direct Channels</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                    isSelected ? 'bg-white border-l-4 border-l-teal-600 shadow-xs' : 'hover:bg-white/80'
                  }`}
                >
                  <img
                    src={conv.clinicAvatar}
                    alt={conv.clinicName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{conv.clinicName}</h4>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">{conv.lastTimestamp}</span>
                    </div>
                    <div className="text-[10px] text-teal-700 font-medium mt-0.5">Patient: {conv.petName}</div>
                    <p className="text-xs text-stone-500 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start New Thread button */}
          <div className="p-3 border-t border-stone-200 bg-white">
            <button
              onClick={() => {
                if (selectedPet) {
                  const targetClinic = clinics[1] || clinics[0];
                  const newId = startOrGetConversationWithClinic(targetClinic.id, selectedPet.id);
                  setActiveConvId(newId);
                }
              }}
              className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition text-center"
            >
              + Message Another Clinic
            </button>
          </div>
        </div>

        {/* Right Column: Chat Window (2 cols) */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.clinicAvatar}
                    alt={activeConv.clinicName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900">{activeConv.clinicName}</h3>
                      <Shield className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Attending Desk · Patient: <strong>{activeConv.petName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${currentCountry.emergencyHotline.replace(/\D/g, '')}`}
                    className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition"
                    title="Direct Phone Line"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
                <div className="text-center my-2">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                    End-to-End Encrypted Veterinary Channel
                  </span>
                </div>

                {activeConv.messages.map((msg) => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {msg.attachment && (
                          <div
                            className={`mb-2 p-2 rounded-lg flex items-center gap-2 text-[11px] ${
                              isMe ? 'bg-teal-700 text-teal-100' : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="font-medium truncate">{msg.attachment.name}</span>
                          </div>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Clinical Prompts */}
              <div className="px-4 py-2 border-t border-stone-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-stone-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Ask:
                </span>
                <button
                  onClick={() => handleQuickPrompt("Checking on Mochi's post-vaccine hydration and rest status.")}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition"
                >
                  Post-vaccine status
                </button>
                <button
                  onClick={() => handleQuickPrompt("Could we request an authorized prescription refill for NexGard?")}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition"
                >
                  Prescription refill
                </button>
                <button
                  onClick={() => handleQuickPrompt("Sending updated photo of the incision / paw healing nicely.")}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition"
                >
                  Healing photo check
                </button>
              </div>

              {/* Message Composer */}
              <div className="p-3 border-t border-stone-200 bg-white">
                {attachedFile && (
                  <div className="mb-2 p-2 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
                    <span className="truncate">Attached: {attachedFile.name}</span>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAttachedFile({
                        type: 'image',
                        name: 'wound_healing_update.jpg',
                      })
                    }
                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                    title="Attach Photo"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachedFile({
                        type: 'record',
                        name: 'rabies_certificate.pdf',
                      })
                    }
                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                    title="Attach Health Record"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type medical inquiry or update for veterinary staff..."
                    className="flex-1 text-xs px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition shadow-xs"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-xs">
              Select a clinic conversation to view messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
