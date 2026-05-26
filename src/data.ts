import { Course, Book, CalendarEvent, Chat, GPAHistory, UserProfile, ResourceItem } from './types';

export const initialUserProfile: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@scholar.edu',
  academicYear: 'Senior',
  major: 'Computer Science',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjik0VWNmJUOJowDTTm2Y4zwHdcxwoUJ2wpR7fh9OIDdf9BTxn0fUvqgvyrShx32FmNmq3VIiEf03E1ICIwLm6LdsazRSM53zqAZuFw1wlmFDZhJd01Vi4RQfS-CG26QF5aoGb6UijfKAFR4xCk_tSndaG7OaxaBZ3nKuJ9WjA5E30VgHnhTe2NCMmaxnkJXAep8xfPtNofWQKCVXSy9Fcp8aAr01z-RcMLckkUAJcMOXgJJ4naZqkAIndpbORcQOAEAt1iXJJE5W8',
  status: 'Learning Now',
};

// Course images
const IMAGE_ALGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5SSx6n765uPJcOV3lpd0zW-ScgFpNxD9gMH1zqjbDO6KWQpu2v56fh3kRs63xdqdMdL5ccZHU6sEyVWP2N6RsWaVWzi81WtEPLJy4OLEiyMrM6TIX2BmAHI6-EdYNDPWdPvYFj6KsiiYPmGSLimzPiJh1yIBhJBX31zF3spGx0aXq9URwCVFHXMAAsRFl-5lDrZD0dscztyu1DJNEQuzxUuASkQNvaxkZdDKAzN6iP2Cwqe_oqLxoMUgIkon_1yJ6XdYqv-srAQvI';
const IMAGE_NEURAL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZKl6FT4PhHopWKs0gEFqQLrcW_NV6h9EizjeMDYIXIebtNk-8gqEMpK8F-6yzUV4ha4of7SIjbyFC-SHwOTPD7VATo5XsCnOX07GQ8uieAAywuF4UPy4qT7jSjAO3k7ORh3cAIcOCvdTQx6kCvIVfhZK0rDFsRbvGJaHozKYA3ak1tgRCSgHlPLddFfbKAKgtSfgWIbaAShLPrS18ovBXiGBIDbvq1pJyY6pV9qNuP26NYJrMuWr-v7HUq3A_m0IbWs5cqMH_1T9O';
const IMAGE_SWE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8d90BLUHFeKEIOIBxzwQr0ACfdKCTQKp_ncU6rADHx2uKFo4PE7eAYMpB_y1USug36qE8HBMe7HjJQTnapR5PXbQ6mPzGxaYJ1J8wHqlSRG2L3CTJm34yFbf4K4ldquSfKsBwKvFREqnJDeCH4zQixdl6bkaefixOedHDQLGSn3lrd09ApiTlk1WF_yFtTds7Yt0D7pATWStvQmp7TWYAuBZZHSZ8_LruoLG0Jhzc0WmuaO-xzCfebErQgzuX-myCYCXc-ayUaAuM';
const IMAGE_CRYPTO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCISfK_MZwXZoyB6jTz5D-ImlaTjcRt4sFhxbiXAXNn8yBSj3SaDQ6kv2GH3XUQWyzB6AFMXcgFE6Pij61uQNXddNEZTzu1gEUqCxoGBB5hxlWflbaZ9WBnxJFRj1aNEd3bc3jsdeksLQSTwCGk6Jbjmjc7OGTCuigA390b6_5bM4uD2C0Hp60paUMiijEG_LL7lk-2oG-MZ_zUavnkbzY7176tkzj7laRMv-EQHl7sqLhbh1Ssh6fCMgmJ_XlEMYYKovVJq_ge6zhM';

export const initialCourses: Course[] = [
  {
    id: 'c1',
    title: 'Advanced Algorithm Design',
    code: 'CS-402',
    instructor: 'Dr. Alan Turing Jr.',
    progress: 78,
    lessonsCount: 30,
    completedLessons: 23,
    grade: 'A',
    gradePercentage: 94.2,
    description: 'Advanced Algorithmic Paradigms: Dynamic Programming, Network Flows, NP-Completeness, Approximation Algorithms.',
    nextLesson: 'Bellman-Ford Algorithm',
    icon: 'Terminal',
    banner: IMAGE_ALGO,
    mostActive: true,
  },
  {
    id: 'c2',
    title: 'Neural Networks 101',
    code: 'AI-310',
    instructor: 'Prof. Sarah Chen',
    progress: 45,
    lessonsCount: 28,
    completedLessons: 12,
    grade: 'B+',
    gradePercentage: 88.5,
    description: 'Introduction to neural computing, multi-layer perceptrons, backpropagation gradients, gradient descent optimizers.',
    nextLesson: 'Backpropagation Basics',
    icon: 'Brain',
    banner: IMAGE_NEURAL,
  },
  {
    id: 'c3',
    title: 'Software Engineering',
    code: 'SE-250',
    instructor: 'Michael Rodriguez',
    progress: 12,
    lessonsCount: 25,
    completedLessons: 3,
    grade: 'A-',
    gradePercentage: 91.8,
    description: 'Core concepts of modular software architecture, testing suites, agile frameworks, and dynamic code generation.',
    nextLesson: 'System Architecture Phase 1',
    icon: 'Layers',
    banner: IMAGE_SWE,
  },
  {
    id: 'c4',
    title: 'Cryptography Fundamentals',
    code: 'CS-380',
    instructor: 'Dr. Elena Volkov',
    progress: 92,
    lessonsCount: 26,
    completedLessons: 24,
    grade: 'A',
    gradePercentage: 96.0,
    description: 'Symmetric and asymmetric encryption, public key cryptography key exchange, digital hashes, and secure sockets.',
    nextLesson: 'RSA Encryption Verification',
    icon: 'Lock',
    banner: IMAGE_CRYPTO,
  },
];

export const initialBooks: Book[] = [
  {
    id: 'b1',
    title: 'System Architecture',
    author: 'R. Johnson',
    coverUrl: IMAGE_SWE,
    isReserved: true,
    dueDate: '2 days',
    iconType: 'code',
  },
  {
    id: 'b2',
    title: 'Security Protocols',
    author: 'S. Miller',
    coverUrl: IMAGE_CRYPTO,
    isReserved: true,
    dueDate: '5 days',
    iconType: 'science',
  },
  {
    id: 'b3',
    title: 'Modern AI Theory',
    author: 'K. Liang',
    coverUrl: IMAGE_NEURAL,
    isReserved: false,
    iconType: 'art',
  },
  {
    id: 'b4',
    title: 'Quantum Computing Intro',
    author: 'Dr. Sarah Chen',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpWyS90ppm80O8BCPKJtgU5Pok3Fe_yyM7fgocGpkPKwzJKGRm9ZROKHWLZVFNeYRAGmvafgZChMxlRQOx_yuZdgc69WJDJzFqcBImeK94v8SlaRMN3jjA1JBX-KEaDNU72ak6-wksDQr6_fOfib1XJq_YlYmidQgUUNvzOD0CBJwnp0ZCnP_iosYQVNtK10203e4ofH2ZTmYKJG9GTI162ZQpBxNHa1j1zUnVpUkeQDmhGuk627aG_5yj53oaGxoPZ_3-0mhzFGl',
    isReserved: false,
    iconType: 'math',
  },
];

export const exploreCourses = [
  {
    id: 'exp1',
    title: 'Introduction to Quantum Physics',
    instructor: 'Dr. Sarah Chen',
    category: 'Physics',
    bestseller: true,
    duration: '12 Weeks',
    rating: '4.9 (2.4k)',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpWyS90ppm80O8BCPKJtgU5Pok3Fe_yyM7fgocGpkPKwzJKGRm9ZROKHWLZVFNeYRAGmvafgZChMxlRQOx_yuZdgc69WJDJzFqcBImeK94v8SlaRMN3jjA1JBX-KEaDNU72ak6-wksDQr6_fOfib1XJq_YlYmidQgUUNvzOD0CBJwnp0ZCnP_iosYQVNtK10203e4ofH2ZTmYKJG9GTI162ZQpBxNHa1j1zUnVpUkeQDmhGuk627aG_5yj53oaGxoPZ_3-0mhzFGl',
    description: 'Master the core mathematical and conceptual foundations of quantum superposition and entanglement.'
  },
  {
    id: 'exp2',
    title: 'Modern Web Architecture',
    instructor: 'Marcus Knight',
    category: 'Computer Science',
    bestseller: false,
    duration: '8 Weeks',
    rating: '4.7 (1.8k)',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfSFtLP2ELnD1acpyLmEG1BUTM7X2ibvYuEaRwGQLheXxLBlAS3BqISVwoCpV0Kah18oiaZEKCmggc7uD3mxhMdwKcrRsJa-sT8GD-_wkXJG34zAWjPGdRPwiKOMd59zqiWNHzoquDrpYraunkbfSd0strRi8xPpP6RSgv50CUUXUq_3DOvm_AReF3Nh-003Ld4ko4tzBnLeSJCVy4g5HTN__eKJaE8vYUjtz1e_9SZdKRIcBXAEzPfhYed4NH9e2k3F9zeDbOdeoI',
    description: 'Learn how to build edge-rendered, responsive, and dynamic system platforms with minimal cold starts.'
  },
  {
    id: 'exp3',
    title: 'Strategic Design Systems',
    instructor: 'Aria Lopez',
    category: 'Arts & Design',
    bestseller: false,
    duration: '6 Weeks',
    rating: '4.8 (950)',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHBhARR5N0mkQE4xwJoYNBsjFLOyfwb0BOkjGfPgwzdeRvZRO99aogzWZtrcVJYT1Sb-80kOgkgJQ7v9ALk7BHf8TKQpzW0sjYecZyk5fApBw_H99Yp3vuCv30wv9xSupxZhjgT_2BwYYzlMS58OqcEumEdHKlde8I2SmBC0EErTTFUjy5aRX07yhq7Z1RY27WVWz6xrS-5McHljZCjhKrUpKHQG4SEnqDYCeE2KreIA8YTIQVfMl422Q2XYaIREgKO0NI-51sf9p',
    description: 'The comprehensive guide to scaling components patterns, typography rhythm, and elevation depths.'
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Personal Study',
    date: '2023-10-02',
    time: '09:00 AM',
    type: 'study',
    details: 'Dynamic Programming Module 4 Review',
    courseName: 'Advanced Algorithm Design',
  },
  {
    id: 'e2',
    title: 'Lecture: Intro to AI',
    date: '2023-10-05',
    time: '11:00 AM',
    type: 'lecture',
    details: 'Overview of activation functions and ML theory',
    courseName: 'Neural Networks 101',
  },
  {
    id: 'e3',
    title: 'Library Session',
    date: '2023-10-11',
    time: '02:00 PM',
    type: 'study',
    details: 'Group reading about modular protocols',
    courseName: 'Software Engineering',
  },
  {
    id: 'e4',
    title: 'AI Research Proposal',
    date: '2023-10-18',
    time: '11:30 AM',
    type: 'deadline',
    details: 'Submit focus thesis topic to Prof. Sarah Jenkins',
    courseName: 'Neural Networks 101',
  },
  {
    id: 'e5',
    title: 'Midterm: Discrete Math',
    date: '2023-10-22',
    time: '10:00 AM',
    type: 'deadline',
    details: 'Covers combinatorics, relations, structural induction',
    courseName: 'Discrete Mathematics',
  },
  {
    id: 'e6',
    title: 'Software Engineering Submission',
    date: '2023-10-25',
    time: '04:00 PM',
    type: 'deadline',
    details: 'Project Architecture Phase 1 Submission',
    courseName: 'Software Engineering',
  },
  {
    id: 'e7',
    title: 'Group Meeting',
    date: '2023-10-27',
    time: '03:00 PM',
    type: 'study',
    details: 'Agile team sprint cycle alignment',
    courseName: 'Software Engineering',
  },
];

export const initialChats: Chat[] = [
  {
    id: 'ch1',
    contactName: 'Prof. Sarah Jenkins',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvwbVm10X5nHnXnVGcQGEjz2r6fIdOM_nCTPbEoXEK0abLxB1Q3XswWS8jAOJ7hctNcrSY1pDr1SnYMsD5aFuPdlkn6mFvmalcrD368xRlen7KkRBK08lM9Cok67ABoN18RF8QVtT6Z0DBtJfa90ylQ6KteqDtKD9hDBHdENBLZ53wc8LxgaP_tXG8_sZQCMI4RJdvwHltj5-L5WThd3oKycRXDliyYtlhJ6tVX7zvZCRV8gN9ibBN1Gg_t6EfqNx-dzWcL9bZfpS3',
    contactTitle: 'Department Head of Art History',
    activeNow: true,
    unreadCount: 2,
    email: 'sarah.jenkins@scholar.edu',
    dept: 'Art History Department',
    messages: [
      {
        id: 'm1',
        senderId: 'other',
        senderName: 'Prof. Sarah Jenkins',
        senderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvwbVm10X5nHnXnVGcQGEjz2r6fIdOM_nCTPbEoXEK0abLxB1Q3XswWS8jAOJ7hctNcrSY1pDr1SnYMsD5aFuPdlkn6mFvmalcrD368xRlen7KkRBK08lM9Cok67ABoN18RF8QVtT6Z0DBtJfa90ylQ6KteqDtKD9hDBHdENBLZ53wc8LxgaP_tXG8_sZQCMI4RJdvwHltj5-L5WThd3oKycRXDliyYtlhJ6tVX7zvZCRV8gN9ibBN1Gg_t6EfqNx-dzWcL9bZfpS3',
        text: "Good morning Alex. I noticed you haven't submitted the topic proposal for your final thesis yet. Is everything alright?",
        timestamp: '10:42 AM',
        isSent: false,
      },
      {
        id: 'm2',
        senderId: 'user',
        senderName: 'Alex Rivera',
        senderAvatar: '',
        text: "Hi Professor! I'm so sorry. I've been refining the focus between modernism and post-modernism. I'll have it uploaded by 5 PM today.",
        timestamp: '10:44 AM',
        isSent: true,
      },
      {
        id: 'm3',
        senderId: 'other',
        senderName: 'Prof. Sarah Jenkins',
        senderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvwbVm10X5nHnXnVGcQGEjz2r6fIdOM_nCTPbEoXEK0abLxB1Q3XswWS8jAOJ7hctNcrSY1pDr1SnYMsD5aFuPdlkn6mFvmalcrD368xRlen7KkRBK08lM9Cok67ABoN18RF8QVtT6Z0DBtJfa90ylQ6KteqDtKD9hDBHdENBLZ53wc8LxgaP_tXG8_sZQCMI4RJdvwHltj5-L5WThd3oKycRXDliyYtlhJ6tVX7zvZCRV8gN9ibBN1Gg_t6EfqNx-dzWcL9bZfpS3',
        text: 'That sounds like a complex balance. Did you review the syllabus for the research methodology section? It might help you narrow down the scope.',
        timestamp: '10:45 AM',
        isSent: false,
      },
      {
        id: 'm4',
        senderId: 'other',
        senderName: 'Prof. Sarah Jenkins',
        senderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvwbVm10X5nHnXnVGcQGEjz2r6fIdOM_nCTPbEoXEK0abLxB1Q3XswWS8jAOJ7hctNcrSY1pDr1SnYMsD5aFuPdlkn6mFvmalcrD368xRlen7KkRBK08lM9Cok67ABoN18RF8QVtT6Z0DBtJfa90ylQ6KteqDtKD9hDBHdENBLZ53wc8LxgaP_tXG8_sZQCMI4RJdvwHltj5-L5WThd3oKycRXDliyYtlhJ6tVX7zvZCRV8gN9ibBN1Gg_t6EfqNx-dzWcL9bZfpS3',
        text: 'Syllabus_Update_V2.pdf',
        timestamp: '10:46 AM',
        isSent: false,
        isFile: true,
        fileName: 'Syllabus_Update_V2.pdf',
        fileSize: '1.2 MB',
      },
    ],
  },
  {
    id: 'ch2',
    contactName: 'Art History Group Study',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8U21fhqvcq4LGrGkkxzcz29abFs_z_2VovjR2e7qXr9qJqr4RaVTLd1kMtwyfHI7PxDqQ-EAoESNbRR83KAvdT5hm3rUITxZf-xwTCCDdbuZbGk0W7BvIokQvr0PL0T4ZSjXshtQbo6nMij_g7MngG0fM0Dt2eRrXvsbMJPzfMr8zjV_u-eitVz3nn-Wz-VSrxV7UNhlDk2TrB4EACs6M0u9oBHzDRaIEWbKLNuKPzQBIY40SoZyzJInsN_43g8_1jdeGD83ZFNvE',
    contactTitle: 'Spring Class Group',
    activeNow: false,
    unreadCount: 0,
    email: 'classgroup-arthistory@scholar.edu',
    dept: 'Humanities Collaboration Group',
    messages: [
      {
        id: 'm2_1',
        senderId: 'other',
        senderName: 'Marcus',
        senderAvatar: '',
        text: "I've uploaded the PDF study guide for Modern Art styles.",
        timestamp: 'Yesterday',
        isSent: false,
      },
    ],
  },
  {
    id: 'ch3',
    contactName: 'David Miller (TA)',
    contactAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVFbnn54KNh5LCKf9ltv1iiLKRzADBsXWuVhB9h0sQ1mfJmc727k3OxcQbOXAtdUAoKXJ_FnROBShlRHls98ASP5xlU_AuTZoB7L_Tu3uH2FRbERQ7qTYEvQWtJKZmid8WLMr2A2EtKvmLTIFTegXH0bWoF2nWbbNDBag-TzZoMbl3FacbqkqqbxshDi5sSxEfi6gMm921ioefK-JlMTZ-rMFG8ec0vDu7tKiSw6z6Q3q9_y3aT4vdX-pHAm9BUr4IPOM3S-I7cB24',
    contactTitle: 'Algorithms Teaching Assistant',
    activeNow: false,
    unreadCount: 0,
    email: 'david.miller.ta@scholar.edu',
    dept: 'Computer Science Department',
    messages: [
      {
        id: 'm3_1',
        senderId: 'other',
        senderName: 'David Miller',
        senderAvatar: '',
        text: 'The lab session has been moved to Room 402 for tomorrow.',
        timestamp: 'Oct 24',
        isSent: false,
      },
    ],
  },
];

export const initialGpaHistory: GPAHistory[] = [
  { semester: "FA '22", gpa: 3.65 },
  { semester: "SP '23", gpa: 3.78 },
  { semester: "FA '23", gpa: 3.72 },
  { semester: "SP '24", gpa: 3.94 },
];

export const initialResources: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Advanced Algorithmic Paradigms & Quantum Circuits',
    author: 'Dr. Alan Turing Jr.',
    category: 'Computing',
    status: 'Published',
    format: 'PDF',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=200',
    description: 'Comprehensive analysis of multi-gate algorithms, recursive complexity classes, dynamic programming optimizations, and Shor\'s factorization workflows.',
    size: '4.8 MB',
    views: 342,
    downloads: 129,
    createdAt: 'May 12, 2026',
    versions: [
      {
        version: 'v1.0',
        date: 'May 12, 2026',
        author: 'Dr. Alan Turing Jr.',
        changelog: 'First edition published after standard administrative peer approval.'
      }
    ],
    feedbacks: [
      {
        id: 'feed-1',
        author: 'Prof. Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80',
        comment: 'Excellent proofs on dynamic programming optimization bounds. Highly clear diagram mappings.',
        rating: 5,
        timestamp: 'May 14, 2026'
      }
    ]
  },
  {
    id: 'res-2',
    title: 'Gradient Descent Optimizers in Neural Processing',
    author: 'Prof. Sarah Chen',
    category: 'Computing',
    status: 'Feedback Stage',
    format: 'Slide',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=200',
    description: 'A study on adaptive learning rates, Adam, RMSProp, and momentum coefficients in fully connected deep architectures.',
    size: '8.1 MB',
    views: 110,
    downloads: 32,
    createdAt: 'May 24, 2026',
    versions: [
      {
        version: 'v0.1-Draft',
        date: 'May 24, 2026',
        author: 'Prof. Sarah Chen',
        changelog: 'Initial presentation deck compiled for syllabus feedback.'
      }
    ],
    feedbacks: []
  },
  {
    id: 'res-3',
    title: 'Introduction to Structural Geology and Plate Kinetics',
    author: 'Dr. Elena Volkov',
    category: 'Science',
    status: 'Under Review',
    format: 'Document',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200',
    description: 'Analytical measurements on tectonic deformation vectors, seismic velocity anomalies, and mineral crystallization depths.',
    size: '2.3 MB',
    views: 89,
    downloads: 14,
    createdAt: 'May 20, 2026',
    versions: [
      {
        version: 'v1.1',
        date: 'May 23, 2026',
        author: 'Dr. Elena Volkov',
        changelog: 'Added higher resolution topographic figures and contour definitions.'
      },
      {
        version: 'v1.0',
        date: 'May 20, 2026',
        author: 'Dr. Elena Volkov',
        changelog: 'Initial Draft submitted to library.'
      }
    ],
    feedbacks: []
  }
];

export const initialActivityLog = [
  {
    id: 'log-1',
    text: 'Dr. Alan Turing Jr. compiled and published "Advanced Algorithmic Paradigms"',
    time: '2 hours ago',
    resourceTitle: 'Advanced Algorithmic Paradigms',
    type: 'upload'
  },
  {
    id: 'log-2',
    text: 'Prof. Sarah Chen submitted dynamic slides on "Gradient Descent Optimizers"',
    time: 'Yesterday',
    resourceTitle: 'Gradient Descent Optimizers',
    type: 'upload'
  }
];

export const recommendedResources = [
  {
    id: 'rec-1',
    title: 'Quantum Cryptography & Key Exchanges Seminars',
    author: 'Dr. Elena Volkov',
    category: 'Computing',
    size: '12.4 MB'
  },
  {
    id: 'rec-2',
    title: 'Kinetics of Materials & Thermo Dynamics',
    author: 'Prof. John Smith',
    category: 'Engineering',
    size: '19.1 MB'
  },
  {
    id: 'rec-3',
    title: 'Linear Algebra Applications in Computer Graphics',
    author: 'Dr. Marcus Knight',
    category: 'Mathematics',
    size: '4.5 MB'
  }
];
