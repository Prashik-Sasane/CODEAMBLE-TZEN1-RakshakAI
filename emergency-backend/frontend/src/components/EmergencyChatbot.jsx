import { useState, useRef, useEffect } from 'react';

/* ── Gemini API helper ─────────────────────────────────── */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Use gemini-1.5-flash — it has a generous free tier (15 RPM, 1M TPM)
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are RakshakAI, an intelligent emergency response assistant integrated into an ambulance dispatch system called Rakshak. Your primary purpose is to help users during emergencies.

Your responsibilities:
1. Provide calm, clear first-aid guidance for medical emergencies (heart attack, choking, burns, bleeding, fractures, etc.)
2. Help users describe their emergency to get the right ambulance type (Basic Life Support, Advanced Life Support, ICU)
3. Answer questions about the ambulance tracking and request process
4. Provide CPR instructions, bleeding control tips, and other life-saving guidance
5. Reassure and calm distressed users
6. If user reports a non-emergency, gently guide them to appropriate resources

Always:
- Be concise and actionable (lives depend on fast info)
- Use numbered steps for procedures
- Recommend calling emergency services (112 in India) for life-threatening situations
- Remind users that an ambulance is on the way if they've already submitted a request
- Never provide medical diagnoses

Keep responses short, clear, and empathetic. Use simple language.`;

/* ── Offline fallback answers ─────────────────────────── */
// Used when Gemini quota is exceeded or API is unreachable
const FALLBACK_ANSWERS = {
    cpr: `❤️ CPR Steps (Adult):

1. Call 112 immediately or ask someone else to call
2. Place the person flat on their back on a firm surface
3. Kneel beside them and place the heel of one hand on the center of their chest (lower half of sternum)
4. Place your other hand on top, interlock fingers
5. Push down hard & fast — at least 5 cm deep, 100–120 pushes per minute
6. After 30 compressions, give 2 rescue breaths (tilt head, lift chin, seal mouth over mouth, blow in for 1 second each)
7. Continue 30:2 cycle until ambulance arrives or person responds

⚡ If untrained, do hands-only CPR (no rescue breaths) — just keep pushing 100–120/min.`,

    bleeding: `🩸 Severe Bleeding Control:

1. Call 112 or request ambulance immediately
2. Apply direct pressure — use a clean cloth, bandage, or clothing
3. Press FIRMLY and do not lift to check — hold for at least 10 minutes
4. If blood soaks through, add more cloth on top (do NOT remove first layer)
5. If bleeding is on a limb, raise it above heart level
6. If an object is embedded, do NOT remove it — press around it
7. Use a tourniquet (if trained) on limbs as a last resort — 5–7 cm above wound

⚠️ Do NOT remove pressure until emergency help arrives.`,

    choking: `😮‍💨 Choking — Heimlich Maneuver:

If the person CANNOT speak, cough, or breathe:
1. Stand behind them, one foot forward for balance
2. Wrap arms around their waist
3. Make a fist and place it just above the navel (below ribcage)
4. Grab your fist with the other hand
5. Give 5 quick, sharp upward thrusts (inward and upward)
6. Repeat until object is expelled or person becomes unconscious

If unconscious:
— Start CPR immediately
— Call 112

For infants (under 1 year):
— 5 back blows + 5 chest thrusts only`,

    burn: `🔥 Burn Treatment:

Minor Burns (small area, redness, no blisters):
1. Cool the burn under cool (not cold) running water for 20 minutes
2. Remove jewelry/tight items near the burn
3. Cover loosely with a sterile bandage
4. Do NOT use ice, butter, toothpaste, or creams

Serious Burns (large area, blistering, charred skin):
1. Call 112 immediately
2. Do NOT remove stuck clothing
3. Cover loosely with a clean, damp cloth
4. Keep person warm — burns cause shock
5. Do NOT break blisters

⚠️ Always seek medical help for burns on face, hands, feet, genitals, or large areas.`,

    ambulance: `🚑 Ambulance Types on Rakshak:

**Basic Life Support (BLS)**
• For stable, non-critical patients
• Equipped with oxygen, basic first-aid
• For accidents with minor injuries, sick patients

**Advanced Life Support (ALS)**
• For critical/semi-critical patients
• Has cardiac monitor, defibrillator, IV drugs
• For heart attacks, strokes, serious trauma

**ICU Ambulance**
• Mobile intensive care unit
• For patients who need ICU-level care during transport
• Ventilator, advanced monitoring equipment
• For very critical/unconscious patients

💡 If unsure, select "Any" and the admin will assign the most appropriate ambulance.`,

    tracking: `📍 How to Track Your Ambulance:

1. After submitting an emergency request, your dashboard shows "Current Request"
2. The status badge updates in real-time:
   • 🟡 Pending — waiting for assignment
   • 🟢 Assigned — ambulance is on the way
   • 🔵 To Hospital — taking you to hospital
   • ✅ Completed
3. Once assigned, you'll see driver name, phone number & vehicle number
4. The map shows live ambulance position
5. You can call the driver directly from the phone number shown

⚡ If the tracker doesn't update, refresh the page — it auto-refreshes every 3 seconds.`,
};

function getFallbackReply(userText) {
    const text = userText.toLowerCase();
    if (text.includes('cpr') || text.includes('heart') || text.includes('cardio') || text.includes('resuscit')) {
        return FALLBACK_ANSWERS.cpr;
    }
    if (text.includes('bleed') || text.includes('blood') || text.includes('wound') || text.includes('cut')) {
        return FALLBACK_ANSWERS.bleeding;
    }
    if (text.includes('chok') || text.includes('heimlich') || text.includes('breath') && text.includes('can\'t')) {
        return FALLBACK_ANSWERS.choking;
    }
    if (text.includes('burn') || text.includes('fire') || text.includes('scald')) {
        return FALLBACK_ANSWERS.burn;
    }
    if (text.includes('ambulance type') || text.includes('bls') || text.includes('als') || text.includes('icu') || text.includes('which ambulance') || text.includes('type of ambulance')) {
        return FALLBACK_ANSWERS.ambulance;
    }
    if (text.includes('track') || text.includes('where') && text.includes('ambulance') || text.includes('status') || text.includes('how long')) {
        return FALLBACK_ANSWERS.tracking;
    }
    return null;
}

async function callGemini(messages) {
    const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }));

    const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
        },
    };

    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errMsg = err?.error?.message || '';
        // Detect quota-related errors
        if (res.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate')) {
            throw { type: 'quota', message: errMsg };
        }
        throw { type: 'api', message: errMsg || `API error ${res.status}` };
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

/* ── Quick-action chips ────────────────────────────────── */
const QUICK_CHIPS = [
    { label: '🚑 Track my ambulance', text: 'How do I track my ambulance?' },
    { label: '❤️ CPR steps', text: 'Give me CPR instructions step by step' },
    { label: '🩸 Bleeding control', text: 'How do I control severe bleeding?' },
    { label: '😮‍💨 Choking help', text: 'Someone is choking, what do I do?' },
    { label: '🔥 Burn treatment', text: 'How to treat a burn injury?' },
    { label: '💊 Ambulance types', text: 'What is the difference between ambulance types?' },
];

/* ── Message Bubble ────────────────────────────────────── */
function MessageBubble({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                marginBottom: '0.6rem',
                animation: 'chatMsgIn 0.22s ease',
            }}
        >
            {!isUser && (
                <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', marginRight: '0.4rem', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                }}>🚑</div>
            )}
            <div
                style={{
                    maxWidth: '80%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isUser
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : 'rgba(255,255,255,0.95)',
                    color: isUser ? 'white' : '#1a202c',
                    fontSize: '0.875rem',
                    lineHeight: 1.55,
                    boxShadow: isUser
                        ? '0 4px 14px rgba(102,126,234,0.35)'
                        : '0 2px 10px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: isUser ? 'none' : '1px solid rgba(229,231,235,0.8)',
                }}
            >
                {msg.content}
            </div>
        </div>
    );
}

/* ── Typing Indicator ──────────────────────────────────── */
function TypingDots() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', flexShrink: 0,
            }}>🚑</div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255,255,255,0.95)', borderRadius: '18px 18px 18px 4px',
                padding: '0.6rem 0.85rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid rgba(229,231,235,0.8)',
            }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#dc2626',
                        animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
            </div>
        </div>
    );
}

/* ── Main Chatbot Component ────────────────────────────── */
export default function EmergencyChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm RakshakAI 🚑\n\nI'm here to help you during emergencies. You can ask me for:\n• First-aid guidance\n• Ambulance tracking help\n• Emergency procedures\n• CPR & life-saving tips\n\nHow can I assist you right now?",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [showChips, setShowChips] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 200);
            setHasUnread(false);
        }
    }, [isOpen, messages]);

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMsg = { role: 'user', content: trimmed };
        const history = [...messages, userMsg];
        setMessages(history);
        setInput('');
        setIsLoading(true);
        setShowChips(false);

        // 1. Try local fallback first for speed (only for well-known queries)
        const localReply = getFallbackReply(trimmed);

        try {
            if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
                // No API key — use offline fallback
                await new Promise((r) => setTimeout(r, 600)); // simulate thinking
                const reply = localReply || "I'm running in offline mode. Here are some things I can help with:\n\n• ❤️ CPR steps\n• 🩸 Bleeding control\n• 😮‍💨ChoChoking help\n• 🔥 Burn treatment\n• 🚑 Ambulance types\n• 📍 Tracking info\n\nPlease ask about any of the above. For emergencies, call 112.";
                setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
            } else {
                const reply = await callGemini(history);
                setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
            }
            if (!isOpen) setHasUnread(true);
        } catch (err) {
            // On quota/rate-limit error → try local fallback
            if (err.type === 'quota' && localReply) {
                setMessages((prev) => [...prev, {
                    role: 'assistant',
                    content: localReply + '\n\n─────\n📶 _AI temporarily unavailable (quota limit). Showing stored guidance._',
                }]);
            } else if (err.type === 'quota') {
                setMessages((prev) => [...prev, {
                    role: 'assistant',
                    content: "⏳ The AI is temporarily at capacity. Here's what I can help with right now:\n\n• ❤️ CPR steps\n• 🩸 Bleeding control\n• 😮‍💨 Choking help\n• 🔥 Burn treatment\n• 🚑 Ambulance types\n• 📍 Tracking my ambulance\n\nJust ask any of the above!\n\n🆘 For real emergencies: call **112**",
                }]);
            } else {
                setMessages((prev) => [...prev, {
                    role: 'assistant',
                    content: `⚠️ Could not reach AI assistant.\n\n${localReply || 'Please try again or call 112 for immediate emergency help.'}`,
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <>
            {/* ── Chatbot Panel ── */}
            {isOpen && (
                <div
                    id="emergency-chatbot-panel"
                    style={{
                        position: 'fixed',
                        bottom: 84,
                        right: 20,
                        width: 360,
                        maxWidth: 'calc(100vw - 40px)',
                        height: 520,
                        maxHeight: 'calc(100vh - 120px)',
                        borderRadius: 20,
                        background: 'linear-gradient(180deg, #fef2f2 0%, #fff5f5 100%)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(239,68,68,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 9998,
                        animation: 'chatOpen 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                        padding: '1rem 1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem',
                            border: '2px solid rgba(255,255,255,0.4)',
                            flexShrink: 0,
                        }}>🚑</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
                                RakshakAI
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ width: 7, height: 7, background: '#86efac', borderRadius: '50%', display: 'inline-block' }} />
                                Emergency Assistant · Online
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chatbot"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                color: 'white',
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                        >✕</button>
                    </div>

                    {/* Emergency banner */}
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        borderBottom: '1px solid rgba(239,68,68,0.12)',
                        padding: '0.45rem 1rem',
                        fontSize: '0.72rem',
                        color: '#b91c1c',
                        textAlign: 'center',
                        flexShrink: 0,
                        fontWeight: 500,
                    }}>
                        🆘 For life-threatening emergencies, call <strong>112</strong> immediately
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '0.85rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(239,68,68,0.2) transparent',
                        }}
                    >
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} msg={msg} />
                        ))}
                        {isLoading && <TypingDots />}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Chips */}
                    {showChips && messages.length <= 1 && (
                        <div style={{
                            padding: '0 0.85rem 0.6rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.4rem',
                            flexShrink: 0,
                        }}>
                            {QUICK_CHIPS.map((chip) => (
                                <button
                                    key={chip.label}
                                    onClick={() => sendMessage(chip.text)}
                                    style={{
                                        padding: '0.3rem 0.65rem',
                                        borderRadius: 20,
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        background: 'rgba(255,255,255,0.9)',
                                        color: '#dc2626',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#fef2f2';
                                        e.currentTarget.style.borderColor = '#dc2626';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                                    }}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input area */}
                    <div style={{
                        padding: '0.75rem',
                        borderTop: '1px solid rgba(229,231,235,0.8)',
                        background: 'white',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-end',
                        flexShrink: 0,
                    }}>
                        <textarea
                            ref={inputRef}
                            id="chatbot-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your emergency or ask a question…"
                            rows={1}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                resize: 'none',
                                border: '1.5px solid rgba(229,231,235,0.9)',
                                borderRadius: 14,
                                padding: '0.55rem 0.85rem',
                                fontSize: '0.875rem',
                                outline: 'none',
                                fontFamily: 'inherit',
                                lineHeight: 1.5,
                                maxHeight: 100,
                                overflowY: 'auto',
                                transition: 'border-color 0.2s',
                                background: '#fafafa',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#ef4444')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(229,231,235,0.9)')}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                            }}
                        />
                        <button
                            id="chatbot-send-btn"
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                border: 'none',
                                background: input.trim() && !isLoading
                                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                    : '#e5e7eb',
                                color: input.trim() && !isLoading ? 'white' : '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(239,68,68,0.35)' : 'none',
                            }}
                            aria-label="Send message"
                        >
                            {isLoading ? (
                                <div style={{
                                    width: 16, height: 16, border: '2.5px solid #9ca3af',
                                    borderTopColor: 'transparent', borderRadius: '50%',
                                    animation: 'spin 0.7s linear infinite',
                                }} />
                            ) : '➤'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Toggle FAB ── */}
            <button
                id="emergency-chatbot-fab"
                onClick={() => { setIsOpen((o) => !o); setHasUnread(false); }}
                aria-label={isOpen ? 'Close emergency chatbot' : 'Open emergency chatbot'}
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    border: 'none',
                    background: isOpen
                        ? 'linear-gradient(135deg, #374151, #1f2937)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    fontSize: isOpen ? '1.3rem' : '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isOpen
                        ? '0 4px 20px rgba(0,0,0,0.25)'
                        : '0 4px 20px rgba(239,68,68,0.5), 0 0 0 4px rgba(239,68,68,0.15)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    zIndex: 9999,
                    animation: isOpen ? 'none' : 'fabPulse 3s ease-in-out infinite',
                }}
            >
                {isOpen ? '✕' : '🚑'}
                {hasUnread && !isOpen && (
                    <span style={{
                        position: 'absolute',
                        top: 0, right: 0,
                        width: 16, height: 16,
                        background: '#fbbf24',
                        borderRadius: '50%',
                        border: '2px solid white',
                        fontSize: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#92400e',
                    }}>!</span>
                )}
            </button>

            {/* ── Animations ── */}
            <style>{`
        @keyframes chatOpen {
          from { opacity: 0; transform: scale(0.85) translateY(20px); transform-origin: bottom right; }
          to   { opacity: 1; transform: scale(1) translateY(0);       transform-origin: bottom right; }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(239,68,68,0.5), 0 0 0 4px rgba(239,68,68,0.15); }
          50%       { box-shadow: 0 4px 24px rgba(239,68,68,0.65), 0 0 0 8px rgba(239,68,68,0.1); }
        }
      `}</style>
        </>
    );
}
