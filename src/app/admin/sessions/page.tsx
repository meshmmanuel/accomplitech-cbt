import { SessionCard } from "@/components/admin/session-card";
import { Button } from "@/components/ui/button";
import { sessions } from "@/data/mock/sessions";
import { Plus } from "lucide-react";

export default function AdminSessionsPage() {
  return (
    <>
      <div className="mb-4.5 flex gap-2.5">
        <Button variant="primary">
          <Plus size={14} /> New Session
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </>
  );
}
