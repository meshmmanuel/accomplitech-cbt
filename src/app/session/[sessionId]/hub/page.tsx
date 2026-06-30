import { redirect } from "next/navigation";

export default async function SessionHubRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/session/${sessionId}/workspace`);
}
