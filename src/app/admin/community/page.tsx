import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteBoardPosts, deleteJobPostsAdmin } from "@/lib/actions/admin";
import AdminContentTable, { type ContentRow } from "@/components/AdminContentTable";
import { BOARD_LABELS, type BoardPost, type JobPost } from "@/lib/types";

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const [{ data: communityPosts }, { data: usedEquipment }, { data: outsourcing }] = await Promise.all([
    supabase
      .from("board_posts")
      .select("*, profiles(name)")
      .neq("board", "used_equipment")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("board_posts")
      .select("*, profiles(name)")
      .eq("board", "used_equipment")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("job_posts")
      .select("*, labs(lab_name)")
      .or("lab_category.eq.외주모집,lab_specialty.eq.외주 의뢰")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const boardRows = (posts: BoardPost[] | null): ContentRow[] =>
    (posts || []).map((p) => ({
      id: p.id,
      title: `[${BOARD_LABELS[p.board]}] ${p.title}`,
      meta: `${(p as unknown as { profiles?: { name: string } }).profiles?.name || "작성자"} · ${new Date(p.created_at).toLocaleDateString("ko-KR")}${p.price ? ` · ${p.price.toLocaleString()}원` : ""}`,
      href: `/community/${p.board}/${p.id}`,
    }));

  const outsourcingRows: ContentRow[] = ((outsourcing || []) as JobPost[]).map((j) => ({
    id: j.id,
    title: j.title,
    meta: `${(j as unknown as { labs?: { lab_name: string } }).labs?.lab_name || ""} · ${j.region} · ${new Date(j.created_at).toLocaleDateString("ko-KR")}`,
    href: `/jobs/${j.id}`,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-9">
      <h1 className="mb-5 border-b-2 border-ink pb-2.5 text-[21px] font-extrabold">커뮤니티 · 중고장비 · 외주거래 관리</h1>
      <p className="mb-5 text-[12.5px] text-ink-soft">제목을 누르면 새 창에서 원문을 확인할 수 있습니다. 체크박스로 여러 건을 한 번에 삭제할 수 있습니다.</p>

      <div className="space-y-6">
        <AdminContentTable title="커뮤니티" items={boardRows(communityPosts as BoardPost[])} onDelete={deleteBoardPosts} emptyLabel="등록된 글이 없습니다." />
        <AdminContentTable title="중고장비" items={boardRows(usedEquipment as BoardPost[])} onDelete={deleteBoardPosts} emptyLabel="등록된 중고장비 글이 없습니다." />
        <AdminContentTable title="외주거래" items={outsourcingRows} onDelete={deleteJobPostsAdmin} emptyLabel="등록된 외주 공고가 없습니다." />
      </div>
    </div>
  );
}
