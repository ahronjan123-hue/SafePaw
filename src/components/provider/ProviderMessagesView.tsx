import React, { useState } from 'react';
import { ProviderServiceType } from '../../types';
import {
  MessageSquare,
  Search,
  Send,
  CheckCircle,
  Paperclip,
  Phone,
  Video,
  Clock,
  Sparkles,
  User,
} from 'lucide-react';

interface ProviderMessagesViewProps {
  providerType: ProviderServiceType;
  onShowToast: (msg: string) => void;
}

export const ProviderMessagesView: React.FC<ProviderMessagesViewProps> = ({
  providerType,
  onShowToast,
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState('t-1');
  const [replyText, setReplyText] = useState('');

  // Domain-specific conversation threads
  const initialThreads = {
    veterinary_clinic: [
      {
        id: 't-1',
        sender: 'Jan Ahron Apilado',
        pet: 'Jervan',
        subject: 'Post-Deworming Observation',
        lastMessage: 'Good morning Dr. Santos, Jervan ate all his meal and his energy is back to normal!',
        time: '10:14 AM',
        unread: true,
        messages: [
          { sender: 'Dr. Santos (Clinic)', text: 'Hi Jan, how is Jervan doing after yesterday’s gastrointestinal deworming dose?', time: '09:30 AM', isMe: true },
          { sender: 'Jan Ahron Apilado', text: 'Good morning Dr. Santos, Jervan ate all his meal and his energy is back to normal!', time: '10:14 AM', isMe: false },
        ],
      },
      {
        id: 't-2',
        sender: 'Maria Lourdes Santos',
        pet: 'Rocky',
        subject: 'Bloodwork Chemistry Panel Ready',
        lastMessage: 'Thank you doctor! We will pick up the liver supplement this afternoon.',
        time: 'Yesterday',
        unread: false,
        messages: [
          { sender: 'Dr. Santos (Clinic)', text: 'Hello Maria, Rocky’s complete blood count is normal. Liver enzymes are slightly elevated so we recommend the milk thistle supplement.', time: 'Yesterday 3:00 PM', isMe: true },
          { sender: 'Maria Lourdes Santos', text: 'Thank you doctor! We will pick up the liver supplement this afternoon.', time: 'Yesterday 4:10 PM', isMe: false },
        ],
      },
    ],
    grooming_salon: [
      {
        id: 't-1',
        sender: 'Danica Tan',
        pet: 'Bella',
        subject: 'Styling Cut Ready for Pickup',
        lastMessage: 'I will be there in 15 minutes! Please give her the duck jerky treat.',
        time: '11:42 AM',
        unread: true,
        messages: [
          { sender: 'Paws & Bubbles Stylist', text: 'Hi Danica! Bella is all finished with her Asian Fusion trim and blueberry spa soak. She looks absolutely gorgeous and smells fresh!', time: '11:30 AM', isMe: true },
          { sender: 'Danica Tan', text: 'I will be there in 15 minutes! Please give her the duck jerky treat.', time: '11:42 AM', isMe: false },
        ],
      },
      {
        id: 't-2',
        sender: 'Erika Santos',
        pet: 'Kobe',
        subject: 'Double Coat Furminator Inquiries',
        lastMessage: 'Can Carlo do the show coat blowout next Saturday at 2 PM?',
        time: 'Yesterday',
        unread: false,
        messages: [
          { sender: 'Erika Santos', text: 'Can Carlo do the show coat blowout next Saturday at 2 PM?', time: 'Yesterday 5:20 PM', isMe: false },
          { sender: 'Paws & Bubbles Stylist', text: 'Hi Erika! Carlo has an open bay at 2:00 PM next Saturday. Slot is reserved for Kobe.', time: 'Yesterday 5:45 PM', isMe: true },
        ],
      },
    ],
    rescue_shelter: [
      {
        id: 't-1',
        sender: 'Joshua Ramos',
        pet: 'Bramble',
        subject: 'Adoption Meet & Greet Follow-up',
        lastMessage: 'We bought the dog bed and 15kg food bag ready! When can we bring Bramble home?',
        time: '10:05 AM',
        unread: true,
        messages: [
          { sender: 'Shelter Lead Bea', text: 'Hi Joshua! The adoption board approved your background and home inspection. Congratulations!', time: '09:50 AM', isMe: true },
          { sender: 'Joshua Ramos', text: 'We bought the dog bed and 15kg food bag ready! When can we bring Bramble home?', time: '10:05 AM', isMe: false },
        ],
      },
      {
        id: 't-2',
        sender: 'Barangay Kagawad Elena',
        pet: 'Stray Puppies',
        subject: 'Rescue Dispatch Location Details',
        lastMessage: 'The puppies are sheltered under the barangay outpost canopy. Safe from rain.',
        time: '08:40 AM',
        unread: false,
        messages: [
          { sender: 'Barangay Kagawad Elena', text: 'The puppies are sheltered under the barangay outpost canopy. Safe from rain.', time: '08:40 AM', isMe: false },
          { sender: 'PawHaven Dispatch', text: 'Thank you Kagawad! Our volunteer Carlo is driving the rescue van and will arrive in 15 mins.', time: '08:50 AM', isMe: true },
        ],
      },
    ],
    animal_shelter: [
      {
        id: 't-1',
        sender: 'Joshua Ramos',
        pet: 'Bramble',
        subject: 'Adoption Meet & Greet Follow-up',
        lastMessage: 'We bought the dog bed and 15kg food bag ready! When can we bring Bramble home?',
        time: '10:05 AM',
        unread: true,
        messages: [
          { sender: 'Shelter Lead Bea', text: 'Hi Joshua! The adoption board approved your background and home inspection. Congratulations!', time: '09:50 AM', isMe: true },
          { sender: 'Joshua Ramos', text: 'We bought the dog bed and 15kg food bag ready! When can we bring Bramble home?', time: '10:05 AM', isMe: false },
        ],
      },
    ],
  }[providerType] || [];

  const [threads, setThreads] = useState(initialThreads);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const newMsg = {
      sender: providerType === 'veterinary_clinic' ? 'Attending Doctor' : providerType === 'grooming_salon' ? 'Salon Stylist' : 'Shelter Coordinator',
      text: replyText.trim(),
      time: 'Just now',
      isMe: true,
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMessage: replyText.trim(),
              time: 'Just now',
            }
          : t
      )
    );

    setReplyText('');
    onShowToast('Message transmitted securely');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-stone-800 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-400" />
          <span>
            {providerType === 'veterinary_clinic' && 'Clinical Patient Messaging & Tele-Triage Inquiries'}
            {providerType === 'grooming_salon' && 'Client Pickup Alerts & Styling Consultations'}
            {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Adopter Communications, Foster Updates & Rescue Hotline'}
          </span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Real-time encrypted communication between your facility and registered pet guardians.
        </p>
      </div>

      {/* Main 2-column chat workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden min-h-[560px]">
        {/* Left: Thread List (Col 4) */}
        <div className="lg:col-span-4 border-r border-stone-800 p-4 space-y-3">
          <div className="text-xs font-bold text-stone-300">Active Conversations</div>
          <div className="space-y-1.5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`w-full text-left p-3 rounded-2xl transition cursor-pointer flex flex-col gap-1 border ${
                  activeThread?.id === thread.id
                    ? 'bg-stone-900 border-teal-500/50 shadow-md'
                    : 'bg-stone-950 border-stone-850 hover:bg-stone-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{thread.sender}</span>
                  <span className="text-[10px] text-stone-500 font-mono">{thread.time}</span>
                </div>
                <div className="text-[11px] text-teal-300 font-medium truncate">
                  Pet: {thread.pet} · {thread.subject}
                </div>
                <div className="text-[11px] text-stone-400 truncate mt-0.5">
                  {thread.lastMessage}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Message Window (Col 8) */}
        {activeThread ? (
          <div className="lg:col-span-8 flex flex-col justify-between p-5 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{activeThread.sender}</h3>
                <span className="text-xs text-stone-400">
                  Regarding: <strong className="text-teal-300">{activeThread.pet}</strong> ({activeThread.subject})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowToast(`Audio call initiated with ${activeThread.sender}`)}
                  className="p-2 rounded-xl bg-stone-900 text-stone-300 hover:text-white border border-stone-800 text-xs cursor-pointer"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onShowToast(`Secure video room invitation sent to ${activeThread.sender}`)}
                  className="p-2 rounded-xl bg-stone-900 text-stone-300 hover:text-white border border-stone-800 text-xs cursor-pointer"
                  title="Telehealth / Video"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {activeThread.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      m.isMe
                        ? 'bg-teal-500 text-stone-950 font-medium rounded-br-none shadow-md'
                        : 'bg-stone-900 text-stone-100 rounded-bl-none border border-stone-800'
                    }`}
                  >
                    <div>{m.text}</div>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono mt-1 px-1">
                    {m.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Template Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 border-t border-stone-900 text-[11px]">
              {providerType === 'veterinary_clinic' && (
                <>
                  <button
                    type="button"
                    onClick={() => setReplyText('Vitals and lab panel are normal. Continue prescribed oral dosage.')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800 shrink-0 cursor-pointer"
                  >
                    + "Vitals are normal"
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText('Please fast your pet from 10 PM onwards for tomorrow morning surgery.')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800 shrink-0 cursor-pointer"
                  >
                    + "Pre-op Fasting Instructions"
                  </button>
                </>
              )}
              {providerType === 'grooming_salon' && (
                <>
                  <button
                    type="button"
                    onClick={() => setReplyText('Your pet is smelling amazing and ready for pickup now at the front desk!')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800 shrink-0 cursor-pointer"
                  >
                    + "Ready for pickup!"
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText('Session is progressing smoothly, blowdry and trimming finishing in 15 mins.')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800 shrink-0 cursor-pointer"
                  >
                    + "15 Mins Remaining"
                  </button>
                </>
              )}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
                <>
                  <button
                    type="button"
                    onClick={() => setReplyText('Adoption committee has reviewed your application. Can you visit for a meet-and-greet?')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800 shrink-0 cursor-pointer"
                  >
                    + "Meet-and-Greet Invitation"
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyText('Rescue ambulance has arrived on scene. Assessing animal trauma.')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800 shrink-0 cursor-pointer"
                  >
                    + "Ambulance on Scene"
                  </button>
                </>
              )}
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply message..."
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder-stone-500 text-xs focus:outline-hidden focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-8 text-stone-500 text-xs">
            Select a conversation on the left to review messages.
          </div>
        )}
      </div>
    </div>
  );
};
