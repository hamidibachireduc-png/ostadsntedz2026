/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SectionId,
  TeacherProfile,
  LessonPlanItem,
  StudentRecord,
  TimetableSlot,
  CoordinationItem,
  EducationalStage,
} from './types';
import {
  DEFAULT_TEACHER_PROFILE,
  STAGE_PRESETS,
  INITIAL_LESSON_PLANS,
  INITIAL_STUDENTS,
  INITIAL_TIMETABLE,
  INITIAL_COORDINATION_ITEMS,
} from './data';
import { Header } from './components/Header';
import { ProfileModal } from './components/ProfileModal';
import { Dashboard } from './components/Dashboard';
import { StagesExplorer } from './components/StagesExplorer';
import { CollaborativeLibrary } from './components/CollaborativeLibrary';
import { PedagogicalPlanning } from './components/PedagogicalPlanning';
import { Gradebook } from './components/Gradebook';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { CouncilsHub } from './components/CouncilsHub';
import { TrainingPortfolio } from './components/TrainingPortfolio';
import { TeacherTimetable } from './components/TeacherTimetable';
import { TeacherDocuments } from './components/TeacherDocuments';
import { LegislationHub } from './components/LegislationHub';
import { CareerSimulator } from './components/CareerSimulator';
import { DigitalizationBridge } from './components/DigitalizationBridge';
import { DataBackupExcel } from './components/DataBackupExcel';
import { CoordinationSpace } from './components/CoordinationSpace';

export default function App() {
  const [currentSection, setCurrentSection] = useState<SectionId>('dashboard');

  const [profile, setProfile] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('snte_teachers_profile_2026_v2');
    return saved ? JSON.parse(saved) : DEFAULT_TEACHER_PROFILE;
  });

  const [lessonPlans, setLessonPlans] = useState<LessonPlanItem[]>(() => {
    const saved = localStorage.getItem('snte_teachers_lessons_2026_v2');
    return saved ? JSON.parse(saved) : INITIAL_LESSON_PLANS;
  });

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('snte_teachers_students_2026_v3');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('snte_teachers_timetable_2026_v3');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [coordinationItems, setCoordinationItems] = useState<CoordinationItem[]>(() => {
    const saved = localStorage.getItem('snte_teachers_coordination_2026_v2');
    return saved ? JSON.parse(saved) : INITIAL_COORDINATION_ITEMS;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('snte_teachers_profile_2026_v2', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('snte_teachers_lessons_2026_v2', JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem('snte_teachers_students_2026_v3', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('snte_teachers_timetable_2026_v3', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('snte_teachers_coordination_2026_v2', JSON.stringify(coordinationItems));
  }, [coordinationItems]);

  const handleSwitchStage = (newStage: EducationalStage) => {
    const preset = STAGE_PRESETS[newStage];
    setProfile((prev) => ({
      ...prev,
      ...preset,
      stage: newStage,
    }));
  };

  const handleNavigate = (section: SectionId) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocumentGenerator = (docId: string) => {
    setSelectedDocId(docId);
    handleNavigate('documents');
  };

  const handleResetAllData = () => {
    setProfile(DEFAULT_TEACHER_PROFILE);
    setLessonPlans(INITIAL_LESSON_PLANS);
    setStudents(INITIAL_STUDENTS);
    setTimetable(INITIAL_TIMETABLE);
    setCoordinationItems(INITIAL_COORDINATION_ITEMS);
    localStorage.removeItem('snte_teachers_custom_docs_2026');
    localStorage.removeItem('snte_teachers_shared_resources_2026');
    localStorage.removeItem('snte_teachers_exam_models_2026');
    localStorage.removeItem('snte_teachers_council_minutes_2026');
  };

  const remediationCount = students.filter(
    (s) => s.stage === profile.stage && s.remediationNeeded
  ).length;

  return (
    <div className="min-h-screen bg-[#071710] text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      <Header
        currentSection={currentSection}
        onSelectSection={handleNavigate}
        profile={profile}
        onSwitchStage={handleSwitchStage}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        remediationCount={remediationCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentSection === 'dashboard' && (
          <Dashboard
            profile={profile}
            onNavigate={handleNavigate}
            onSwitchStage={handleSwitchStage}
            lessonPlans={lessonPlans}
            students={students}
            timetable={timetable}
            coordinationItems={coordinationItems}
            onOpenDocumentGenerator={handleOpenDocumentGenerator}
            onOpenSettings={() => setIsProfileModalOpen(true)}
          />
        )}

        {currentSection === 'stages' && (
          <StagesExplorer profile={profile} onSwitchStage={handleSwitchStage} />
        )}

        {currentSection === 'resources' && (
          <CollaborativeLibrary profile={profile} />
        )}

        {currentSection === 'planning' && (
          <PedagogicalPlanning
            profile={profile}
            lessonPlans={lessonPlans}
            onUpdateLessonPlans={setLessonPlans}
          />
        )}

        {currentSection === 'gradebook' && (
          <Gradebook
            profile={profile}
            students={students}
            onUpdateStudents={setStudents}
            onNavigate={handleNavigate}
          />
        )}

        {currentSection === 'analytics' && (
          <PerformanceAnalytics
            profile={profile}
            students={students}
            onUpdateStudents={setStudents}
            onNavigate={handleNavigate}
          />
        )}

        {currentSection === 'councils' && <CouncilsHub profile={profile} />}

        {currentSection === 'training' && (
          <TrainingPortfolio
            profile={profile}
            onOpenDocumentGenerator={handleOpenDocumentGenerator}
          />
        )}

        {currentSection === 'timetable' && (
          <TeacherTimetable
            profile={profile}
            timetable={timetable}
            onUpdateTimetable={setTimetable}
          />
        )}

        {currentSection === 'documents' && (
          <TeacherDocuments
            profile={profile}
            initialSelectedDocId={selectedDocId}
          />
        )}

        {currentSection === 'legislation' && <LegislationHub />}

        {currentSection === 'career' && <CareerSimulator profile={profile} />}

        {currentSection === 'digitalization' && (
          <DigitalizationBridge profile={profile} students={students} />
        )}

        {currentSection === 'backup' && (
          <DataBackupExcel
            profile={profile}
            onUpdateProfile={setProfile}
            students={students}
            onUpdateStudents={setStudents}
            lessonPlans={lessonPlans}
            onUpdateLessonPlans={setLessonPlans}
            timetable={timetable}
            onUpdateTimetable={setTimetable}
            coordinationItems={coordinationItems}
            onUpdateCoordination={setCoordinationItems}
            onResetAllData={handleResetAllData}
          />
        )}

        {currentSection === 'coordination' && (
          <CoordinationSpace
            profile={profile}
            items={coordinationItems}
            onUpdateItems={setCoordinationItems}
            onOpenDocumentGenerator={handleOpenDocumentGenerator}
          />
        )}
      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={setProfile}
      />

      <footer className="mt-auto bg-[#040e0a] border-t border-[#d4af37]/30 py-8 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#8f1414] via-[#d4af37] to-[#105e32] p-0.5 flex items-center justify-center overflow-hidden">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="أيقونة التوثيق"
                    className="w-full h-full rounded-full object-contain bg-[#06150e]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#06150e] flex items-center justify-center font-black text-[11px] text-[#f5d77f]">
                    SNTE
                  </div>
                )}
              </div>
              <div>
                <div className="text-white font-bold text-sm">
                  البوابة الرقمية لأساتذة الأطوار الثلاثة · النقابة الوطنية لعمال التربية (SNTE 2026)
                </div>
                <div className="text-[11px] text-[#d4af37] font-semibold">
                  شعارنا الدائم: كرامة · ترقية · وحدة · عمل — الابتدائي · المتوسط · الثانوي
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium">
              <button
                onClick={() => handleNavigate('dashboard')}
                className="hover:text-[#f5d77f] transition-colors cursor-pointer"
              >
                الداشبورد البيداغوجي
              </button>
              <span>·</span>
              <button
                onClick={() => handleNavigate('analytics')}
                className="hover:text-[#f5d77f] transition-colors cursor-pointer"
              >
                لوحة تحكم الأداء التربوي (Recharts)
              </button>
              <span>·</span>
              <button
                onClick={() => handleNavigate('timetable')}
                className="hover:text-[#f5d77f] transition-colors cursor-pointer"
              >
                التواقيت التفاعلية
              </button>
              <span>·</span>
              <button
                onClick={() => handleNavigate('resources')}
                className="hover:text-[#f5d77f] transition-colors cursor-pointer"
              >
                مكتبة الموارد التشاركية
              </button>
              <span>·</span>
              <button
                onClick={() => handleNavigate('gradebook')}
                className="hover:text-[#f5d77f] transition-colors cursor-pointer"
              >
                قسم التقييم التربوي
              </button>
              <span>·</span>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="hover:text-[#f5d77f] transition-colors cursor-pointer"
              >
                أيقونة التوثيق وبرنامج المؤسسة
              </button>
            </div>

            <div className="text-center md:text-left text-[11px] text-slate-400">
              <div>المطابقة التشريعية: المرسوم التنفيذي 25-54 والقرار 834</div>
              <div className="text-[#d4af37]">النموذج القياسي المعتمد لمنصات الأساتذة 2026</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
