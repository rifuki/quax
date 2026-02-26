import { adminService } from "@/lib/api";
import type { User } from "../types/admin-types";

export { adminService as adminApi };

// Keep backward compatible type exports
export type { User };
export type { LogLevelRequest, LogLevelRequest as ChangeLogLevelRequest } from "@/lib/api/services/admin-services";
