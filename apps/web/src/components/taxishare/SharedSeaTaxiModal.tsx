"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Navigation,
  Phone,
  ExternalLink,
  ShieldCheck,
  Users,
  Clock,
  Anchor,
  Compass,
  Sparkles,
  QrCode,
  Calculator,
  MessageSquare,
  Send,
  MapPin,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogOut,
  Radio
} from "lucide-react";
import {
  calculateSeaTaxiFare,
  getSeaTaxiRoute,
  SEA_TAXI_OFFICIAL_TARIFF,
  COMMON_SEA_TAXI_ROUTES
} from "@/lib/data/sea-taxi";
import { PierSharingQrCard } from "./PierSharingQrCard";
import type { SeaTaxiLobby, LobbyParticipant } from "@/lib/types/taxi-share";

interface SharedSeaTaxiModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export function SharedSeaTaxiModal({
  isOpen,
  onClose,
  defaultOrigin = "Bostancı",
  defaultDestination = "Büyükada"
}: SharedSeaTaxiModalProps) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [passengers, setPassengers] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<"LOBBY" | "CALCULATOR" | "QR">("LOBBY");

  // Lobi canlı durumu
  const [lobby, setLobby] = useState<SeaTaxiLobby | null>(null);
  const [isLoadingLobby, setIsLoadingLobby] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Form alanları
  const [joinName, setJoinName] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinCount, setJoinCount] = useState<number>(1);
  const [joinNote, setJoinNote] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Lobiyi getir
  const fetchLobby = async (orig: string, dest: string, userId?: string | null) => {
    try {
      setIsLoadingLobby(true);
      const uid = userId !== undefined ? userId : currentUserId;
      const paramUid = uid ? `&participantId=${encodeURIComponent(uid)}` : "";
      const res = await fetch(`/api/taxishare/lobby?origin=${encodeURIComponent(orig)}&destination=${encodeURIComponent(dest)}${paramUid}`);
      if (res.ok) {
        const data = (await res.json()) as SeaTaxiLobby;
        setLobby(data);
      }
    } catch (e) {
      console.error("Lobby fetch error:", e);
    } finally {
      setIsLoadingLobby(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const storedId = localStorage.getItem("vapur_taxi_participant_id");
      if (storedId) setCurrentUserId(storedId);
      fetchLobby(origin, destination, storedId);
    }
  }, [isOpen, origin, destination]);

  // Lobiye Katıl
  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || !joinPhone.trim()) {
      setStatusMsg("Lütfen isim ve telefon bilginizi girin.");
      return;
    }

    try {
      const res = await fetch("/api/taxishare/lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "JOIN",
          origin,
          destination,
          payload: {
            name: joinName,
            phone: joinPhone,
            passengerCount: joinCount,
            note: joinNote
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        setLobby(json.lobby);
        setCurrentUserId(json.participant.id);
        localStorage.setItem("vapur_taxi_participant_id", json.participant.id);
        setShowJoinForm(false);
        setStatusMsg("✓ İskele lobisine başarıyla katıldınız!");
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch (e) {
      setStatusMsg("Lobiye katılırken bir hata oluştu.");
    }
  };

  // Lobiden Ayrıl
  const handleLeaveLobby = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/taxishare/lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LEAVE",
          origin,
          destination,
          payload: { participantId: currentUserId }
        })
      });
      if (res.ok) {
        const json = await res.json();
        setLobby(json.lobby);
        setCurrentUserId(null);
        localStorage.removeItem("vapur_taxi_participant_id");
        setStatusMsg("Lobiden ayrıldınız.");
        setTimeout(() => setStatusMsg(""), 3000);
      }
    } catch (e) {}
  };

  // Mesaj Gönder
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const senderName = lobby?.participants.find((p) => p.id === currentUserId)?.name || "Misafir";
    const textToSend = chatInput;
    setChatInput("");

    try {
      const res = await fetch("/api/taxishare/lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MESSAGE",
          origin,
          destination,
          payload: {
            senderId: currentUserId || "anon",
            senderName,
            text: textToSend
          }
        })
      });
      if (res.ok) {
        const json = await res.json();
        setLobby(json.lobby);
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  const route = getSeaTaxiRoute(origin, destination);
  const fare = calculateSeaTaxiFare(route.nauticalMiles, passengers);
  const isJoined = Boolean(currentUserId && lobby?.participants.some((p) => p.id === currentUserId));

  // WhatsApp link formatı
  const getWhatsAppUrl = (phone: string, targetName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `9${cleanPhone}` : cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
    const text = encodeURIComponent(`Merhaba ${targetName}, Vapur uygulamasında ${origin} iskelesi deniz taksi paylaşım lobisindeyiz. Buluşma için yazıyorum.`);
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto min-h-full">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative my-auto w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-white z-10 flex flex-col max-h-[94vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-bold shadow-md">
                <Anchor size={20} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                    PAYLAŞIMLI İBB DENİZ TAKSİ
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Radio size={10} className="animate-pulse text-emerald-400" />
                    <span>CANLI BULUŞMA LOBİSİ</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  Vapurlar bittiğinde veya fırtınada yolcularla buluşup masrafı bölüşün
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sekme Seçici: Lobi vs. Hesaplayıcı vs. QR */}
          <div className="px-4 pt-2.5 pb-0 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("LOBBY")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "LOBBY"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users size={13} />
              <span>Canlı İskele Lobisi ({lobby?.totalPassengers ?? 3} Yolcu)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CALCULATOR")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "CALCULATOR"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calculator size={13} />
              <span>Ücret Tarifesi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("QR")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "QR"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <QrCode size={13} />
              <span>Toplanma QR Kodu</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(94vh-140px)]">
            {/* Güzergâh Seçici */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>BULUŞMA HATTI</span>
                <span className="font-mono text-cyan-300 text-[11px]">
                  {route.nauticalMiles} NM • ~{route.estimatedMinutes} dk Geçiş
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Biniş İskelesi
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => {
                      setOrigin(e.target.value);
                      fetchLobby(e.target.value, destination);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold outline-none cursor-pointer"
                  >
                    {COMMON_SEA_TAXI_ROUTES.map((r, i) => (
                      <option key={`orig-${i}`} value={r.origin}>
                        {r.origin}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Varış İskelesi
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      fetchLobby(origin, e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold outline-none cursor-pointer"
                  >
                    {COMMON_SEA_TAXI_ROUTES.map((r, i) => (
                      <option key={`dest-${i}`} value={r.destination}>
                        {r.destination}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {statusMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* SEKME 1: CANLI İSKELE PAYLAŞIM LOBİSİ */}
            {activeTab === "LOBBY" && (
              <div className="space-y-3.5">
                {/* Buluşma Noktası ve Zaman Kartı */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-950 to-slate-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-amber-300 flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-400" />
                      <span>FİZİKSEL BULUŞMA NOKTASI:</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Hedef: ~{lobby?.targetDepartureTime || "00:30"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    📍 {lobby?.meetupPoint}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-300">
                    <span>Mevcut Doluluk: <strong className="text-emerald-400">{lobby?.totalPassengers ?? 3} / 10 Yolcu</strong></span>
                    <span>Kişi Başı: <strong className="text-amber-400 font-bold">{lobby?.perPersonFare ?? 420} ₺</strong></span>
                  </div>
                </div>

                {/* Katılımcı Listesi (İletişim Butonları: WhatsApp & Arama) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                      <Users size={13} className="text-cyan-400" />
                      <span>İskelede Bekleyen Yolcular</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lobby?.participants.length ?? 0} Katılımcı Grubu
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(lobby?.participants ?? []).map((p) => {
                      const isMe = p.id === currentUserId;
                      return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                            isMe
                              ? "bg-blue-950/40 border-blue-500/50 shadow-md"
                              : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{p.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {p.passengerCount} Yolcu
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                                  Siz
                                </span>
                              )}
                            </div>
                            {p.note && (
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate italic">
                                &ldquo;{p.note}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* İletişim Aksiyonları */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isMe ? (
                              <>
                                <a
                                  href={`tel:${p.phone}`}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
                                  title="Doğrudan Telefonla Ara"
                                >
                                  <Phone size={12} className="text-emerald-400" />
                                  <span>Ara</span>
                                </a>

                                <a
                                  href={getWhatsAppUrl(p.phone, p.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-emerald-500/40"
                                  title="WhatsApp ile İletişim Kur"
                                >
                                  <MessageSquare size={12} />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={handleLeaveLobby}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-rose-500/40"
                              >
                                <LogOut size={12} />
                                <span>Ayrıl</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Katılım Aksiyon Butonu & Formu */}
                {!isJoined ? (
                  !showJoinForm ? (
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(true)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <UserPlus size={15} />
                      <span>Gruba Katıl & Yolcularla Eşleş (Kişi Başı {lobby?.perPersonFare ?? 420} ₺)</span>
                    </button>
                  ) : (
                    <form onSubmit={handleJoinLobby} className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-300">LOBİYE KATILIM BİLGİLERİ</span>
                        <button
                          type="button"
                          onClick={() => setShowJoinForm(false)}
                          className="text-[11px] text-slate-400 hover:text-white"
                        >
                          ✕ Vazgeç
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Adınız / Rumuz
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: Ahmet K."
                            value={joinName}
                            onChange={(e) => setJoinName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Telefon / WhatsApp
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="05XX XXX XX XX"
                            value={joinPhone}
                            onChange={(e) => setJoinPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Kişi Sayısı
                          </label>
                          <select
                            value={joinCount}
                            onChange={(e) => setJoinCount(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold outline-none cursor-pointer"
                          >
                            <option value={1}>1 Kişi</option>
                            <option value={2}>2 Kişi</option>
                            <option value={3}>3 Kişi</option>
                            <option value={4}>4 Kişi</option>
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Buluşma Notu (İsteğe Bağlı)
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Turnikeler önündeyim, siyah mont"
                            value={joinNote}
                            onChange={(e) => setJoinNote(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                      >
                        Bilgileri Kaydet & Gruba Dahil Ol
                      </button>
                    </form>
                  )
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-center justify-between">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>Bu gruptasınız. Diğer yolcularla arayarak veya WhatsApp ile buluşabilirsiniz.</span>
                    </span>
                  </div>
                )}

                {/* Canlı Lobi Mesajlaşma Panosu */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-300 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-amber-400" />
                      <span>İskele Canlı İletişim Panosu</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Anlık</span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(lobby?.messages ?? []).map((m) => (
                      <div key={m.id} className="text-[11px] p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 leading-relaxed">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                          <strong className="text-cyan-300">{m.senderName}</strong>
                          <span className="font-mono">{m.timestamp}</span>
                        </div>
                        <p className="text-slate-200">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Mesaj yazın (örn: Turnikelerin yanındayım)..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Gönder</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SEKME 2: ÜCRET HESAPLAYICI */}
            {activeTab === "CALCULATOR" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                      <Users size={14} className="text-amber-400" />
                      <span>PAYLAŞILAN YOLCU SAYISI</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/40">
                      {passengers} Yolcu
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>1 Kişi (Özel Tekne)</span>
                    <span>5 Kişi</span>
                    <span>10 Kişi (Maksimum)</span>
                  </div>

                  {/* Cost Box */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Kişi Başı Tutar
                      </span>
                      <strong className="text-lg sm:text-xl font-mono font-black text-amber-400">
                        {fare.perPersonFare} ₺
                      </strong>
                      <span className="text-[9px] text-slate-500 block">masraf bölüşüldüğünde</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Toplam Tekne Ücreti
                      </span>
                      <strong className="text-lg sm:text-xl font-mono font-black text-slate-200">
                        {fare.totalBoatFare} ₺
                      </strong>
                      <span className="text-[9px] text-slate-500 block">
                        (500₺ açılış + {fare.mileCost}₺ mil)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-xs">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-slate-400 leading-tight">
                    <strong className="text-slate-300 block">Yasal Dayanak & Tarife:</strong>
                    {SEA_TAXI_OFFICIAL_TARIFF.legalCitation} gereği İBB Deniz Taksiler açılış 500 ₺ ve mil başı 750 ₺ sabit tarifeyle hizmet vermektedir.
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 3: İSKELE TOPLANMA QR KODU */}
            {activeTab === "QR" && (
              <PierSharingQrCard
                origin={origin}
                destination={destination}
                perPersonFare={fare.perPersonFare}
                passengers={passengers}
              />
            )}
          </div>

          {/* Footer Aksiyon Butonları */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
            <a
              href="tel:153"
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone size={13} className="text-emerald-400" />
              <span>ALO 153</span>
            </a>

            <a
              href={SEA_TAXI_OFFICIAL_TARIFF.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>İBB Deniz Taksi Uygulamasını Aç</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
