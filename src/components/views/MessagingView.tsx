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
  MessageSquare,
  Building,
  Plus,
  X,
  CheckCircle,
} from 'lucide-react';

export const MessagingView: React.FC = () => {
  const {
    conversations,
    sendMessage,
    selectedPet,
    pets,
    clinics,
    startOrGetConversationWithClinic,
    currentCountry,
  } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ type: 'image' | 'record'; name: string } | null>(null);
  const [clinicPickerOpen, setClinicPickerOpen] = useState(false);
  const [selectedPetForChat, setSelectedPetForChat] = useState<string>(selectedPet?.id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep active conversation synced
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

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

  const handleStartConversation = (clinicId: string) => {
    const targetPetId = selectedPetForChat || selectedPet?.id || (pets[0]?.id || 'general');
    const newId = startOrGetConversationWithClinic(clinicId, targetPetId);
    setActiveConvId(newId);
    setClinicPickerOpen(false);
  };

  const activePetName = activeConv?.petName || selectedPet?.name || 'our pet';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Direct Veterinary Messaging Portal
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time direct communication with attending veterinarians and clinic desks across {currentCountry.name}.
          </p>
        </div>
        <button
          onClick={() => setClinicPickerOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Message a Clinic</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden h-[680px] grid grid-cols-1 md:grid-cols-3">
        {/* Left Column: Conversations List */}
        <div className="border-r border-stone-200 flex flex-col h-full bg-stone-50/50">
          <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase text-stone-500">Clinic Inboxes</h2>
              <div className="text-[11px] text-stone-400 mt-0.5">Encrypted Direct Channels</div>
            </div>
            <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
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
                      <p className="text-xs text-stone-500 truncate mt-1">
                        {conv.lastMessage || 'Channel active'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-stone-400 space-y-2">
                <Building className="w-8 h-8 mx-auto text-stone-300" />
                <p className="font-semibold text-stone-600">No Clinic Chats Yet</p>
                <p className="text-[11px]">Click below to open a direct channel with any accredited hospital.</p>
              </div>
            )}
          </div>

          {/* Start New Thread button */}
          <div className="p-3 border-t border-stone-200 bg-white">
            <button
              onClick={() => setClinicPickerOpen(true)}
              className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-teal-700" />
              <span>Message Another Clinic</span>
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
                    End-to-End Real-Time Veterinary Channel
                  </span>
                </div>

                {activeConv.messages.length > 0 ? (
                  activeConv.messages.map((msg) => {
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
                  })
                ) : (
                  <div className="py-12 text-center text-stone-400 text-xs space-y-1">
                    <p className="font-semibold text-stone-600">Start of conversation with {activeConv.clinicName}</p>
                    <p className="text-[11px]">Type your inquiry below to connect with veterinary staff in real time.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Clinical Prompts */}
              <div className="px-4 py-2 border-t border-stone-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-stone-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Ask:
                </span>
                <button
                  onClick={() => handleQuickPrompt(`Checking on ${activePetName}'s post-vaccine hydration and recovery status.`)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition cursor-pointer"
                >
                  Post-vaccine status
                </button>
                <button
                  onClick={() => handleQuickPrompt(`Could we request an authorized prescription refill for ${activePetName}?`)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition cursor-pointer"
                >
                  Prescription refill
                </button>
                <button
                  onClick={() => handleQuickPrompt('Sending updated photo of the incision / paw healing nicely.')}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition cursor-pointer"
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
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer"
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
                        name: 'patient_recovery_photo.jpg',
                      })
                    }
                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    title="Attach Photo"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachedFile({
                        type: 'record',
                        name: 'vaccine_passport_record.pdf',
                      })
                    }
                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
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
                    className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition shadow-xs cursor-pointer"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-base font-bold text-stone-900">Real-Time Veterinary Messaging</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Start a direct encrypted channel with accredited animal hospitals and trauma centers in the Philippines.
                </p>
              </div>
              <button
                onClick={() => setClinicPickerOpen(true)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                + Select a Clinic to Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clinic Selection Modal for New Conversations */}
      {clinicPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Choose a Hospital or Clinic</h3>
                  <p className="text-[11px] text-stone-500">Accredited veterinary network in the Philippines</p>
                </div>
              </div>
              <button
                onClick={() => setClinicPickerOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pets.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1.5">
                  Regarding Patient:
                </label>
                <select
                  value={selectedPetForChat}
                  onChange={(e) => setSelectedPetForChat(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-teal-600"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} · {p.breed})
                    </option>
                  ))}
                  <option value="general">General Inquiries / No specific pet</option>
                </select>
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  onClick={() => handleStartConversation(clinic.id)}
                  className="p-3 rounded-2xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={clinic.image}
                      alt={clinic.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-teal-900 truncate">
                        {clinic.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">{clinic.address}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                        <span>★ {clinic.rating}</span>
                        <span>·</span>
                        <span className="text-teal-700 font-medium">
                          {clinic.emergencyAvailable ? '24/7 Emergency Active' : 'Regular Clinical Hours'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold shrink-0 group-hover:bg-teal-700">
                    Open Chat
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setClinicPickerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
