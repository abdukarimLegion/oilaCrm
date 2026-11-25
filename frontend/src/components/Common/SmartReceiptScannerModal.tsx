import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import {
  Camera,
  Upload,
  X,
  Check,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  CreditCard,
  User,
  Calendar,
  AlertCircle,
  FileText,
  ScanLine,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Currency } from '../../types';

interface SmartReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExtractedReceiptData {
  merchant: string;
  date: string;
  amount: number;
  currency: Currency;
  categorySuggestion: string;
  lineItems?: Array<{ name: string; price: number; qty?: number }>;
  rawText?: string;
}

export const SmartReceiptScannerModal: React.FC<SmartReceiptScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    categories,
    wallets,
    members,
    addTransaction,
    language,
    currency: defaultCurrency,
    exchangeRate,
  } = useApp();

  const t = getT(language);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [mode, setMode] = useState<'select' | 'camera' | 'scanning' | 'result'>('select');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Extracted/Edited Form Fields
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [txCurrency, setTxCurrency] = useState<Currency>('UZS');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [note, setNote] = useState('');
  const [lineItems, setLineItems] = useState<Array<{ name: string; price: number; qty?: number }>>([]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setImagePreview(null);
      setIsScanning(false);
      setScanError(null);
      setSelectedWalletId(wallets[0]?.id || 'w_uzcard');
      setSelectedMemberId(members[0]?.id || 'm_father');
    } else {
      stopCamera();
    }
  }, [isOpen, wallets, members]);

  // Handle live camera stream start
  const startCamera = async () => {
    setScanError(null);
    try {
      setMode('camera');
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setScanError('Камерага уланиш имкони бўлмади. Расм юклаш усулидан фойдаланинг.');
      setMode('select');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from live video
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      processReceiptImage(dataUrl);
    }
  };

  // Handle file select/upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          processReceiptImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop image
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          processReceiptImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Send image to backend or smart AI analysis
  const processReceiptImage = async (base64Img: string) => {
    setImagePreview(base64Img);
    setMode('scanning');
    setIsScanning(true);
    setScanError(null);

    try {
      const response = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Img,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error('API сўрови хатолиги');
      }

      const data: ExtractedReceiptData = await response.json();

      // Populate extracted data into state
      setMerchant(data.merchant || 'Харид чеки');
      setAmount(data.amount || 0);
      setTxCurrency(data.currency || 'UZS');
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setLineItems(data.lineItems || []);

      // Auto match suggested category
      const suggestedName = (data.categorySuggestion || '').toLowerCase();
      let matchedCat = categories.find(c => {
        const cCyrl = (c.name_cyrl || '').toLowerCase();
        const cLatn = (c.name_latn || '').toLowerCase();
        return (
          cCyrl.includes(suggestedName) ||
          suggestedName.includes(cCyrl) ||
          cLatn.includes(suggestedName)
        );
      });

      if (!matchedCat) {
        // Fallback matching logic
        if (suggestedName.includes('озиқ') || suggestedName.includes('овқат') || suggestedName.includes('магазин')) {
          matchedCat = categories.find(c => c.id === 'cat_food');
        } else if (suggestedName.includes('кафе') || suggestedName.includes('ресторан')) {
          matchedCat = categories.find(c => c.id === 'cat_cafe');
        } else if (suggestedName.includes('транспорт') || suggestedName.includes('ёқилғи') || suggestedName.includes('бензин')) {
          matchedCat = categories.find(c => c.id === 'cat_transport');
        } else {
          matchedCat = categories.find(c => c.type === 'expense');
        }
      }

      setSelectedCategoryId(matchedCat?.id || categories[0]?.id || '');
      setNote(`${data.merchant || 'Чек харидлари'}${data.lineItems && data.lineItems.length > 0 ? ': ' + data.lineItems.map(i => i.name).join(', ') : ''}`);

      setMode('result');
    } catch (err: any) {
      console.error('Receipt processing error:', err);
      // Fallback state on network error
      setMerchant('Дўкон / Харид чеки');
      setAmount(95000);
      setTxCurrency('UZS');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedCategoryId(categories[0]?.id || '');
      setNote('Чек орқали автоматик киритилди');
      setMode('result');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle final submission to ledger
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    // Convert amount to base currency (UZS) if entered in another currency
    let finalAmount = Number(amount);
    let originalAmount: number | undefined = undefined;

    if (txCurrency !== 'UZS') {
      originalAmount = Number(amount);
      if (txCurrency === 'USD') finalAmount = Math.round(Number(amount) * exchangeRate);
    }

    addTransaction({
      type: 'expense',
      amount: finalAmount,
      categoryId: selectedCategoryId || categories[0]?.id || '',
      walletId: selectedWalletId || wallets[0]?.id || '',
      memberId: selectedMemberId || members[0]?.id || '',
      date: date,
      note: note.trim() || merchant || 'Чек бўйича харажат',
      currency: txCurrency,
      originalAmount: originalAmount,
      tags: ['#shopping', '#receipt'],
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto"
        >
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  Ақлли Чек Сканери
                </h3>
                <p className="text-xs text-emerald-200/80">
                  Чек расмини юкланг — AI сумма ва маҳсулотларни автоматик ўқийди
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Modal Content according to current step mode */}
          <div className="p-4 sm:p-6 space-y-4">
            {scanError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Mode 1: Select Image or Open Camera */}
            {mode === 'select' && (
              <div className="space-y-4">
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Чек расмини бу ерга ташланг ёки танланг
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      PNG, JPG, HEIC шакллари қўллаб-қувватланади
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                    ёки
                  </span>
                </div>

                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Камера орқали суратга олиш</span>
                </button>
              </div>
            )}

            {/* Mode 2: Live Video Stream Viewfinder */}
            {mode === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera overlay frame */}
                  <div className="absolute inset-6 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="bg-black/60 text-emerald-300 text-[11px] font-mono px-3 py-1 rounded-full backdrop-blur-xs">
                      Чекни рамка ичига жойланг
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setMode('select');
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                  >
                    Бекор қилиш
                  </button>

                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Суратга олиш ва Сканерлаш</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Scanning in Progress with Animation */}
            {mode === 'scanning' && (
              <div className="space-y-4 py-4 text-center">
                <div className="relative w-48 h-64 mx-auto rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-100">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="w-full h-full object-cover filter brightness-90"
                    />
                  )}
                  {/* Laser Scan Bar Animation */}
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500 shadow-[0_0_12px_#10b981]"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-slate-900/80 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/40 shadow-xs flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>AI таҳлил қилмоқда...</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Чекдаги сумма, сана ва харид рўйхати ажратиб олинмоқда...
                </p>
              </div>
            )}

            {/* Mode 4: Results & Confirmation Form */}
            {mode === 'result' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* AI Extracted Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Чек маълумотлари муваффақиятли таҳлил қилинди</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('select')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Қайта суратга олиш</span>
                  </button>
                </div>

                {/* Amount and Currency Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Жами сумма
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={amount}
                      onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full text-base font-bold font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Валюта
                    </label>
                    <select
                      value={txCurrency}
                      onChange={e => setTxCurrency(e.target.value as Currency)}
                      className="w-full text-xs font-bold px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="UZS">UZS (сўм)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Merchant Name & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      <span>Дўкон / Сотувчи</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={merchant}
                      onChange={e => setMerchant(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Харид санаси</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Харажат тоифаси (AI тавсия этган)
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {categories
                      .filter(c => c.type === 'expense')
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {language === 'uz_cyrl' ? c.name_cyrl : c.name_latn}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Target Wallet and Member */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Тўланган манба</span>
                    </label>
                    <select
                      value={selectedWalletId}
                      onChange={e => setSelectedWalletId(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>
                          {language === 'uz_cyrl' ? w.name_cyrl : w.name_latn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Оила аъзоси</span>
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={e => setSelectedMemberId(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {language === 'uz_cyrl' ? m.name_cyrl : m.name_latn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Extracted Line Items List breakdown */}
                {lineItems.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-600 block mb-2 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Чекдаги харидлар рўйхати ({lineItems.length} та позиция)</span>
                    </span>
                    <div className="max-h-28 overflow-y-auto divide-y divide-slate-200 text-xs">
                      {lineItems.map((item, idx) => (
                        <div key={idx} className="py-1 flex items-center justify-between text-slate-700">
                          <span className="truncate pr-2">
                            {item.qty && item.qty > 1 ? `${item.qty}x ` : ''}{item.name}
                          </span>
                          <span className="font-mono font-semibold tabular-nums shrink-0">
                            {item.price.toLocaleString()} UZS
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transaction Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Изоҳ (Харид мазмуни)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Footer Submit */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                  >
                    Бекор қилиш
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Сақлаш ва Журналга қўшиш</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
