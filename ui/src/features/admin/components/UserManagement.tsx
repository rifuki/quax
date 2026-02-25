/**
 * User Management Component
 * Enhanced user list with search, filter, and role management
 */

import { useState } from "react";
import { Search, Shield, User as UserIcon, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { useUsersList, useUpdateUserRole } from "../hooks/use-admin";
import { useAuthUser } from "@/stores/use-auth-store";
import { toast } from "sonner";
import { queryClient } from "@/providers/TanStackProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { UserWithTimestamps } from "@/features/user";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithTimestamps | null;
  newRole: "admin" | "user" | null;
  onConfirm: () => void;
  isLoading: boolean;
}

function ConfirmRoleDialog({
  open,
  onOpenChange,
  user,
  newRole,
  onConfirm,
  isLoading,
}: ConfirmDialogProps) {
  if (!user || !newRole) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Role Change</DialogTitle>
          <DialogDescription>
            Are you sure you want to change <strong>{user.name}</strong>&apos;s role from{" "}
            <Badge variant={user.role === "admin" ? "destructive" : "default"}>
              {user.role}
            </Badge>{" "}
            to{" "}
            <Badge variant={newRole === "admin" ? "destructive" : "default"}>
              {newRole}
            </Badge>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Updating..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserManagement() {
  const { data: users, isLoading } = useUsersList();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateUserRole();
  const currentUser = useAuthUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: UserWithTimestamps | null;
    newRole: "admin" | "user" | null;
  }>({ open: false, user: null, newRole: null });

  // Filter users based on search
  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users
  const sortedUsers = filteredUsers?.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "created_at":
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleRoleChange = (user: UserWithTimestamps, newRole: "admin" | "user") => {
    // Prevent self-demotion
    if (user.id === currentUser?.id && newRole === "user") {
      toast.error("Cannot change your own role", {
        description: "You cannot demote yourself from admin.",
      });
      return;
    }

    setConfirmDialog({ open: true, user, newRole });
  };

  const confirmRoleChange = () => {
    if (!confirmDialog.user || !confirmDialog.newRole) return;

    updateRole(
      { userId: confirmDialog.user.id, role: confirmDialog.newRole },
      {
        onSuccess: () => {
          toast.success(`Role updated - ${confirmDialog.user!.name} is now ${confirmDialog.newRole}.`);
          queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
          setConfirmDialog({ open: false, user: null, newRole: null });
        },
        onError: () => {
          toast.error("Failed to update role - Please try again.");
        },
      }
    );
  };

  const toggleSort = (column: "name" | "email" | "created_at") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">User Management</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredUsers?.length || 0} users</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="" onClick={() => toggleSort("name")}>
                    <div className="flex items-center gap-1">
                      User
                      {sortBy === "name" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="" onClick={() => toggleSort("email")}>
                    <div className="flex items-center gap-1">
                      Email
                      {sortBy === "email" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="" onClick={() => toggleSort("created_at")}>
                    <div className="flex items-center gap-1">
                      Joined
                      {sortBy === "created_at" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.username && (
                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "destructive" : "default"}
                        className="gap-1"
                      >
                        {user.role === "admin" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <UserIcon className="h-3 w-3" />
                        )}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role !== "admin" ? (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user, "admin")}
                              disabled={isUpdating}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Promote to Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user, "user")}
                              disabled={isUpdating || user.id === currentUser?.id}
                            >
                              <UserIcon className="h-4 w-4 mr-2" />
                              Demote to User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmRoleDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        user={confirmDialog.user}
        newRole={confirmDialog.newRole}
        onConfirm={confirmRoleChange}
        isLoading={isUpdating}
      />
    </>
  );
}
