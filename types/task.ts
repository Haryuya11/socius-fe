export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskStatus =
  | "IN_PROGRESS"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "OVERDUE"
  | "CANCELLED";

export type DeliveryType = number;

export type TaskActivityType =
  | "CREATE"
  | "UPDATE"
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "CANCEL"
  | "REOPEN";

export interface Task {
  id: number;
  parentId: number | null;
  receiverId: string;
  receiverName: string;
  senderId: string;
  senderName: string;
  teamCode: string;
  departmentCode: string;
  title: string;
  description: string | null;
  deliveryType: DeliveryType;
  status: TaskStatus;
  priority: TaskPriority | null;
  startDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  subTaskCount: number;
}

export interface CreateTaskInput {
  receiverId: string;
  teamCode: string;
  departmentCode: string;
  title: string;
  description?: string;
  deliveryType?: number;
  priority?: TaskPriority;
  startDate: string;
  dueDate: string;
  parentId?: number | null;
}

export interface CreateSubTaskInput {
  receiverId: string;
  title: string;
  startDate: string;
  dueDate: string;
  teamCode?: string;
  departmentCode?: string;
  priority?: TaskPriority;
  description?: string;
}

export interface UpdateTaskInput {
  receiverId?: string;
  title?: string;
  description?: string;
  deliveryType?: number;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
}

export interface TaskSearchCondition {
  receiverId?: string | "me" | null;
  senderId?: string | "me" | null;
  teamCode?: string | null;
  departmentCode?: string | null;
  status?: TaskStatus[];
  priority?: TaskPriority | null;
  parentId?: number | null;
  isParent?: boolean;
  overdue?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface TaskQueryParams {
  page?: number;
  size?: number;
  condition?: TaskSearchCondition;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export interface TaskActivity {
  id: number;
  taskId: number;
  activityType: TaskActivityType;
  actorId: string;
  actorName: string;
  note: string | null;
  createdAt: string;
}

export interface WorkflowConfig {
  title: string;
  label: string;
  action: (id: number, note: string) => Promise<boolean>;
  required?: boolean;
}
