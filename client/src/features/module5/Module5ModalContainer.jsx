// client/src/features/module5/Module5ModalContainer.jsx
import React from 'react';
import {
  CreateProjectModal,
  ScheduleInstallationModal,
  RaiseTicketModal,
  AssignTaskModal,
  TraceModal,
  PhotoPackModal,
  VoiceRecorderModal,
} from '../../components/common/Modals';

export default function Module5ModalContainer({
  modalType,
  onClose,
  module5State,
  module5Actions,
  toast,
}) {
  const { lookups, projects, traceData, selectedRecord, traceLoading } = module5State;
  const {
    handleCreateProject,
    handleScheduleInstallation,
    handleCreateTicket,
    handleAssignTask,
  } = module5Actions;

  if (!modalType) return null;

  return (
    <>
      {modalType === 'CREATE_PROJECT' && (
        <CreateProjectModal
          lookups={lookups}
          onClose={onClose}
          onSubmit={(e) => handleCreateProject(e, onClose)}
        />
      )}

      {modalType === 'SCHEDULE_INSTALLATION' && (
        <ScheduleInstallationModal
          projects={projects}
          onClose={onClose}
          onSubmit={(e) => handleScheduleInstallation(e, onClose)}
        />
      )}

      {modalType === 'RAISE_TICKET' && (
        <RaiseTicketModal
          lookups={lookups}
          onClose={onClose}
          onSubmit={(e) => handleCreateTicket(e, onClose)}
        />
      )}

      {modalType === 'ASSIGN_TASK' && (
        <AssignTaskModal
          onClose={onClose}
          onSubmit={(e) => handleAssignTask(e, onClose)}
        />
      )}

      {modalType === 'TRACE_JOB' && (
        <TraceModal
          traceData={traceData}
          selectedRecord={selectedRecord}
          loading={traceLoading}
          onClose={onClose}
        />
      )}

      {modalType === 'PHOTO_PACK' && (
        <PhotoPackModal
          onClose={onClose}
          toast={toast}
        />
      )}

      {modalType === 'VOICE_RECORDER' && (
        <VoiceRecorderModal
          onClose={onClose}
          toast={toast}
        />
      )}
    </>
  );
}
