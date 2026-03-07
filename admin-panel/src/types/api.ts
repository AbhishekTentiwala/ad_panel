// ==================== Auth Service ====================
export type UserType = "USER" | "COLLEGE" | "SUPER_ADMIN";

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  email_verified: boolean;
  type: UserType;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  type: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListResponse {
  items: AdminUserResponse[];
  total: number;
  page: number;
  page_size: number;
}

// Auth request types
export interface GoogleAuthRequest {
  id_token: string;
}

export interface EmailRegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface UpdateTypeRequest {
  type: UserType;
}

export interface UpdateActiveRequest {
  is_active: boolean;
}

export interface MessageResponse {
  message: string;
}

// ==================== Admin Unified & Health ====================
export interface ServiceHealth {
  status: string;
  latency_ms?: number | null;
  status_code?: number | null;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  services?: Record<string, ServiceHealth>;
}

export interface StatsResponse {
  users: number;
  communities: number;
  posts: number;
  comments: number;
  colleges: number;
  attachments: number;
  timestamp: string;
}

// ==================== College Service ====================
export interface CollegeResponse {
  id: string;
  name: string;
  contact_email: string;
  physical_address: string;
  admin_users: string[];
  communities: string[];
  created_at: string;
  updated_at: string;
}

export interface CollegeListResponse {
  items: CollegeResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateCollegeRequest {
  name: string;
  contact_email: string;
  physical_address: string;
  admin_users?: string[];
}

export interface UpdateCollegeRequest {
  name?: string | null;
  contact_email?: string | null;
  physical_address?: string | null;
  admin_users?: string[] | null;
}

export interface CollegeUserResponse {
  college_id: string;
  user_id: string;
  joined_at: string;
}

export interface CollegeUserListResponse {
  items: CollegeUserResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface DeleteCollegeResponse {
  college_id: string;
  message: string;
}

export interface AddCommunityResponse {
  college_id: string;
  community_id: string;
  message: string;
}

export interface RemoveCommunityResponse {
  college_id: string;
  community_id: string;
  message: string;
}

export interface AdminActionResponse {
  college_id: string;
  user_id: string;
  message: string;
}

// This endpoint doesn't exist in OpenAPI - was used for calculations
// export interface CollegeStatsResponse {
//   college_id: string;
//   community_count: number;
//   admin_count: number;
//   member_count: number;
// }

// ==================== Community Service ====================
export type CommunityType = "PUBLIC" | "PRIVATE";

export interface CommunityResponse {
  id: string;
  name: string;
  type: CommunityType;
  member_users: string[];
  requested_users: string[];
  parent_colleges: string[];
  posts: string[];
  created_at: string;
  updated_at: string;
}

export interface CommunityListResponse {
  items: CommunityResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateCommunityRequest {
  name: string;
  type?: CommunityType;
  parent_colleges?: string[];
}

export interface UpdateCommunityRequest {
  name?: string | null;
  type?: CommunityType | null;
}

export interface JoinCommunityResponse {
  community_id: string;
  status: string; // "joined" | "requested"
  message: string;
}

export interface LeaveCommunityResponse {
  community_id: string;
  message: string;
}

export interface PendingRequestsResponse {
  community_id: string;
  requested_users: string[];
  total: number;
}

export interface ApproveRejectResponse {
  community_id: string;
  user_id: string;
  message: string;
}

// ==================== Post Service ====================
export interface PostResponse {
  id: string;
  user_id: string;
  community_id: string;
  content: string;
  likes: number;
  views: number;
  attachments: string[];
  comments: string[];
  created_at: string;
  updated_at: string;
  user_name?: string | null;
  user_picture?: string | null;
}

export interface PostListResponse {
  items: PostResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreatePostRequest {
  community_id: string;
  content: string;
  attachments?: string[];
}

export interface UpdatePostRequest {
  content?: string | null;
  attachments?: string[] | null;
}

export interface DeletePostResponse {
  post_id: string;
  message: string;
}

// ==================== Comment Service ====================
export interface CommentResponse {
  id: string;
  post_id: string;
  user_id: string;
  community_id: string;
  parent_id: string | null;
  content: string;
  likes: number;
  liked_by: string[];
  created_at: string;
  updated_at: string;
  user_name?: string | null;
  user_picture?: string | null;
}

export interface CommentListResponse {
  items: CommentResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateCommentRequest {
  post_id: string;
  community_id: string;
  content: string;
}

export interface CreateReplyRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content?: string | null;
}

export interface DeleteCommentResponse {
  comment_id: string;
  message: string;
}

export interface LikeResponse {
  comment_id: string;
  liked: boolean;
  likes: number;
}

// ==================== Attachment Service ====================
export interface AttachmentResponse {
  id: string;
  uploader_user_id: string;
  filename: string;
  content_type: string;
  size: number;
  bucket: string;
  object_key: string;
  created_at: string;
}

export interface AttachmentListResponse {
  items: AttachmentResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface DeleteAttachmentResponse {
  attachment_id: string;
  message: string;
}

// ==================== Generic Utilities ====================
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
