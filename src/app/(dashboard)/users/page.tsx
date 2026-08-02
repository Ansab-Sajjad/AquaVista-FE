"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ArrowDownward,
  ArrowUpward,
  Clear,
  FilterList,
  MoreVert,
  Search,
  ViewColumn,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { DataGrid, type GridColDef, type GridSortModel, type GridPaginationModel } from "@mui/x-data-grid";

import { getStoredAuthToken, isAdminUser, normalizeAvatarUrl } from "@/lib/auth";

type Project = { id: string; name: string; municipality: string };
type User = {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
  status: string;
  lastActive?: string;
  createdAt: string;
  profileImage?: string | null;
  image?: string | null;
  projects: Project[];
};
type ViewMode = "list" | "grid";
type RoleFilter = "all" | "admin" | "project-user";
type StatusFilter = "all" | "active" | "inactive" | "pending";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ROWS_PER_PAGE = 10;

function formatDate(value?: string) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}

function formatStatus(value?: string) {
  if (!value) return "Unknown";
  const normalized = value.trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function getRoleKey(role: string) {
  return role === "admin" ? "admin" : "project-user";
}

function getStatusColor(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "active") return "success";
  if (normalizedStatus === "pending") return "primary";
  return "warning";
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(0);
  const [gridPaginationModel, setGridPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: ROWS_PER_PAGE,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const orderedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (b.role === "admin" && a.role !== "admin") return 1;
      return 0;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orderedUsers.filter((user) => {
      const searchableText = [
        user.name,
        user.email,
        user.company,
        user.role,
        user.projects.map((project) => project.name).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesRole = roleFilter === "all" || getRoleKey(user.role) === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchTerm, statusFilter, orderedUsers]);

  const sortedUsers = useMemo(() => {
    if (!sortModel.length) return [...filteredUsers];

    return [...filteredUsers].sort((a, b) => {
      const { field, sort } = sortModel[0];
      const valueA = String(a[field as keyof User] ?? "").toLowerCase();
      const valueB = String(b[field as keyof User] ?? "").toLowerCase();
      return sort === "desc" ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
    });
  }, [filteredUsers, sortModel]);

  const paginatedUsers = useMemo(() => {
    const startIndex = page * ROWS_PER_PAGE;
    return sortedUsers.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [page, sortedUsers]);
  const pageCount = Math.max(1, Math.ceil(sortedUsers.length / ROWS_PER_PAGE));

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(0);
    setGridPaginationModel({ page: 0, pageSize: ROWS_PER_PAGE });
    setSortModel([]);
  };

  const columns: GridColDef<User>[] = [
    {
      field: "avatar",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={normalizeAvatarUrl(params.row.profileImage || params.row.image || undefined)}
          alt={params.row.name}
          sx={{ width: 32, height: 32 }}
        >
          {params.row.name?.charAt(0) ?? "U"}
        </Avatar>
      ),
    },
    {
      field: "name",
      headerName: "User",
      minWidth: 220,
      flex: 1.2,
      renderCell: (params) => (
        <Box className="flex flex-col py-2">
          <Typography className="font-semibold">{params.row.name}</Typography>
          <Typography variant="body2" className="text-text-secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "company",
      headerName: "Company",
      minWidth: 160,
      flex: 1,
      renderCell: (params) => params.value || "-",
    },
    {
      field: "role",
      headerName: "Role",
      minWidth: 140,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value === "admin" ? "Admin" : "Project user"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Chip label={formatStatus(params.value)} size="small" color={getStatusColor(params.value)} />
      ),
    },
    {
      field: "projects",
      headerName: "Projects",
      minWidth: 240,
      flex: 1.3,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box className="flex max-w-full flex-wrap gap-1 py-2">
          {params.row.projects.length ? (
            params.row.projects.map((project: Project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/dashboard`}
                className="rounded-full border border-divider px-2.5 py-1 text-xs font-medium text-primary no-underline transition hover:bg-primary/10"
              >
                {project.name}
              </Link>
            ))
          ) : (
            <Typography variant="body2" className="text-text-secondary">
              No projects
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      minWidth: 90,
      align: "left",
      headerAlign: "left",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box className="flex items-center py-2">
          <IconButton
            size="small"
            aria-label={`View ${params.row.name}`}
            onClick={() => router.push(`/users/${params.row.id}`)}
            sx={{
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    setPage(0);
  }, [searchTerm, roleFilter, statusFilter]);

  const loadUsers = useCallback(async () => {
    if (!isAdminUser()) return;
    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/projects/admin/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Unable to load users.");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminUser()) {
      router.replace("/projects");
      return;
    }
    void loadUsers();
  }, [loadUsers, router]);

  if (!isAdminUser()) return null;

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box>
        <Typography variant="h2" component="h1">
          Users
        </Typography>
        <Typography variant="body1" className="text-text-secondary">
          Review user access, account status, and project assignments.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="flex flex-col gap-4 p-4 md:p-6">
          <Box className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} className="flex-1 flex-wrap gap-2 md:gap-3">
              <TextField
                label="Search users"
                placeholder="Name, email, company, project"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                size="small"
                className="min-w-[260px]"
              />
              <FormControl size="small" className="min-w-[180px]">
                <InputLabel id="role-filter-label">Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={roleFilter}
                  label="Role"
                  onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                >
                  <MenuItem value="all">All roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="project-user">Project user</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" className="min-w-[180px]">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                >
                  <MenuItem value="all">All status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="flex-wrap gap-2">
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={viewMode}
                exclusive
                onChange={(_event, nextView) => {
                  if (nextView) setViewMode(nextView);
                }}
              >
                <ToggleButton value="list">List view</ToggleButton>
                <ToggleButton value="grid">Grid view</ToggleButton>
              </ToggleButtonGroup>
              <Button variant="outlined" onClick={handleResetFilters}>
                Reset filters
              </Button>
            </Stack>
          </Box>

          {loading ? (
            <Box className="flex items-center justify-center py-16">
              <CircularProgress size={28} />
            </Box>
          ) : viewMode === "grid" ? (
            <Box className="flex flex-col gap-4">
              <Box className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedUsers.length === 0 ? (
                  <Box className="col-span-full flex justify-center py-16">
                    <Typography variant="body1" className="text-text-secondary">
                      No users match the current filters.
                    </Typography>
                  </Box>
                ) : (
                  paginatedUsers.map((user) => (
                    <Card key={user.id} variant="outlined" className="h-full border border-divider bg-background-paper">
                      <CardContent className="flex h-full flex-col gap-4">
                        <Box className="flex items-start justify-between gap-2">
                          <Box className="flex items-center gap-3">
                            <Avatar
                              alt={user.name}
                              src={normalizeAvatarUrl(user.profileImage || user.image || undefined)}
                              sx={{ width: 48, height: 48 }}
                            >
                              {user.name?.charAt(0) ?? "U"}
                            </Avatar>
                            <Box className="flex flex-col gap-1">
                              <Typography className="font-semibold">{user.name}</Typography>
                              <Typography variant="body2" className="text-text-secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={formatStatus(user.status)}
                            size="small"
                            color={getStatusColor(user.status)}
                          />
                        </Box>

                        <Box className="flex flex-wrap gap-2">
                          <Chip
                            label={user.role === "admin" ? "Admin" : "Project user"}
                            size="small"
                            variant="outlined"
                          />
                          <Chip label={user.company || "-"} size="small" variant="outlined" />
                        </Box>

                        <Box className="flex flex-col gap-1">
                          <Typography variant="body2" className="font-semibold">
                            Projects
                          </Typography>
                          {user.projects.length ? (
                            <Box className="flex flex-wrap gap-1">
                              {user.projects.map((project) => (
                                <Link
                                  key={project.id}
                                  href={`/projects/${project.id}/dashboard`}
                                  className="rounded-full border border-divider px-2.5 py-1 text-xs font-medium text-primary no-underline transition hover:bg-primary/10"
                                >
                                  {project.name}
                                </Link>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" className="text-text-secondary">
                              No projects
                            </Typography>
                          )}
                        </Box>

                        <Box className="mt-auto flex justify-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility fontSize="small" />}
                            onClick={() => router.push(`/users/${user.id}`)}
                          >
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
              {sortedUsers.length > ROWS_PER_PAGE && (
                <Box className="flex justify-center">
                  <Pagination
                    count={pageCount}
                    page={page + 1}
                    onChange={(_event, nextPage) => setPage(nextPage - 1)}
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Box className="w-full overflow-hidden">
              <DataGrid
                rows={sortedUsers}
                columns={columns}
                getRowId={(row) => row.id}
                autoHeight
                disableRowSelectionOnClick
                paginationModel={gridPaginationModel}
                onPaginationModelChange={setGridPaginationModel}
                sortModel={sortModel}
                onSortModelChange={(model) => setSortModel(model)}
                pageSizeOptions={[10, 20, 50]}
                sx={{
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "rgba(0, 0, 0, 0.03)",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid rgba(224, 224, 224, 1)",
                  },
                }}
                slots={{
                  columnSortedAscendingIcon: () => <ArrowUpward fontSize="small" />,
                  columnSortedDescendingIcon: () => <ArrowDownward fontSize="small" />,
                  columnMenuIcon: () => <MoreVert fontSize="small" />,
                  columnMenuSortAscendingIcon: () => <ArrowUpward fontSize="small" />,
                  columnMenuSortDescendingIcon: () => <ArrowDownward fontSize="small" />,
                  columnMenuFilterIcon: () => <FilterList fontSize="small" />,
                  columnMenuHideIcon: () => <VisibilityOff fontSize="small" />,
                  columnMenuClearIcon: () => <Clear fontSize="small" />,
                  columnMenuManageColumnsIcon: () => <ViewColumn fontSize="small" />,
                  filterPanelDeleteIcon: () => <Clear fontSize="small" />,
                  filterPanelRemoveAllIcon: () => <Clear fontSize="small" />,
                  quickFilterIcon: () => <Search fontSize="small" />,
                  quickFilterClearIcon: () => <Clear fontSize="small" />,
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
