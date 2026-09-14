import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  ExternalLink,
  ChevronDown,
  Languages,
  AlertTriangle,
  BookOpen,
  Award,
  CreditCard,
  WifiOff,
  FileCheck
} from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickActionTab?: 'apply' | 'track' | 'guidelines' | 'scrutiny' | 'merit';
  isAiGenerated?: boolean;
}

interface ArohaMitraBotProps {
  lang?: LanguageCode;
  onNavigateTab?: (tab: 'apply' | 'track' | 'guidelines' | 'scrutiny' | 'merit') => void;
}

// Inline Markdown formatter (bold, italic, code)
const renderInlineMarkdown = (str: string, isUserMessage = false): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = str;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const codeMatch = remaining.match(/`(.*?)`/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    let earliest: { type: 'bold' | 'code' | 'italic'; match: RegExpMatchArray } | null = null;
    let minIndex = Infinity;

    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < minIndex) {
      minIndex = boldMatch.index;
      earliest = { type: 'bold', match: boldMatch };
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < minIndex) {
      minIndex = codeMatch.index;
      earliest = { type: 'code', match: codeMatch };
    }
    if (italicMatch && italicMatch.index !== undefined && italicMatch.index < minIndex) {
      minIndex = italicMatch.index;
      earliest = { type: 'italic', match: italicMatch };
    }

    if (!earliest || minIndex === Infinity) {
      parts.push(remaining);
      break;
    }

    if (minIndex > 0) {
      parts.push(remaining.substring(0, minIndex));
    }

    const matchedStr = earliest.match[0];
    const innerText = earliest.match[1];

    if (earliest.type === 'bold') {
      parts.push(
        <strong key={key++} className={isUserMessage ? 'font-bold text-white' : 'font-bold text-emerald-950'}>
          {innerText}
        </strong>
      );
    } else if (earliest.type === 'code') {
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-black/10 font-mono text-[11px]">
          {innerText}
        </code>
      );
    } else if (earliest.type === 'italic') {
      parts.push(
        <em key={key++} className="italic">
          {innerText}
        </em>
      );
    }

    remaining = remaining.substring(minIndex + matchedStr.length);
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
};

// Block Markdown formatter (headings, bullets, numbered lists, dividers, paragraphs)
const renderFormattedMarkdown = (text: string, isUserMessage = false): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}_ul`} className="my-1.5 pl-4 list-disc space-y-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`empty_${idx}`);
      elements.push(<div key={`spacer_${idx}`} className="h-1" />);
      return;
    }

    if (trimmed === '---' || trimmed === '***') {
      flushList(`hr_${idx}`);
      elements.push(<hr key={`hr_${idx}`} className="my-2 border-current opacity-20" />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`h3_${idx}`);
      elements.push(
        <h4 key={`h3_${idx}`} className={`font-bold text-xs mt-2 mb-1 ${isUserMessage ? 'text-white' : 'text-emerald-950'}`}>
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''), isUserMessage)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList(`h2_${idx}`);
      elements.push(
        <h3 key={`h2_${idx}`} className={`font-bold text-sm mt-2 mb-1 ${isUserMessage ? 'text-white' : 'text-emerald-950'}`}>
          {renderInlineMarkdown(trimmed.replace(/^#+\s+/, ''), isUserMessage)}
        </h3>
      );
      return;
    }

    if (/^[\*\-]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[\*\-]\s+/, '');
      listItems.push(
        <li key={`li_${idx}`} className="text-xs leading-relaxed">
          {renderInlineMarkdown(content, isUserMessage)}
        </li>
      );
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushList(`num_${idx}`);
      const content = trimmed.replace(/^\d+\.\s+/, '');
      const num = trimmed.match(/^(\d+)\./)?.[1] || '1';
      elements.push(
        <div key={`num_${idx}`} className="flex items-start gap-1.5 my-1 text-xs leading-relaxed">
          <span className={`font-bold shrink-0 ${isUserMessage ? 'text-amber-200' : 'text-emerald-800'}`}>{num}.</span>
          <div>{renderInlineMarkdown(content, isUserMessage)}</div>
        </div>
      );
      return;
    }

    flushList(`p_${idx}`);
    elements.push(
      <p key={`p_${idx}`} className="my-1 text-xs leading-relaxed">
        {renderInlineMarkdown(trimmed, isUserMessage)}
      </p>
    );
  });

  flushList('end');
  return <>{elements}</>;
};

export const ArohaMitraBot: React.FC<ArohaMitraBotProps> = ({ lang: propLang, onNavigateTab }) => {
  const { lang: contextLang, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<LanguageCode>(propLang || contextLang);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: getTranslation('botGreeting', propLang || contextLang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync when context language changes
  useEffect(() => {
    setActiveLang(contextLang);
  }, [contextLang]);

  // Update initial greeting if language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg_welcome') {
        return [
          {
            id: 'msg_welcome',
            sender: 'bot',
            text: getTranslation('botGreeting', activeLang),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [activeLang]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const t = (key: string) => getTranslation(key, activeLang);

  // Dynamic suggested prompts for ALL 7 languages
  const getSuggestedPrompts = () => {
    switch (activeLang) {
      case 'hi':
        return [
          { label: 'NFST छात्रवृत्ति कितनी मिलती है?', query: 'NFST फेलोशिप की राशि, पात्रता और नियम क्या हैं?' },
          { label: 'NOS विदेश छात्रवृत्ति के नियम क्या हैं?', query: 'NOS विदेश छात्रवृत्ति के नियम, आय सीमा और शीर्ष 500 विश्वविद्यालय क्या हैं?' },
          { label: 'दस्तावेज़ में नाम का अंतर (Name Mismatch)?', query: 'यदि आवेदन और जाति प्रमाणपत्र में नाम का अंतर हो तो क्या करें?' },
          { label: 'कमी सूचना (Deficiency) कैसे हल करें?', query: 'Deficiency Notice आने पर सुधार कैसे करें?' },
          { label: 'ऑफलाइन मोड में आवेदन कैसे भरें?', query: 'ऑफलाइन PWA से बिना इंटरनेट आवेदन कैसे होता है?' },
          { label: 'सामान्य प्रश्न: भारत के प्रधानमंत्री कौन हैं?', query: 'भारत के वर्तमान प्रधानमंत्री और जनजातीय कार्य मंत्री कौन हैं?' },
        ];
      case 'te':
        return [
          { label: 'NFST ఫెలోషిప్ మొత్తం ఎంత?', query: 'NFST ఫెలోషిప్ మొత్తం, అర్హతలు మరియు నిబంధనలు ఏమిటి?' },
          { label: 'NOS విదేశీ స్కాలర్‌షిప్ ఎలా దరఖాస్తు చేయాలి?', query: 'NOS విదేశీ స్కాలర్‌షిప్ ఆదాయ పరిమితి మరియు అర్హతలు ఏమిటి?' },
          { label: 'సర్టిఫికెట్‌లో పేరు తేడా ఉంటే (Name Mismatch)?', query: 'దరఖాస్తులో మరియు కుల ధృవీకరణ పత్రంలో పేరు తేడా ఉంటే ఏమి చేయాలి?' },
          { label: 'Deficiency Notice ఎలా పరిష్కరించాలి?', query: 'Deficiency Notice వస్తే దాన్ని ఎలా పరిష్కరించాలి?' },
          { label: 'ఆఫ్‌లైన్ మోడ్ ఎలా పనిచేస్తుంది?', query: 'ఇంటర్నెట్ లేకపోయినా AROHA యాప్ ద్వారా దరఖాస్తు ఎలా చేయవచ్చు?' },
        ];
      case 'or':
        return [
          { label: 'NFST ଫେଲୋସିପ୍ ରାଶି କେତେ?', query: 'NFST ଫେଲୋସିପ୍ ରାଶି, ଯୋଗ୍ୟତା ଏବଂ ନିୟମାବଳୀ କ’ଣ?' },
          { label: 'NOS ବିଦେଶ ଛାତ୍ରବୃତ୍ତି ନିୟମ କ’ଣ?', query: 'NOS ବିଦେଶ ଛାତ୍ରବୃତ୍ତି ଆୟ ସୀମା ଓ ଯୋଗ୍ୟତା କ’ଣ?' },
          { label: 'ପ୍ରମାଣପତ୍ରରେ ନାମ ତ୍ରୁଟି (Name Mismatch)?', query: 'ପ୍ରମାଣପତ୍ର ଏବଂ ଆବେଦନରେ ନାମ ମେଳ ନଖାଇଲେ କ’ଣ କରିବେ?' },
          { label: 'ଅଫଲାଇନ୍ PWA କିପରି କାମ କରେ?', query: 'ଅଫଲାଇନ୍ PWA ଇଣ୍ଟରନେଟ୍ ବିନା କିପରି କାର୍ଯ୍ୟ କରେ?' },
        ];
      case 'bn':
        return [
          { label: 'NFST ফেলোশিপের পরিমাণ কত?', query: 'NFST ফেলোশিপের টাকা, যোগ্যতা এবং নিয়মাবলী কী কী?' },
          { label: 'NOS বিদেশ বৃত্তির নিয়ম কী?', query: 'NOS বিদেশের স্কলারশিপের নিয়ম, পারিবারিক আয় সীমা কত?' },
          { label: 'নথিতে নামের অমিল থাকলে (Name Mismatch)?', query: 'আবেদনপত্র এবং এসটি সনদে নামের অমিল থাকলে কী করণীয়?' },
          { label: 'Deficiency নোটিশ কীভাবে ঠিক করবেন?', query: 'Deficiency Notice পেলে কীভাবে নথি পুনরায় জমা দেবেন?' },
        ];
      case 'sat':
        return [
          { label: 'NFST ᱯᱷᱮᱞᱳᱥᱤᱯ ᱴᱟᱠᱟ ᱛᱤᱱᱟᱹᱜ?', query: 'NFST ᱯᱷᱮᱞᱳᱥᱤᱯ ᱨᱮᱭᱟᱜ ᱴᱟᱠᱟ, ᱡᱚᱜᱽᱭᱚᱛᱟ ᱟᱨ ᱱᱤᱭᱟᱹᱢ ᱪᱮᱫ?' },
          { label: 'NOS ᱵᱤᱫᱮᱥ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱱᱤᱭᱟᱹᱢ?', query: 'NOS ᱵᱤᱫᱮᱥ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱟᱭ ᱥᱤᱢᱟᱹ ᱟᱨ ᱡᱚᱜᱽᱭᱚᱛᱟ ᱪᱮᱫ?' },
          { label: 'ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ ᱨᱮ ᱧᱩᱛᱩᱢ ᱵᱷᱮᱜᱟᱨ (Name Mismatch)?', query: 'ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ ᱟᱨ ᱟᱨᱫᱟᱥ ᱨᱮ ᱧᱩᱛᱩᱢ ᱵᱷᱮᱜᱟᱨ ᱠᱷᱟᱱ ᱪᱮᱫ ᱪᱤᱠᱟᱹᱭᱟ?' },
          { label: 'ᱚᱯᱷᱞᱟᱭᱤᱱ PWA ᱪᱮᱫ ᱞᱮᱠᱟ ᱠᱟᱹᱢᱤᱭᱟ?', query: 'ᱤᱱᱴᱟᱨᱱᱮᱴ ᱵᱟᱹᱱᱩᱜ ᱨᱮᱦᱚᱸ ᱯᱷᱚᱨᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱯᱮᱨᱮᱡ ᱜᱟᱱᱚᱜᱼᱟ?' },
        ];
      case 'mr':
        return [
          { label: 'NFST फेलोशिप रक्कम किती आहे?', query: 'NFST फेलोशिप रक्कम, पात्रता आणि निकष काय आहेत?' },
          { label: 'NOS परदेशी शिष्यवृत्तीचे नियम काय?', query: 'NOS परदेशी शिष्यवृत्तीसाठी कौटुंबिक उत्पन्न मर्यादा व अटी काय आहेत?' },
          { label: 'प्रमाणपत्रात नावाचा फरक (Name Mismatch)?', query: 'दाखल्यावरील नाव आणि अर्जातील नाव वेगळे असल्यास काय करावे?' },
          { label: 'Deficiency Notice कशी सोडवावी?', query: 'Deficiency Notice आल्यावर कागदपत्रे कशी दुरुस्त करावीत?' },
          { label: 'ऑफलाइन PWA मोड कसा चालतो?', query: 'इंटरनेट नसताना आदिवासी भागात अर्ज कसा भरता येतो?' },
        ];
      default:
        return [
          { label: 'What is the NFST Fellowship amount?', query: 'What is the NFST fellowship stipend amount, duration, and quota?' },
          { label: 'How to apply for NOS Overseas Scholarship?', query: 'What are the rules, Top 500 QS criteria, and income limits for NOS overseas scholarship?' },
          { label: 'Document Name Mismatch: What to do?', query: 'What happens if my name on the Caste Certificate does not match my application?' },
          { label: 'How to resolve a Deficiency Notice?', query: 'How do I resolve a deficiency notice and re-upload documents?' },
          { label: 'How does Offline PWA mode work?', query: 'How does the offline mode work in remote tribal areas without internet?' },
          { label: 'General Knowledge: PM & Tribal Affairs', query: 'Who is the Prime Minister of India and Minister of Tribal Affairs?' },
        ];
    }
  };

  // Robust Local Multilingual Knowledge & Conversational Engine (Full Fallback & Offline)
  const generateLocalBotResponse = (userQuery: string, targetLang: LanguageCode): { reply: string; actionTab?: 'apply' | 'track' | 'guidelines' | 'scrutiny' | 'merit' } => {
    const q = userQuery.toLowerCase().trim();

    // 1. SAFE ARITHMETIC / MATH CALCULATION (e.g. "37000 * 12", "55 * 8", "37000 + 42000")
    const mathRegex = /^\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*$/;
    const mathMatch = q.match(mathRegex);
    if (mathMatch) {
      const num1 = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const num2 = parseFloat(mathMatch[3]);
      let res = 0;
      if (op === '+') res = num1 + num2;
      else if (op === '-') res = num1 - num2;
      else if (op === '*') res = num1 * num2;
      else if (op === '/' && num2 !== 0) res = num1 / num2;

      let extraContext = '';
      if (num1 === 37000 && num2 === 12 && op === '*') {
        extraContext = '\n\n💡 **Note:** ₹37,000 × 12 months = ₹4,44,000, which is the total annual base JRF stipend under the National Fellowship for ST Students (NFST) fellowship!';
      } else if (num1 === 42000 && num2 === 12 && op === '*') {
        extraContext = '\n\n💡 **Note:** ₹42,000 × 12 months = ₹5,04,000, which is the total annual base SRF stipend under the NFST fellowship!';
      }

      return {
        reply: `**Calculation Result:**\n\n\`${num1} ${op} ${num2} = ${res.toLocaleString('en-IN')}\`${extraContext}`,
      };
    }

    // 2. GREETINGS & INTRODUCTIONS
    if (
      q === 'hi' || q === 'hello' || q === 'hey' || q.includes('namaste') || q.includes('johar') || 
      q.includes('vanakkam') || q.includes('pranam') || q.includes('नमस्ते') || q.includes('जोहार') || 
      q.includes('నమస్కారం') || q.includes('ନମସ୍କାର') || q.includes('নমস্কার') || q.includes('ᱡᱚᱦᱟᱨ') || q.includes('नमस्कार')
    ) {
      const greetings: Record<LanguageCode, string> = {
        en: `**Hello! Johar! Greetings from AROHA Mitra!**\n\nI am your official AI conversational assistant for the **Ministry of Tribal Affairs (MoTA), Government of India**.\n\nYou can ask me **ANY question**:\n- **Scholarships:** NFST (₹37,000/mo JRF, 750 slots) & NOS (20 slots for Top 500 universities abroad)\n- **Application Assistance:** Eligibility, required documents, offline PWA, resolving name mismatches\n- **General Knowledge:** Questions about Indian governance, history, tribal culture, science, or general inquiries\n\nHow can I help you today?`,
        hi: `**नमस्ते! जोहार! आरोह मित्र में आपका स्वागत है!**\n\nमैं **जनजातीय कार्य मंत्रालय (MoTA), भारत सरकार** का डिजिटल AI सहायक हूँ।\n\nआप मुझसे **कोई भी प्रश्न** पूछ सकते हैं:\n- **छात्रवृत्तियाँ:** NFST (₹37,000/माह JRF, 750 सीटें) और NOS (विदेश में अध्ययन हेतु 20 सीटें)\n- **आवेदन सहायता:** पात्रता, आवश्यक दस्तावेज़, नाम में अंतर (Name Mismatch) सुधार, ऑफलाइन PWA\n- **सामान्य ज्ञान:** जनजातीय संस्कृति, इतिहास, शासन व्यवस्था या कोई भी सामान्य प्रश्न!\n\nमैं आज आपकी क्या सहायता कर सकता हूँ?`,
        te: `**నమస్కారం! జోహార్! ఆరోహ మిత్రకు స్వాగతం!**\n\nనేను భారత ప్రభుత్వ **గిరిజన వ్యవహారాల మంత్రిత్వ శాఖ (MoTA)** అధికారిక AI సహాయకుడిని.\n\nమీరు నన్ను **ఏదైనా ప్రశ్న** అడగవచ్చు:\n- **స్కాలర్‌షిప్‌లు:** NFST (నెలకి ₹37,000 JRF, 750 స్లాట్లు) & NOS (టాప్ 500 విదేశీ విశ్వవిద్యాలయాలు)\n- **దరఖాస్తు సహాయం:** అర్హతలు, ధ్రువపత్రాలు, పేరు తేడాలు (Name Mismatch), ఆఫ్‌లైన్ PWA విధానం\n- **సాధారణ జ్ఞానం:** సంస్కృతి, సాధారణ విజ్ఞానం మరియు ఏ ఇతర ప్రశ్నలైనా!\n\nఈరోజు నేను మీకు ఎలా సహాయపడగలను?`,
        or: `**ନମସ୍କାର! ଜୋହାର! ଆରୋହ ମିତ୍ରରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ!**\n\nମୁଁ ଭାରତ ସରକାରଙ୍କ **ଜନଜାତି ବ୍ୟାପାର ମନ୍ତ୍ରଣାଳୟ (MoTA)** ର ଡିଜିଟାଲ୍ AI ସହାୟକ।\n\nଆପଣ ମୋତେ **ଯେକୌଣସି ପ୍ରଶ୍ନ** ପଚାରିପାରିବେ:\n- **ଛାତ୍ରବୃତ୍ତି:** NFST (ମାସିକ ₹୩୭,୦୦୦ JRF) ଏବଂ NOS (ବିଦେଶରେ ଶୀର୍ଷ ୫୦୦ ବିଶ୍ୱବିଦ୍ୟାଳୟ)\n- **ଆବେଦନ ନିର୍ଦ୍ଦେଶାବଳୀ:** ଯୋଗ୍ୟତା, ପ୍ରମାଣପତ୍ର, ଅଫଲାଇନ୍ PWA, ନାମ ତ୍ରୁଟି ସମାଧାନ\n- **ସାଧାରଣ ଜ୍ଞାନ:** ସଂସ୍କୃତି, ଇତିହାସ କିମ୍ବା ଯେକୌଣସି ଜେନେରାଲ୍ ପ୍ରଶ୍ନ!\n\nମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?`,
        bn: `**নমস্কার! জোহার! আরোহ মিত্রে আপনাকে স্বাগতম!**\n\nআমি ভারত সরকারের **উপজাতি বিষয়ক মন্ত্রকের (MoTA)** অফিসিয়াল ডিজিটাল এআই সহকারী।\n\nআপনি আমাকে **যেকোনো ধরণের প্রশ্ন** করতে পারেন:\n- **স্কলারশিপ:** NFST (মাসে ₹৩৭,০০০ JRF, ৭৫০টি আসন) ও NOS (বিদেশে উচ্চশিক্ষার জন্য ২০টি আসন)\n- **আবেদন সহায়তা:** যোগ্যতা, নথিপত্র, নামের অমিল (Name Mismatch) সংশোধন, অফলাইন PWA\n- **সাধারণ জ্ঞান:** উপজাতি ঐতিহ্য, ভারতীয় প্রশাসন বা যেকোনো সাধারণ প্রশ্ন!\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?`,
        sat: `**ᱡᱚᱦᱟᱨ! ᱟᱨᱳᱦ ᱢᱤᱛᱨᱚ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ!**\n\nᱤᱧ ᱫᱚ ᱵᱷᱟᱨᱚᱛ ᱥᱚᱨᱠᱟᱨ ᱨᱮᱱᱟᱜ **ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱵᱮᱯᱟᱨ ᱢᱚᱱᱛᱨᱟᱲᱚᱭ (MoTA)** ᱨᱤᱱᱤᱡ AI ᱜᱚᱲᱚᱭᱤᱡ ᱠᱟᱹᱱᱟᱹᱧ᱾\n\nᱟᱢ ᱤᱧ ᱴᱷᱮᱱ **ᱡᱟᱦᱟᱸᱱᱟᱜ ᱠᱩᱠᱞᱤ** ᱜᱮ ᱠᱩᱞ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ:\n- **ᱥᱠᱚᱞᱟᱨᱥᱤᱯ:** NFST ᱟᱨ NOS ᱯᱷᱮᱞᱳᱥᱤᱯ\n- **ᱜᱚᱲᱚ:** ᱧᱩᱛᱩᱢ ᱵᱷᱮᱜᱟᱨ ᱥᱚᱞᱦᱮ, ᱚᱯᱷᱞᱟᱭᱤᱱ ᱯᱷᱚᱨᱢ ᱯᱮᱨᱮᱡ\n- **ᱞᱟᱠᱪᱟᱨ ᱟᱨ ᱥᱟᱫᱷᱟᱨᱚᱱ ᱠᱟᱛᱷᱟ:** ᱥᱟᱱᱛᱟᱲ, ᱢᱩᱱᱰᱟ ᱥᱮ ᱥᱚᱨᱠᱟᱨ ᱵᱟᱵᱚᱛ!\n\nᱪᱮᱫ ᱜᱚᱲᱚᱢ ᱠᱷᱚᱡᱚᱜ ᱠᱟᱱᱟ?`,
        mr: `**नमस्कार! जोहार! आरोह मित्र मध्ये आपले स्वागत आहे!**\n\nमी **आदिवासी कार्य मंत्रालय (MoTA), भारत सरकार** चा डिजिटल AI सहाय्यक आहे.\n\nआपण मला **कोणताही प्रश्न** विचारू शकता:\n- **शिष्यवृत्ती:** NFST (दरमहा ₹३७,००० JRF, ७५० जागा) आणि NOS (परदेशी शिक्षणासाठी २० जागा)\n- **अर्ज मार्गदर्शन:** पात्रता, कागदपत्रे, नावातील फरक (Name Mismatch) दुरुस्ती, ऑफलाइन PWA\n- **सामान्य ज्ञान:** आदिवासी संस्कृती, इतिहास, सामान्य माहिती किंवा इतर काहीही!\n\nमी आज आपली काय मदत करू शकतो?`,
      };
      return { reply: greetings[targetLang] || greetings.en };
    }

    // 3. WHO ARE YOU / CAPABILITIES
    if (q.includes('who are you') || q.includes('what can you do') || q.includes('who made you') || q.includes('तुम कौन हो') || q.includes('तू कोण आहेस') || q.includes('నువ్వు ఎవరు')) {
      return {
        reply: `**I am AROHA Mitra** — an intelligent multilingual AI assistant developed for the **Ministry of Tribal Affairs (MoTA), Government of India**.\n\n**My Capabilities:**\n1. **Scholarship Guidance:** Complete rules for NFST (750 national research fellowship slots) and NOS (20 overseas scholarship slots).\n2. **Application & Verification Assistance:** Explaining required documents, AI OCR checks, and resolving document name discrepancies.\n3. **Multilingual Support:** Conversing fluently in English, Hindi, Telugu, Odia, Bengali, Santhali, and Marathi.\n4. **Universal Q&A:** Ready to answer general knowledge, governance, geography, science, math, or history questions!`,
      };
    }

    // 4. POLITE / GRATITUDE
    if (q.includes('thank') || q.includes('धन्यवाद') || q.includes('ధన్యవాదాలు') || q.includes('shukriya') || q.includes('dhanyawad')) {
      return {
        reply: `**You are most welcome! Johar!**\n\nIt is an honor to assist you. If you need any more help with scholarship guidelines, document verification, application tracking, or any other query, feel free to ask!`,
      };
    }

    // 5. DOCUMENTS REQUIRED / CHECKLIST
    if (
      q.includes('document') || q.includes('certificate') || q.includes('upload') || q.includes('proof') || 
      q.includes('दस्तावेज़') || q.includes('कागज़ात') || q.includes('సర్టిఫికేట్') || q.includes('checklist')
    ) {
      return {
        reply: `**Mandatory Documents Required for AROHA Scholarship Applications:**\n\n1. **ST Community Caste Certificate:** Competent authority certificate issued under Article 342 with digital seal.\n2. **Academic Credentials:** Marksheets and degree certificates of Master's Degree (minimum 55% aggregate).\n3. **Eligibility Exam Scorecard:** UGC-NET or CSIR-NET qualification certificate (for NFST scholars).\n4. **Ph.D / Foreign Admission Offer Letter:** Admission letter from Indian recognized university (NFST) or **Top 500 QS World University** (NOS).\n5. **Income Certificate:** Family income certificate below ₹8,00,000/annum (mandatory for NOS; exempted for NFST).\n6. **Identity & Banking Proof:** Aadhaar Card (mandatory for PFMS Direct Benefit Transfer) and bank passbook/cancelled cheque.\n7. **Passport:** Valid Indian passport with minimum 6 months validity (for NOS candidates).\n8. **Affidavit (if applicable):** Required from Tehsildar/SDM if there is any name spelling variation.`,
        actionTab: 'apply',
      };
    }

    // 6. HOW TO APPLY / APPLICATION STEPS
    if (
      q.includes('how to apply') || (q.includes('apply') && !q.includes('both')) || 
      q.includes('registration') || q.includes('step') || q.includes('process') || 
      q.includes('आवेदन कैसे') || q.includes('ఎలా దరఖాస్తు')
    ) {
      return {
        reply: `**Step-by-Step Guide to Applying on AROHA:**\n\n1. **Step 1 - Personal & Demographic Details:** Enter your full name, Aadhaar number, contact info, state, and specific ST community tribe.\n2. **Step 2 - Fellowship Scheme Selection:** Choose between **NFST** (Ph.D in India) or **NOS** (Master's/Ph.D abroad).\n3. **Step 3 - Academic & NET Details:** Enter Master's aggregate percentage (min 55%), university, UGC-NET roll number, and percentile.\n4. **Step 4 - Document Upload & Neural AI OCR:** Upload PDF/JPEG copies of your certificates. The built-in AI will automatically read your caste certificate, verify authenticity, and check for name consistency.\n5. **Step 5 - Review & Submit:** Verify your declaration and submit. Your application instantly gets an Application Reference ID for live tracking!\n\n💡 *Note:* If you are in a remote tribal area with poor network, AROHA works in **Offline PWA mode** and automatically syncs when you reconnect.`,
        actionTab: 'apply',
      };
    }

    // 7. ELIGIBILITY & PERCENTAGE REQUIREMENTS & AGE LIMIT
    if (
      q.includes('eligib') || q.includes('criteria') || q.includes('who can apply') || 
      q.includes('percentage') || q.includes('55%') || q.includes('age limit') || 
      q.includes('how old') || q.includes('पात्रता') || q.includes('అర్హత')
    ) {
      return {
        reply: `**Eligibility Criteria Summary for MoTA Scholarships:**\n\n- **Category:** Must belong to a Scheduled Tribe (ST) recognized under Article 342 of the Constitution of India.\n- **Academic Minimum:** Minimum **55% marks (or equivalent CGPA)** in Master's degree from a recognized institution.\n- **NFST Criteria:** Qualified UGC-NET / CSIR-NET or secured confirmed Ph.D admission in an Indian University.\n- **NOS Criteria:** Unconditional admission offer from a university ranked in the **Top 500 QS World University Rankings**.\n- **NOS Age Limit:** Below **35 years** as on 1st July of the application cycle.\n- **Income Criteria:** Total family income must not exceed **₹8.0 Lakhs per annum** for NOS (No income ceiling for NFST).`,
        actionTab: 'guidelines',
      };
    }

    // 8. COMPARE / CAN I APPLY FOR BOTH SCHOLARSHIPS?
    if (q.includes('both') || q.includes('difference') || q.includes('compare') || q.includes('which scholarship') || q.includes('दोनों')) {
      return {
        reply: `**Comparison: NFST vs. NOS Scholarships:**\n\n| Feature | NFST (National Fellowship) | NOS (Overseas Scholarship) |\n| :--- | :--- | :--- |\n| **Scope** | Ph.D & M.Phil research in Indian universities | Master's, Ph.D, & Post-Doc abroad |\n| **Annual Slots** | **750 Slots** nationally | **20 Slots** nationally |\n| **Stipend / Support** | ₹37,000/mo (JRF) to ₹42,000/mo (SRF) + HRA | 100% Tuition + £9,900/yr (UK) or $15,400/yr (US) |\n| **Travel & Visa** | Not applicable | Return economy airfare + Visa fees covered |\n| **Income Limit** | **No income ceiling** | **₹8,00,000/year ceiling** |\n| **Female Reservation** | **Statutory 30% quota** (225 slots) | Statutory reservation applies |\n\n**Can you apply for both?** Yes, if you meet the respective eligibility criteria, you may submit applications for both. However, as per Government of India financial rules, a scholar may draw financial fellowship from only one scheme concurrently.`,
        actionTab: 'guidelines',
      };
    }

    // 9. DOCUMENT NAME MISMATCH (HIGH PRIORITY ISSUE)
    if (
      q.includes('name mismatch') || q.includes('name not match') || q.includes('spelling') || 
      q.includes('lapang') || q.includes('khasi') || q.includes('surname') || q.includes('discrepancy') ||
      q.includes('नाम का अंतर') || q.includes('नाम अलग') || q.includes('పేరు తేడా') || q.includes('ନାମ ମେଳ') ||
      q.includes('नावातील फरक') || q.includes('নামের অমিল')
    ) {
      if (targetLang === 'hi') {
        return {
          reply: `**दस्तावेज़ में नाम का अंतर (Name Mismatch) होने पर क्या करें?**\n\n1. **समस्या:** यदि आपके आवेदन फॉर्म में नाम (उदा. Jemimah Khasi) और आपके एसटी प्रमाणपत्र/राजस्व रिकॉर्ड में नाम (उदा. Jemimah Lapang) में वर्तनी या उपनाम का अंतर है, तो AROHA का AI OCR इसे तुरंत **Discrepancy (विसंगति)** के रूप में चिह्नित करता है।\n2. **प्रक्रिया:** ऐसी स्थिति में आवेदन स्वतः रद्द नहीं होता, बल्कि MoTA संवीक्षा अधिकारी (Scrutiny Desk) के पास मानव समीक्षा हेतु जाता है।\n3. **समाधान विकल्प:**\n   - **SDM / तहसीलदार हलफनामा (Affidavit):** प्रथम श्रेणी मजिस्ट्रेट या तहसीलदार द्वारा जारी शपथ पत्र जिसमें स्पष्ट हो कि दोनों नाम एक ही व्यक्ति के हैं।\n   - **राजपत्र अधिसूचना (Gazette Notification):** यदि आधिकारिक उपनाम परिवर्तन हुआ है।\n   - **संशोधित प्रमाणपत्र:** संबंधित जारीकर्ता प्राधिकारी से अद्यतन डिजिटल हस्ताक्षरित प्रमाणपत्र।\n4. **सुधार समय सीमा:** अधिकारी द्वारा Deficiency Notice जारी होने के बाद उम्मीदवार को **15 दिन** का समय दिया जाता है।`,
          actionTab: 'track',
        };
      }
      if (targetLang === 'te') {
        return {
          reply: `**ధృవీకరణ పత్రంలో పేరు తేడా (Name Mismatch) ఉంటే పరిష్కారం:**\n\n1. **AI OCR గుర్తించడం:** దరఖాస్తులో ఒక పేరు (ఉదా: Jemimah Khasi) మరియు ST సర్టిఫికెట్‌లో మరొక పేరు (ఉదా: Jemimah Lapang) ఉన్నప్పుడు సిస్టమ్ ఆటోమేటిక్‌గా డిస్క్రిపెన్సీగా గుర్తిస్తుంది.\n2. **రద్దు కాదు - పరిశీలన:** ఇలాంటి దరఖాస్తు తిరస్కరించబడదు; Scrutiny ఆఫీసర్ పరిశీలనకు పంపబడుతుంది.\n3. **పరిష్కార మార్గాలు:**\n   - తహసీల్దార్ లేదా SDM చే జారీ చేయబడిన **Affidavit (ప్రమాణపత్రం)** అప్‌లోడ్ చేయాలి.\n   - అధికారిక **Gazette Notification** కాపీని సమర్పించవచ్చు.\n4. **సమయం:** Deficiency Notice అందిన తర్వాత అభ్యర్థికి సరిదిద్దడానికి **15 రోజుల వ్యవధి** ఉంటుంది.`,
          actionTab: 'track',
        };
      }
      return {
        reply: `**Resolving a Document Name Mismatch Discrepancy in AROHA:**\n\n1. **How AI OCR Detects It:** When your application form specifies a name (e.g. *Jemimah Khasi*), but your uploaded ST Caste Certificate reads a clan name or variant (e.g. *Jemimah Lapang*), AROHA's neural OCR tags it as a **Name Discrepancy (Confidence < 60%)**.\n2. **Human-in-the-Loop Scrutiny:** Your application is **NOT** automatically rejected. It is routed for manual review by a MoTA Scrutiny Officer.\n3. **Required Resolution Documents:**\n   - **SDM / Tehsildar Affidavit:** A sworn affidavit from a First-Class Judicial Magistrate or Executive Magistrate stating that both names belong to the same individual.\n   - **Official Gazette Notification:** If you underwent a legal name change.\n   - **Updated Digital Certificate:** Digitally re-issued ST certificate from your State Revenue portal.\n4. **Submission Window:** Once a Deficiency Notice is dispatched, you have **15 calendar days** to re-upload via the **'Track Status & DBT'** section.`,
        actionTab: 'track',
      };
    }

    // 10. NFST FELLOWSHIP QUESTIONS
    if (q.includes('nfst') || (q.includes('fellowship') && !q.includes('nos')) || q.includes('jrf') || q.includes('srf') || q.includes('stipend') || q.includes('phd') || q.includes('mphil') || q.includes('एनएफएसटी') || q.includes('ఫెలోషిప్')) {
      if (targetLang === 'hi') {
        return {
          reply: `**राष्ट्रीय अध्येतावृत्ति योजना (NFST) - मुख्य बिंदु:**\n\n- **कुल सीटें:** प्रतिवर्ष **750 स्लॉट** विशेष रूप से अनुसूचित जनजाति (ST) छात्रों के लिए।\n- **JRF (कनिष्ठ अध्येतावृत्ति):** प्रथम 2 वर्ष हेतु **₹37,000 प्रति माह** + लागू HRA।\n- **SRF (वरिष्ठ अध्येतावृत्ति):** अगले 3 वर्ष हेतु **₹42,000 प्रति माह** + लागू HRA।\n- **वार्षिक आकस्मिकता (Contingency):** **₹20,500/वर्ष** (मानविकी) अथवा **₹25,000/वर्ष** (विज्ञान व प्रौद्योगिकी)।\n- **पात्रता:** स्नातकोत्तर में न्यूनतम **55% अंक** और UGC-NET / CSIR-NET परीक्षा उत्तीर्ण।\n- **महिला आरक्षण:** न्यूनतम **30% सीटें ST महिला शोधार्थियों** हेतु आरक्षित हैं।\n- **संवितरण:** प्रत्येक माह की 1 तारीख को PFMS Direct Benefit Transfer द्वारा सीधे बैंक खाते में।`,
          actionTab: 'guidelines',
        };
      }
      return {
        reply: `**National Fellowship for Higher Education of ST Students (NFST):**\n\n- **Annual Slots:** **750 Fellowship Slots** awarded exclusively to Scheduled Tribe researchers across India.\n- **JRF Stipend:** **₹37,000 / month** for the first 2 years of Ph.D/M.Phil + applicable HRA.\n- **SRF Stipend:** **₹42,000 / month** for the subsequent 3 years + applicable HRA.\n- **Annual Contingency:** **₹20,500 / annum** for Humanities & Social Sciences; **₹25,000 / annum** for Science & Engineering.\n- **Eligibility:** Minimum **55% marks in Master's degree** and qualified UGC-NET or CSIR-NET examination.\n- **Female Reservation:** Statutory **30% seats** (225 slots) are strictly reserved for ST women scholars.\n- **Direct Benefit Transfer:** Released on the 1st of every month directly into your Aadhaar-linked bank account via PFMS.`,
        actionTab: 'guidelines',
      };
    }

    // 11. NOS OVERSEAS SCHOLARSHIP QUESTIONS
    if (q.includes('nos') || q.includes('overseas') || q.includes('foreign') || q.includes('oxford') || q.includes('harvard') || q.includes('abroad') || q.includes('विदेश') || q.includes('income limit') || q.includes('విదేశీ')) {
      if (targetLang === 'hi') {
        return {
          reply: `**राष्ट्रीय प्रवासी छात्रवृत्ति योजना (NOS) - नियम एवं विवरण:**\n\n- **कुल सीटें:** प्रतिवर्ष **20 स्लॉट** विदेशी शीर्ष विश्वविद्यालयों में Master's, Ph.D व Post-Doctoral शोध हेतु।\n- **विश्वविद्यालय रैंकिंग:** उम्मीदवार के पास **QS World University Ranking के शीर्ष 500** संस्थानों से unconditional offer letter होना अनिवार्य है।\n- **शिक्षण शुल्क:** 100% ट्यूशन फीस भारत सरकार द्वारा सीधे विदेशी विश्वविद्यालय को दी जाती है।\n- **निर्वाह भत्ता (Living Allowance):** ब्रिटेन हेतु **£9,900/वर्ष** अथवा अमेरिका व अन्य देशों हेतु **$15,400/वर्ष**।\n- **हवाई यात्रा:** इकोनॉमी क्लास का अंतरराष्ट्रीय हवाई टिकट + वीज़ा शुल्क।\n- **पारिवारिक आय सीमा:** कुल पारिवारिक आय **₹8,00,000 (8 लाख रुपये प्रति वर्ष)** से कम होनी चाहिए।\n- **आयु सीमा:** चयन वर्ष की 1 जुलाई को 35 वर्ष से कम।`,
          actionTab: 'guidelines',
        };
      }
      return {
        reply: `**National Overseas Scholarship for ST Candidates (NOS):**\n\n- **Annual Quota:** **20 Slots Annually** for Master's, Ph.D., and Post-Doctoral studies at elite international universities.\n- **Institution Standard:** Candidate must hold an unconditional admission offer letter from an institution ranked in the **Top 500 QS World University Rankings**.\n- **Tuition Coverage:** **100% full tuition fees** remitted directly to the foreign university by the Ministry of Tribal Affairs.\n- **Annual Maintenance Allowance:** **£9,900 / year** (United Kingdom) or **$15,400 / year** (USA and other countries).\n- **Travel & Visa:** Return economy international airfare and visa application fees covered.\n- **Mandatory Income Ceiling:** Total family income must not exceed **₹8,00,000 (8 Lakhs) per annum**.\n- **Age Criterion:** Below 35 years as of 1st July of the selection cycle.`,
        actionTab: 'guidelines',
      };
    }

    // 12. DEFICIENCY NOTICE
    if (q.includes('deficiency') || q.includes('notice') || q.includes('reject') || q.includes('re-upload') || q.includes('कमी') || q.includes('त्रुटि') || q.includes('సరిదిద్దడం')) {
      return {
        reply: `**How to Resolve a Deficiency Notice in AROHA:**\n\n1. **What is it?** A Deficiency Notice is issued when the Scrutiny Committee spots an issue with an uploaded document (e.g. illegible seal, name mismatch, or expired income certificate).\n2. **Where to see it?** Navigate to the **'Track Status & DBT'** tab. The active defect is highlighted in amber/rose with the officer's exact remarks.\n3. **How to resolve?** Click the **'Resolve Deficiency'** button, attach the corrected document, and submit.\n4. **AI Re-Check:** The platform instantly re-runs the OCR verification and prioritizes your file in the Scrutiny Officer's queue.\n5. **Timeline:** You have **15 days** from notice issuance to submit your response.`,
        actionTab: 'track',
      };
    }

    // 13. OFFLINE PWA CAPABILITY
    if (q.includes('offline') || q.includes('pwa') || q.includes('internet') || q.includes('network') || q.includes('ऑफ़लाइन') || q.includes('ఇంటర్నెట్') || q.includes('ଅଫଲାଇନ୍')) {
      return {
        reply: `**Tribal Area Offline-First PWA Technology:**\n\n- **Zero Network Required:** Specially built for remote Scheduled Areas (ITDA belts like Bastar, Adilabad, Koraput, Mayurbhanj, Khunti) with intermittent connectivity.\n- **Local IndexedDB Caching:** Fill out your multi-step form and queue certificate uploads directly in your browser's private offline database.\n- **Background Auto-Sync:** The second your device connects to mobile network or Wi-Fi, AROHA automatically uploads queued files and syncs drafts with MoTA servers.\n- **Live Simulation:** Click the **'Online / Simulated Offline'** badge in the top navigation header to test this workflow live!`,
        actionTab: 'apply',
      };
    }

    // 14. MERIT RANKING & 30% FEMALE QUOTA
    if (q.includes('merit') || q.includes('quota') || q.includes('rank') || q.includes('female') || q.includes('women') || q.includes('मेरिट') || q.includes('आरक्षण') || q.includes('మహిళా')) {
      return {
        reply: `**National Merit Ranking & 30% Female Quota System:**\n\n- **Formula:** Merit score is automatically calculated using a statutory weighted matrix:\n  - **45% UGC-NET / CSIR-NET Percentile**\n  - **35% Qualifying Master's Degree Percentage**\n  - **15% Research Proposal Evaluation**\n  - **5% Affirmative Weightage (PVTG & Remote Regions)**\n- **Mandatory 30% Female Quota:** A minimum of **225 of the 750 NFST slots** (and 6 of the 20 NOS slots) are statutorily reserved for ST women scholars.\n- **Roster Inspection:** You can view the real-time cutoff and selection list under the **'National Merit Roster'** administrative view.`,
        actionTab: 'merit',
      };
    }

    // 15. DIRECT BENEFIT TRANSFER (PFMS DBT)
    if (q.includes('dbt') || q.includes('pfms') || q.includes('money') || q.includes('bank') || q.includes('account') || q.includes('utr') || q.includes('payment') || q.includes('पैसा') || q.includes('खाता')) {
      return {
        reply: `**PFMS Direct Benefit Transfer (DBT) System:**\n\n- **Direct to Account:** All fellowship stipends are disbursed electronically via the Public Financial Management System (PFMS) directly into your Aadhaar-seeded bank account.\n- **Cycle:** Monthly payments are initiated on the 1st of every month.\n- **Electronic Audit Trail:** Selected fellows can view their official Presidential Sanction Order, tranche installments, and UTR transaction numbers inside the **'Track Status & DBT'** section.`,
        actionTab: 'track',
      };
    }

    // 16. PVTG / VULNERABLE GROUPS
    if (q.includes('pvtg') || q.includes('vulnerable') || q.includes('chenchu') || q.includes('birhor') || q.includes('toda') || q.includes('maria gond')) {
      return {
        reply: `**Particularly Vulnerable Tribal Groups (PVTGs):**\n\n- **Definition:** 75 tribal communities across 18 States and 1 Union Territory characterized by declining or stagnant population, pre-agricultural level of technology, and extremely low literacy.\n- **Priority in AROHA:** In compliance with Government of India affirmative action, candidates from PVTG communities (such as Birhor, Chenchu, Maria Gond, Toda, Saharia, Katkari) receive **+5% affirmative weightage points** in their National Merit composite score.`,
        actionTab: 'merit',
      };
    }

    // 17. EMRS SCHOOLS
    if (q.includes('emrs') || q.includes('eklavya') || q.includes('एकलव्य')) {
      return {
        reply: `**Eklavya Model Residential Schools (EMRS):**\n\n- **Objective:** Flagship initiative of the Ministry of Tribal Affairs (MoTA) to impart quality education (Class VI to XII) to Scheduled Tribe (ST) students in remote tribal regions.\n- **Scale:** Over 400+ operational residential schools offering free education, boarding, uniforms, and digital laboratories.\n- **Higher Education Pipeline:** EMRS graduates are encouraged and prioritized when transitioning to higher education and national research fellowships such as NFST and NOS.`,
      };
    }

    // 18. TRIBAL HERITAGE & CULTURE
    if (q.includes('tribe') || q.includes('tribal') || q.includes('gond') || q.includes('santhal') || q.includes('warli') || q.includes('dokra') || q.includes('जनजाति') || q.includes('संस्कृति')) {
      return {
        reply: `**Indigenous Tribal Heritage & Culture of Bharat:**\n\n- **Scheduled Tribes (ST):** Over 705 distinct tribal communities (>10.4 crore citizens) are recognized under Article 342 of the Indian Constitution.\n- **Particularly Vulnerable Tribal Groups (PVTGs):** 75 highly vulnerable communities receive prioritized welfare.\n- **Traditional Art Forms:**\n  - **Warli (Maharashtra):** Sacred Tarpa circular dances on red ochre mud walls.\n  - **Gond (Madhya Pradesh):** Sacred Mahua trees and animals drawn with intricate dots and dashes.\n  - **Dokra (Bastar, Chhattisgarh):** 4,000-year-old lost-wax bell metal craft.\n  - **Saura (Odisha):** Sacred Idital murals honoring tribal ancestors.\n\nScroll down to the footer of this portal to explore our interactive **Indigenous Tribal Heritage Gallery**!`,
      };
    }

    // 19. LEADERSHIP: PRESIDENT, PM, MINISTERS & MOTA
    if (
      q.includes('president') || q.includes('murmu') || q.includes('prime minister') || 
      q.includes('pm') || q.includes('minister') || q.includes('mota') || 
      q.includes('leader') || q.includes('government') || q.includes('राष्ट्रपति') || 
      q.includes('प्रधानमंत्री') || q.includes('मंत्री')
    ) {
      return {
        reply: `**Constitutional Leadership & Ministry of Tribal Affairs (MoTA):**\n\n- **President of India:** **Smt. Droupadi Murmu** (Hon'ble President of India, notably the first person belonging to a Scheduled Tribe community - Santhal - to hold the highest constitutional office of the Republic of Bharat).\n- **Prime Minister of India:** **Shri Narendra Modi**.\n- **Union Minister of Tribal Affairs:** **Shri Jual Oram** (Cabinet Minister for Tribal Affairs).\n- **Ministry Headquarters:** Shastri Bhawan, New Delhi.\n- **Constitutional Mandate:** Article 342 (Tribal notification), Fifth & Sixth Schedules, Forest Rights Act (FRA 2006), and National Higher Education Fellowships (NFST & NOS).`,
      };
    }

    // 20. GENERAL KNOWLEDGE: CAPITAL OF INDIA & GEOGRAPHY
    if (q.includes('capital of india') || q.includes('capital') || q.includes('delhi') || q.includes('राजधानी')) {
      return {
        reply: `**Capital of India:** **New Delhi** (राष्ट्रीय राजधानी क्षेत्र - नई दिल्ली).\n\nNew Delhi serves as the seat of all three branches of the Government of India: the Executive (Rashtrapati Bhavan, Prime Minister's Office), Legislature (Parliament of India - Sansad Bhavan), and the Judiciary (Supreme Court of India).`,
      };
    }

    // 21. UNIVERSAL SMART CONVERSATIONAL FALLBACK (Handles any other question with insight)
    if (targetLang === 'hi') {
      return {
        reply: `मैं आपके प्रश्न **"${userQuery}"** को समझ गया हूँ!\n\nमैं आपकी निम्नलिखित सभी विषयों में सहायता कर सकता हूँ:\n- **छात्रवृत्ति नियम:** NFST (₹37,000/माह, 750 स्लॉट) और NOS (विदेश में शीर्ष 500 विश्वविद्यालय, ₹8 लाख आय सीमा)\n- **दस्तावेज़ सहायता:** जाति प्रमाणपत्र में नाम का अंतर (Name Mismatch), आय प्रमाण, हलफनामा और AI OCR जांच\n- **कमी निवारण:** Deficiency Notice मिलने पर 15 दिन के भीतर दस्तावेज़ पुनः अपलोड करना\n- **ऑफलाइन PWA:** दूरदराज जनजातीय क्षेत्रों में बिना इंटरनेट आवेदन करना\n- **सामान्य ज्ञान व संस्कृति:** भारत की 705+ अनुसूचित जनजातियाँ, गोंड/वारली/ढोकरा कला और सामान्य विषय!\n\nकृपया अधिक विशिष्ट विवरण पूछें या नीचे दिए गए सुझावों में से किसी पर क्लिक करें!`,
      };
    }

    if (targetLang === 'te') {
      return {
        reply: `మీరు అడిగిన ప్రశ్న **"${userQuery}"** కు సంబంధించి నేను మీకు వివరాలు అందించగలను!\n\nనేను ఈ క్రింది అంశాలపై పూర్తి సమాచారం ఇవ్వగలను:\n- **NFST ఫెలోషిప్:** ప్రతి నెలా ₹37,000 JRF, 750 స్లాట్లు, 30% మహిళా రిజర్వేషన్\n- **NOS విదేశీ స్కాలర్‌షిప్:** టాప్ 500 QS విదేశీ విశ్వవిద్యాలయాలు, ₹8 లక్షల కుటుంబ ఆదాయ పరిమితి\n- **సర్టిఫికేట్ సమస్యలు:** పేరు తేడా (Name Mismatch), అఫిడవిట్ సమర్పణ, AI OCR తనిఖీ\n- **ఆఫ్‌లైన్ PWA:** ఇంటర్నెట్ లేకపోయినా దరఖాస్తు చేసుకోవడం\n\nదయచేసి మీ ప్రశ్నకు సంబంధించి మరింత సమాచారం అడగండి!`,
      };
    }

    return {
      reply: `I understand your question regarding **"${userQuery}"**!\n\nHere is what I can assist you with:\n\n- **Scholarship Programs:** NFST (₹37,000/mo JRF stipend, 750 national research slots) & NOS (20 slots for Top 500 QS universities worldwide).\n- **Eligibility & Verification:** Age limits, ₹8 Lakh income ceiling, UGC-NET scores, and resolving document name discrepancies (e.g. Caste certificate vs Application name).\n- **Deficiency Notices:** How to submit corrected documents within 15 days on the Track Status tab.\n- **Offline PWA Support:** Completing and queuing applications without active internet in remote tribal areas.\n- **Tribal Heritage & General Q&A:** Information about Indian Scheduled Tribes, PVTGs, arts, administrative rules, and general inquiries.\n\nFeel free to ask any specific follow-up question or click one of the quick suggestions below!`,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Attempt to query server-side Gemini AI with multi-turn conversation context
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s generous timeout

      // Pass previous conversational turns for contextual follow-up
      const chatHistory = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          language: activeLang,
          history: chatHistory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.reply && !data.fallback) {
          // Detect if response recommends a portal section
          let actionTab: 'apply' | 'track' | 'guidelines' | 'scrutiny' | 'merit' | undefined = undefined;
          const lowerReply = data.reply.toLowerCase();
          if (lowerReply.includes('track status') || lowerReply.includes('deficiency') || lowerReply.includes('dbt')) {
            actionTab = 'track';
          } else if (lowerReply.includes('apply now') || lowerReply.includes('multi-step form') || lowerReply.includes('application form')) {
            actionTab = 'apply';
          } else if (lowerReply.includes('guidelines') || lowerReply.includes('eligibility criteria')) {
            actionTab = 'guidelines';
          } else if (lowerReply.includes('merit roster') || lowerReply.includes('ranking')) {
            actionTab = 'merit';
          }

          const botMsg: ChatMessage = {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAiGenerated: true,
            quickActionTab: actionTab,
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (e) {
      // Network error, offline, or timeout: proceed gracefully to local engine
    }

    // 2. Intelligent Local Multilingual Knowledge Engine fallback
    setTimeout(() => {
      const localResponse = generateLocalBotResponse(text, activeLang);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: localResponse.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActionTab: localResponse.actionTab,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 300);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'bot',
        text: getTranslation('botGreeting', activeLang),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const activeLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === activeLang) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-emerald-950 text-emerald-100 text-xs px-3 py-1.5 rounded-full shadow-lg border border-emerald-700/60 hidden sm:flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{t('botName')}</span>
            <span className="text-[10px] text-emerald-300">({activeLangOption.nativeName})</span>
          </div>
        )}

        <button
          id="aroha-mitra-bot-toggle"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3.5 rounded-2xl text-white shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-stone-900 hover:bg-stone-800'
              : 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-700 hover:scale-105'
          }`}
          title="Open AROHA Mitra Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-emerald-300" />
          ) : (
            <>
              <div className="relative">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              </div>
              <span className="hidden sm:inline font-bold text-sm tracking-wide">
                {t('botName')}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div
          id="aroha-mitra-chat-window"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 md:w-[440px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-emerald-800/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Forest Green Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center font-bold shadow-md flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black text-white">{t('botName')}</h3>
                  <span className="bg-emerald-800 text-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-600">
                    MoTA AI
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-300 font-medium">
                  {t('botSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* In-Chat Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[11px] font-medium rounded-lg border border-emerald-600 transition cursor-pointer"
                  title="Switch Language"
                >
                  <Languages className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-bold">{activeLangOption.code.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-300" />
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute right-0 top-8 mt-1 w-36 bg-slate-900 text-white border border-emerald-600/60 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
                    <div className="px-2.5 py-1 text-[10px] text-emerald-400 font-bold border-b border-slate-800">
                      {t('selectLanguage') || 'Select Language'}
                    </div>
                    {SUPPORTED_LANGUAGES.map((langOpt) => (
                      <button
                        key={langOpt.code}
                        type="button"
                        onClick={() => {
                          setActiveLang(langOpt.code);
                          setLanguage(langOpt.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-800 transition cursor-pointer ${
                          activeLang === langOpt.code ? 'text-amber-400 font-bold bg-emerald-950/60' : 'text-slate-200'
                        }`}
                      >
                        <span>{langOpt.nativeName}</span>
                        <span className="text-[10px] text-slate-400">({langOpt.code.toUpperCase()})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/50 rounded-lg transition cursor-pointer"
                title={t('clearChat')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/50 rounded-lg transition cursor-pointer"
                title={t('minimize')}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-emerald-50/20 text-xs min-h-[260px] max-h-[400px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-emerald-900/10 rounded-bl-xs'
                  }`}
                >
                  <div className="leading-relaxed">
                    {msg.sender === 'bot' ? (
                      renderFormattedMarkdown(msg.text, false)
                    ) : (
                      <div className="whitespace-pre-line">{msg.text}</div>
                    )}
                  </div>

                  {/* Optional Quick Action Button */}
                  {msg.quickActionTab && onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateTab(msg.quickActionTab!);
                        setIsOpen(false);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition cursor-pointer"
                    >
                      <span>{t('goToSection') || 'Go to Section'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  <div className="flex items-center justify-between mt-1 text-[9px]">
                    {msg.isAiGenerated && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Gemini AI
                      </span>
                    )}
                    <span
                      className={`block text-right ml-auto ${
                        msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Clickable Suggestions Pills */}
          <div className="px-3.5 py-2.5 bg-emerald-50/60 border-t border-emerald-100 overflow-x-auto">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{t('quickQuestions')}</span>
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">
                {activeLangOption.nativeName}
              </span>
            </div>
            <div className="flex gap-1.5 pb-1 overflow-x-auto scrollbar-none">
              {getSuggestedPrompts().map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white text-emerald-900 border border-emerald-200 hover:border-emerald-600 hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('askPlaceholder')}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-800 transition cursor-pointer flex-shrink-0"
              title={t('send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
