/**
 * API Key Management Component
 * Create, view, revoke, and delete API keys
 */

import { useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Ban, Clock, Shield } from "lucide-react";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useDeleteApiKey,
} from "../hooks/use-admin";
import { toast } from "sonner";
import { queryClient } from "@/providers/TanStackProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ApiKey } from "../types/admin-types";

const AVAILABLE_SCOPES = [
  { value: "admin:full", label: "Full Admin Access", description: "Complete system access" },
  { value: "admin:users", label: "User Management", description: "Manage users and roles" },
  { value: "admin:api-keys", label: "API Key Management", description: "Manage API keys" },
  { value: "dev:seed", label: "Development", description: "Development utilities" },
  { value: "read:users", label: "Read Users", description: "Read-only user access" },
];

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateKeyDialog({ open, onOpenChange }: CreateKeyDialogProps) {
  const { mutate: createKey, isPending } = useCreateApiKey();

  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["read:users"]);
  const [expiresDays, setExpiresDays] = useState<string>("30");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error("Select at least one scope");
      return;
    }

    createKey(
      {
        name: name.trim(),
        scopes: selectedScopes,
        expiresDays: expiresDays === "never" ? undefined : parseInt(expiresDays),
      },
      {
        onSuccess: (data) => {
          setCreatedKey(data.key);
          queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
          toast.success("API key created successfully");
        },
        onError: () => {
          toast.error("Failed to create API key");
        },
      }
    );
  };

  const handleClose = () => {
    setName("");
    setSelectedScopes(["read:users"]);
    setExpiresDays("30");
    setCreatedKey(null);
    onOpenChange(false);
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production API Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Expiration</Label>
              <Select value={expiresDays} onValueChange={setExpiresDays}>
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
                      checked={selectedScopes.includes(scope.value)}
                      onCheckedChange={() => toggleScope(scope.value)}
                    />
                    <div className="grid gap-0.5">
                      <label
                        htmlFor={scope.value}
                        className="text-sm font-medium "
                      >
                        {scope.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{scope.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isPending}>
                {isPending ? "Creating..." : "Create API Key"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

interface KeyActionsProps {
  apiKey: ApiKey;
}

function KeyActions({ apiKey }: KeyActionsProps) {
  const { mutate: revokeKey, isPending: isRevoking } = useRevokeApiKey();
  const { mutate: deleteKey, isPending: isDeleting } = useDeleteApiKey();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRevoke = () => {
    revokeKey(apiKey.id, {
      onSuccess: () => {
        toast.success("API key revoked");
        queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
      },
      onError: () => {
        toast.error("Failed to revoke key");
      },
    });
  };

  const handleDelete = () => {
    deleteKey(apiKey.id, {
      onSuccess: () => {
        toast.success("API key deleted");
        queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
        setShowDeleteConfirm(false);
      },
      onError: () => {
        toast.error("Failed to delete key");
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {apiKey.is_active ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600"
            onClick={handleRevoke}
            disabled={isRevoking}
            title="Revoke"
          >
            <Ban className="h-4 w-4" />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{apiKey.name}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ApiKeyManagement() {
  const { data: apiKeys, isLoading } = useApiKeys();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">API Keys</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys?.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        {key.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.is_active ? (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Ban className="h-3 w-3" />
                          Revoked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 2).map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                        {key.scopes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.scopes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {key.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(key.expires_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <KeyActions apiKey={key} />
                    </TableCell>
                  </TableRow>
                ))}
                {apiKeys?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No API keys found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateKeyDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
}
