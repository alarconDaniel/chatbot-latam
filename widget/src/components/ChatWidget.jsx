import React, { useEffect, useMemo, useRef, useState } from "react";
import { askChatbot } from "../services/chatApi";
import avatarImage from "../assets/avatar.png";
import maleImage from "../assets/male.png";
import maleHomeGif from "../assets/male_home.gif";

const homeMaleGif = maleHomeGif;
const welcomeMaleImage = maleImage;
const assistantProfileImage = avatarImage;

const frequentQuestions = [
  "¿Qué es Latinoamérica Comparte?",
  "¿Qué líneas tiene Latinoamérica Comparte?",
  "¿Qué es Comparte Academia?",
  "¿Qué es DESCUBRE?",
  "¿Qué es ESTRUCTURA?",
  "¿En qué se diferencian DESCUBRE y ESTRUCTURA?",
];

function formatTime() {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function createInitialMessage() {
  return {
    id: "welcome",
    role: "bot",
    text:
      "¡Hola! Soy Male, el asistente de Latinoamérica Comparte. Estoy aquí para orientarte sobre programas, iniciativas, formas de apoyo y participación.",
    time: formatTime(),
  };
}

function getStoredValue(key, fallbackValue) {
  if (typeof window === "undefined") return fallbackValue;

  try {
    return window.localStorage.getItem(key) || fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveStoredValue(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // no-op
  }
}

const COUNTRY_THEME_ALIASES = {
  latam: "latam",
  lac: "latam",
  regional: "latam",
  co: "co",
  colombia: "co",
  cl: "cl",
  chile: "cl",
  ec: "ec",
  ecuador: "ec",
  ar: "ar",
  argentina: "ar",
};

const COUNTRY_VISUAL_THEMES = {
  latam: {
    label: "Latinoamérica",
    badgeLabel: "Latinoamérica Comparte",
    emoji: "🌎",
    light: {
      headerBackground:
        "linear-gradient(135deg, #8B5E3C 0%, #A8754A 48%, #B76B5F 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #8B5E3C 0%, #A8754A 48%, #B76B5F 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.36) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.22) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.14) 0, transparent 30%), linear-gradient(160deg, #FFF7E3 0%, #F8E3BC 48%, #E88F76 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(168, 117, 74, 0.10) 0 2px, transparent 2.5px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.13) 0, transparent 24%), radial-gradient(circle at 12% 90%, rgba(90, 64, 50, 0.10) 0, transparent 30%), repeating-linear-gradient(90deg, rgba(90,64,50,0.028) 0 1px, transparent 1px 18px), linear-gradient(180deg, #FFF7E3 0%, #F8E3BC 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #8B5E3C 0%, #A8754A 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.18)",
      userBubbleShadow: "0 14px 28px rgba(90,64,50,0.18)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(139,94,60,0.22) 0 5px, rgba(168,117,74,0.16) 5px 10px, rgba(183,107,95,0.14) 10px 15px, transparent 15px), #FFF7E3",
      botBubbleBorder: "rgba(90, 64, 50, 0.16)",
      badgeBackground: "rgba(255,255,255,0.22)",
      badgeBorder: "rgba(255,255,255,0.32)",
      badgeColor: "#ffffff",
      typingDot: "#5A4032",
      inputShellBorder: "rgba(90, 64, 50, 0.16)",
      inputSparkBackground: "#F8E3BC",
      inputSparkColor: "#5A4032",
      sendButtonBackground:
        "linear-gradient(135deg, #8B5E3C 0%, #A8754A 56%, #B76B5F 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 26px rgba(90,64,50,0.24)",
    },
    dark: {
      headerBackground:
        "linear-gradient(135deg, #1E1713 0%, #2D211B 48%, #5A4032 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #1E1713 0%, #2D211B 48%, #5A4032 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.14) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.18) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.12) 0, transparent 30%), linear-gradient(160deg, #113116 0%, #1E1713 44%, #2D211B 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.08) 0 2px, transparent 2.4px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.12) 0, transparent 24%), radial-gradient(circle at 10% 82%, rgba(168, 117, 74, 0.13) 0, transparent 28%), repeating-linear-gradient(90deg, rgba(248,227,188,0.04) 0 1px, transparent 1px 18px), linear-gradient(180deg, #2D211B 0%, #1E1713 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.16)",
      userBubbleShadow: "0 14px 28px rgba(17,19,22,0.28)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(139,94,60,0.26) 0 5px, rgba(168,117,74,0.22) 5px 10px, rgba(183,107,95,0.18) 10px 15px, transparent 15px), rgba(45, 33, 27, 0.96)",
      botBubbleBorder: "rgba(248, 227, 188, 0.14)",
      badgeBackground: "rgba(255,255,255,0.16)",
      badgeBorder: "rgba(255,255,255,0.22)",
      badgeColor: "#ffffff",
      typingDot: "#F8E3BC",
      inputShellBorder: "rgba(248, 227, 188, 0.16)",
      inputSparkBackground: "rgba(248,227,188,0.10)",
      inputSparkColor: "#F8E3BC",
      sendButtonBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 26px rgba(17,19,22,0.28)",
    },
  },
  co: {
    label: "Colombia",
    badgeLabel: "Colombia Comparte",
    emoji: "🇨🇴",
    light: {
      headerBackground:
        "linear-gradient(135deg, rgba(18,31,54,0.16), rgba(18,31,54,0.16)), linear-gradient(135deg, #fcd116 0%, #fcd116 42%, #003893 42%, #003893 72%, #ce1126 72%, #ce1126 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #fcd116 0%, #fcd116 50%, #003893 50%, #003893 75%, #ce1126 75%, #ce1126 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.36) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.22) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.14) 0, transparent 30%), linear-gradient(160deg, #FFF7E3 0%, #F8E3BC 48%, #E88F76 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(168, 117, 74, 0.10) 0 2px, transparent 2.5px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.13) 0, transparent 24%), radial-gradient(circle at 12% 90%, rgba(90, 64, 50, 0.10) 0, transparent 30%), repeating-linear-gradient(90deg, rgba(90,64,50,0.028) 0 1px, transparent 1px 18px), linear-gradient(180deg, #FFF7E3 0%, #F8E3BC 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.18)",
      userBubbleShadow: "0 14px 28px rgba(90,64,50,0.18)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(252,209,22,0.44) 0 7px, rgba(0,56,147,0.30) 7px 13px, rgba(206,17,38,0.28) 13px 19px, transparent 19px), #ffffff",
      botBubbleBorder: "rgba(0, 56, 147, 0.24)",
      badgeBackground: "rgba(255,255,255,0.24)",
      badgeBorder: "rgba(255,255,255,0.38)",
      badgeColor: "#ffffff",
      typingDot: "#0b4fa3",
      inputShellBorder: "rgba(0,56,147,0.22)",
      inputSparkBackground: "linear-gradient(180deg, rgba(252,209,22,0.34), rgba(252,209,22,0.14))",
      inputSparkColor: "#0b4fa3",
      sendButtonBackground:
        "linear-gradient(135deg, #fcd116 0%, #fcd116 38%, #003893 39%, #003893 70%, #ce1126 71%, #ce1126 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 28px rgba(0,56,147,0.28)",
    },
    dark: {
      headerBackground:
        "linear-gradient(135deg, rgba(5,14,28,0.24), rgba(5,14,28,0.24)), linear-gradient(135deg, #fcd116 0%, #fcd116 42%, #0a4ea3 42%, #0a4ea3 72%, #d6283d 72%, #d6283d 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #fcd116 0%, #fcd116 50%, #0a4ea3 50%, #0a4ea3 75%, #d6283d 75%, #d6283d 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.14) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.18) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.12) 0, transparent 30%), linear-gradient(160deg, #113116 0%, #1E1713 44%, #2D211B 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.08) 0 2px, transparent 2.4px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.12) 0, transparent 24%), radial-gradient(circle at 10% 82%, rgba(168, 117, 74, 0.13) 0, transparent 28%), repeating-linear-gradient(90deg, rgba(248,227,188,0.04) 0 1px, transparent 1px 18px), linear-gradient(180deg, #2D211B 0%, #1E1713 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.16)",
      userBubbleShadow: "0 14px 28px rgba(17,19,22,0.24)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(252,209,22,0.42) 0 7px, rgba(68,132,245,0.36) 7px 13px, rgba(225,70,58,0.34) 13px 19px, transparent 19px), rgba(45, 33, 27, 0.96)",
      botBubbleBorder: "rgba(252,209,22,0.24)",
      badgeBackground: "rgba(255,255,255,0.18)",
      badgeBorder: "rgba(255,255,255,0.28)",
      badgeColor: "#ffffff",
      typingDot: "#ffe07b",
      inputShellBorder: "rgba(252,209,22,0.22)",
      inputSparkBackground: "rgba(252,209,22,0.16)",
      inputSparkColor: "#ffe07b",
      sendButtonBackground:
        "linear-gradient(135deg, #fcd116 0%, #fcd116 38%, #0a4ea3 39%, #0a4ea3 70%, #d6283d 71%, #d6283d 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 28px rgba(0,0,0,0.32)",
    },
  },
  cl: {
    label: "Chile",
    badgeLabel: "Chile Comparte",
    emoji: "🇨🇱",
    light: {
      headerBackground:
        "linear-gradient(135deg, rgba(8,22,44,0.16), rgba(8,22,44,0.16)), linear-gradient(135deg, #0039a6 0%, #1b59c9 34%, #ffffff 34%, #ffffff 60%, #d52b1e 60%, #d52b1e 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #0039a6 0%, #0039a6 34%, #ffffff 34%, #ffffff 67%, #d52b1e 67%, #d52b1e 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.36) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.22) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.14) 0, transparent 30%), linear-gradient(160deg, #FFF7E3 0%, #F8E3BC 48%, #E88F76 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(168, 117, 74, 0.10) 0 2px, transparent 2.5px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.13) 0, transparent 24%), radial-gradient(circle at 12% 90%, rgba(90, 64, 50, 0.10) 0, transparent 30%), repeating-linear-gradient(90deg, rgba(90,64,50,0.028) 0 1px, transparent 1px 18px), linear-gradient(180deg, #FFF7E3 0%, #F8E3BC 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.18)",
      userBubbleShadow: "0 14px 28px rgba(90,64,50,0.18)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(0,57,166,0.42) 0 8px, rgba(255,255,255,0.64) 8px 14px, rgba(213,43,30,0.30) 14px 20px, transparent 20px), #ffffff",
      botBubbleBorder: "rgba(0,57,166,0.24)",
      badgeBackground: "rgba(255,255,255,0.24)",
      badgeBorder: "rgba(255,255,255,0.38)",
      badgeColor: "#ffffff",
      typingDot: "#0039a6",
      inputShellBorder: "rgba(0,57,166,0.22)",
      inputSparkBackground: "rgba(0,57,166,0.12)",
      inputSparkColor: "#0039a6",
      sendButtonBackground:
        "linear-gradient(135deg, #0039a6 0%, #1f62d1 42%, #ffffff 43%, #ffffff 58%, #d52b1e 59%, #d52b1e 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 28px rgba(0,57,166,0.28)",
    },
    dark: {
      headerBackground:
        "linear-gradient(135deg, rgba(5,14,28,0.26), rgba(5,14,28,0.26)), linear-gradient(135deg, #0039a6 0%, #1b59c9 34%, #f0f7ff 34%, #f0f7ff 60%, #d52b1e 60%, #d52b1e 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #0039a6 0%, #0039a6 34%, #f0f7ff 34%, #f0f7ff 67%, #d52b1e 67%, #d52b1e 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.14) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.18) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.12) 0, transparent 30%), linear-gradient(160deg, #113116 0%, #1E1713 44%, #2D211B 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.08) 0 2px, transparent 2.4px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.12) 0, transparent 24%), radial-gradient(circle at 10% 82%, rgba(168, 117, 74, 0.13) 0, transparent 28%), repeating-linear-gradient(90deg, rgba(248,227,188,0.04) 0 1px, transparent 1px 18px), linear-gradient(180deg, #2D211B 0%, #1E1713 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.16)",
      userBubbleShadow: "0 14px 28px rgba(17,19,22,0.24)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(68,132,245,0.46) 0 8px, rgba(255,255,255,0.26) 8px 14px, rgba(225,70,58,0.38) 14px 20px, transparent 20px), rgba(45, 33, 27, 0.96)",
      botBubbleBorder: "rgba(104,158,255,0.24)",
      badgeBackground: "rgba(255,255,255,0.18)",
      badgeBorder: "rgba(255,255,255,0.28)",
      badgeColor: "#ffffff",
      typingDot: "#9dc2ff",
      inputShellBorder: "rgba(104,158,255,0.22)",
      inputSparkBackground: "rgba(68,132,245,0.16)",
      inputSparkColor: "#9dc2ff",
      sendButtonBackground:
        "linear-gradient(135deg, #0039a6 0%, #1f62d1 42%, #f0f7ff 43%, #f0f7ff 58%, #d52b1e 59%, #d52b1e 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 28px rgba(0,0,0,0.32)",
    },
  },
  ec: {
    label: "Ecuador",
    badgeLabel: "Ecuador Comparte",
    emoji: "🇪🇨",
    light: {
      headerBackground:
        "linear-gradient(135deg, rgba(18,31,54,0.16), rgba(18,31,54,0.16)), linear-gradient(135deg, #f4c542 0%, #f4c542 42%, #034ea2 42%, #034ea2 72%, #ef3340 72%, #ef3340 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #f4c542 0%, #f4c542 50%, #034ea2 50%, #034ea2 75%, #ef3340 75%, #ef3340 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.36) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.22) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.14) 0, transparent 30%), linear-gradient(160deg, #FFF7E3 0%, #F8E3BC 48%, #E88F76 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(168, 117, 74, 0.10) 0 2px, transparent 2.5px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.13) 0, transparent 24%), radial-gradient(circle at 12% 90%, rgba(90, 64, 50, 0.10) 0, transparent 30%), repeating-linear-gradient(90deg, rgba(90,64,50,0.028) 0 1px, transparent 1px 18px), linear-gradient(180deg, #FFF7E3 0%, #F8E3BC 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.18)",
      userBubbleShadow: "0 14px 28px rgba(90,64,50,0.18)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(244,197,66,0.44) 0 7px, rgba(3,78,162,0.30) 7px 13px, rgba(239,51,64,0.28) 13px 19px, transparent 19px), #ffffff",
      botBubbleBorder: "rgba(3,78,162,0.24)",
      badgeBackground: "rgba(255,255,255,0.24)",
      badgeBorder: "rgba(255,255,255,0.38)",
      badgeColor: "#ffffff",
      typingDot: "#034ea2",
      inputShellBorder: "rgba(3,78,162,0.22)",
      inputSparkBackground: "linear-gradient(180deg, rgba(244,197,66,0.34), rgba(244,197,66,0.14))",
      inputSparkColor: "#034ea2",
      sendButtonBackground:
        "linear-gradient(135deg, #f4c542 0%, #f4c542 38%, #034ea2 39%, #034ea2 70%, #ef3340 71%, #ef3340 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 28px rgba(3,78,162,0.28)",
    },
    dark: {
      headerBackground:
        "linear-gradient(135deg, rgba(5,14,28,0.24), rgba(5,14,28,0.24)), linear-gradient(135deg, #f4c542 0%, #f4c542 42%, #145fba 42%, #145fba 72%, #ef5260 72%, #ef5260 100%)",
      ribbonBackground:
        "linear-gradient(90deg, #f4c542 0%, #f4c542 50%, #145fba 50%, #145fba 75%, #ef5260 75%, #ef5260 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.14) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.18) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.12) 0, transparent 30%), linear-gradient(160deg, #113116 0%, #1E1713 44%, #2D211B 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.08) 0 2px, transparent 2.4px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.12) 0, transparent 24%), radial-gradient(circle at 10% 82%, rgba(168, 117, 74, 0.13) 0, transparent 28%), repeating-linear-gradient(90deg, rgba(248,227,188,0.04) 0 1px, transparent 1px 18px), linear-gradient(180deg, #2D211B 0%, #1E1713 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.16)",
      userBubbleShadow: "0 14px 28px rgba(17,19,22,0.24)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(244,197,66,0.42) 0 7px, rgba(58,128,224,0.36) 7px 13px, rgba(239,82,92,0.34) 13px 19px, transparent 19px), rgba(45, 33, 27, 0.96)",
      botBubbleBorder: "rgba(244,197,66,0.24)",
      badgeBackground: "rgba(255,255,255,0.18)",
      badgeBorder: "rgba(255,255,255,0.28)",
      badgeColor: "#ffffff",
      typingDot: "#ffe39a",
      inputShellBorder: "rgba(244,197,66,0.22)",
      inputSparkBackground: "rgba(244,197,66,0.16)",
      inputSparkColor: "#ffe39a",
      sendButtonBackground:
        "linear-gradient(135deg, #f4c542 0%, #f4c542 38%, #145fba 39%, #145fba 70%, #ef5260 71%, #ef5260 100%)",
      sendButtonColor: "#ffffff",
      sendButtonShadow: "0 14px 28px rgba(0,0,0,0.32)",
    },
  },
  ar: {
    label: "Argentina",
    badgeLabel: "Argentina Comparte",
    emoji: "🇦🇷",
    light: {
      headerBackground:
        "linear-gradient(135deg, rgba(12,35,57,0.14), rgba(12,35,57,0.14)), radial-gradient(circle at 50% 50%, rgba(246,180,14,0.95) 0 7%, transparent 7.4%), linear-gradient(135deg, #74acdf 0%, #dff2ff 48%, #74acdf 100%)",
      ribbonBackground:
        "radial-gradient(circle at 50% 50%, rgba(246,180,14,0.95) 0 9%, transparent 9.5%), linear-gradient(90deg, #74acdf 0%, #dff2ff 50%, #74acdf 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.36) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.22) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.14) 0, transparent 30%), linear-gradient(160deg, #FFF7E3 0%, #F8E3BC 48%, #E88F76 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(168, 117, 74, 0.10) 0 2px, transparent 2.5px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.13) 0, transparent 24%), radial-gradient(circle at 12% 90%, rgba(90, 64, 50, 0.10) 0, transparent 30%), repeating-linear-gradient(90deg, rgba(90,64,50,0.028) 0 1px, transparent 1px 18px), linear-gradient(180deg, #FFF7E3 0%, #F8E3BC 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.18)",
      userBubbleShadow: "0 14px 28px rgba(90,64,50,0.18)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(116,172,223,0.48) 0 7px, rgba(246,180,14,0.30) 7px 13px, rgba(116,172,223,0.48) 13px 19px, transparent 19px), #ffffff",
      botBubbleBorder: "rgba(74,145,209,0.26)",
      badgeBackground: "rgba(255,255,255,0.24)",
      badgeBorder: "rgba(255,255,255,0.38)",
      badgeColor: "#ffffff",
      typingDot: "#347dbd",
      inputShellBorder: "rgba(74,145,209,0.22)",
      inputSparkBackground: "rgba(116,172,223,0.20)",
      inputSparkColor: "#2167a6",
      sendButtonBackground:
        "radial-gradient(circle at 50% 50%, rgba(246,180,14,0.96) 0 12%, transparent 12.5%), linear-gradient(135deg, #74acdf 0%, #dff2ff 48%, #74acdf 100%)",
      sendButtonColor: "#0f3c66",
      sendButtonShadow: "0 14px 28px rgba(52,125,189,0.28)",
    },
    dark: {
      headerBackground:
        "linear-gradient(135deg, rgba(5,14,28,0.22), rgba(5,14,28,0.22)), radial-gradient(circle at 50% 50%, rgba(246,180,14,0.95) 0 7%, transparent 7.4%), linear-gradient(135deg, #74acdf 0%, #dff2ff 48%, #74acdf 100%)",
      ribbonBackground:
        "radial-gradient(circle at 50% 50%, rgba(246,180,14,0.95) 0 9%, transparent 9.5%), linear-gradient(90deg, #74acdf 0%, #dff2ff 50%, #74acdf 100%)",
      homeBackground:
        "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.14) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.18) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.12) 0, transparent 30%), linear-gradient(160deg, #113116 0%, #1E1713 44%, #2D211B 100%)",
      chatBackground:
        "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.08) 0 2px, transparent 2.4px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.12) 0, transparent 24%), radial-gradient(circle at 10% 82%, rgba(168, 117, 74, 0.13) 0, transparent 28%), repeating-linear-gradient(90deg, rgba(248,227,188,0.04) 0 1px, transparent 1px 18px), linear-gradient(180deg, #2D211B 0%, #1E1713 100%)",
      userBubbleBackground:
        "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
      userBubbleBorder: "rgba(255,255,255,0.16)",
      userBubbleShadow: "0 14px 28px rgba(17,19,22,0.24)",
      botBubbleBackground:
        "linear-gradient(90deg, rgba(116,172,223,0.46) 0 7px, rgba(246,180,14,0.34) 7px 13px, rgba(116,172,223,0.46) 13px 19px, transparent 19px), rgba(45, 33, 27, 0.96)",
      botBubbleBorder: "rgba(149,202,245,0.26)",
      badgeBackground: "rgba(255,255,255,0.18)",
      badgeBorder: "rgba(255,255,255,0.28)",
      badgeColor: "#ffffff",
      typingDot: "#b9e1ff",
      inputShellBorder: "rgba(149,202,245,0.22)",
      inputSparkBackground: "rgba(116,172,223,0.16)",
      inputSparkColor: "#b9e1ff",
      sendButtonBackground:
        "radial-gradient(circle at 50% 50%, rgba(246,180,14,0.96) 0 12%, transparent 12.5%), linear-gradient(135deg, #74acdf 0%, #dff2ff 48%, #74acdf 100%)",
      sendButtonColor: "#0f3c66",
      sendButtonShadow: "0 14px 28px rgba(0,0,0,0.32)",
    },
  },
};

function getCountryTheme(country) {
  const normalizedCountry = String(country || "latam").trim().toLowerCase();
  const themeKey = COUNTRY_THEME_ALIASES[normalizedCountry] || "latam";
  return COUNTRY_VISUAL_THEMES[themeKey];
}

function normalizeCountryCode(country) {
  const normalizedCountry = String(country || "latam").trim().toLowerCase();
  return COUNTRY_THEME_ALIASES[normalizedCountry] || "latam";
}

function normalizeCountryDetectionText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectCountryFromMessage(message, fallbackCountry = "latam") {
  const normalizedMessage = normalizeCountryDetectionText(message);
  const normalizedFallback = normalizeCountryCode(fallbackCountry);

  const countryPatterns = {
    co: [
      /\bcolombia\b/,
      /\bcolombia comparte\b/,
      /\bcolombiano(?:s|a|as)?\b/,
    ],
    cl: [
      /\bchile\b/,
      /\bchile comparte\b/,
      /\bchileno(?:s|a|as)?\b/,
    ],
    ec: [
      /\becuador\b/,
      /\becuador comparte\b/,
      /\becuatoriano(?:s|a|as)?\b/,
    ],
    ar: [
      /\bargentina\b/,
      /\bargentina comparte\b/,
      /\bargentino(?:s|a|as)?\b/,
    ],
  };

  const matchedCountries = Object.entries(countryPatterns)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(normalizedMessage)))
    .map(([countryCode]) => countryCode);

  const explicitlyMentionsLatam =
    /\b(latam|latinoamerica|latinoamerica comparte|latinoamericano(?:s|a|as)?)\b/.test(
      normalizedMessage
    );

  if (matchedCountries.length === 1) {
    return matchedCountries[0];
  }

  if (matchedCountries.length > 1) {
    return "latam";
  }

  if (explicitlyMentionsLatam) {
    return "latam";
  }

  return normalizedFallback;
}

function buildStyles({ isDark, isLargeText, country }) {
  const colors = isDark
    ? {
        pageBg:
          "radial-gradient(circle at 14% 10%, rgba(248, 227, 188, 0.12) 0, transparent 24%), radial-gradient(circle at 86% 10%, rgba(232, 143, 118, 0.14) 0, transparent 20%), radial-gradient(circle at 50% 88%, rgba(168, 117, 74, 0.14) 0, transparent 28%), linear-gradient(165deg, #113116 0%, #1E1713 48%, #2D211B 100%)",
        chatBg:
          "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.09) 0 2px, transparent 2.4px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.12) 0, transparent 24%), radial-gradient(circle at 10% 82%, rgba(168, 117, 74, 0.13) 0, transparent 28%), repeating-linear-gradient(90deg, rgba(248,227,188,0.04) 0 1px, transparent 1px 18px), linear-gradient(180deg, #2D211B 0%, #1E1713 100%)",
        headerBg:
          "linear-gradient(135deg, #1E1713 0%, #2D211B 48%, #5A4032 100%)",
        card: "rgba(45, 33, 27, 0.94)",
        cardStrong: "rgba(30, 23, 19, 0.98)",
        cardSoft: "rgba(248, 227, 188, 0.08)",
        cardSubtle: "rgba(248, 227, 188, 0.05)",
        border: "rgba(248, 227, 188, 0.14)",
        text: "#FFF7E3",
        muted: "#F8E3BC",
        subtle: "#D8B991",
        white: "#ffffff",
        success: "#22C55E",
        userBubble:
          "linear-gradient(135deg, #5A4032 0%, #8B5E3C 56%, #B76B5F 100%)",
        botBubble: "rgba(45, 33, 27, 0.96)",
        inputBg: "rgba(30, 23, 19, 0.96)",
        shadow: "0 30px 72px rgba(17, 19, 22, 0.38)",
        softShadow: "0 18px 40px rgba(17, 19, 22, 0.22)",
      }
    : {
        pageBg:
          "radial-gradient(circle at 12% 9%, rgba(248, 227, 188, 0.26) 0, transparent 24%), radial-gradient(circle at 88% 10%, rgba(232, 143, 118, 0.16) 0, transparent 22%), radial-gradient(circle at 50% 90%, rgba(168, 117, 74, 0.12) 0, transparent 28%), linear-gradient(165deg, #FFF7E3 0%, #F8E3BC 46%, #E88F76 100%)",
        chatBg:
          "radial-gradient(circle at 12% 10%, rgba(168, 117, 74, 0.10) 0 2px, transparent 2.5px), radial-gradient(circle at 84% 18%, rgba(232, 143, 118, 0.12) 0, transparent 24%), radial-gradient(circle at 12% 90%, rgba(90, 64, 50, 0.10) 0, transparent 30%), repeating-linear-gradient(90deg, rgba(90,64,50,0.028) 0 1px, transparent 1px 18px), linear-gradient(180deg, #FFF7E3 0%, #F8E3BC 100%)",
        headerBg:
          "linear-gradient(135deg, #8B5E3C 0%, #A8754A 48%, #B76B5F 100%)",
        card: "rgba(255, 247, 227, 0.96)",
        cardStrong: "rgba(248, 227, 188, 0.99)",
        cardSoft: "rgba(255, 247, 227, 0.92)",
        cardSubtle: "rgba(248, 227, 188, 0.88)",
        border: "rgba(90, 64, 50, 0.16)",
        text: "#2D211B",
        muted: "#5A4032",
        subtle: "#8B5E3C",
        white: "#ffffff",
        success: "#22C55E",
        userBubble:
          "linear-gradient(135deg, #8B5E3C 0%, #A8754A 56%, #B76B5F 100%)",
        botBubble: "#FFF7E3",
        inputBg: "#FFF7E3",
        shadow: "0 30px 70px rgba(90, 64, 50, 0.18)",
        softShadow: "0 18px 38px rgba(90, 64, 50, 0.11)",
      };

  const countryTheme = getCountryTheme(country);
  const countryStyle = countryTheme[isDark ? "dark" : "light"];
  const countryThemeAnimation =
    {
      latam: "lcThemeShiftLatam",
      co: "lcThemeShiftCo",
      cl: "lcThemeShiftCl",
      ar: "lcThemeShiftAr",
      ec: "lcThemeShiftEc",
    }[normalizeCountryCode(country)] || "lcThemeShiftLatam";

  const chatFontSize = isLargeText ? "15.5px" : "14px";
  const textBase = isLargeText ? "14.5px" : "13.5px";

  return {
    colors,

    globalStyle: `
      .lc-chat-scroll::-webkit-scrollbar,
      .lc-page-scroll::-webkit-scrollbar { width: 8px; }
      .lc-chat-scroll::-webkit-scrollbar-track,
      .lc-page-scroll::-webkit-scrollbar-track { background: transparent; }
      .lc-chat-scroll::-webkit-scrollbar-thumb,
      .lc-page-scroll::-webkit-scrollbar-thumb {
        background: ${isDark ? "rgba(248,227,188,0.24)" : "rgba(90,64,50,0.22)"};
        border-radius: 999px;
      }
      .lc-soft-button {
        transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease, filter 160ms ease;
      }
      .lc-soft-button:hover { transform: translateY(-1px); filter: brightness(1.02); }
      .lc-soft-button:active { transform: translateY(0) scale(0.985); }
      .lc-chip {
        transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
      }
      .lc-chip:hover { transform: translateY(-1px); }
      .lc-dot:nth-child(1) { animation: lcTyping 1s infinite ease-in-out; }
      .lc-dot:nth-child(2) { animation: lcTyping 1s infinite ease-in-out 0.14s; }
      .lc-dot:nth-child(3) { animation: lcTyping 1s infinite ease-in-out 0.28s; }
      .lc-pulse { animation: lcPulse 1.7s ease-in-out infinite; }
      .lc-float { animation: lcFloat 4.8s ease-in-out infinite; }
      .lc-home-male { animation: lcHomeMale 5.8s ease-in-out infinite; }
      .lc-home-bubble { animation: lcHomeBubble 4.8s ease-in-out infinite; }
      .lc-home-bubble-alt { animation: lcHomeBubbleAlt 5.2s ease-in-out infinite; }
      .lc-home-shine { animation: lcHomeShine 4.5s ease-in-out infinite; }
      @keyframes lcTyping {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.42; }
        40% { transform: translateY(-4px); opacity: 1; }
      }
      @keyframes lcPulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(168, 117, 74, 0.16); }
        50% { box-shadow: 0 0 0 7px rgba(168, 117, 74, 0.07); }
      }
      @keyframes lcFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .lc-launcher-shell { user-select: none; }
      .lc-launcher-button {
        transition: transform 220ms ease, filter 220ms ease, box-shadow 220ms ease;
      }
      .lc-launcher-button:hover {
        transform: translateY(-4px) scale(1.035);
        filter: brightness(1.04);
      }
      .lc-launcher-button:active {
        transform: translateY(-1px) scale(0.985);
      }
      .lc-launcher-male { animation: lcLauncherMale 4.2s ease-in-out infinite; }
      .lc-launcher-ring { animation: lcLauncherRing 2.8s ease-in-out infinite; }
      .lc-launcher-ring-alt { animation: lcLauncherRingAlt 3.1s ease-in-out infinite; }
      .lc-launcher-shine { animation: lcLauncherShine 3.6s ease-in-out infinite; }
      .lc-launcher-sparkle { animation: lcLauncherSparkle 2.6s ease-in-out infinite; }
      .lc-launcher-hint { animation: lcLauncherHint 4.2s ease-in-out infinite; }
      @keyframes lcLauncherMale {
        0%, 100% { transform: translateY(7px) scale(1); }
        50% { transform: translateY(1px) scale(1.035); }
      }
      @keyframes lcLauncherRing {
        0%, 100% { transform: scale(1); opacity: 0.64; }
        50% { transform: scale(1.1); opacity: 0.18; }
      }
      @keyframes lcLauncherRingAlt {
        0%, 100% { transform: scale(1); opacity: 0.42; }
        50% { transform: scale(1.14); opacity: 0.08; }
      }
      @keyframes lcLauncherShine {
        0%, 100% { transform: translateX(0) rotate(18deg); opacity: 0.34; }
        50% { transform: translateX(9px) rotate(18deg); opacity: 0.62; }
      }
      @keyframes lcLauncherSparkle {
        0%, 100% { transform: rotate(0deg) scale(0.92); opacity: 0.74; }
        50% { transform: rotate(14deg) scale(1.12); opacity: 1; }
      }
      @keyframes lcLauncherHint {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }

      @keyframes lcThemeShiftLatam {
        0% {
          opacity: 0.78;
          transform: translate3d(0, 5px, 0) scale(0.994);
        }
        48% {
          opacity: 0.96;
          transform: translate3d(0, 1px, 0) scale(0.999);
        }
        78% {
          opacity: 1;
          transform: translate3d(0, -1px, 0) scale(1.001);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
      @keyframes lcThemeShiftCo {
        0% {
          opacity: 0.78;
          transform: translate3d(0, 5px, 0) scale(0.994);
        }
        48% {
          opacity: 0.96;
          transform: translate3d(0, 1px, 0) scale(0.999);
        }
        78% {
          opacity: 1;
          transform: translate3d(0, -1px, 0) scale(1.001);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
      @keyframes lcThemeShiftCl {
        0% {
          opacity: 0.78;
          transform: translate3d(0, 5px, 0) scale(0.994);
        }
        48% {
          opacity: 0.96;
          transform: translate3d(0, 1px, 0) scale(0.999);
        }
        78% {
          opacity: 1;
          transform: translate3d(0, -1px, 0) scale(1.001);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
      @keyframes lcThemeShiftAr {
        0% {
          opacity: 0.78;
          transform: translate3d(0, 5px, 0) scale(0.994);
        }
        48% {
          opacity: 0.96;
          transform: translate3d(0, 1px, 0) scale(0.999);
        }
        78% {
          opacity: 1;
          transform: translate3d(0, -1px, 0) scale(1.001);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
      @keyframes lcThemeShiftEc {
        0% {
          opacity: 0.78;
          transform: translate3d(0, 5px, 0) scale(0.994);
        }
        48% {
          opacity: 0.96;
          transform: translate3d(0, 1px, 0) scale(0.999);
        }
        78% {
          opacity: 1;
          transform: translate3d(0, -1px, 0) scale(1.001);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @keyframes lcUserMessageEnter {
        0% {
          opacity: 0;
          transform: translate3d(18px, 8px, 0) scale(0.985);
          filter: blur(1.2px);
        }
        58% {
          opacity: 1;
          transform: translate3d(-1px, -1px, 0) scale(1.006);
          filter: blur(0);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes lcBotMessageEnter {
        0% {
          opacity: 0;
          transform: translate3d(-18px, 8px, 0) scale(0.985);
          filter: blur(1.2px);
        }
        58% {
          opacity: 1;
          transform: translate3d(1px, -1px, 0) scale(1.006);
          filter: blur(0);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes lcMessageBubbleSettle {
        0% {
          box-shadow: 0 4px 10px rgba(90, 64, 50, 0.04);
        }
        62% {
          box-shadow: 0 18px 34px rgba(90, 64, 50, 0.12);
        }
        100% {
          box-shadow: inherit;
        }
      }

      @keyframes lcTypingBubbleEnter {
        0% {
          opacity: 0;
          transform: translate3d(-12px, 6px, 0) scale(0.985);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @keyframes lcAvatarSoftPop {
        0% {
          opacity: 0.75;
          transform: translateY(4px) scale(0.92);
        }
        68% {
          opacity: 1;
          transform: translateY(-1px) scale(1.05);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @media (max-width: 560px) {
        .lc-launcher-shell {
          right: 16px !important;
          bottom: max(16px, env(safe-area-inset-bottom)) !important;
          gap: 0 !important;
        }
        .lc-launcher-hint { display: none !important; }
        .lc-launcher-button {
          width: 108px !important;
          height: 108px !important;
        }
        .lc-launcher-male {
          width: 126px !important;
          height: 126px !important;
        }
        .lc-widget-shell {
          right: 16px !important;
          bottom: max(16px, env(safe-area-inset-bottom)) !important;
          width: calc(100vw - 32px) !important;
          height: min(640px, calc(100vh - 32px)) !important;
        }
      }
      .lc-input::placeholder {
        color: ${isDark ? "rgba(248,227,188,0.62)" : "rgba(90,64,50,0.72)"};
      }
    `,

    launcherShell: {
      position: "fixed",
      right: "24px",
      bottom: "max(22px, env(safe-area-inset-bottom))",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "14px",
      pointerEvents: "none",
      transform: "scale(0.75)",
      transformOrigin: "bottom right",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    launcherHint: {
      maxWidth: "220px",
      padding: "13px 15px",
      borderRadius: "22px",
      background: isDark ? "rgba(45, 33, 27, 0.94)" : "rgba(255, 247, 227, 0.96)",
      border: `1px solid ${countryStyle.botBubbleBorder || colors.border}`,
      boxShadow: isDark
        ? "0 18px 42px rgba(3, 18, 33, 0.30)"
        : "0 18px 42px rgba(90, 64, 50, 0.16)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      color: colors.text,
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      pointerEvents: "none",
      textAlign: "left",
    },

    launcherHintEyebrow: {
      color: colors.subtle,
      fontSize: isLargeText ? "11.5px" : "10.5px",
      fontWeight: 950,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      lineHeight: 1.2,
    },

    launcherHintTitle: {
      color: colors.text,
      fontSize: isLargeText ? "16.5px" : "15px",
      fontWeight: 950,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },

    launcherHintText: {
      color: colors.muted,
      fontSize: isLargeText ? "13.5px" : "12.5px",
      fontWeight: 750,
      lineHeight: 1.35,
    },

    launcherButton: {
      width: "122px",
      height: "122px",
      borderRadius: "999px",
      border: `2px solid ${isDark ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.96)"}`,
      background: countryStyle.headerBackground || colors.headerBg,
      boxShadow: isDark
        ? "0 26px 58px rgba(2, 16, 28, 0.46), inset 0 1px 0 rgba(255,255,255,0.28)"
        : "0 26px 58px rgba(90, 64, 50, 0.28), inset 0 1px 0 rgba(255,255,255,0.54)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "visible",
      padding: 0,
      pointerEvents: "auto",
      isolation: "isolate",
      WebkitTapHighlightColor: "transparent",
    },

    launcherOrb: {
      position: "absolute",
      inset: "9px",
      borderRadius: "999px",
      background: isDark
        ? "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.10) 34%, rgba(255,255,255,0.04) 72%, rgba(255,255,255,0.02) 100%)"
        : "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.58) 34%, rgba(255,255,255,0.18) 72%, rgba(255,255,255,0.08) 100%)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.72)"}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
      pointerEvents: "none",
      zIndex: 1,
    },

    launcherRing: {
      position: "absolute",
      inset: "-10px",
      borderRadius: "999px",
      border: `2px solid ${isDark ? "rgba(248,227,188,0.34)" : "rgba(90,64,50,0.24)"}`,
      pointerEvents: "none",
      zIndex: -1,
    },

    launcherRingAlt: {
      position: "absolute",
      inset: "-18px",
      borderRadius: "999px",
      border: `1px dashed ${isDark ? "rgba(248,227,188,0.24)" : "rgba(90,64,50,0.18)"}`,
      pointerEvents: "none",
      zIndex: -2,
    },

    launcherShine: {
      position: "absolute",
      top: "10px",
      left: "18px",
      width: "34px",
      height: "68px",
      borderRadius: "999px",
      background: "linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.04) 100%)",
      pointerEvents: "none",
      zIndex: 2,
    },

    launcherSparkle: {
      position: "absolute",
      top: "15px",
      right: "18px",
      color: "#ffffff",
      fontSize: "19px",
      fontWeight: 950,
      lineHeight: 1,
      textShadow: "0 6px 14px rgba(0,0,0,0.24)",
      pointerEvents: "none",
      zIndex: 5,
    },

    launcherMaleImage: {
      position: "relative",
      zIndex: 3,
      width: "142px",
      height: "142px",
      objectFit: "contain",
      display: "block",
      pointerEvents: "none",
      filter: isDark
        ? "drop-shadow(0 14px 18px rgba(0,0,0,0.34))"
        : "drop-shadow(0 14px 18px rgba(90,64,50,0.22))",
    },

    launcherStatusDot: {
      position: "absolute",
      right: "13px",
      bottom: "14px",
      width: "14px",
      height: "14px",
      borderRadius: "999px",
      background: colors.success,
      border: `3px solid ${isDark ? "#2D211B" : "#FFF7E3"}`,
      pointerEvents: "none",
      zIndex: 6,
    },

    widget: {
      width: "min(390px, calc(100vw - 48px))",
      maxWidth: "390px",
      height: "min(640px, calc(100vh - 48px))",
      borderRadius: "30px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: colors.cardStrong,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      boxShadow: colors.shadow,
      position: "fixed",
      right: "24px",
      bottom: "max(24px, env(safe-area-inset-bottom))",
      zIndex: 9999,
      isolation: "isolate",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
      transition: "background-color 680ms cubic-bezier(0.22, 1, 0.36, 1), border-color 680ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 680ms cubic-bezier(0.22, 1, 0.36, 1), color 520ms ease",
      willChange: "opacity, transform",
    },

    header: {
      minHeight: "78px",
      padding: "16px",
      background: countryStyle.headerBackground || colors.headerBg,
      color: colors.white,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
      boxSizing: "border-box",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 720ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
      willChange: "opacity, transform",
    },

    countryRibbon: {
      width: "100%",
      height: "7px",
      background: countryStyle.ribbonBackground,
      boxShadow: isDark ? "0 8px 18px rgba(0,0,0,0.18)" : "0 8px 18px rgba(90,64,50,0.08)",
      flexShrink: 0,
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
      willChange: "opacity, transform",
    },

    headerArcOne: {
      position: "absolute",
      width: "168px",
      height: "168px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.15)",
      top: "-98px",
      right: "-60px",
      pointerEvents: "none",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease, transform 560ms ease",
    },

    headerArcTwo: {
      position: "absolute",
      width: "92px",
      height: "92px",
      borderRadius: "999px",
      border: "18px solid rgba(255,255,255,0.11)",
      bottom: "-54px",
      left: "14px",
      pointerEvents: "none",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease, transform 560ms ease",
    },

    headerAvatarWrap: {
      width: "48px",
      height: "48px",
      borderRadius: "999px",
      overflow: "hidden",
      background: "rgba(255,255,255,0.22)",
      boxShadow: "0 14px 28px rgba(5, 45, 82, 0.2)",
      flexShrink: 0,
      position: "relative",
      zIndex: 1,
      border: "1px solid rgba(255,255,255,0.18)",
    },

    avatarImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center center",
      display: "block",
      borderRadius: "999px",
    },

    headerInfo: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      position: "relative",
      zIndex: 1,
    },

    headerTitle: {
      fontSize: isLargeText ? "16.5px" : "15px",
      fontWeight: 950,
      letterSpacing: "-0.02em",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    headerStatus: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      fontSize: isLargeText ? "13px" : "12px",
      color: "rgba(255,255,255,0.88)",
      whiteSpace: "nowrap",
    },

    headerCountryBadge: {
      width: "fit-content",
      maxWidth: "100%",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 8px",
      borderRadius: "999px",
      background: countryStyle.badgeBackground,
      border: `1px solid ${countryStyle.badgeBorder}`,
      color: countryStyle.badgeColor,
      fontSize: isLargeText ? "11.5px" : "10.5px",
      fontWeight: 900,
      lineHeight: 1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
      backdropFilter: "blur(10px)",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), border-color 720ms cubic-bezier(0.22, 1, 0.36, 1), color 560ms ease, box-shadow 720ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },

    onlineDot: {
      width: "8px",
      height: "8px",
      borderRadius: "999px",
      background: colors.success,
      display: "inline-block",
      flexShrink: 0,
    },

    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      position: "relative",
      zIndex: 1,
    },

    iconButton: {
      minWidth: "36px",
      height: "36px",
      padding: "0 10px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.24)",
      background: "rgba(255,255,255,0.16)",
      color: colors.white,
      fontSize: "13px",
      fontWeight: 950,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1,
      whiteSpace: "nowrap",
      backdropFilter: "blur(10px)",
    },

    closeButton: {
      width: "36px",
      height: "36px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.24)",
      background: "rgba(255,255,255,0.16)",
      color: colors.white,
      fontSize: "22px",
      fontWeight: 800,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1,
      backdropFilter: "blur(10px)",
    },

    page: {
      flex: 1,
      position: "relative",
      padding: "18px 16px 16px",
      background: colors.pageBg,
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },

    pageInner: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "16px",
      position: "relative",
      zIndex: 1,
    },

    homePage: {
      flex: 1,
      position: "relative",
      padding: "18px",
      background:
        countryStyle.homeBackground ||
        (isDark
          ? "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.14) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.18) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.12) 0, transparent 30%), linear-gradient(160deg, #113116 0%, #1E1713 44%, #2D211B 100%)"
          : "radial-gradient(circle at 18% 14%, rgba(248, 227, 188, 0.36) 0, transparent 25%), radial-gradient(circle at 86% 16%, rgba(232, 143, 118, 0.22) 0, transparent 22%), radial-gradient(circle at 52% 86%, rgba(168, 117, 74, 0.14) 0, transparent 30%), linear-gradient(160deg, #FFF7E3 0%, #F8E3BC 48%, #E88F76 100%)"),
      overflow: "hidden",
      boxSizing: "border-box",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },

    homeTexture: {
      position: "absolute",
      inset: 0,
      backgroundImage: isDark
        ? "linear-gradient(rgba(255,255,255,0.042) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)"
        : "linear-gradient(rgba(90,64,50,0.042) 1px, transparent 1px), linear-gradient(90deg, rgba(90,64,50,0.032) 1px, transparent 1px)",
      backgroundSize: "34px 34px",
      maskImage: "radial-gradient(circle at 50% 34%, black 0%, transparent 78%)",
      pointerEvents: "none",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease, transform 560ms ease",
    },

    homeAuraTop: {
      position: "absolute",
      top: "-86px",
      left: "50%",
      width: "380px",
      height: "300px",
      borderRadius: "999px",
      transform: "translateX(-50%)",
      background: isDark
        ? "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(168,117,74,0.14) 38%, transparent 70%)"
        : "radial-gradient(circle, rgba(255,247,227,0.98) 0%, rgba(248,227,188,0.90) 40%, transparent 72%)",
      filter: "blur(3px)",
      pointerEvents: "none",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease, transform 560ms ease",
    },

    homeAuraBottom: {
      position: "absolute",
      left: "50%",
      bottom: "-132px",
      width: "430px",
      height: "260px",
      borderRadius: "999px",
      transform: "translateX(-50%)",
      background: isDark
        ? "radial-gradient(circle, rgba(45,33,27,0.82) 0%, rgba(45,33,27,0.2) 46%, transparent 74%)"
        : "radial-gradient(circle, rgba(248,227,188,0.96) 0%, rgba(255,247,227,0.32) 48%, transparent 74%)",
      pointerEvents: "none",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease, transform 560ms ease",
    },

    homeCloseButton: {
      position: "absolute",
      top: "16px",
      right: "16px",
      width: "38px",
      height: "38px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.38)",
      background: isDark ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.76)",
      color: isDark ? "#ffffff" : "#5A4032",
      fontSize: "21px",
      fontWeight: 850,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: isDark ? "0 12px 28px rgba(17,19,22,0.18)" : "0 12px 28px rgba(90,64,50,0.10)",
      backdropFilter: "blur(14px)",
      zIndex: 8,
    },

    homeContent: {
      minHeight: "100%",
      position: "relative",
      zIndex: 2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "0px",
      padding: "20px 0 18px",
      boxSizing: "border-box",
      transform: "translateY(36px)",
    },

    homeHeroScene: {
      width: "100%",
      height: "342px",
      maxHeight: "52vh",
      minHeight: "318px",
      position: "relative",
      display: "flex",
      isolation: "isolate",
      alignItems: "flex-end",
      justifyContent: "center",
      marginBottom: "-4px",
      pointerEvents: "none",
      zIndex: 4,
      overflow: "visible",
    },

    homeHalo: {
      position: "absolute",
      width: "292px",
      height: "292px",
      borderRadius: "999px",
      bottom: "-18px",
      background: isDark
        ? "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(168,117,74,0.14) 40%, rgba(255,255,255,0) 74%)"
        : "radial-gradient(circle, rgba(255,247,227,0.98) 0%, rgba(248,227,188,0.94) 42%, rgba(255,255,255,0) 74%)",
      filter: "blur(2px)",
    },

    homeHaloRing: {
      position: "absolute",
      width: "244px",
      height: "244px",
      borderRadius: "999px",
      bottom: "20px",
      border: isDark ? "1px solid rgba(248,227,188,0.12)" : "1px solid rgba(90,64,50,0.1)",
      boxShadow: isDark
        ? "inset 0 0 38px rgba(255,255,255,0.08)"
        : "inset 0 0 40px rgba(255,255,255,0.88)",
    },

    homeMaleLarge: {
      width: "360px",
      maxWidth: "94%",
      height: "auto",
      display: "block",
      position: "relative",
      zIndex: 5,
      marginBottom: "0px",
      transform: "translateY(96px)",
      background: "transparent",
      objectFit: "contain",
      mixBlendMode: "multiply",
      filter: isDark
        ? "drop-shadow(0 24px 34px rgba(3,17,32,0.36)) saturate(1.04)"
        : "drop-shadow(0 24px 36px rgba(90,64,50,0.2)) saturate(1.04)",
    },

    homeFloorShadow: {
      position: "absolute",
      width: "168px",
      height: "28px",
      borderRadius: "50%",
      bottom: "-4px",
      background: isDark ? "rgba(17, 19, 22, 0.18)" : "rgba(90, 64, 50, 0.12)",
      filter: "blur(8px)",
      zIndex: 3,
    },

    homeBubbleLeft: {
      position: "absolute",
      left: "28px",
      top: "112px",
      padding: "9px 12px",
      borderRadius: "999px",
      background: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.82)",
      border: `1px solid ${colors.border}`,
      color: colors.text,
      fontSize: isLargeText ? "13px" : "12px",
      fontWeight: 950,
      boxShadow: colors.softShadow,
      backdropFilter: "blur(14px)",
      zIndex: 6,
    },

    homeBubbleRight: {
      position: "absolute",
      right: "28px",
      top: "158px",
      width: "45px",
      height: "45px",
      borderRadius: "18px",
      background: "linear-gradient(135deg, rgba(139,94,60,0.95) 0%, rgba(183,107,95,0.95) 100%)",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "17px",
      boxShadow: "0 18px 30px rgba(90,64,50,0.22)",
      zIndex: 6,
    },

    homeSoftCircleLeft: {
      position: "absolute",
      left: "-34px",
      top: "66px",
      width: "102px",
      height: "102px",
      borderRadius: "999px",
      background: isDark ? "rgba(255,255,255,0.12)" : "rgba(168,117,74,0.12)",
      zIndex: 1,
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease, transform 560ms ease",
    },

    homeSoftCircleRight: {
      position: "absolute",
      right: "25px",
      top: "105px",
      width: "28px",
      height: "28px",
      borderRadius: "999px",
      background: isDark ? "rgba(255,255,255,0.2)" : "rgba(183,107,95,0.16)",
      zIndex: 1,
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 560ms ease, transform 560ms ease",
    },

    homeGlassCard: {
      width: "100%",
      maxWidth: "346px",
      borderRadius: "0px",
      padding: "4px 16px 0",
      background: "transparent",
      border: "none",
      boxShadow: "none",
      backdropFilter: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "12px",
      boxSizing: "border-box",
      position: "relative",
      zIndex: 3,
      overflow: "visible",
    },

    homeCardShine: {
      display: "none",
    },

    homeName: {
      margin: 0,
      color: colors.text,
      fontSize: isLargeText ? "44px" : "40px",
      lineHeight: 0.95,
      fontWeight: 950,
      letterSpacing: "-0.055em",
      position: "relative",
      zIndex: 2,
      textShadow: isDark ? "0 10px 28px rgba(17,19,22,0.16)" : "0 10px 28px rgba(90,64,50,0.10)",
    },

    homeTagline: {
      margin: 0,
      maxWidth: "250px",
      color: colors.muted,
      fontSize: isLargeText ? "14.5px" : "13.2px",
      lineHeight: 1.48,
      position: "relative",
      zIndex: 2,
    },

    homeStatusPill: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      padding: "8px 12px",
      borderRadius: "999px",
      background: isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.86)",
      border: `1px solid ${colors.border}`,
      color: colors.text,
      fontSize: isLargeText ? "13px" : "12px",
      fontWeight: 900,
      position: "relative",
      zIndex: 2,
      boxShadow: isDark ? "none" : "0 10px 22px rgba(90,64,50,0.08)",
      backdropFilter: "blur(14px)",
    },

    homeButtonRow: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "1.05fr 0.95fr",
      gap: "10px",
      marginTop: "4px",
      position: "relative",
      zIndex: 2,
    },

    homePrimaryButton: {
      width: "100%",
      border: "none",
      borderRadius: "999px",
      padding: "14px 16px",
      fontSize: isLargeText ? "15px" : "14px",
      fontWeight: 950,
      cursor: "pointer",
      color: colors.white,
      background: "linear-gradient(135deg, #8B5E3C 0%, #A8754A 56%, #B76B5F 100%)",
      boxShadow: "0 16px 30px rgba(90,64,50,0.24)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },

    homeSecondaryButton: {
      width: "100%",
      border: `1px solid ${colors.border}`,
      borderRadius: "999px",
      padding: "14px 16px",
      fontSize: isLargeText ? "15px" : "14px",
      fontWeight: 950,
      cursor: "pointer",
      color: colors.text,
      background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,247,227,0.95)",
      boxShadow: isDark ? "none" : "0 10px 20px rgba(90,64,50,0.07)",
    },

    orbOne: {
      position: "absolute",
      width: "122px",
      height: "122px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.18)",
      top: "36px",
      left: "-46px",
    },

    orbTwo: {
      position: "absolute",
      width: "96px",
      height: "96px",
      borderRadius: "28px",
      background: "rgba(255,255,255,0.14)",
      right: "-28px",
      bottom: "90px",
      transform: "rotate(18deg)",
    },

    orbThree: {
      position: "absolute",
      width: "34px",
      height: "34px",
      borderRadius: "999px",
      background: "rgba(255,255,255,0.28)",
      top: "120px",
      right: "44px",
    },

    homeStack: {
      width: "100%",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      position: "relative",
      padding: "2px 0 8px",
      boxSizing: "border-box",
    },

    maleStage: {
      width: "100%",
      maxWidth: "360px",
      height: "330px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      overflow: "visible",
      pointerEvents: "none",
      marginBottom: "8px",
    },

    maleGlow: {
      position: "absolute",
      width: "280px",
      height: "280px",
      borderRadius: "999px",
      background: isDark
        ? "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(168,117,74,0.12) 42%, rgba(255,255,255,0) 72%)"
        : "radial-gradient(circle, rgba(255,247,227,0.96) 0%, rgba(248,227,188,0.90) 42%, rgba(255,255,255,0) 72%)",
      bottom: "0px",
      filter: "blur(2px)",
    },

    maleBadgeOne: {
      display: "none",
    },

    maleBadgeTwo: {
      display: "none",
    },

    maleMascotImage: {
      width: "220px",
      maxWidth: "100%",
      height: "auto",
      display: "block",
      position: "relative",
      zIndex: 2,
      filter: isDark
        ? "drop-shadow(0 22px 30px rgba(4,18,34,0.26))"
        : "drop-shadow(0 22px 30px rgba(90,64,50,0.16))",
    },

    homeCard: {
      width: "100%",
      borderRadius: "30px",
      padding: "24px 18px 18px",
      background: isDark ? "rgba(45,33,27,0.78)" : "rgba(255,247,227,0.86)",
      border: `1px solid ${colors.border}`,
      boxShadow: colors.softShadow,
      backdropFilter: "blur(18px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "13px",
      boxSizing: "border-box",
      position: "relative",
      zIndex: 1,
    },

    eyebrow: {
      display: "none",
    },

    title: {
      margin: 0,
      color: colors.text,
      fontSize: isLargeText ? "35px" : "32px",
      lineHeight: 1,
      fontWeight: 950,
      letterSpacing: "-0.045em",
    },

    text: {
      margin: 0,
      color: colors.muted,
      fontSize: textBase,
      lineHeight: 1.56,
    },

    welcomePills: {
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      justifyContent: "center",
    },

    pill: {
      padding: "8px 12px",
      borderRadius: "999px",
      background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,247,227,0.96)",
      border: `1px solid ${colors.border}`,
      color: colors.text,
      fontSize: isLargeText ? "13px" : "12px",
      fontWeight: 850,
      boxShadow: isDark ? "none" : "0 8px 18px rgba(90,64,50,0.07)",
    },

    heroInfoGrid: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "10px",
      marginTop: "2px",
    },

    infoCard: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "11px",
      padding: "12px",
      borderRadius: "22px",
      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,247,227,0.94)",
      border: `1px solid ${colors.border}`,
      textAlign: "left",
      boxSizing: "border-box",
    },

    infoIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(139,94,60,0.18) 0%, rgba(232,143,118,0.16) 100%)",
      color: isDark ? "#F8E3BC" : "#5A4032",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      flexShrink: 0,
      fontWeight: 950,
    },

    infoTitle: {
      display: "block",
      color: colors.text,
      fontSize: isLargeText ? "14px" : "13px",
      fontWeight: 950,
      marginBottom: "2px",
    },

    infoText: {
      margin: 0,
      color: colors.subtle,
      fontSize: isLargeText ? "12.8px" : "11.8px",
      lineHeight: 1.38,
    },

    ctaRow: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginTop: "2px",
    },

    primaryButton: {
      width: "100%",
      border: "none",
      borderRadius: "999px",
      padding: "14px 16px",
      fontSize: isLargeText ? "15px" : "14px",
      fontWeight: 950,
      cursor: "pointer",
      color: colors.white,
      background: "linear-gradient(135deg, #8B5E3C 0%, #A8754A 56%, #B76B5F 100%)",
      boxShadow: "0 16px 30px rgba(90,64,50,0.22)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },

    secondaryButton: {
      width: "100%",
      border: `1px solid ${colors.border}`,
      borderRadius: "999px",
      padding: "14px 16px",
      fontSize: isLargeText ? "15px" : "14px",
      fontWeight: 900,
      cursor: "pointer",
      color: colors.text,
      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,247,227,0.94)",
      boxShadow: isDark ? "none" : "0 10px 20px rgba(90,64,50,0.07)",
    },

    settingsStack: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },

    settingsPreviewCard: {
      width: "100%",
      borderRadius: "28px",
      padding: "18px",
      background: colors.card,
      border: `1px solid ${colors.border}`,
      boxShadow: colors.softShadow,
      backdropFilter: "blur(18px)",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      boxSizing: "border-box",
    },

    settingsHero: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },

    settingsAvatarWrap: {
      width: "72px",
      height: "72px",
      borderRadius: "999px",
      overflow: "hidden",
      background: colors.cardSoft,
      border: `1px solid ${colors.border}`,
      boxShadow: colors.softShadow,
      flexShrink: 0,
    },

    settingsTitle: {
      margin: 0,
      color: colors.text,
      fontSize: isLargeText ? "25px" : "23px",
      lineHeight: 1.05,
      fontWeight: 950,
      letterSpacing: "-0.04em",
    },

    settingsText: {
      margin: "6px 0 0",
      color: colors.muted,
      fontSize: textBase,
      lineHeight: 1.5,
    },

    summaryRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },

    summaryChip: {
      padding: "8px 12px",
      borderRadius: "999px",
      background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,247,227,0.94)",
      border: `1px solid ${colors.border}`,
      color: colors.text,
      fontSize: isLargeText ? "13px" : "12px",
      fontWeight: 900,
      boxShadow: isDark ? "none" : "0 8px 18px rgba(90,64,50,0.06)",
    },

    settingsCard: {
      width: "100%",
      borderRadius: "30px",
      padding: "18px",
      background: colors.card,
      border: `1px solid ${colors.border}`,
      boxShadow: colors.softShadow,
      backdropFilter: "blur(18px)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxSizing: "border-box",
    },

    sectionLabel: {
      margin: 0,
      color: colors.subtle,
      fontSize: isLargeText ? "12px" : "11px",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.09em",
    },

    settingItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      padding: "13px 14px",
      borderRadius: "22px",
      border: `1px solid ${colors.border}`,
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,247,227,0.96)",
      boxSizing: "border-box",
    },

    settingLeft: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: 0,
      flex: 1,
    },

    settingIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(139,94,60,0.18) 0%, rgba(232,143,118,0.16) 100%)",
      color: isDark ? "#F8E3BC" : "#5A4032",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: 950,
      flexShrink: 0,
    },

    settingCopy: {
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "3px",
    },

    settingLabel: {
      color: colors.text,
      fontSize: isLargeText ? "15px" : "13.8px",
      fontWeight: 950,
    },

    settingDescription: {
      color: colors.subtle,
      fontSize: isLargeText ? "12.8px" : "11.8px",
      lineHeight: 1.38,
    },

    settingAction: {
      minWidth: "118px",
      border: "none",
      borderRadius: "999px",
      padding: "10px 12px",
      fontSize: isLargeText ? "13px" : "12px",
      fontWeight: 900,
      cursor: "pointer",
      color: colors.white,
      background: "linear-gradient(135deg, #5A4032 0%, #8B5E3C 52%, #B76B5F 100%)",
      boxShadow: "0 12px 24px rgba(90,64,50,0.18)",
      flexShrink: 0,
    },

    settingsActions: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "10px",
      marginTop: "2px",
    },

    chatBody: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      background: countryStyle.chatBackground || colors.chatBg,
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },

    messages: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      padding: "16px",
      overflowY: "auto",
      position: "relative",
      boxSizing: "border-box",
    },

    introCard: {
      borderRadius: "26px",
      padding: "14px",
      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.78)",
      border: `1px solid ${colors.border}`,
      boxShadow: isDark ? "0 12px 28px rgba(17,19,22,0.20)" : "0 12px 28px rgba(90,64,50,0.08)",
      display: "flex",
      alignItems: "center",
      gap: "11px",
      backdropFilter: "blur(12px)",
    },

    introAvatarWrap: {
      width: "52px",
      height: "52px",
      borderRadius: "999px",
      overflow: "hidden",
      flexShrink: 0,
      background: colors.cardSoft,
      border: `1px solid ${colors.border}`,
      boxShadow: colors.softShadow,
    },

    introTitle: {
      margin: 0,
      color: colors.text,
      fontSize: isLargeText ? "14px" : "13px",
      fontWeight: 950,
    },

    introCountryBadge: {
      width: "fit-content",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      marginTop: "5px",
      marginBottom: "5px",
      padding: "4px 8px",
      borderRadius: "999px",
      background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.84)",
      border: `1px solid ${countryStyle.botBubbleBorder}`,
      color: colors.text,
      fontSize: isLargeText ? "11.5px" : "10.5px",
      fontWeight: 900,
      lineHeight: 1,
      boxShadow: isDark ? "0 8px 18px rgba(0,0,0,0.16)" : "0 8px 18px rgba(90,64,50,0.08)",
    },

    introText: {
      margin: "3px 0 0",
      color: colors.muted,
      fontSize: isLargeText ? "13px" : "12px",
      lineHeight: 1.42,
    },

    botRow: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      gap: "8px",
      animation: "lcBotMessageEnter 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
    },

    userRow: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      gap: "8px",
      animation: "lcUserMessageEnter 460ms cubic-bezier(0.22, 1, 0.36, 1) both",
    },

    smallAvatarWrap: {
      width: "36px",
      height: "36px",
      borderRadius: "999px",
      overflow: "hidden",
      background: colors.cardSoft,
      border: `1px solid ${colors.border}`,
      boxShadow: isDark
        ? "0 10px 18px rgba(4,18,34,0.22)"
        : "0 10px 18px rgba(90,64,50,0.14)",
      flexShrink: 0,
      animation: "lcAvatarSoftPop 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
    },

    bubbleWrap: {
      maxWidth: "80%",
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    },

    botBubble: {
      padding: "12px 14px",
      borderRadius: "22px",
      borderBottomLeftRadius: "8px",
      fontSize: chatFontSize,
      lineHeight: 1.52,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      color: colors.text,
      background: countryStyle.botBubbleBackground,
      border: `1px solid ${countryStyle.botBubbleBorder}`,
      boxShadow: isDark ? "0 12px 26px rgba(17,19,22,0.20)" : "0 12px 26px rgba(90,64,50,0.08)",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), border-color 720ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 720ms cubic-bezier(0.22, 1, 0.36, 1), color 560ms ease",
      animation: "lcMessageBubbleSettle 620ms ease-out both",
    },

    userBubble: {
      padding: "12px 14px",
      borderRadius: "22px",
      borderBottomRightRadius: "8px",
      fontSize: chatFontSize,
      lineHeight: 1.52,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      color: colors.white,
      background: countryStyle.userBubbleBackground || colors.userBubble,
      border: `1px solid ${countryStyle.userBubbleBorder || "rgba(255,255,255,0.18)"}`,
      boxShadow: countryStyle.userBubbleShadow || "0 14px 28px rgba(90,64,50,0.18)",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.28)",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), border-color 720ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 720ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: "lcMessageBubbleSettle 620ms ease-out both",
    },

    errorBubble: {
      padding: "12px 14px",
      borderRadius: "22px",
      borderBottomLeftRadius: "8px",
      fontSize: chatFontSize,
      lineHeight: 1.52,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      background: isDark ? "rgba(120,28,51,0.44)" : "#fff1f5",
      color: isDark ? "#ffd6e5" : "#9d174d",
      border: `1px solid ${isDark ? "rgba(255,146,187,0.18)" : "#fecdd3"}`,
      animation: "lcMessageBubbleSettle 620ms ease-out both",
    },

    time: {
      fontSize: isLargeText ? "12px" : "11px",
      color: colors.subtle,
      padding: "0 5px",
    },

    faqArea: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginTop: "7px",
      padding: "10px",
      borderRadius: "22px",
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)",
      border: `1px solid ${colors.border}`,
    },

    faqTitle: {
      margin: 0,
      color: colors.subtle,
      fontSize: isLargeText ? "12px" : "11px",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },

    faqGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: "7px",
    },

    faqButton: {
      border: `1px solid ${isDark ? "rgba(248,227,188,0.18)" : "#E8CFA8"}`,
      background: isDark ? "rgba(168,117,74,0.12)" : "#FFF7E3",
      color: isDark ? "#F8E3BC" : "#5A4032",
      borderRadius: "999px",
      padding: "8px 11px",
      fontSize: isLargeText ? "12.5px" : "12px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: isDark ? "none" : "0 8px 16px rgba(90,64,50,0.06)",
    },

    disabledFaqButton: {
      border: `1px solid ${isDark ? "rgba(248,227,188,0.18)" : "#E8CFA8"}`,
      background: isDark ? "rgba(168,117,74,0.12)" : "#FFF7E3",
      color: isDark ? "#F8E3BC" : "#5A4032",
      borderRadius: "999px",
      padding: "8px 11px",
      fontSize: isLargeText ? "12.5px" : "12px",
      fontWeight: 900,
      cursor: "not-allowed",
      opacity: 0.56,
    },

    typingBubble: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      width: "fit-content",
      padding: "13px 15px",
      borderRadius: "22px",
      borderBottomLeftRadius: "8px",
      background: countryStyle.botBubbleBackground,
      border: `1px solid ${countryStyle.botBubbleBorder}`,
      boxShadow: isDark ? "0 12px 26px rgba(17,19,22,0.20)" : "0 12px 26px rgba(90,64,50,0.08)",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), border-color 720ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 720ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: "lcTypingBubbleEnter 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
    },

    typingDot: {
      width: "6px",
      height: "6px",
      borderRadius: "999px",
      background: countryStyle.typingDot,
      display: "inline-block",
      transition: "background-color 520ms ease",
    },

    footer: {
      padding: "12px",
      background: isDark ? "rgba(30,23,19,0.98)" : "#FFF7E3",
      borderTop: `1px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      gap: "9px",
      flexShrink: 0,
      boxSizing: "border-box",
      transition: "background-color 680ms cubic-bezier(0.22, 1, 0.36, 1), border-color 680ms cubic-bezier(0.22, 1, 0.36, 1)",
      animation: `${countryThemeAnimation} 760ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },

    inputShell: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderRadius: "999px",
      padding: "5px 5px 5px 14px",
      border: `1px solid ${countryStyle.inputShellBorder || colors.border}`,
      background: colors.inputBg,
      boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.9)",
      transition: "border-color 680ms cubic-bezier(0.22, 1, 0.36, 1), background-color 680ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 680ms cubic-bezier(0.22, 1, 0.36, 1)",
    },

    inputSpark: {
      width: "24px",
      height: "24px",
      borderRadius: "999px",
      background: countryStyle.inputSparkBackground,
      color: countryStyle.inputSparkColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13px",
      flexShrink: 0,
    },

    input: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      color: colors.text,
      fontSize: isLargeText ? "15px" : "14px",
      padding: "11px 2px",
    },

    sendButton: {
      width: "46px",
      height: "46px",
      borderRadius: "999px",
      border: "none",
      background: countryStyle.sendButtonBackground,
      color: countryStyle.sendButtonColor,
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: 950,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: countryStyle.sendButtonShadow,
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.22)",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), color 560ms ease, box-shadow 720ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms ease",
    },

    disabledSendButton: {
      width: "46px",
      height: "46px",
      borderRadius: "999px",
      border: "none",
      background: countryStyle.sendButtonBackground,
      color: countryStyle.sendButtonColor,
      cursor: "not-allowed",
      fontSize: "18px",
      fontWeight: 950,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      opacity: 0.48,
      boxShadow: "none",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.18)",
      transition: "background 720ms cubic-bezier(0.22, 1, 0.36, 1), color 560ms ease, opacity 560ms ease",
    },
  };
}

function AssistantAvatar({ styles, size = "small" }) {
  const image = <img src={assistantProfileImage} alt="Avatar del asistente" style={styles.avatarImage} />;

  if (size === "header") {
    return <div style={styles.headerAvatarWrap}>{image}</div>;
  }

  if (size === "settings") {
    return <div style={styles.settingsAvatarWrap}>{image}</div>;
  }

  if (size === "intro") {
    return <div style={styles.introAvatarWrap}>{image}</div>;
  }

  return <div style={styles.smallAvatarWrap}>{image}</div>;
}

function TypingIndicator({ styles }) {
  return (
    <div style={styles.botRow}>
      <AssistantAvatar styles={styles} />
      <div style={styles.typingBubble} aria-label="El asistente está escribiendo">
        <span className="lc-dot" style={styles.typingDot}></span>
        <span className="lc-dot" style={styles.typingDot}></span>
        <span className="lc-dot" style={styles.typingDot}></span>
      </div>
    </div>
  );
}

export default function ChatWidget({
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  country = "latam",
  sessionId,
  title = "Male",
  placeholder = "Escribe tu mensaje...",
  onClose,
}) {
  const [messages, setMessages] = useState([createInitialMessage()]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showLauncherHint, setShowLauncherHint] = useState(true);
  const [screen, setScreen] = useState("home");
  const [theme, setTheme] = useState(() => getStoredValue("latamChatTheme", "dark"));
  const [textSize, setTextSize] = useState(() => getStoredValue("latamChatTextSize", "normal"));
  const [showSuggestions, setShowSuggestions] = useState(
    () => getStoredValue("latamChatShowSuggestions", "true") !== "false"
  );
  const [activeVisualCountry, setActiveVisualCountry] = useState(
    () => normalizeCountryCode(country)
  );

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const isDark = theme === "dark";
  const isLargeText = textSize === "large";

  const styles = useMemo(
    () => buildStyles({ isDark, isLargeText, country: activeVisualCountry }),
    [isDark, isLargeText, activeVisualCountry]
  );

  const activeCountryTheme = useMemo(
    () => getCountryTheme(activeVisualCountry),
    [activeVisualCountry]
  );

  const isCountrySpecificTheme = activeCountryTheme.label !== "Latinoamérica";

  const resolvedSessionId = useMemo(() => {
    if (sessionId) return sessionId;

    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `session-${Date.now()}`;
  }, [sessionId]);

  const focusInput = () => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    saveStoredValue("latamChatTheme", theme);
  }, [theme]);

  useEffect(() => {
    saveStoredValue("latamChatTextSize", textSize);
  }, [textSize]);

  useEffect(() => {
    saveStoredValue("latamChatShowSuggestions", showSuggestions ? "true" : "false");
  }, [showSuggestions]);

  useEffect(() => {
    setActiveVisualCountry(normalizeCountryCode(country));
  }, [country]);

  useEffect(() => {
    if (screen === "chat") {
      focusInput();
    }
  }, [screen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const launcherHintTimer = window.setTimeout(() => {
      setShowLauncherHint(false);
    }, 5000);

    return () => window.clearTimeout(launcherHintTimer);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;

    if (screen === "chat") {
      focusInput();
    }
  }, [messages, loading, screen, showSuggestions]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (screen === "chat") {
      focusInput();
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const toggleTextSize = () => {
    setTextSize((currentTextSize) => (currentTextSize === "large" ? "normal" : "large"));
  };

  const handleSendMessage = async (messageToSend) => {
    const trimmedMessage = (messageToSend ?? input).trim();
    if (!trimmedMessage || loading) return;

    const detectedCountry = detectCountryFromMessage(trimmedMessage, country);
    setActiveVisualCountry(detectedCountry);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedMessage,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    focusInput();

    try {
      const result = await askChatbot({
        message: trimmedMessage,
        country: detectedCountry,
        sessionId: resolvedSessionId,
        apiBaseUrl,
      });

      const botMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: result?.answer || "No encontré una respuesta para mostrar.",
        time: formatTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error conectando con el backend:", error);

      const fallbackError = {
        id: `error-${Date.now()}`,
        role: "error",
        text: "No pude conectar con el servidor. Intenta nuevamente en unos segundos.",
        time: formatTime(),
      };

      setMessages((prev) => [...prev, fallbackError]);
    } finally {
      setLoading(false);
      focusInput();
    }
  };

  const handleFrequentQuestion = (question) => {
    handleSendMessage(question);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const headerStatusText =
    screen === "chat"
      ? "Male en línea"
      : screen === "settings"
        ? "Configura a Male"
        : "Male está listo para ayudarte";

  const renderHeader = () => (
    <header style={styles.header}>
      <div style={styles.headerArcOne}></div>
      <div style={styles.headerArcTwo}></div>

      <AssistantAvatar styles={styles} size="header" />

      <div style={styles.headerInfo}>
        <div style={styles.headerTitle}>Male</div>
        <div style={styles.headerStatus}>
          <span className="lc-pulse" style={styles.onlineDot}></span>
          {headerStatusText}
        </div>
        {isCountrySpecificTheme ? (
          <div style={styles.headerCountryBadge}>
            <span aria-hidden="true">{activeCountryTheme.emoji}</span>
            <span>{activeCountryTheme.badgeLabel}</span>
          </div>
        ) : null}
      </div>

      <div style={styles.headerActions}>
        {screen === "home" ? (
          <>
            <button
              type="button"
              className="lc-soft-button"
              style={styles.iconButton}
              onClick={toggleTheme}
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={isDark ? "Modo claro" : "Modo oscuro"}
            >
              {isDark ? "☀" : "☾"}
            </button>

            <button
              type="button"
              className="lc-soft-button"
              style={styles.iconButton}
              onClick={() => setScreen("settings")}
              aria-label="Abrir configuración"
              title="Configuración"
            >
              ⚙
            </button>
          </>
        ) : null}

        {screen === "chat" ? (
          <button
            type="button"
            className="lc-soft-button"
            style={styles.iconButton}
            onClick={() => setScreen("settings")}
            aria-label="Abrir configuración"
            title="Configuración"
          >
            ⚙
          </button>
        ) : null}

        <button
          type="button"
          className="lc-soft-button"
          style={styles.closeButton}
          onClick={handleClose}
          aria-label="Cerrar chatbot"
          title="Cerrar"
        >
          ×
        </button>
      </div>
    </header>
  );

  if (!isOpen) {
    return (
      <>
        <style>{styles.globalStyle}</style>

        <aside
          className="lc-launcher-shell"
          style={styles.launcherShell}
          aria-label="Abrir el asistente virtual Male"
        >
          {showLauncherHint ? (
            <div className="lc-launcher-hint" style={styles.launcherHint} aria-hidden="true">
              <span style={styles.launcherHintEyebrow}>Asistente virtual</span>
              <strong style={styles.launcherHintTitle}>Habla con Male</strong>
              <span style={styles.launcherHintText}>Haz clic para abrir el chat</span>
            </div>
          ) : null}

          <button
            type="button"
            className="lc-launcher-button"
            style={styles.launcherButton}
            onClick={handleOpen}
            aria-label="Abrir el chatbot de Male"
            title="Abrir chatbot de Male"
          >
            <span className="lc-launcher-ring" style={styles.launcherRing} aria-hidden="true"></span>
            <span className="lc-launcher-ring-alt" style={styles.launcherRingAlt} aria-hidden="true"></span>
            <span className="lc-launcher-shine" style={styles.launcherShine} aria-hidden="true"></span>
            <span style={styles.launcherOrb} aria-hidden="true"></span>
            <span className="lc-launcher-sparkle" style={styles.launcherSparkle} aria-hidden="true">✦</span>

            <img
              className="lc-launcher-male"
              src={homeMaleGif || welcomeMaleImage}
              alt=""
              aria-hidden="true"
              style={styles.launcherMaleImage}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = welcomeMaleImage;
              }}
            />

            <span className="lc-pulse" style={styles.launcherStatusDot} aria-hidden="true"></span>
          </button>
        </aside>
      </>
    );
  }

  return (
    <section className="lc-widget-shell" style={styles.widget}>
      <style>{styles.globalStyle}</style>
      {screen !== "home" ? renderHeader() : null}
      {screen !== "home" && isCountrySpecificTheme ? (
        <div style={styles.countryRibbon} aria-hidden="true"></div>
      ) : null}

      {screen === "home" ? (
        <main className="lc-page-scroll" style={styles.homePage}>
          <div style={styles.homeTexture}></div>
          <div style={styles.homeAuraTop}></div>
          <div style={styles.homeAuraBottom}></div>
          <div style={styles.homeSoftCircleLeft}></div>
          <div style={styles.homeSoftCircleRight}></div>

          <button
            type="button"
            className="lc-soft-button"
            style={styles.homeCloseButton}
            onClick={handleClose}
            aria-label="Cerrar chatbot"
            title="Cerrar"
          >
            ×
          </button>

          <div style={styles.homeContent}>
            <section style={styles.homeHeroScene} aria-label="Male">
              <div style={styles.homeHalo}></div>
              <div style={styles.homeHaloRing}></div>
              <div className="lc-home-bubble" style={styles.homeBubbleLeft}>Male</div>
              <div className="lc-home-bubble-alt" style={styles.homeBubbleRight}>✦</div>
              <img
                className="lc-home-male"
                src={homeMaleGif || welcomeMaleImage}
                alt="Male"
                style={styles.homeMaleLarge}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = welcomeMaleImage;
                }}
              />
              <div style={styles.homeFloorShadow}></div>
            </section>

            <section style={styles.homeGlassCard}>
              <div className="lc-home-shine" style={styles.homeCardShine}></div>

              <span style={styles.homeStatusPill}>
                <span className="lc-pulse" style={styles.onlineDot}></span>
                Listo para ayudarte
              </span>

              <h1 style={styles.homeName}>Male</h1>

              <p style={styles.homeTagline}>
                Estoy listo para ayudarte.
              </p>

              <div style={styles.homeButtonRow}>
                <button
                  type="button"
                  className="lc-soft-button"
                  style={styles.homePrimaryButton}
                  onClick={() => setScreen("chat")}
                >
                  Empezar <span aria-hidden="true">➜</span>
                </button>

                <button
                  type="button"
                  className="lc-soft-button"
                  style={styles.homeSecondaryButton}
                  onClick={() => setScreen("settings")}
                >
                  Configurar
                </button>
              </div>
            </section>
          </div>
        </main>
      ) : null}

      {screen === "settings" ? (
        <main className="lc-page-scroll" style={styles.page}>
          <div style={styles.orbOne}></div>
          <div style={styles.orbTwo}></div>
          <div style={styles.orbThree}></div>

          <div style={styles.pageInner}>
            <div style={styles.settingsStack}>
              <section style={styles.settingsPreviewCard}>
                <div style={styles.settingsHero}>
                  <AssistantAvatar styles={styles} size="settings" />
                  <div>
                    <h2 style={styles.settingsTitle}>Configuración</h2>
                    <p style={styles.settingsText}>
                      Ajusta la apariencia del asistente y deja el entorno del chat justo como te resulte más cómodo.
                    </p>
                  </div>
                </div>

                <div style={styles.summaryRow}>
                  <span style={styles.summaryChip}>{isDark ? "Modo oscuro" : "Modo claro"}</span>
                  <span style={styles.summaryChip}>{isLargeText ? "Texto grande" : "Texto normal"}</span>
                  <span style={styles.summaryChip}>{showSuggestions ? "Sugeridas activas" : "Sugeridas ocultas"}</span>
                </div>
              </section>

              <section style={styles.settingsCard}>
                <p style={styles.sectionLabel}>Ajustes principales</p>

                <div style={styles.settingItem}>
                  <div style={styles.settingLeft}>
                    <div style={styles.settingIcon}>☀</div>
                    <div style={styles.settingCopy}>
                      <span style={styles.settingLabel}>Tema visual</span>
                      <span style={styles.settingDescription}>Alterna entre modo claro y modo oscuro.</span>
                    </div>
                  </div>
                  <button type="button" className="lc-soft-button" style={styles.settingAction} onClick={toggleTheme}>
                    {isDark ? "Modo claro" : "Modo oscuro"}
                  </button>
                </div>

                <div style={styles.settingItem}>
                  <div style={styles.settingLeft}>
                    <div style={styles.settingIcon}>Aa</div>
                    <div style={styles.settingCopy}>
                      <span style={styles.settingLabel}>Tamaño de texto</span>
                      <span style={styles.settingDescription}>Mejora la lectura con tamaño normal o grande.</span>
                    </div>
                  </div>
                  <button type="button" className="lc-soft-button" style={styles.settingAction} onClick={toggleTextSize}>
                    {isLargeText ? "Texto normal" : "Texto grande"}
                  </button>
                </div>

                <div style={styles.settingItem}>
                  <div style={styles.settingLeft}>
                    <div style={styles.settingIcon}>?</div>
                    <div style={styles.settingCopy}>
                      <span style={styles.settingLabel}>Preguntas sugeridas</span>
                      <span style={styles.settingDescription}>Activa u oculta los accesos rápidos dentro del chat.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="lc-soft-button"
                    style={styles.settingAction}
                    onClick={() => setShowSuggestions((current) => !current)}
                  >
                    {showSuggestions ? "Ocultarlas" : "Mostrarlas"}
                  </button>
                </div>

                <div style={styles.settingsActions}>
                  <button
                    type="button"
                    className="lc-soft-button"
                    style={styles.primaryButton}
                    onClick={() => setScreen("chat")}
                  >
                    Ir a chatear con Male
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      ) : null}

      {screen === "chat" ? (
        <div style={styles.chatBody}>
          <div ref={listRef} className="lc-chat-scroll" style={styles.messages}>
            <section style={styles.introCard}>
              <AssistantAvatar styles={styles} size="intro" />
              <div>
                <p style={styles.introTitle}>Male</p>
                {isCountrySpecificTheme ? (
                  <span style={styles.introCountryBadge}>
                    <span aria-hidden="true">{activeCountryTheme.emoji}</span>
                    <span>{activeCountryTheme.badgeLabel}</span>
                  </span>
                ) : null}
                <p style={styles.introText}>
                  Pregúntale a Male sobre Latinoamérica Comparte, sus líneas de trabajo y programas como DESCUBRE y ESTRUCTURA.                </p>
              </div>
            </section>

            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const isError = message.role === "error";
              const isLastMessage = index === messages.length - 1;
              const shouldShowFrequentQuestions = showSuggestions && !isUser && isLastMessage && !loading;

              return (
                <div key={message.id} style={isUser ? styles.userRow : styles.botRow}>
                  {!isUser ? <AssistantAvatar styles={styles} /> : null}

                  <div style={styles.bubbleWrap}>
                    <article style={isUser ? styles.userBubble : isError ? styles.errorBubble : styles.botBubble}>
                      {message.text}
                    </article>

                    <span style={{ ...styles.time, alignSelf: isUser ? "flex-end" : "flex-start" }}>
                      {message.time}
                    </span>

                    {shouldShowFrequentQuestions ? (
                      <div style={styles.faqArea}>
                        <p style={styles.faqTitle}>Preguntas sugeridas</p>
                        <div style={styles.faqGrid}>
                          {frequentQuestions.map((question) => (
                            <button
                              key={question}
                              type="button"
                              className="lc-chip"
                              style={loading ? styles.disabledFaqButton : styles.faqButton}
                              onClick={() => handleFrequentQuestion(question)}
                              disabled={loading}
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {loading ? <TypingIndicator styles={styles} /> : null}
          </div>

          <footer style={styles.footer}>
            <div style={styles.inputShell}>
              <span style={styles.inputSpark} aria-hidden="true">✦</span>
              <input
                ref={inputRef}
                className="lc-input"
                style={styles.input}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                aria-label="Mensaje"
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              className="lc-soft-button"
              style={loading ? styles.disabledSendButton : styles.sendButton}
              onClick={() => handleSendMessage()}
              disabled={loading}
              aria-label="Enviar mensaje"
              title="Enviar"
            >
              ➤
            </button>
          </footer>
        </div>
      ) : null}
    </section>
  );
}
