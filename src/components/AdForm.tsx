"use client";

import { useActionState, useState } from "react";
import { createAd, updateAd } from "@/lib/actions/ads";
import { createClient } from "@/lib/supabase/client";
import { AD_POSITION_LABELS, AD_TYPE_LABELS, type Ad, type AdPosition, type AdType } from "@/lib/types";

const MAX_IMAGE_MB = 5;

export default function AdForm({ ad }: { ad?: Ad }) {
  const isEdit = !!ad;
  const action = isEdit ? updateAd.bind(null, ad!.id) : createAd;
  const [state, formAction, pending] = useActionState(action, { error: null });

  const [imageUrl, setImageUrl] = useState<string | null>(ad?.image || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [type, setType] = useState<AdType>(ad?.type || "image");

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setUploadError(`이미지는 ${MAX_IMAGE_MB}MB 이하만 가능합니다.`);
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("ad-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("ad-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setUploadError((err as Error).message || "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="max-w-lg space-y-3">
      <div>
        <label className="mb-1 block text-[12px] font-bold text-ink-soft">광고 제목</label>
        <input name="title" required defaultValue={ad?.title} placeholder="광고 제목" className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-bold text-ink-soft">설명</label>
        <textarea
          name="description"
          defaultValue={ad?.description || ""}
          placeholder="설명 (선택)"
          rows={3}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-bold text-ink-soft">
          이미지 {type === "youtube" && <span className="font-normal">(유튜브는 썸네일이 자동 생성되어 생략 가능)</span>}
        </label>
        {imageUrl && (
          <div className="relative mb-2 h-24 w-40 overflow-hidden rounded-sm border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="광고 이미지" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-ink/70 text-[11px] text-white"
              aria-label="이미지 삭제"
            >
              ×
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={handleImageSelect}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[12.5px] file:mr-3 file:rounded-sm file:border-0 file:bg-teal-tint file:px-2.5 file:py-1 file:text-[12px] file:font-bold file:text-teal disabled:opacity-50"
        />
        {uploading && <p className="mt-1 text-[11.5px] text-ink-soft">업로드 중...</p>}
        {uploadError && <p className="mt-1 text-[11.5px] font-bold text-coral">{uploadError}</p>}
        <input type="hidden" name="image" value={imageUrl || ""} />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-bold text-ink-soft">링크 URL</label>
        <input
          name="link"
          type="url"
          required
          defaultValue={ad?.link}
          placeholder={type === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://..."}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-bold text-ink-soft">광고 위치</label>
          <select name="position" defaultValue={ad?.position || "main_top"} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]">
            {(Object.keys(AD_POSITION_LABELS) as AdPosition[]).map((p) => (
              <option key={p} value={p}>
                {AD_POSITION_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-bold text-ink-soft">광고 종류</label>
          <select
            name="type"
            defaultValue={type}
            onChange={(e) => setType(e.target.value as AdType)}
            className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
          >
            {(Object.keys(AD_TYPE_LABELS) as AdType[]).map((t) => (
              <option key={t} value={t}>
                {AD_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-bold text-ink-soft">시작일 (선택)</label>
          <input name="start_date" type="date" defaultValue={ad?.start_date || ""} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-bold text-ink-soft">종료일 (선택)</label>
          <input name="end_date" type="date" defaultValue={ad?.end_date || ""} className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-bold text-ink-soft">우선순위 (숫자가 클수록 먼저 노출)</label>
        <input
          name="priority"
          type="number"
          defaultValue={ad?.priority ?? 0}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[13.5px]"
        />
      </div>

      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" name="active" defaultChecked={ad ? ad.active : true} /> 노출 활성화
      </label>

      {state.error && <p className="text-[12.5px] font-bold text-coral">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || uploading}
        className="w-full rounded-sm bg-teal py-3 text-[14.5px] font-bold text-white hover:bg-teal-deep disabled:opacity-60"
      >
        {pending ? "저장 중..." : isEdit ? "수정 내용 저장" : "광고 등록"}
      </button>
    </form>
  );
}
