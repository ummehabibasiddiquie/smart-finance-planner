import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <div className="text-lg font-semibold">{title}</div>
        {description ? <div className="mt-2 text-sm text-muted-foreground">{description}</div> : null}
        {actionLabel && onAction ? (
          <div className="mt-6">
            <Button onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

