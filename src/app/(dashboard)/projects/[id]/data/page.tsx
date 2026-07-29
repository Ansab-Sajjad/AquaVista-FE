"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormLabel,
  Grid,
  Input,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

const DATA_TYPES = [
  "Financial Snapshot",
  "Customer Allocation / Billing Data",
  "CIP Register",
  "Rate Table",
  "Demographics",
  "Budget / Audit Data",
  "Rate Resolution",
];

const TEMPLATES = [
  { name: "Financial Snapshot Template", description: "Standard municipal financial snapshot layout." },
  { name: "Customer Allocation Template", description: "Revenue and consumption by customer class." },
  { name: "CIP Register Template", description: "Capital improvement plan register." },
  { name: "Rate Table Template", description: "Existing rate structure and tiers." },
  { name: "Demographics Template", description: "Population and household data." },
];

type UploadFile = {
  id: string;
  name: string;
  type: string;
  year: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "processing" | "completed" | "failed";
};

const MOCK_UPLOADS: UploadFile[] = [
  {
    id: "1",
    name: "strasburg_financial_snapshot_2025.xlsx",
    type: "Financial Snapshot",
    year: "2025",
    uploadedBy: "Admin",
    uploadedAt: "2026-06-28",
    status: "completed",
  },
];

export default function DataPage() {
  const [uploads, setUploads] = useState<UploadFile[]>(MOCK_UPLOADS);
  const [fileType, setFileType] = useState(DATA_TYPES[0]);
  const [year, setYear] = useState("2025");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const newUpload: UploadFile = {
      id: String(Date.now()),
      name: file.name,
      type: fileType,
      year,
      uploadedBy: "Admin",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "processing",
    };
    setUploads((prev) => [newUpload, ...prev]);
    setTimeout(() => {
      setUploads((prev) => prev.map((u) => (u.id === newUpload.id ? { ...u, status: "completed" as const } : u)));
    }, 1500);
  }, [fileType, year]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "text/csv": [".csv"] },
  });

  const statusColor = (status: UploadFile["status"]) => {
    if (status === "completed") return "success";
    if (status === "processing") return "warning";
    return "error";
  };

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box>
        <Typography variant="h4" component="h2">
          Data
        </Typography>
        <Typography variant="body1" className="text-text-secondary">
          Upload baseline data and download templates.
        </Typography>
      </Box>

      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="flex flex-col gap-4 p-5">
          <Typography variant="h6">Upload project data</Typography>
          <Box className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormControl className="outlined" variant="standard" size="small">
              <FormLabel>File type</FormLabel>
              <Select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                {DATA_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="outlined" variant="standard" size="small">
              <FormLabel>Year</FormLabel>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" />
            </FormControl>
          </Box>

          <Box
            {...getRootProps()}
            className="border-grey-100 hover:border-primary flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
          >
            <input {...getInputProps()} />
            <Typography variant="body1" className={isDragActive ? "text-primary" : "text-text-secondary"}>
              {isDragActive ? "Drop the file here" : "Drag & drop a CSV or Excel file, or click to browse"}
            </Typography>
            <Typography variant="caption" className="text-text-secondary">
              Supported formats: .csv, .xlsx
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="flex flex-col gap-4 p-5">
          <Typography variant="h6">Uploaded files</Typography>
          {uploads.length === 0 ? (
            <Typography variant="body2" className="text-text-secondary">
              No files uploaded yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {uploads.map((file) => (
                <Grid key={file.id} size={{ xs: 12, md: 6 }}>
                  <Box className="bg-grey-25 flex flex-col gap-2 rounded-2xl p-4">
                    <Box className="flex items-center justify-between gap-2">
                      <Typography variant="body1" className="font-semibold text-text-primary">
                        {file.name}
                      </Typography>
                      <Chip label={file.status} size="small" color={statusColor(file.status)} />
                    </Box>
                    <Typography variant="body2" className="text-text-secondary">
                      {file.type} &bull; {file.year} &bull; {file.uploadedBy} &bull; {file.uploadedAt}
                    </Typography>
                    <Box className="flex gap-2">
                      <Button size="small" variant="outlined" color="grey">
                        Download
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="flex flex-col gap-4 p-5">
          <Typography variant="h6">Baseline templates</Typography>
          <Grid container spacing={2}>
            {TEMPLATES.map((template) => (
              <Grid key={template.name} size={{ xs: 12, md: 6, lg: 4 }}>
                <Box className="bg-grey-25 flex h-full flex-col gap-2 rounded-2xl p-4">
                  <Typography variant="body1" className="font-semibold text-text-primary">
                    {template.name}
                  </Typography>
                  <Typography variant="body2" className="text-text-secondary">
                    {template.description}
                  </Typography>
                  <Button size="small" variant="outlined" color="grey" className="mt-auto w-fit">
                    Download
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
