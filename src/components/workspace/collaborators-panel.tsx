"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, UserPlus, X } from "lucide-react";
import {
  inviteCollaboratorAction,
  listCollaboratorsAction,
  revokeCollaboratorAction,
  type Collaborator,
} from "@/app/actions/collaborators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function CollaboratorsPanel({
  tripId,
  isOwner,
}: {
  tripId: string;
  isOwner: boolean;
}) {
  const [email, setEmail] = useState("");
  const [list, setList] = useState<Collaborator[]>([]);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const rows = await listCollaboratorsAction(tripId);
      setList(rows);
    });
  }

  useEffect(() => {
    if (isOwner) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, isOwner]);

  if (!isOwner) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Only the trip owner can manage collaborators.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Invite someone by email. They&apos;ll get a link to join this trip as a
        viewer.
      </p>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await inviteCollaboratorAction({
              tripId,
              email,
              role: "viewer",
            });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            try {
              await navigator.clipboard.writeText(res.inviteUrl);
              toast.success("Invite created — link copied");
            } catch {
              toast.success("Invite created");
              toast.message(res.inviteUrl);
            }
            setEmail("");
            refresh();
          });
        }}
      >
        <Input
          type="email"
          required
          placeholder="friend@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl"
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </form>

      <ul className="space-y-2">
        {list.length === 0 ? (
          <li className="text-sm text-[var(--muted)]">No collaborators yet.</li>
        ) : (
          list.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{c.email}</p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {c.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {c.role}
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                {c.status === "pending" ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    aria-label="Copy invite link"
                    onClick={async () => {
                      const url = `${window.location.origin}/invite/${c.invite_token}`;
                      await navigator.clipboard.writeText(url);
                      toast.success("Invite link copied");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label="Revoke"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await revokeCollaboratorAction(c.id, tripId);
                      if (!res.ok) toast.error(res.error);
                      else {
                        toast.success("Access revoked");
                        refresh();
                      }
                    });
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
