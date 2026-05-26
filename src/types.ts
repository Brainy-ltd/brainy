/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabId = 'dashboard' | 'courses' | 'explore' | 'calendar' | 'grades' | 'messages' | 'settings' | 'library' | 'feedback' | 'course-workspace';

export type EventType = 'deadline' | 'lecture' | 'study' | 'personal';

export interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  lessonsCount: number;
  completedLessons: number;
  grade: string;
  gradePercentage: number;
  description: string;
  nextLesson: string;
  icon: string;
  banner: string;
  mostActive?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  isReserved?: boolean;
  dueDate?: string;
  iconType?: 'book' | 'math' | 'science' | 'art' | 'code' | 'general';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  type: EventType;
  details: string;
  courseName?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  isFile?: boolean;
  fileName?: string;
  fileSize?: string;
}

export interface Chat {
  id: string;
  contactName: string;
  contactAvatar: string;
  contactTitle: string;
  activeNow: boolean;
  messages: Message[];
  unreadCount: number;
  email: string;
  dept: string;
}

export interface GPAHistory {
  semester: string;
  gpa: number;
}

export interface UserProfile {
  name: string;
  email: string;
  academicYear: string;
  major: string;
  avatarUrl: string;
  status: 'Learning Now' | 'Away' | 'On Break';
}

export interface FeedbackSubmission {
  id: string;
  subject: string;
  date: string;
  status: 'Resolved' | 'Pending' | 'In Progress';
  category?: string;
  rating?: number;
  message?: string;
  anonymous?: boolean;
}

export type ResourceStatus = 'Draft' | 'Under Review' | 'Feedback Stage' | 'Approved' | 'Published';
export type ResourceFormat = 'PDF' | 'Video' | 'Link' | 'Document' | 'Dataset' | 'Slide';

export interface FeedbackItem {
  id: string;
  author: string;
  avatar: string;
  comment: string;
  suggestion?: string;
  rating: number;
  timestamp: string;
}

export interface VersionItem {
  version: string;
  date: string;
  author: string;
  changelog: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  author: string;
  category: string;
  status: ResourceStatus;
  format: ResourceFormat;
  thumbnailUrl: string;
  description: string;
  size: string;
  views: number;
  downloads: number;
  createdAt: string;
  versions: VersionItem[];
  feedbacks: FeedbackItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}
