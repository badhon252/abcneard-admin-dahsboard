export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
  profileImage?: {
    public_id: string;
    secure_url: string;
  };
  isVerified: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: UserProfile;
}
