import http from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/response";
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubTaskInput,
  TaskQueryParams,
  TaskActivity,
} from "@/types/task";

export const taskService = {
  // --- CRUD ---

  createTask: async (data: CreateTaskInput): Promise<boolean> => {
    const response = await http.post<ApiResponse<null>>("/api/tasks", data);
    return response.data.success;
  },

  updateTask: async (id: number, data: UpdateTaskInput): Promise<Task> => {
    const response = await http.put<ApiResponse<Task>>(
      `/api/tasks/${id}`,
      data,
    );
    return response.data.data;
  },

  getTaskDetail: async (id: number): Promise<Task> => {
    const response = await http.get<ApiResponse<Task>>(`/api/tasks/${id}`);
    return response.data.data;
  },

  deleteTask: async (id: number): Promise<boolean> => {
    const response = await http.delete<ApiResponse<null>>(`/api/tasks/${id}`);
    return response.data.success;
  },

  createSubTask: async (
    parentId: number,
    data: CreateSubTaskInput,
  ): Promise<boolean> => {
    const response = await http.post<ApiResponse<null>>(
      `/api/tasks/${parentId}/sub-tasks`,
      data,
    );
    return response.data.success;
  },

  getSubTasks: async (parentId: number): Promise<Task[]> => {
    const response = await http.get<ApiResponse<Task[]>>(
      `/api/tasks/${parentId}/sub-tasks`,
    );
    return response.data.data;
  },

  searchTasks: async (
    params?: TaskQueryParams,
  ): Promise<PaginatedResponse<Task>> => {
    const page = params?.page || 1;
    const size = params?.size || 10;
    const condition = params?.condition || {
      receiverId: "me",
      senderId: null,
      teamCode: null,
      departmentCode: null,
      status: [],
      priority: null,
      parentId: null,
      isParent: true,
      overdue: false,
      dueDateFrom: null,
      dueDateTo: null,
      search: null,
    };

    const payload = {
      condition,
      pageRequest: { pageNumber: page, pageSize: size },
      sortRequests: [
        {
          sortBy: params?.sortBy || "dueDate",
          sortDirection: params?.sortDirection || "ASC",
        },
      ],
    };

    const response = await http.post<ApiResponse<PaginatedResponse<Task>>>(
      "/api/tasks/search",
      payload,
    );
    return response.data.data;
  },

  getMyTasks: async (): Promise<PaginatedResponse<Task>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Task>>>(
      "/api/tasks/my-tasks",
    );
    return response.data.data;
  },

  getAssignedByMe: async (): Promise<PaginatedResponse<Task>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Task>>>(
      "/api/tasks/assigned-by-me",
    );
    return response.data.data;
  },

  getTasksByTeam: async (
    teamCode: string,
  ): Promise<PaginatedResponse<Task>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Task>>>(
      `/api/tasks/team/${teamCode}`,
    );
    return response.data.data;
  },

  getTasksByDepartment: async (
    deptCode: string,
  ): Promise<PaginatedResponse<Task>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Task>>>(
      `/api/tasks/department/${deptCode}`,
    );
    return response.data.data;
  },

  submitReview: async (
    id: number,
    completionNote: string,
  ): Promise<boolean> => {
    const response = await http.put<ApiResponse<null>>(
      `/api/tasks/${id}/submit-review`,
      { completionNote },
    );
    return response.data.success;
  },

  approveTask: async (id: number, reviewNote?: string): Promise<boolean> => {
    const response = await http.put<ApiResponse<null>>(
      `/api/tasks/${id}/approve`,
      { reviewNote },
    );
    return response.data.success;
  },

  rejectTask: async (id: number, rejectionReason: string): Promise<boolean> => {
    const response = await http.put<ApiResponse<null>>(
      `/api/tasks/${id}/reject`,
      { rejectionReason },
    );
    return response.data.success;
  },

  cancelTask: async (
    id: number,
    cancellationReason: string,
  ): Promise<boolean> => {
    const response = await http.put<ApiResponse<null>>(
      `/api/tasks/${id}/cancel`,
      { cancellationReason },
    );
    return response.data.success;
  },

  reopenTask: async (id: number, reason?: string): Promise<boolean> => {
    const response = await http.put<ApiResponse<null>>(
      `/api/tasks/${id}/reopen`,
      { reopenReason: reason },
    );
    return response.data.success;
  },

  getTaskActivities: async (id: number): Promise<TaskActivity[]> => {
    const response = await http.get<ApiResponse<TaskActivity[]>>(
      `/api/tasks/${id}/activities`,
    );
    return response.data.data;
  },
};
