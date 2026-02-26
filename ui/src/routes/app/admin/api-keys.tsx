import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Clock,
  Search,
  Settings2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Ban,
  ArrowUpDown,
  MoreHorizontal,
  Dices,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiKeys, useCreateApiKey, useRevokeApiKey, useDeleteApiKey } from "@/features/admin";
import { toast } from "sonner";
import type { ApiKey } from "@/features/admin";

const AVAILABLE_SCOPES = [
  { value: "admin:full", label: "Full Admin Access" },
  { value: "admin:users", label: "User Management" },
  { value: "admin:api-keys", label: "API Key Management" },
  { value: "dev:seed", label: "Development" },
  { value: "read:users", label: "Read Users" },
];

export const Route = createFileRoute("/app/admin/api-keys")({
  component: ApiKeysManagementPage,
});

function ApiKeysManagementPage() {
  const { data: apiKeys, isLoading } = useApiKeys();
  const { mutate: createKey, isPending: isCreating } = useCreateApiKey();
  const { mutate: revokeKey } = useRevokeApiKey();
  const { mutate: deleteKey } = useDeleteApiKey();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formScopes, setFormScopes] = useState<string[]>(["read:users"]);
  const [formExpires, setFormExpires] = useState("30");

  const columns: ColumnDef<ApiKey>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-miku-primary text-white" : ""}
          >
            {isActive ? "Active" : "Revoked"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "scopes",
      header: "Scopes",
      cell: ({ row }) => {
        const scopes = row.getValue("scopes") as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {scopes.slice(0, 2).map((scope) => (
              <Badge key={scope} variant="outline" className="text-xs">
                {scope}
              </Badge>
            ))}
            {scopes.length > 2 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs cursor-help">
                    +{scopes.length - 2}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {scopes.slice(2).join(", ")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <span className="text-muted-foreground text-sm">
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "expires_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expires
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const expiresAt = row.getValue("expires_at") as string | null;
        return expiresAt ? (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="h-3 w-3" />
            {new Date(expiresAt).toLocaleDateString()}
          </div>
        ) : (
          <span className="italic text-muted-foreground text-sm">Never</span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const keyId = row.original.id;
        const isActive = row.original.is_active;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 ">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isActive && (
                <DropdownMenuItem
                  onClick={() => handleRevoke(keyId)}
                  className="text-amber-600 "
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Revoke
                </DropdownMenuItem>
              )}
              {isActive && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => setDeleteConfirm(keyId)}
                className="text-destructive "
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: apiKeys || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleCreate = () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (formScopes.length === 0) {
      toast.error("Select at least one scope");
      return;
    }

    createKey(
      {
        name: formName.trim(),
        scopes: formScopes,
        expiresDays: formExpires === "never" ? undefined : parseInt(formExpires),
      },
      {
        onSuccess: (data) => {
          setCreatedKey(data.key);
          toast.success("API key created successfully");
        },
        onError: () => {
          toast.error("Failed to create API key");
        },
      }
    );
  };

  const handleCloseCreate = () => {
    setCreateDialogOpen(false);
    setCreatedKey(null);
    setFormName("");
    setFormScopes(["read:users"]);
    setFormExpires("30");
  };

  const handleRevoke = (id: string) => {
    revokeKey(id, {
      onSuccess: () => toast.success("API key revoked"),
      onError: () => toast.error("Failed to revoke key"),
    });
  };

  const handleDelete = (id: string) => {
    deleteKey(id, {
      onSuccess: () => {
        toast.success("API key deleted");
        setDeleteConfirm(null);
      },
      onError: () => toast.error("Failed to delete key"),
    });
  };

  const handleBulkRevoke = () => {
    const activeSelected = selectedRows.filter((row) => row.original.is_active);
    const count = activeSelected.length;
    if (count === 0) {
      toast.error("No active keys selected");
      return;
    }
    activeSelected.forEach((row) => revokeKey(row.original.id));
    toast.success(`${count} API key(s) revoked`);
    table.toggleAllPageRowsSelected(false);
  };

  const handleBulkDelete = () => {
    const count = selectedCount;
    selectedRows.forEach((row) => deleteKey(row.original.id));
    toast.success(`${count} API key(s) deleted`);
    table.toggleAllPageRowsSelected(false);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">Manage API access keys for external integrations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/admin">← Back to Admin</Link>
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All API Keys ({apiKeys?.length || 0})</CardTitle>
              <div className="flex items-center gap-2">
                {/* Column Visibility Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 ">
                      <Settings2 className="mr-2 h-3.5 w-3.5" />
                      View
                      <ChevronDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[150px]">
                    {table
                      .getAllColumns()
                      .filter(
                        (column) =>
                          typeof column.accessorFn !== "undefined" && column.getCanHide()
                      )
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search API keys..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="h-8 pl-8"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="h-24 text-center">
                            No API keys found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Bulk Actions Bar - Below Table */}
                {selectedCount > 0 && (
                  <div className="mt-4 flex items-center justify-between rounded-md border bg-muted/50 p-2 px-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => table.toggleAllPageRowsSelected(false)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Clear
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        onClick={handleBulkRevoke}
                      >
                        <Ban className="mr-1 h-3 w-3" />
                        Revoke
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={handleBulkDelete}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={handleCloseCreate}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key with specific permissions. The key will only be shown once.
              </DialogDescription>
            </DialogHeader>

            {createdKey ? (
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm text-amber-800 mb-2 font-medium">
                    Copy this key now! It won&apos;t be shown again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-amber-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {createdKey}
                    </code>
                    <CopyButton text={createdKey} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCloseCreate}>Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <div className="relative">
                    <Input
                      id="key-name"
                      placeholder="e.g., Production API Key"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground "
                      onClick={() => {
                        const prefixes = ["Production", "Development", "Testing", "Staging", "Backup", "Legacy", "Internal", "External"];
                        const suffixes = ["API Key", "Access Key", "Service Key", "Integration Key", "Webhook Key"];
                        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
                        const randomNum = Math.floor(Math.random() * 999) + 1;
                        setFormName(`${prefix} ${suffix} ${randomNum}`);
                      }}
                      title="Generate random name"
                    >
                      <Dices className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expiration</Label>
                  <Select value={formExpires} onValueChange={setFormExpires}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="never">Never expires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Scopes (Permissions)</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <div key={scope.value} className="flex items-start gap-3">
                        <Checkbox
                          id={scope.value}
                          checked={formScopes.includes(scope.value)}
                          onCheckedChange={() => {
                            setFormScopes((prev) =>
                              prev.includes(scope.value)
                                ? prev.filter((s) => s !== scope.value)
                                : [...prev, scope.value]
                            );
                          }}
                        />
                        <div className="grid gap-0.5">
                          <label htmlFor={scope.value} className="text-sm font-medium ">
                            {scope.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseCreate}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create API Key"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this API key? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4 text-miku-primary" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
