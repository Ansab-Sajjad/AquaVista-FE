"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { apiClient } from "@/lib/api-client";

type FilePreviewDialogProps = {
  open: boolean;
  fileId: string | null;
  fileName: string;
  projectId: string;
  onClose: () => void;
};

type PreviewState = {
  loading: boolean;
  error: string | null;
  // PDF / Word .doc (binary, can't parse in-browser)
  blobUrl: string | null;
  // CSV / Excel
  headers: string[];
  rows: string[][];
  // Word .docx (rendered as HTML)
  html: string | null;
};

const INITIAL_STATE: PreviewState = {
  loading: true,
  error: null,
  blobUrl: null,
  headers: [],
  rows: [],
  html: null,
};

function getFileKind(fileName: string): "pdf" | "csv" | "xlsx" | "docx" | "doc" | "unknown" {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  if (ext === "pdf") return "pdf";
  if (ext === "csv") return "csv";
  if (ext === "xlsx") return "xlsx";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc";
  return "unknown";
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  };

  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(splitLine);
  return { headers, rows };
}

export default function FilePreviewDialog({
  open,
  fileId,
  fileName,
  projectId,
  onClose,
}: FilePreviewDialogProps) {
  const [state, setState] = useState<PreviewState>(INITIAL_STATE);

  const kind = getFileKind(fileName);

  const loadPreview = useCallback(async () => {
    if (!fileId || !projectId) return;

    setState({ ...INITIAL_STATE });

    try {
      const res = await apiClient.raw<Response>(`/api/projects/${projectId}/data/${fileId}/preview`);

      const blob = await res.blob();

      if (kind === "pdf") {
        const url = window.URL.createObjectURL(blob);
        setState({ ...INITIAL_STATE, loading: false, blobUrl: url });
        return;
      }

      if (kind === "csv") {
        const text = await blob.text();
        const { headers, rows } = parseCsv(text);
        setState({ ...INITIAL_STATE, loading: false, headers, rows });
        return;
      }

      if (kind === "xlsx") {
        const arrayBuffer = await blob.arrayBuffer();
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: string[][] = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          raw: false,
          defval: "",
        });
        const headers = data.length > 0 ? data[0].map(String) : [];
        const rows = data.slice(1).map((r) => r.map(String));
        setState({ ...INITIAL_STATE, loading: false, headers, rows });
        return;
      }

      if (kind === "docx") {
        const arrayBuffer = await blob.arrayBuffer();
        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setState({ ...INITIAL_STATE, loading: false, html: result.value });
        return;
      }

      // .doc (binary) or unknown — can't preview in-browser
      setState({
        ...INITIAL_STATE,
        loading: false,
        error: "Preview is not available for this file type. Please download the file to view it.",
      });
    } catch (err) {
      setState({
        ...INITIAL_STATE,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load preview.",
      });
    }
  }, [fileId, projectId, kind]);

  useEffect(() => {
    if (open && fileId) {
      void loadPreview();
    }
  }, [open, fileId, loadPreview]);

  // Cleanup blob URL when dialog closes or file changes
  useEffect(() => {
    return () => {
      if (state.blobUrl) {
        window.URL.revokeObjectURL(state.blobUrl);
      }
    };
  }, [state.blobUrl]);

  const showTable = state.headers.length > 0 || state.rows.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          className: "backdrop-blur-sm",
          timeout: 300,
        },
      }}
      className="animate-in fade-in zoom-in-95 duration-200"
    >
      <DialogTitle className="flex items-center justify-between pr-2">
        <Typography variant="h6" component="span" className="truncate">
          {fileName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className="min-h-[300px]">
        {state.loading ? (
          <Box className="flex items-center justify-center py-16">
            <CircularProgress size={32} />
          </Box>
        ) : state.error ? (
          <Box className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Typography variant="body1" className="text-text-secondary">
              {state.error}
            </Typography>
          </Box>
        ) : state.blobUrl ? (
          <iframe
            src={state.blobUrl}
            title={fileName}
            className="h-[70vh] w-full rounded-lg border-0"
          />
        ) : showTable ? (
          <TableContainer sx={{ maxHeight: "70vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {state.headers.map((header, i) => (
                    <TableCell
                      key={i}
                      sx={{ fontWeight: "bold", backgroundColor: "background.paper" }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {state.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} hover>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : state.html ? (
          <Box
            className="prose max-w-none overflow-y-auto p-2"
            sx={{ maxHeight: "70vh" }}
            dangerouslySetInnerHTML={{ __html: state.html }}
          />
        ) : (
          <Box className="flex items-center justify-center py-12">
            <Typography variant="body2" className="text-text-secondary">
              No preview available.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
