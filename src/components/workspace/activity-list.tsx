"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, RefreshCw, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { Activity, ActivityType } from "@/lib/types";
import {
  reorderActivitiesAction,
  updateActivityAction,
  deleteActivityAction,
  addCommentAction,
  listCommentsAction,
  type ActivityComment,
} from "@/app/actions/activities";
import { ActivityCard } from "@/components/workspace/activity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function SortableRow({
  activity,
  children,
}: {
  activity: Activity;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative flex gap-1">
      <button
        type="button"
        className="mt-4 shrink-0 cursor-grab touch-none rounded-lg p-1 text-[var(--muted)] active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function ActivityList({
  tripId,
  dayId,
  dayNumber,
  activities: initial,
  destination,
  canEdit,
  onSelect,
  selectedId,
  onFavorite,
  favorited,
  onRegenerateDay,
}: {
  tripId: string;
  dayId: string;
  dayNumber: number;
  activities: Activity[];
  destination: string;
  canEdit: boolean;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  onFavorite?: (id: string) => void;
  favorited?: Record<string, boolean>;
  onRegenerateDay?: () => void;
}) {
  // Local order for DnD; re-sync when the day's activity set changes (React
  // "adjust state when props change" pattern — avoids setState-in-useEffect).
  const initialKey = `${dayId}:${initial.map((a) => a.id).join(",")}`;
  const [items, setItems] = useState(initial);
  const [itemsKey, setItemsKey] = useState(initialKey);
  if (initialKey !== itemsKey) {
    setItemsKey(initialKey);
    setItems(initial);
  }

  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Activity | null>(null);
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [commentBody, setCommentBody] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !canEdit) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    startTransition(async () => {
      const res = await reorderActivitiesAction({
        tripId,
        dayId,
        orderedIds: next.map((a) => a.id),
      });
      if (!res.ok) toast.error(res.error);
    });
  }

  function openComments(activityId: string) {
    setCommentFor(activityId);
    startTransition(async () => {
      const rows = await listCommentsAction(tripId, activityId);
      setComments(rows);
    });
  }

  return (
    <div className="space-y-2">
      {canEdit && onRegenerateDay ? (
        <div className="mb-2 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={pending}
            onClick={onRegenerateDay}
          >
            <RefreshCw className="h-3 w-3" />
            Redo day {dayNumber}
          </Button>
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((a) => (
            <SortableRow key={a.id} activity={a}>
              <div className="space-y-1">
                <ActivityCard
                  activity={a}
                  active={selectedId === a.id}
                  onSelect={() => onSelect?.(a.id)}
                  destination={destination}
                  favorited={!!favorited?.[a.id]}
                  onFavorite={
                    onFavorite ? () => onFavorite(a.id) : undefined
                  }
                />
                {canEdit ? (
                  <div className="flex gap-1 pl-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setEditing(a)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => openComments(a.id)}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Comment
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => openComments(a.id)}
                  >
                    <MessageSquare className="h-3 w-3" />
                    Comment
                  </Button>
                )}
              </div>
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl">
            <h3 className="font-display text-lg font-semibold">Edit activity</h3>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startTransition(async () => {
                  const res = await updateActivityAction({
                    activityId: editing.id,
                    tripId,
                    patch: {
                      title: String(fd.get("title") || editing.title),
                      description: String(fd.get("description") || ""),
                      type: String(fd.get("type") || editing.type) as ActivityType,
                      start_time: String(fd.get("start_time") || "") || null,
                      duration_min: Number(fd.get("duration_min")) || null,
                      cost_cents: Math.round(
                        parseFloat(String(fd.get("cost") || "0")) * 100,
                      ),
                    },
                  });
                  if (!res.ok) toast.error(res.error);
                  else {
                    toast.success("Activity updated");
                    setEditing(null);
                    // optimistic local
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === editing.id
                          ? {
                              ...x,
                              title: String(fd.get("title") || x.title),
                              description: String(fd.get("description") || ""),
                              type: String(fd.get("type") || x.type) as ActivityType,
                              start_time: String(fd.get("start_time") || "") || null,
                              duration_min: Number(fd.get("duration_min")) || null,
                              cost_cents: Math.round(
                                parseFloat(String(fd.get("cost") || "0")) * 100,
                              ),
                            }
                          : x,
                      ),
                    );
                  }
                });
              }}
            >
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={editing.title} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing.description ?? ""}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="start_time">Start</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    defaultValue={editing.start_time ?? "10:00"}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration_min">Minutes</Label>
                  <Input
                    id="duration_min"
                    name="duration_min"
                    type="number"
                    defaultValue={editing.duration_min ?? 90}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" name="type" defaultValue={editing.type} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cost">Cost (USD)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    defaultValue={((editing.cost_cents ?? 0) / 100).toFixed(2)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={pending}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="ml-auto"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Delete this activity?")) return;
                    startTransition(async () => {
                      const res = await deleteActivityAction({
                        activityId: editing.id,
                        tripId,
                      });
                      if (!res.ok) toast.error(res.error);
                      else {
                        setItems((prev) => prev.filter((x) => x.id !== editing.id));
                        setEditing(null);
                        toast.success("Deleted");
                      }
                    });
                  }}
                >
                  Delete
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {commentFor ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl">
            <h3 className="font-display text-lg font-semibold">Comments</h3>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
              {comments.length === 0 ? (
                <li className="text-[var(--muted)]">No comments yet.</li>
              ) : (
                comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-xl border border-[var(--border)] px-3 py-2"
                  >
                    {c.body}
                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  const res = await addCommentAction({
                    tripId,
                    activityId: commentFor,
                    body: commentBody,
                  });
                  if (!res.ok) toast.error(res.error);
                  else {
                    setCommentBody("");
                    const rows = await listCommentsAction(tripId, commentFor);
                    setComments(rows);
                    toast.success("Comment added");
                  }
                });
              }}
            >
              <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Add a note for your travel buddies…"
                rows={3}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                  Post
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCommentFor(null)}
                >
                  Close
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
