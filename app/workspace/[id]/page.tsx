import { Workspace } from "./workspace";

// Server Component: resolves the dynamic segment, then hands a stable `id`
// to the client workspace. Using `await params` (Next 16 convention) avoids
// the `useParams` Suspense requirement under `cacheComponents`.
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Workspace id={id} />;
}