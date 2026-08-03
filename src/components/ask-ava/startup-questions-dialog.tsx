"use client";

import type { StartupQuestion } from "./types";
import { useEffect, useState } from "react";

import { ArrowDownward, ArrowUpward, Delete, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  questions: StartupQuestion[];
  onClose: () => void;
  onSave: (questions: StartupQuestion[]) => Promise<void>;
};

export default function StartupQuestionsDialog({ open, questions, onClose, onSave }: Props) {
  const [drafts, setDrafts] = useState<StartupQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDrafts(questions.map((q, i) => ({ ...q, order: q.order ?? i })));
    }
  }, [open, questions]);

  const addQuestion = () => {
    setDrafts((prev) => [...prev, { text: "", order: prev.length }]);
  };

  const updateText = (index: number, text: string) => {
    setDrafts((prev) => prev.map((q, i) => (i === index ? { ...q, text } : q)));
  };

  const removeQuestion = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i })));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    setDrafts((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((q, i) => ({ ...q, order: i }));
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(drafts.filter((q) => q.text.trim()).map((q, i) => ({ ...q, order: i })));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage startup questions</DialogTitle>
      <DialogContent>
        <Typography variant="body2" className="text-text-secondary mb-3">
          These questions appear for project users when they open Ask AVA. Add, edit, delete, and reorder them.
        </Typography>
        <List disablePadding>
          {drafts.map((q, index) => (
            <ListItem
              key={index}
              disableGutters
              className="mb-2 gap-2"
              sx={{ alignItems: "flex-start" }}
              secondaryAction={
                <Box className="flex flex-col">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => moveQuestion(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => moveQuestion(index, 1)}
                    disabled={index === drafts.length - 1}
                    title="Move down"
                  >
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <TextField
                fullWidth
                size="small"
                value={q.text}
                onChange={(e) => updateText(index, e.target.value)}
                placeholder="Enter a startup question"
              />
              <IconButton edge="end" size="small" onClick={() => removeQuestion(index)} title="Delete">
                <Delete fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <Button onClick={addQuestion} variant="outlined" size="small" className="mt-2 w-fit">
          + Add question
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" startIcon={<Save />} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
