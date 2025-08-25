import React from 'react';
import IconFallback from './IconFallback';

// Import all icons we might use
import {
  FiUsers,
  FiPlus,
  FiDollarSign,
  FiTarget,
  FiTrendingUp,
  FiCheck,
  FiX,
  FiLock,
  FiUnlock,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronUp,
  FiShield,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiList,
  FiSend,
  FiChevronLeft,
  FiGlobe,
  FiMessageCircle,
  FiMoreVertical,
  FiSmile,
  FiPaperclip,
  FiSearch,
  FiBell,
  FiSettings,
  FiHome,
  FiLogOut,
  FiMail,
  FiPhone,
  FiSmartphone,
  FiKey,
  FiCamera,
  FiCopy,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiRefreshCw,
  FiUser,
  FiDownload,
  FiHelpCircle,
  FiInfo,
  FiArchive,
} from "react-icons/fi";

const SafeIcon = ({ iconName, size = 20, color = "currentColor", ...props }) => {
  // Get the icon component
  const IconComponent = (() => {
    try {
      switch (iconName) {
        case 'FiUserPlus': return FiUserPlus;
        case 'FiUsers': return FiUsers;
        case 'FiPlus': return FiPlus;
        case 'FiDollarSign': return FiDollarSign;
        case 'FiTarget': return FiTarget;
        case 'FiTrendingUp': return FiTrendingUp;
        case 'FiCheck': return FiCheck;
        case 'FiX': return FiX;
        case 'FiLock': return FiLock;
        case 'FiUnlock': return FiUnlock;
        case 'FiEdit2': return FiEdit2;
        case 'FiTrash2': return FiTrash2;
        case 'FiEye': return FiEye;
        case 'FiChevronDown': return FiChevronDown;
        case 'FiChevronUp': return FiChevronUp;
        case 'FiShield': return FiShield;
        case 'FiArrowDownCircle': return FiArrowDownCircle;
        case 'FiArrowUpCircle': return FiArrowUpCircle;
        case 'FiList': return FiList;
        case 'FiSend': return FiSend;
        case 'FiChevronLeft': return FiChevronLeft;
        case 'FiGlobe': return FiGlobe;
        case 'FiMessageCircle': return FiMessageCircle;
        case 'FiMoreVertical': return FiMoreVertical;
        case 'FiSmile': return FiSmile;
        case 'FiPaperclip': return FiPaperclip;
        case 'FiSearch': return FiSearch;
        case 'FiBell': return FiBell;
              case 'FiSettings': return FiSettings;
      case 'FiEyeOff': return FiEyeOff;
      case 'FiHome': return FiHome;
      case 'FiLogOut': return FiLogOut;
      case 'FiMail': return FiMail;
      case 'FiPhone': return FiPhone;
      case 'FiSmartphone': return FiSmartphone;
      case 'FiKey': return FiKey;
      case 'FiCamera': return FiCamera;
      case 'FiCopy': return FiCopy;
      case 'FiCalendar': return FiCalendar;
      case 'FiClock': return FiClock;
      case 'FiCreditCard': return FiCreditCard;
      case 'FiRefreshCw': return FiRefreshCw;
      case 'FiUser': return FiUser;
      case 'FiDownload': return FiDownload;
      case 'FiHelpCircle': return FiHelpCircle;
      case 'FiInfo': return FiInfo;
      case 'FiArchive': return FiArchive;
      default: return null;
      }
    } catch (error) {
      console.warn(`Icon ${iconName} not found, using fallback`);
      return null;
    }
  })();

  // If icon component exists, render it
  if (IconComponent) {
    return <IconComponent size={size} color={color} {...props} />;
  }

  // Otherwise, render fallback
  return <IconFallback iconName={iconName} size={size} color={color} {...props} />;
};

export default SafeIcon;
