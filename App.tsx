
import React, { useState, useEffect } from 'react';
import { UploadCard } from './components/UploadCard';
import { Chip } from './components/Chip';
import { CheckPill } from './components/CheckPill';
import { Lightbox } from './components/Lightbox';
import type { UploadedFile } from './types';
import { cx, fileToDataURL, cropImageToAspectRatio } from './utils';
import { generateImages } from './services/geminiService';

export default function App() {
  // Upload states
  const [model, setModel] = useState<UploadedFile | null>(null);
  const [product, setProduct] = useState<UploadedFile | null>(null);
  const [clothing, setClothing] = useState<UploadedFile | null>(null);
  const [logo, setLogo] = useState<UploadedFile | null>(null);
  

  // Style options (multi)
  const styleOptions = [
    "Chuyên nghiệp",
    "Sang trọng",
    "Tự nhiên",
    "Hiện đại",
    "Tập trung vào da",
  ];
  const [styles, setStyles] = useState(["Chuyên nghiệp"]);

  // Quality (single)
  const qualityOptions = ["1080p", "2K", "4K", "8K"];
  const [quality, setQuality] = useState("8K");

  // Aspect (single)
  const aspectOptions = ["9:16", "16:9", "1:1"];
  const [aspect, setAspect] = useState("9:16");

  // Others
  const [count, setCount] = useState(2);
  const [userPrompt, setUserPrompt] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const setFileWithPreview = async (file: File, setter: React.Dispatch<React.SetStateAction<UploadedFile | null>>) => {
    if (file.size > 15 * 1024 * 1024) {
      setToast("File vượt quá 15MB.");
      return;
    }
    const previewUrl = await fileToDataURL(file);
    setter({ file, previewUrl });
  };

  const toggleStyle = (label: string, checked: boolean) => {
    setStyles((prev) => {
      const s = new Set(prev);
      if (checked) s.add(label);
      else s.delete(label);
      return Array.from(s);
    });
  };

  const generateSuggestedPrompt = () => {
    const parts = ["người mẫu"]; // Start with the subject
    if (product) parts.push("tương tác với sản phẩm được cung cấp");
    if (clothing) parts.push("mặc trang phục được cung cấp");
    if (logo) parts.push("thêm logo vào góc trên bên phải một cách nổi bật và hài hòa");

    // Add styles
    parts.push(...styles);
    
    // Add general scene details
    parts.push("bối cảnh ngoài trời hiện đại", "ánh sáng tự nhiên", "tông màu da chân thực");

    return parts.join(', '); // Join everything with commas
  };

  const onSuggestPrompt = () => {
    setUserPrompt(generateSuggestedPrompt());
  };

  const onGenerate = async () => {
    if (!model) {
      setToast("Vui lòng tải lên Người mẫu (Model).");
      return;
    }

    // Auto-generate prompt if it's empty to ensure the API call is effective
    let finalUserPrompt = userPrompt;
    if (!userPrompt.trim()) {
      finalUserPrompt = generateSuggestedPrompt();
      setUserPrompt(finalUserPrompt);
    }

    setLoading(true);
    setPreviews([]);
    setToast("");
    try {
      // Pre-crop the model image to the target aspect ratio
      const croppedModelFile = await cropImageToAspectRatio(model.file, aspect);
      const croppedModel: UploadedFile = {
        file: croppedModelFile,
        previewUrl: await fileToDataURL(croppedModelFile),
      };

      const payload = {
        modelFile: croppedModel, // Use the pre-cropped image
        otherFiles: { clothing: clothing || undefined, logo: logo || undefined, product: product || undefined },
        styles,
        quality,
        aspect,
        count,
        userPrompt: finalUserPrompt,
      };
      const urls = await generateImages(payload);
      setPreviews(urls);
    } catch (e) {
// FIX: Corrected the syntax of the catch block.
      console.error(e);
      setToast(e instanceof Error ? e.message : "Có lỗi xảy ra khi tạo ảnh.");
    } finally {
      setLoading(false);
    }
  };

  const onDownloadAll = async () => {
    if (!previews.length) {
      setToast("Chưa có ảnh để tải.");
      return;
    }
    // Browser will open each image; in real app, zip files.
    previews.forEach((u) => window.open(u, "_blank"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-violet-200 text-slate-800 flex flex-col">
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.82 2.46a.75.75 0 0 0 .544.544l2.46.82a.75.75 0 0 1 0 1.442l-2.46.82a.75.75 0 0 0-.544.544l-.82 2.46a.75.75 0 0 1-1.442 0l-.82-2.46a.75.75 0 0 0-.544-.544l-2.46-.82a.75.75 0 0 1 0-1.442l2.46-.82a.75.75 0 0 0 .544-.544l.82-2.46A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036a.75.75 0 0 0 .568.568l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a.75.75 0 0 0-.568.568l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a.75.75 0 0 0-.568-.568l-1.036-.258a.75.75 0 0 1 0-1.456l1.036.258a.75.75 0 0 0 .568.568l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.558l.5 2a.75.75 0 0 0 .558.558l2 .5a.75.75 0 0 1 0 1.424l-2 .5a.75.75 0 0 0-.558.558l-.5 2a.75.75 0 0 1-1.424 0l-.5-2a.75.75 0 0 0-.558-.558l-2-.5a.75.75 0 0 1 0-1.424l2-.5a.75.75 0 0 0 .558.558l.5-2a.75.75 0 0 1 .712-.558Z" clipRule="evenodd" />
              </svg>
              Trợ Lý Tạo Ảnh Bán Hàng Miễn Phí
            </h1>
            <p className="mt-4 text-base sm:text-lg font-semibold text-slate-700">
              Ứng dụng được xây dựng bởi Biệt Đội đến từ thương hiệu <span className="font-bold text-teal-600">Sâm Dây Lâm Thịnh 🌿</span>
            </p>
            <p className="mt-2 text-sm sm:text-base text-gray-800">
              Để hỗ trợ tốt hơn, kết nối thêm với mình tại Zalo:{' '}
              <a href="https://zalo.me/g/mqjrff519" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline hover:text-purple-700 transition-colors">
                https://zalo.me/g/mqjrff519
              </a>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT SIDE */}
            <div className="space-y-6">
              {/* Upload Section */}
              <section className="rounded-3xl border border-blue-200/80 bg-white/60 backdrop-blur-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-blue-900">Tải lên</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UploadCard
                    title="Người mẫu (Model)"
                    file={model}
                    onFile={(f) => setFileWithPreview(f, setModel)}
                    onClear={() => setModel(null)}
                  />
                  <UploadCard
                    title="Sản phẩm (Product)"
                    file={product}
                    onFile={(f) => setFileWithPreview(f, setProduct)}
                    onClear={() => setProduct(null)}
                    objectFit="contain"
                  />
                  <UploadCard
                    title="Trang phục (Clothing)"
                    subtitle="Ưu tiên PNG nền trong suốt"
                    file={clothing}
                    onFile={(f) => setFileWithPreview(f, setClothing)}
                    onClear={() => setClothing(null)}
                  />
                  <UploadCard
                    title="Logo"
                    subtitle="Ưu tiên PNG nền trong suốt"
                    file={logo}
                    onFile={(f) => setFileWithPreview(f, setLogo)}
                    onClear={() => setLogo(null)}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-3">Hỗ trợ PNG, JPG, WEBP. Tối đa 15MB mỗi ảnh. Kéo-thả hoặc bấm “Chọn ảnh”.</p>
              </section>

              {/* Style / Quality / Aspect */}
              <section className="rounded-3xl border border-blue-200/80 bg-white/60 backdrop-blur-lg p-4 sm:p-6 space-y-5">
                <div className="rounded-2xl border border-blue-300/80 p-4">
                  <div className="text-blue-900 font-semibold mb-3">Phong cách</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {styleOptions.map((opt) => (
                      <CheckPill
                        key={opt}
                        label={opt}
                        checked={styles.includes(opt)}
                        onChange={(v) => toggleStyle(opt, v)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-blue-300/80 p-4">
                    <div className="text-blue-900 font-semibold mb-3">Chất lượng ảnh</div>
                    <div className="flex flex-wrap gap-2">
                      {qualityOptions.map((q) => (
                        <Chip key={q} label={q} active={quality === q} onClick={() => setQuality(q)} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-blue-300/80 p-4">
                    <div className="text-blue-900 font-semibold mb-3">Tỷ lệ khung hình</div>
                    <div className="flex flex-wrap gap-2">
                      {aspectOptions.map((a) => (
                        <Chip key={a} label={a} active={aspect === a} onClick={() => setAspect(a)} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Prompt */}
              <section className="rounded-3xl border border-blue-200/80 bg-white/60 backdrop-blur-lg p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-blue-900">Yêu cầu chung (Prompt)</h2>
                  <button type="button" className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={onSuggestPrompt}>
                    Gợi ý Prompt
                  </button>
                </div>
                <textarea
                  className="mt-3 w-full min-h-[110px] rounded-2xl bg-white border border-gray-300 p-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Mô tả ảnh mong muốn…"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                />

                <div className="mt-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Số lượng ảnh</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(8, parseInt(e.target.value || "1", 10))))}
                    className="w-20 rounded-xl bg-white border border-gray-300 px-3 py-1.5 text-sm"
                  />
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={onDownloadAll}
                    className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Tải tất cả ảnh
                  </button>
                  <button
                    type="button"
                    onClick={onGenerate}
                    disabled={loading}
                    className={cx(
                      "px-5 py-2 rounded-full font-semibold transition-colors text-white",
                      loading
                        ? "bg-gray-400/80 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                    )}
                  >
                    {loading ? "Đang tạo…" : `Tạo ${count} ảnh`}
                  </button>
                </div>

                {toast && (
                  <div className="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded-lg text-center sm:text-left">{toast}</div>
                )}
              </section>
            </div>

            {/* RIGHT SIDE – Preview */}
            <div className="rounded-3xl p-0.5 bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <section className="rounded-[22px] bg-gray-50 h-full p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-blue-900">Ảnh xem trước</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {loading && Array.from({ length: count }).map((_, idx) => (
                      <div key={idx} className="aspect-[9/16] animate-pulse rounded-2xl overflow-hidden bg-blue-100"></div>
                  ))}

                  {!loading && previews.length === 0 && (
                    <div className="col-span-2 text-gray-500 text-sm h-64 flex items-center justify-center">Chưa có ảnh. Hãy nhập Prompt và bấm “Tạo ảnh”.</div>
                  )}

                  {previews.map((url, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-[9/16]">
                      <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(url)} />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); window.open(url, "_blank"); }}
                          className="px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-xs hover:bg-black/60"
                        >
                          Tải ảnh
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-xs text-gray-600">
                  Ứng dụng sử dụng Google Gemini để tạo ảnh dựa trên hình ảnh đầu vào và prompt của bạn. Kết quả có thể khác nhau. Hãy thử các prompt khác nhau để có kết quả tốt nhất.
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Lightbox url={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
