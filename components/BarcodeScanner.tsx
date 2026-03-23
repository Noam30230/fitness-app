"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Keyboard, Search, Loader2 } from "lucide-react";

interface BarcodeResult {
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

interface BarcodeScannerProps {
  onResult: (result: BarcodeResult, quantity_g: number) => void;
}

export default function BarcodeScanner({ onResult }: BarcodeScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [product, setProduct] = useState<BarcodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<unknown>(null);
  const hasScanned = useRef(false);

  const handleBarcode = useCallback(async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/barcode?barcode=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Produit non trouvé");
      setProduct(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Produit non trouvé. Essayez un autre code.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "camera" || typeof window === "undefined") return;

    hasScanned.current = false;
    let stopped = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (stopped) return;
      const qr = new Html5Qrcode("barcode-reader");
      scannerRef.current = qr;

      qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          if (hasScanned.current) return;
          hasScanned.current = true;
          qr.stop().catch(() => {}).finally(() => {
            handleBarcode(decodedText);
          });
        },
        undefined
      ).catch(() => {
        setMode("manual");
        setError("Caméra non disponible, utilisez la saisie manuelle.");
      });
    }).catch(() => {
      setMode("manual");
    });

    return () => {
      stopped = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qr = scannerRef.current as any;
      if (qr?.isScanning) {
        qr.stop().catch(() => {});
      }
    };
  }, [mode, handleBarcode]);

  const handleManualSearch = () => {
    if (manualCode.trim()) handleBarcode(manualCode.trim());
  };

  const handleConfirm = () => {
    if (product) onResult(product, quantity);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("camera"); setProduct(null); setError(""); hasScanned.current = false; }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === "camera" ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
          }`}
        >
          <Camera size={16} /> Caméra
        </button>
        <button
          onClick={() => { setMode("manual"); setProduct(null); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === "manual" ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
          }`}
        >
          <Keyboard size={16} /> Manuel
        </button>
      </div>

      {mode === "camera" && !product && !loading && (
        <div
          id="barcode-reader"
          className="w-full rounded-xl overflow-hidden bg-[#1C1C1C] min-h-[250px]"
        />
      )}

      {mode === "manual" && !product && (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
            placeholder="Code-barres (ex: 3017620422003)"
            className="flex-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#555] focus:border-[#F5C400] outline-none"
          />
          <button onClick={handleManualSearch} className="bg-[#F5C400] text-black p-3 rounded-xl">
            <Search size={18} />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Loader2 size={24} className="text-[#F5C400] animate-spin" />
          <span className="text-xs text-[#888888]">Recherche du produit...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm text-center">{error}</p>
          {mode === "camera" && (
            <button
              onClick={() => { setError(""); hasScanned.current = false; setMode("manual"); }}
              className="w-full mt-2 text-xs text-[#888888] underline"
            >
              Saisir le code manuellement
            </button>
          )}
        </div>
      )}

      {product && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#1C1C1C] rounded-xl p-4 border border-[#2A2A2A]">
            <h3 className="font-semibold text-white mb-2">{product.name}</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Cal.", value: product.calories_per_100g, unit: "" },
                { label: "Prot.", value: product.protein_per_100g, unit: "g" },
                { label: "Gluc.", value: product.carbs_per_100g, unit: "g" },
                { label: "Lip.", value: product.fat_per_100g, unit: "g" },
              ].map(({ label, value, unit }) => (
                <div key={label}>
                  <div className="text-[#888888] text-xs">{label}</div>
                  <div className="text-white text-sm font-semibold">{value}{unit}</div>
                  <div className="text-[#555] text-[10px]">/100g</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-[#888888] mb-2 block">Quantité (grammes)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:border-[#F5C400] outline-none"
            />
            {quantity > 0 && (
              <p className="text-xs text-[#888888] mt-1">
                = {Math.round(product.calories_per_100g * quantity / 100)} kcal •{" "}
                P: {Math.round(product.protein_per_100g * quantity / 10) / 10}g •{" "}
                G: {Math.round(product.carbs_per_100g * quantity / 10) / 10}g •{" "}
                L: {Math.round(product.fat_per_100g * quantity / 10) / 10}g
              </p>
            )}
          </div>

          <button onClick={handleConfirm} className="w-full bg-[#F5C400] text-black font-bold py-3.5 rounded-xl min-h-[52px]">
            Ajouter ce repas
          </button>
        </div>
      )}
    </div>
  );
}
