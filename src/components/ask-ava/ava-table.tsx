"use client";

import type { AvaTableData } from "./types";
import { useState } from "react";

import { Check, ContentCopy } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function AvaTable({ data }: { data: AvaTableData }) {
  const [copied, setCopied] = useState(false);

  const columns = Array.isArray(data?.columns) ? data.columns : [];
  const rows = Array.isArray(data?.rows) ? data.rows : [];

  const handleCopy = async () => {
    const tsv = [columns.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore silently
    }
  };

  if (columns.length === 0 && rows.length === 0) {
    return null;
  }

  return (
    <Box className="border-grey-500 mt-3 w-full overflow-hidden rounded-2xl border">
      <Box className="bg-grey-25 flex items-center justify-between px-3 py-2">
        <Typography variant="subtitle2" className="text-text-primary">
          {data?.title || "Table"}
        </Typography>
        <IconButton size="small" onClick={handleCopy} title="Copy table values">
          {copied ? <Check fontSize="small" className="text-success" /> : <ContentCopy fontSize="small" />}
        </IconButton>
      </Box>
      <TableContainer className="max-h-[420px]">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index} className="bg-grey-50 font-semibold">
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
