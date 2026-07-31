"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import { getStoredAuthToken } from "@/lib/auth";

const DATA_TYPES = [
  "Financial Snapshot",
  "Customer Allocation / Billing Data",
  "CIP Register",
  "Rate Table",
  "Demographics",
  "Budget / Audit Data",
  "Rate Resolution",
];

type UploadFile = {
  id: string;
  name: string;
  fileType: string;
  year?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "Processing" | "Completed" | "Failed";
  sizeBytes?: number;
};

type TemplateFile = {
  id: string;
  name: string;
  description: string;
  fileType: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DataPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";

  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [templates, setTemplates] = useState<TemplateFile[]>([]);
  const [fileType, setFileType] = useState(DATA_TYPES[0]);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUploadedFiles = useCallback(async () => {
    if (!projectId) return;
    setLoadingFiles(true);
    try {
      const token = getStoredAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/data`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUploads(data);
      }
    } catch (err) {
      console.error("Failed to load project files:", err);
    } finally {
      setLoadingFiles(false);
    }
  }, [projectId]);

  const fetchTemplates = useCallback(async () => {
    if (!projectId) return;
    setLoadingTemplates(true);
    try {
      const token = getStoredAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/templates`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchUploadedFiles();
    fetchTemplates();
  }, [fetchUploadedFiles, fetchTemplates]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || !projectId) return;
      const file = acceptedFiles[0];

      setUploading(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const token = getStoredAuthToken();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileType", fileType);
        if (year) {
          formData.append("year", year);
        }

        const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/data`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to upload file");
        }

        setSuccessMsg(`File "${file.name}" uploaded successfully!`);
        fetchUploadedFiles();
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [projectId, fileType, year, fetchUploadedFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
    },
  });

  const handleDownloadTemplate = async (templateId: string, fileName: string) => {
    try {
      const token = getStoredAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/templates/${templateId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Download failed");
    }
  };

  const handleDownloadUploadedFile = async (fileId: string, fileName: string) => {
    try {
      const token = getStoredAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/data/${fileId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to download file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Download failed");
    }
  };

  const handleDeleteUploadedFile = async (fileId: string) => {
    try {
      const token = getStoredAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/data/${fileId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setSuccessMsg("File deleted successfully.");
        fetchUploadedFiles();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete file");
      }
    } catch (err: any) {
      setError(err.message || "Delete failed");
    }
  };

  const statusColor = (status: UploadFile["status"]) => {
    if (status === "Completed") return "success";
    if (status === "Processing") return "warning";
    return "error";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch {
      return dateStr;
    }
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

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Upload Section */}
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
            {uploading ? (
              <Box className="flex flex-col items-center gap-2">
                <CircularProgress size={32} />
                <Typography variant="body1">Uploading document...</Typography>
              </Box>
            ) : (
              <>
                <CloudUploadIcon color="action" sx={{ fontSize: 36 }} />
                <Typography variant="body1" className={isDragActive ? "text-primary" : "text-text-secondary"}>
                  {isDragActive ? "Drop the file here" : "Drag & drop a CSV, Excel, or PDF file, or click to browse"}
                </Typography>
                <Typography variant="caption" className="text-text-secondary">
                  Supported formats: .csv, .xlsx, .pdf
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Uploaded Files Section */}
      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="flex flex-col gap-4 p-5">
          <Typography variant="h6">Uploaded files</Typography>
          {loadingFiles ? (
            <Box className="flex items-center justify-center p-6">
              <CircularProgress size={28} />
            </Box>
          ) : uploads.length === 0 ? (
            <Typography variant="body2" className="text-text-secondary">
              No files uploaded yet. Select a file type and year above to upload project data.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {uploads.map((file) => (
                <Grid key={file.id} size={{ xs: 12, md: 6 }}>
                  <Box className="bg-grey-25 flex flex-col gap-2 rounded-2xl p-4">
                    <Box className="flex items-center justify-between gap-2">
                      <Typography variant="body1" className="text-text-primary font-semibold">
                        {file.name}
                      </Typography>
                      <Chip label={file.status.charAt(0).toUpperCase() + file.status.slice(1)} size="small" color={statusColor(file.status)} />
                    </Box>
                    <Typography variant="body2" className="text-text-secondary">
                      {file.fileType} {file.year ? `• ${file.year}` : ""} • {file.uploadedBy} •{" "}
                      {formatDate(file.uploadedAt)} {file.sizeBytes ? `• ${formatFileSize(file.sizeBytes)}` : ""}
                    </Typography>
                    <Box className="mt-1 flex gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadUploadedFile(file.id, file.name)}
                      >
                        Download
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUploadedFile(file.id)}
                        title="Delete file"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Baseline Templates Section */}
      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="flex flex-col gap-4 p-5">
          <Typography variant="h6">Baseline templates</Typography>
          {loadingTemplates ? (
            <Box className="flex items-center justify-center p-6">
              <CircularProgress size={28} />
            </Box>
          ) : templates.length === 0 ? (
            <Typography variant="body2" className="text-text-secondary">
              No templates available.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid key={template.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Box className="bg-grey-25 flex h-full flex-col gap-2 rounded-2xl p-4">
                    <Typography variant="body1" className="text-text-primary font-semibold">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" className="text-text-secondary">
                      {template.description}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      className="mt-auto w-fit"
                      onClick={() => handleDownloadTemplate(template.id, template.originalName)}
                    >
                      Download
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
