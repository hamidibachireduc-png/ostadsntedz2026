export type EducationalStage = 'primary' | 'middle' | 'secondary';

export type SectionId =
  | 'dashboard'
  | 'stages'
  | 'planning'
  | 'gradebook' // قسم التقييم التربوي الشامل
  | 'analytics' // لوحة تحكم الأداء التربوي (Recharts)
  | 'resources' // مكتبة الموارد التشاركية
  | 'councils'  // قسم المجالس البيداغوجية والإدارية
  | 'training'  // التكوين والندوات والتثبيت (كاباس)
  | 'timetable' // نظام التواقيت التفاعلي
  | 'documents' // حقيبة وثائق الأستاذ (+ إضافة مستند مخصص)
  | 'legislation'
  | 'career'
  | 'digitalization'
  | 'backup'    // قسم حفظ البيانات واستيرادها إكسل
  | 'coordination';

export interface TeacherSpecialization {
  id: string;
  stage: EducationalStage;
  title: string;
  assignedSubjects: string[];
  activitiesSubCategories?: string[];
  quotaInfo: string;
}

export interface SharedResourceItem {
  id: string;
  title: string;
  stage: EducationalStage;
  teacherSpecialtyId: string;
  subject: string;
  primaryActivityName?: string;
  level: string;
  term: 1 | 2 | 3;
  resourceType: 'lesson_model' | 'exercises_series' | 'exam_subject' | 'pedagogical_guide' | 'interactive_media';
  authorName: string;
  wilaya: string;
  createdAt: string;
  downloadsCount: number;
  likesCount: number;
  fileName?: string;
  fileSize?: string;
  description: string;
  contentBody: string;
}

export interface CustomTeacherDocument {
  id: string;
  code: string;
  title: string;
  stageScope: 'all' | EducationalStage;
  category: 'administrative' | 'pedagogical' | 'inspection' | 'councils' | 'exams';
  description: string;
  recipientOrAuthority: string;
  bodyText: string;
  createdAt: string;
}

export interface TeacherProfile {
  fullName: string;
  stage: EducationalStage;
  rank: string;
  subject: string;
  schoolName: string;
  wilaya: string;
  schoolYear: string;
  currentTerm: 1 | 2 | 3;
  assignedClasses: string[];
  echelon: number;
  yearsOfService: number;
  weeklyQuotaHours: number;
  isHeadTeacher: boolean;
  logoUrl?: string; // صورة الأيقونة / الشعار الخاص بالمؤسسة والتوثيق
  institutionProgramFile?: string; // اسم ملف البرنامج السنوي / مشروع المؤسسة المرفق
  institutionProgramTitle?: string;
}

export interface StageMetadata {
  id: EducationalStage;
  title: string;
  shortTitle: string;
  weeklyHours: string;
  baseRanks: {
    code: string;
    name: string;
    category2026: number;
    index2026: number;
    promotionCondition: string;
  }[];
  subjects: string[];
  levels: string[];
  evaluationSystem: {
    formula: string;
    components: string[];
    councilRules: string;
  };
  officialExams: string;
  pedagogicalHighlights: string[];
}

export interface LessonPlanItem {
  id: string;
  stage: EducationalStage;
  subject: string;
  level: string;
  term: 1 | 2 | 3;
  weekNumber: number;
  domain: string;
  lessonTitle: string;
  competencyTarget: string;
  learningObjectives: string[];
  pedagogicalSupports: string;
  evaluationCriteria: string;
  durationMinutes: number;
  status: 'completed' | 'in_progress' | 'planned';
  logbookSigned: boolean;
  date: string;
}

export interface StudentRecord {
  id: string;
  matricule: string;
  fullName: string;
  birthDate: string;
  stage: EducationalStage;
  className: string;
  diagnosticScore: number;
  diagnosticLevel: 'mastered' | 'partial' | 'remediation';
  diagnosticWeakness: string;
  continuousAssessment: number;
  test1: number;
  test2: number;
  exam: number;
  term1Avg?: number; // معدل الفصل الأول لمتابعة تقدم التلميذ
  term2Avg?: number; // معدل الفصل الثاني
  term3Avg?: number; // معدل الفصل الثالث / المتوقع
  absencesCount: number;
  behaviorNote: string;
  remediationNeeded: boolean;
}

export interface ExamExerciseItem {
  id: string;
  title: string;
  points: number;
  competencyTargeted: string;
  difficulty: 'easy' | 'medium' | 'complex';
  questionText: string;
  answerKey: string;
}

export interface OfficialExamTemplate {
  id: string;
  stage: EducationalStage;
  examType: 'test' | 'term_exam' | 'diagnostic_exam' | 'mock_official';
  term: 1 | 2 | 3;
  subject: string;
  level: string;
  duration: string;
  date: string;
  coefficient: number;
  generalInstructions: string;
  exercises: ExamExerciseItem[];
  createdAt: string;
}

export interface CouncilDirectoryItem {
  id: string;
  title: string;
  decreeRef: string;
  stageScope: 'all' | EducationalStage;
  periodicity: string;
  presidency: string;
  members: string[];
  coreCompetencies: string[];
  teacherRole: string[];
  minutesTemplateSummary: string;
}

export interface CouncilMinutesRecord {
  id: string;
  councilId: string;
  councilTitle: string;
  stage: EducationalStage;
  targetClassOrSubject: string;
  date: string;
  term: 1 | 2 | 3;
  agenda: string;
  statisticsSummary: string;
  decisionsAndRecommendations: string;
  attendees: string;
}

export interface StatutoryMissionCategory {
  id: string;
  stageScope: 'all' | EducationalStage;
  roleTitle: string;
  legalRef: string;
  categoryLabel: string;
  missions: {
    code: string;
    title: string;
    details: string;
    mandatoryDocuments: string[];
  }[];
}

export interface TimetableSlot {
  id: string;
  day: 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  periodIndex: number;
  timeRange: string;
  stage: EducationalStage;
  className: string;
  subject: string;
  activityName?: string; // تسمية النشاط (خاصة بالطور الابتدائي) أو التخصص
  sessionType: 'lesson' | 'tp_td' | 'remediation' | 'coordination' | 'parents_reception';
  room: string;
  teacherName?: string;
}

export interface TeacherDocumentTemplate {
  id: string;
  code: string;
  title: string;
  stageScope: 'all' | EducationalStage;
  category: 'administrative' | 'pedagogical' | 'inspection' | 'councils' | 'exams';
  description: string;
  fields: {
    key: string;
    label: string;
    defaultValue: string;
    type?: 'text' | 'textarea' | 'date' | 'select';
    options?: string[];
  }[];
  bodyTemplate: (values: Record<string, string>, profile: TeacherProfile) => string;
}

export interface LegislationDocument {
  id: string;
  title: string;
  number: string;
  date: string;
  category:
    | 'statute_25_54'
    | 'statutory_missions'
    | 'pedagogy_curricula'
    | 'evaluation_councils'
    | 'career_salary'
    | 'exams_digital';
  isUpdated2026: boolean;
  stageTarget: 'all' | EducationalStage;
  description: string;
  tags: string[];
  fullText: string;
  keyArticles: {
    articleNumber: string;
    summary: string;
    text: string;
  }[];
}

export interface CoordinationItem {
  id: string;
  stage: EducationalStage;
  type: 'agenda' | 'subject_meeting' | 'parents_log' | 'exam_supervision';
  title: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'normal';
  notes: string;
  completed: boolean;
}
