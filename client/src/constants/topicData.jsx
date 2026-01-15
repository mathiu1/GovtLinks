
import React from 'react';
import { FaFingerprint, FaAddressCard, FaVoteYea, FaShoppingBasket, FaPassport, FaPiggyBank, FaRupeeSign, FaMapMarkedAlt, FaCar, FaFileSignature, FaLightbulb, FaSeedling, FaHeartbeat, FaLayerGroup, FaSearch, FaBriefcase, FaLandmark, FaGlobe, FaFileAlt, FaBus, FaFemale, FaGraduationCap, FaHome } from 'react-icons/fa';

export const serviceTopics = [
    { id: 'aadhar', en: 'Aadhaar', ta: 'ஆதார்', icon: <FaFingerprint /> },
    { id: 'pan', en: 'PAN Card', ta: 'பான் கார்டு', icon: <FaAddressCard /> },
    { id: 'voter', en: 'Voter ID', ta: 'வாக்காளர் அட்டை', icon: <FaVoteYea /> },
    { id: 'ration', en: 'Ration Card', ta: 'ரேஷன் கார்டு', icon: <FaShoppingBasket /> },
    { id: 'passport', en: 'Passport', ta: 'பாஸ்போர்ட்', icon: <FaPassport /> },

    { id: 'pf', en: 'PF / EPF', ta: 'பிஎஃப்', icon: <FaPiggyBank /> },
    { id: 'tax', en: 'Income Tax', ta: 'வருமான வரி', icon: <FaRupeeSign /> },
    { id: 'land', en: 'Patta / Chitta', ta: 'பட்டா / சிட்டா', icon: <FaMapMarkedAlt /> },
    { id: 'transport', en: 'Transport / RTO', ta: 'போக்குவரத்து', icon: <FaCar /> },
    { id: 'revenue', en: 'Certificates (Revenue)', ta: 'வருவாய் துறை', icon: <FaFileSignature /> },
    { id: 'employment', en: 'Employment', ta: 'வேலைவாய்ப்பு', icon: <FaBriefcase /> },
    { id: 'utilities', en: 'Electricity / EB', ta: 'மின்சாரம் / EB', icon: <FaLightbulb /> },
];

export const schemeTopics = [
    { id: 'all_schemes', en: 'All Schemes', ta: 'நலத்திட்டங்கள்', icon: <FaLayerGroup /> },
    { id: 'agri', en: 'Agriculture', ta: 'விவசாயம்', icon: <FaSeedling /> },
    { id: 'women', en: 'Women Welfare', ta: 'பெண்கள் நலம்', icon: <FaFemale /> },
    { id: 'student', en: 'Student/Scholarship', ta: 'மாணவர்', icon: <FaGraduationCap /> },
    { id: 'health', en: 'Health Schemes', ta: 'மருத்துவம்', icon: <FaHeartbeat /> },
    { id: 'loan', en: 'Loans', ta: 'கடனுதவி', icon: <FaLandmark /> },
    { id: 'housing', en: 'Housing', ta: 'வீட்டுவசதி', icon: <FaHome /> },
];

export const careerTopics = [
    { id: 'all_career', en: 'Jobs & Exams', ta: 'வேலைவாய்ப்பு & தேர்வுகள்', icon: <FaBriefcase /> },
    { id: 'job_state', en: 'State Govt Jobs', ta: 'மாநில அரசு வேலைகள்', icon: <FaLandmark /> },
    { id: 'job_central', en: 'Central Govt Jobs', ta: 'மத்திய அரசு வேலைகள்', icon: <FaGlobe /> },
    { id: 'exam_entrance', en: 'Entrance Exams', ta: 'நுழைவுத் தேர்வுகள்', icon: <FaFileAlt /> },
    { id: 'job_railway', en: 'Railways', ta: 'ரயில்வே', icon: <FaBus /> },
];
