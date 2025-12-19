import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeckCardProps {
  deck: {
    id: string;
    title: string;
    description: string | null;
    card_count: number;
  };
  onDelete: (deckId: string) => void;
  onRename?: (deckId: string, newTitle: string) => void;
}

export const DeckCard = ({ deck, onDelete, onRename }: DeckCardProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(deck.title);
  const progress = (deck.card_count / 20) * 100;

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== deck.title && onRename) {
      onRename(deck.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(deck.title);
    setIsEditing(false);
  };

  return (
    <>
      <Card 
        className="group hover:scale-105 transition-all duration-300 card-shine border-border/50 hover:border-primary/50 hover:card-glow cursor-pointer"
        onClick={() => !isEditing && navigate(`/deck/${deck.id}`)}
      >
        <CardHeader>
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 font-display text-xl"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveTitle}>
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl">
                {deck.title}
              </CardTitle>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {deck.description && !isEditing && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {deck.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">
                {deck.card_count}/20
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Удалить колоду "{deck.title}"?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Это действие нельзя отменить.</p>
              <p className="font-medium text-destructive">
                Вы навсегда потеряете весь прогресс по этой колоде: {deck.card_count} карточек, исследования и AI-оценки.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(deck.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить навсегда
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
