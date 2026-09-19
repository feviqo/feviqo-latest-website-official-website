import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Lock, LogOut, Bell, User, Video, ShieldCheck, 
  ChevronDown, CheckCircle2, Sparkles 
} from 'lucide-react';
import { ClientProject, ClientProfile, LeadBooking, SimulatedEmail, ProjectRevisionNote, RawFootageFile, ChatMessage } from '../types';
import { 
  SEED_CLIENT_PROFILES, DEFAULT_PROJECTS, SEED_LEADS, SEED_EMAILS, AuthSession 
} from './flow/flowData';
import { FlowLogin } from './flow/FlowLogin';
import { ClientWorkspace } from './flow/ClientWorkspace';
import { EditorWorkspace } from './flow/EditorWorkspace';
import { AdminWorkspace } from './flow/AdminWorkspace';
import { NewProjectModal } from './flow/NewProjectModal';
import { EmailModal } from './flow/EmailModal';
import { FeviqoHeaderLogo } from './FeviqoLogo';
import { sendNotificationEmail } from '../services/emailService';

interface FeviqoFlowAppProps {
  onBackToHome: () => void;
  initialView?: 'login' | 'register' | 'client' | 'editor' | 'admin';
  onBookCall?: () => void;
}

export const FeviqoFlowApp: React.FC<FeviqoFlowAppProps> = ({
  onBackToHome,
  initialView = 'login',
  onBookCall,
}) => {
  // 1. Session State - strictly password protected
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('feviqo_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email === 'sarah@lumina-skincare.com' || parsed?.email === 'marco@feviqo.com') {
          localStorage.removeItem('feviqo_auth_session');
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  // 2. Clean Core State - No fake mock data
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      localStorage.removeItem('feviqo_clients_v4');
      localStorage.removeItem('feviqo_clients_v3');
      const saved = localStorage.getItem('feviqo_clients_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((c: any) => c.email !== 'sarah@lumina-skincare.com' && c.email !== 'alex@creator.com') : [];
      }
    } catch {}
    return [];
  });

  const [projects, setProjects] = useState<ClientProject[]>(() => {
    try {
      localStorage.removeItem('feviqo_projects_v4');
      localStorage.removeItem('feviqo_projects_v3');
      const saved = localStorage.getItem('feviqo_projects_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((p: any) => p.id !== 'proj-1' && p.id !== 'proj-2' && p.id !== 'proj-3') : [];
      }
    } catch {}
    return [];
  });

  const [leads, setLeads] = useState<LeadBooking[]>(() => {
    try {
      localStorage.removeItem('feviqo_leads_v4');
      const saved = localStorage.getItem('feviqo_leads_v6');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [emails, setEmails] = useState<SimulatedEmail[]>(() => {
    try {
      localStorage.removeItem('feviqo_emails_v4');
      const saved = localStorage.getItem('feviqo_emails_v6');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [editors, setEditors] = useState<any[]>([]);

  // Load live editors from server
  useEffect(() => {
    fetch('/api/editors')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEditors(data);
        }
      })
      .catch(() => {});
  }, []);

  // Active Project Selection & Modals
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // RBAC view state: When role is admin, admin can inspect client and editor views as well
  const [adminActiveView, setAdminActiveView] = useState<'admin' | 'editor' | 'client'>('admin');
  const [adminSelectedClientId, setAdminSelectedClientId] = useState<string>('all');

  // Sync to localStorage
  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem('feviqo_auth_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('feviqo_auth_session');
      }
    } catch {}
  }, [session]);

  useEffect(() => {
    try {
      localStorage.setItem('feviqo_clients_v6', JSON.stringify(clients));
    } catch {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('feviqo_projects_v6', JSON.stringify(projects));
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projects),
      }).catch(() => {});
    } catch {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('feviqo_emails_v6', JSON.stringify(emails));
    } catch {}
  }, [emails]);

  useEffect(() => {
    try {
      localStorage.setItem('feviqo_leads_v6', JSON.stringify(leads));
    } catch {}
  }, [leads]);

  // Load authoritative data from server DAL
  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data?.clients && Array.isArray(data.clients)) {
          setClients(data.clients);
        }
      })
      .catch((err) => console.warn('Failed to load server clients:', err));

    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data?.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
          if (data.projects.length > 0 && !activeProjectId) {
            setActiveProjectId(data.projects[0].id);
          }
        }
      })
      .catch((err) => console.warn('Failed to load server projects:', err));

    fetch('/api/strategy-calls')
      .then((res) => res.json())
      .then((data) => {
        if (data?.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      })
      .catch((err) => console.warn('Failed to load server strategy calls:', err));
  }, []);

  const handleUpdateLead = (updatedLead: LeadBooking) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    fetch(`/api/strategy-calls/${updatedLead.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLead),
    }).catch((err) => console.warn('Failed to update lead on server:', err));
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    fetch(`/api/strategy-calls/${leadId}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Failed to delete lead from server:', err));
  };

  // Sign out / Lock Portal
  const handleSignOut = () => {
    setSession(null);
    localStorage.removeItem('feviqo_auth_session');
  };

  // Automated Email Dispatcher helper - strictly resolved to client's portal account email
  const triggerAutomatedEmail = (
    project: ClientProject, 
    newStatus: ClientProject['status'], 
    previewUrl?: string
  ) => {
    // Dynamically retrieve exact client email registered to their portal login profile
    const matchedClient = clients.find(
      c => (project.clientId && c.id === project.clientId) ||
           c.email.toLowerCase() === project.clientEmail.toLowerCase()
    );
    const targetEmail = matchedClient ? matchedClient.email : project.clientEmail;
    const recipientName = matchedClient ? matchedClient.name : (project.clientName || 'Client');

    let subject = '';
    let body = '';
    let type: SimulatedEmail['type'] = 'status_editing';

    if (newStatus === 'Editing') {
      type = 'status_editing';
      subject = `🚀 Production Started: ${project.title}`;
      body = `Hi ${recipientName},\n\nYour assigned editor ${project.editorName} has claimed your request "${project.title}" and production is underway. Our team is slicing raw camera footage, color correcting, and designing kinetic motion graphics. Target draft turnaround is within 24-48 hours.`;
    } else if (newStatus === 'Review Ready') {
      type = 'status_review';
      subject = `🎬 Cut Ready for Review: ${project.title}`;
      body = `Hi ${recipientName},\n\nGreat news! ${project.editorName} has completed the review draft for "${project.title}".\n\nPreview Draft Link: ${previewUrl || project.deliveredVideoUrl || 'Available in your FEVIQO Flow client portal'}\n\nPlease log into your client portal at ${window.location.origin}/flow to review the cut and submit timestamped revision notes.`;
    } else if (newStatus === 'Completed') {
      type = 'status_completed';
      subject = `✅ Video Approved & 4K Master Ready: ${project.title}`;
      body = `Hi ${recipientName},\n\nCongratulations! Your video "${project.title}" is officially approved and the final master 4K render is ready for download in your FEVIQO Flow portal.\n\nThank you for creating with FEVIQO!`;
    } else {
      type = 'new_request';
      subject = `📋 Task Queued: ${project.title}`;
      body = `Hi ${recipientName},\n\nYour task "${project.title}" has been placed in the editor queue. Your editor ${project.editorName} will begin production shortly.`;
    }

    const emailItem: SimulatedEmail = {
      id: 'em-' + Date.now(),
      to: targetEmail,
      recipientName,
      subject,
      body,
      type,
      timestamp: 'Just now',
      read: false,
      projectId: project.id,
      projectTitle: project.title,
    };

    setEmails((prev) => [emailItem, ...prev]);

    // Dispatch real email over the network to recipient
    sendNotificationEmail({
      to: targetEmail,
      type: newStatus === 'Review Ready' 
        ? 'project_in_review' 
        : newStatus === 'Completed' 
        ? 'project_approved' 
        : 'project_status_changed',
      subject,
      data: {
        recipientName,
        projectName: project.title,
        newStatus,
        editorName: project.editorName,
        previewUrl: previewUrl || project.deliveredVideoUrl,
      },
    }).catch((err) => console.warn('Real email dispatch failed:', err));

    // Also dispatch direct status update alert to partner@feviqo.com
    sendNotificationEmail({
      to: 'partner@feviqo.com',
      type: 'project_status_changed',
      subject: `⚡ [FEVIQO Status Update] ${project.title} is now ${newStatus}`,
      data: {
        recipientName: 'Studio Partner',
        clientName: recipientName,
        projectName: project.title,
        newStatus,
        editorName: project.editorName,
        previewUrl: previewUrl || project.deliveredVideoUrl,
      },
    }).catch(() => {});
  };

  // Handler: Delete Project Task
  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setActiveProjectId((prev) => (prev === projectId ? '' : prev));
  };

  // Handler: Add Footage to Existing Project
  const handleFootageAddedToProject = (projectId: string, newFiles: RawFootageFile[]) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            rawFootageFiles: [...p.rawFootageFiles, ...newFiles],
            lastUpdated: 'Just now',
          };
        }
        return p;
      })
    );
  };

  // Handler: Update Cloud Footage Link
  const handleUpdateFootageLink = (projectId: string, footageLink: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            footageLink: footageLink.trim(),
            lastUpdated: 'Just now',
          };
        }
        return p;
      })
    );
  };

  // Handler: Create Project
  const handleCreateProject = (newProject: ClientProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);

    // Trigger automated email dispatch
    const emailItem: SimulatedEmail = {
      id: 'em-' + Date.now(),
      to: newProject.clientEmail,
      recipientName: newProject.clientName || 'Client',
      subject: `📥 New Video Request Received: ${newProject.title}`,
      body: `Hi ${newProject.clientName || 'there'},\n\nWe received your new video editing request "${newProject.title}" with ${newProject.rawFootageFiles.length} raw footage assets. Your editor ${newProject.editorName} has been notified and will review your creative instructions shortly.`,
      type: 'new_request',
      timestamp: 'Just now',
      read: false,
      projectId: newProject.id,
      projectTitle: newProject.title,
    };
    setEmails((prev) => [emailItem, ...prev]);

    // Dispatch real email to client
    sendNotificationEmail({
      to: newProject.clientEmail,
      type: 'project_submitted',
      subject: `📥 New Video Request Received: ${newProject.title}`,
      data: {
        recipientName: newProject.clientName || 'Client',
        projectName: newProject.title,
        editorName: newProject.editorName,
      },
    }).catch((err) => console.warn('Real email dispatch failed:', err));

    // Also dispatch direct new project alert to partner@feviqo.com
    sendNotificationEmail({
      to: 'partner@feviqo.com',
      type: 'project_submitted',
      subject: `🎬 [New Client Request] "${newProject.title}" by ${newProject.clientName || 'Client'}`,
      data: {
        recipientName: 'Studio Partner',
        clientName: newProject.clientName || 'Client',
        clientEmail: newProject.clientEmail,
        projectName: newProject.title,
        editorName: newProject.editorName,
        notes: newProject.creativeInstructions,
      },
    }).catch(() => {});
  };

  // Handler: Update Status from Editor
  const handleUpdateProjectStatus = (
    projectId: string, 
    newStatus: ClientProject['status'], 
    previewUrl?: string
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updated: ClientProject = {
            ...p,
            status: newStatus,
            lastUpdated: 'Just now',
            deliveredVideoUrl: previewUrl || p.deliveredVideoUrl,
          };
          triggerAutomatedEmail(updated, newStatus, previewUrl);
          return updated;
        }
        return p;
      })
    );
  };

  // Handler: Client adds timestamped revision note
  const handleAddRevisionNote = (projectId: string, noteText: string, timestamp: string) => {
    const newNote: ProjectRevisionNote = {
      id: 'note-' + Date.now(),
      timestamp: timestamp || '0:00',
      note: noteText,
      author: session?.name || 'Client',
      authorRole: 'client',
      createdAt: 'Just now',
      isAddressed: false,
    };

    // Persist to backend server API
    fetch(`/api/annotations/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    }).catch((err) => console.warn('Server annotation sync error:', err));

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            revisionNotes: [...(p.revisionNotes || []), newNote],
            lastUpdated: 'Just now',
          };
        }
        return p;
      })
    );
  };

  // Handler: Editor replies to client note
  const handleEditorReplyNote = (projectId: string, noteId: string, replyText: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedNotes = (p.revisionNotes || []).map((n) => {
            if (n.id === noteId) {
              const updated = { ...n, editorReply: replyText, isAddressed: true };
              fetch(`/api/annotations/${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
              }).catch(() => {});
              return updated;
            }
            return n;
          });
          return { ...p, revisionNotes: updatedNotes, lastUpdated: 'Just now' };
        }
        return p;
      })
    );
  };

  // Handler: Toggle note addressed status
  const handleToggleNoteAddressed = (projectId: string, noteId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedNotes = (p.revisionNotes || []).map((n) => {
            if (n.id === noteId) {
              return { ...n, isAddressed: !n.isAddressed };
            }
            return n;
          });
          return { ...p, revisionNotes: updatedNotes };
        }
        return p;
      })
    );
  };

  // Handler: Editor adds a direct note
  const handleAddEditorNote = (projectId: string, noteText: string) => {
    const newNote: ProjectRevisionNote = {
      id: 'note-' + Date.now(),
      timestamp: 'Studio Note',
      note: noteText,
      author: session?.name || 'Marco Silvestri',
      authorRole: 'editor',
      createdAt: 'Just now',
      isAddressed: false,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            revisionNotes: [...(p.revisionNotes || []), newNote],
            lastUpdated: 'Just now',
          };
        }
        return p;
      })
    );
  };

  // Handler: Send WhatsApp message
  const handleSendChatMessage = (projectId: string, msg: Omit<ChatMessage, 'id' | 'projectId'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      projectId,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            chatMessages: [...(p.chatMessages || []), newMsg],
            lastUpdated: 'Just now',
          };
        }
        return p;
      })
    );

    // Sync to backend chat endpoint
    fetch(`/api/chat/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch(() => {});
  };

  // Handler: Admin reassign client to editor
  const handleReassignClientEditor = (clientId: string, newEditor: string) => {
    const targetClient = clients.find((c) => c.id === clientId);
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, assignedEditor: newEditor } : c))
    );

    // Also update all tasks belonging to this client to reflect the new editor
    setProjects((prev) =>
      prev.map((p) => {
        if (p.clientId === clientId || (targetClient && p.clientEmail.toLowerCase() === targetClient.email.toLowerCase())) {
          return { ...p, editorName: newEditor, lastUpdated: 'Just now' };
        }
        return p;
      })
    );

    fetch(`/api/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedEditor: newEditor }),
    }).catch(() => {});
  };

  // Handler: Add new client from Admin
  const handleAddNewClient = async (newProfileData: any): Promise<{ success: boolean; client?: ClientProfile; oneTimePassword?: string }> => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfileData),
      });
      const data = await res.json();
      if (res.ok && data.success && data.client) {
        const savedClient: ClientProfile = data.client;
        setClients((prev) => [savedClient, ...prev.filter((c) => c.id !== savedClient.id)]);

        // Send welcoming automated credentials email
        const welcomeEmail: SimulatedEmail = {
          id: 'em-' + Date.now(),
          to: savedClient.email,
          recipientName: savedClient.name,
          subject: `🔐 Your Private FEVIQO Flow Portal Access`,
          body: `Hi ${savedClient.name},\n\nWelcome to FEVIQO! Your private client workspace is ready.\n\nPortal URL: ${window.location.origin}/flow\nLogin Email: ${savedClient.email}\nTemporary Password: ${data.oneTimePassword || '(Provided during onboarding)'}\n\nAssigned Video Editor: ${savedClient.assignedEditor || 'Marco Silvestri'}\n\nYou can log in now to upload your raw footage and manage your video production queue.`,
          type: 'new_request',
          timestamp: 'Just now',
          read: false,
          projectId: 'system',
          projectTitle: 'Client Portal Onboarding',
        };
        setEmails((prev) => [welcomeEmail, ...prev]);

        return { success: true, client: savedClient, oneTimePassword: data.oneTimePassword };
      }
      return { success: false };
    } catch (err) {
      console.error('Failed to create client on server:', err);
      setClients((prev) => [newProfileData, ...prev]);
      return { success: true, client: newProfileData, oneTimePassword: newProfileData.password };
    }
  };

  // Handler: Update client status (Active / Paused / Archived / Disabled)
  const handleUpdateClientStatus = async (clientId: string, status: 'Active' | 'Paused' | 'Archived' | 'Disabled') => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, status } : c)));
    try {
      await fetch(`/api/clients/${clientId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('Failed to update client status on server:', err);
    }
  };

  // Handler: Reset client password securely
  const handleResetClientPassword = async (clientId: string, newPassword?: string): Promise<{ success: boolean; temporaryPassword?: string }> => {
    try {
      const res = await fetch(`/api/clients/${clientId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, temporaryPassword: data.temporaryPassword };
      }
      return { success: false };
    } catch (err) {
      console.error('Failed to reset client password:', err);
      return { success: false };
    }
  };

  // Handler: Delete or archive client safely
  const handleDeleteClient = async (clientId: string, permanent: boolean = false) => {
    if (permanent) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } else {
      setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, status: 'Archived' } : c)));
    }
    try {
      await fetch(`/api/clients/${clientId}?mode=${permanent ? 'permanent' : 'archive'}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to delete/archive client on server:', err);
    }
  };

  // Handler: Switch into client portal view mode for admin
  const handleSwitchToClientSession = (client: ClientProfile) => {
    setAdminSelectedClientId(client.id);
    setAdminActiveView('client');
  };

  // Handler: 1-Click Subscription Pause / Upgrade Flexibility
  const handleUpdateSubscription = async (
    action: 'pause' | 'resume' | 'upgrade',
    targetPlan?: string,
    notes?: string
  ) => {
    if (!session) return;
    const clientIndex = clients.findIndex(
      (c) => c.email.toLowerCase() === session.email.toLowerCase()
    );

    const currentClient: ClientProfile = clientIndex !== -1 ? clients[clientIndex] : {
      id: session.clientId || 'cli-' + Date.now(),
      name: session.name || 'Client',
      email: session.email,
      company: session.company || 'Company',
      website: '',
      phone: '',
      country: 'United States',
      plan: 'Pro ($2,299/mo)',
      monthlySpend: 2299,
      status: 'Active',
      joinedDate: 'Recent',
      activeProjectsCount: 1,
      assignedEditor: session.assignedEditor || 'Marco Silvestri',
    };

    let updatedStatus: 'Active' | 'Paused' | 'Archived' | 'Disabled' = currentClient.status;
    let updatedPlan = currentClient.plan;
    let updatedSpend = currentClient.monthlySpend;

    if (action === 'pause') {
      updatedStatus = 'Paused';
    } else if (action === 'resume') {
      updatedStatus = 'Active';
    } else if (action === 'upgrade' && targetPlan) {
      updatedPlan = targetPlan;
      updatedStatus = 'Active';
      if (targetPlan.includes('5,999') || targetPlan.includes('4,999') || targetPlan.includes('4,699') || targetPlan.includes('In-House')) {
        updatedSpend = targetPlan.includes('Yearly') || targetPlan.includes('4,699') ? 4699 : targetPlan.includes('Quarterly') || targetPlan.includes('4,999') ? 4999 : 5999;
      } else if (targetPlan.includes('2,299') || targetPlan.includes('1,999') || targetPlan.includes('1,799') || targetPlan.includes('Pro')) {
        updatedSpend = targetPlan.includes('Yearly') || targetPlan.includes('1,799') ? 1799 : targetPlan.includes('Quarterly') || targetPlan.includes('1,999') ? 1999 : 2299;
      } else if (targetPlan.includes('1,299') || targetPlan.includes('999') || targetPlan.includes('899') || targetPlan.includes('Scale')) {
        updatedSpend = targetPlan.includes('Yearly') || targetPlan.includes('899') ? 899 : targetPlan.includes('Quarterly') || targetPlan.includes('999') ? 999 : 1299;
      }
    }

    const updatedProfile: ClientProfile = {
      ...currentClient,
      status: updatedStatus,
      plan: updatedPlan,
      monthlySpend: updatedSpend,
    };

    const newClients = [...clients];
    if (clientIndex !== -1) {
      newClients[clientIndex] = updatedProfile;
    } else {
      newClients.push(updatedProfile);
    }
    setClients(newClients);
    try {
      localStorage.setItem('feviqo_clients_v4', JSON.stringify(newClients));
    } catch {}

    // Dispatch to server API
    fetch('/api/clients/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientEmail: session.email,
        clientName: session.name,
        company: session.company,
        action,
        targetPlan,
        currentPlan: currentClient.plan,
        notes,
      }),
    }).catch((err) => console.warn('Subscription server call warning:', err));

    // Direct email notification to partner@feviqo.com
    const emailType = action === 'pause' ? 'plan_paused' : action === 'resume' ? 'plan_resumed' : 'plan_upgraded';
    const emailSubject = action === 'pause'
      ? `⏸️ [Plan Update: PAUSED] ${session.name} (${session.company || 'Client'}) paused subscription`
      : action === 'resume'
      ? `▶️ [Plan Update: RESUMED] ${session.name} (${session.company || 'Client'}) resumed subscription`
      : `🚀 [Plan Upgrade Request] ${session.name} (${session.company || 'Client'}) upgraded to ${targetPlan}`;

    sendNotificationEmail({
      to: 'partner@feviqo.com',
      type: emailType,
      subject: emailSubject,
      data: {
        recipientName: 'Studio Partner',
        clientName: session.name,
        clientEmail: session.email,
        company: session.company,
        currentPlan: currentClient.plan,
        targetPlan,
        action,
        notes,
      },
    }).catch(() => {});

    // Also notify client copy
    sendNotificationEmail({
      to: session.email,
      type: emailType,
      subject: emailSubject,
      data: {
        recipientName: session.name,
        clientName: session.name,
        clientEmail: session.email,
        company: session.company,
        currentPlan: currentClient.plan,
        targetPlan,
        action,
        notes,
      },
    }).catch(() => {});

    // Push simulated email into studio inbox
    const simEmail: SimulatedEmail = {
      id: 'em-' + Date.now(),
      to: 'partner@feviqo.com',
      recipientName: 'Studio HQ',
      subject: emailSubject,
      body: action === 'pause'
        ? `${session.name} (${session.company}) paused their subscription. Dedicated concierge assistance notified at partner@feviqo.com.`
        : action === 'resume'
        ? `${session.name} (${session.company}) resumed their subscription.`
        : `${session.name} (${session.company}) upgraded to ${targetPlan}.`,
      type: 'status_editing',
      timestamp: 'Just now',
      read: false,
      projectId: 'plan-mgmt',
      projectTitle: `${action.toUpperCase()}: ${updatedPlan}`,
    };
    setEmails((prev) => [simEmail, ...prev]);
  };

  // Handlers: Email management
  const handleDeleteEmail = async (emailId: string) => {
    setEmails((prev) => {
      const updated = prev.filter((em) => em.id !== emailId);
      try {
        localStorage.setItem('feviqo_emails_v4', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await fetch(`/api/emails/${emailId}`, { method: 'DELETE' });
    } catch {}
  };

  const handleClearAllEmails = async () => {
    setEmails([]);
    try {
      localStorage.removeItem('feviqo_emails_v4');
    } catch {}
    try {
      await fetch('/api/emails', { method: 'DELETE' });
    } catch {}
  };

  // Handlers: Editor Roster CRUD
  const handleAddNewEditor = async (newEditorData: any) => {
    try {
      const res = await fetch('/api/editors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEditorData),
      });
      const created = await res.json();
      setEditors((prev) => [...prev, created]);
    } catch {
      const fallback = {
        id: `ed-${Date.now()}`,
        ...newEditorData,
        status: 'Active',
      };
      setEditors((prev) => [...prev, fallback]);
    }
  };

  const handleUpdateEditor = async (editorId: string, data: any) => {
    try {
      const res = await fetch(`/api/editors/${editorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setEditors((prev) => prev.map((e) => (e.id === editorId ? updated : e)));
    } catch {
      setEditors((prev) => prev.map((e) => (e.id === editorId ? { ...e, ...data } : e)));
    }
  };

  const handleDeleteEditor = async (editorId: string) => {
    setEditors((prev) => prev.filter((e) => e.id !== editorId));
    try {
      await fetch(`/api/editors/${editorId}`, { method: 'DELETE' });
    } catch {}
  };

  // If not logged in, render the password-protected Login screen!
  if (!session) {
    return (
      <FlowLogin
        onLoginSuccess={setSession}
        onBackToHome={onBackToHome}
        clients={clients}
        initialRole={initialView === 'admin' ? 'admin' : 'client'}
      />
    );
  }

  // Count unread emails
  const unreadEmailCount = emails.filter((e) => !e.read).length;

  const isAdminHeader = session.role === 'admin' && adminActiveView === 'admin';

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 font-sans flex flex-col selection:bg-[#22C55E] selection:text-slate-950">
      
      {/* Top Application Header: Signature Deep Forest Brand Green across all views */}
      <header className="h-16 sm:h-20 bg-gradient-to-r from-[#032415] via-[#064e3b] to-[#032415] border-b border-[#064e3b]/80 text-white shadow-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
        
        {/* Left: Back & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-200/90 hover:text-white hover:bg-emerald-950/60 transition py-1.5 px-3 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Feviqo.com</span>
          </button>

          <div className="h-4 w-[1px] bg-[#143B27]" />

          <div className="flex items-center gap-2">
            <FeviqoHeaderLogo theme="dark" className="h-6 sm:h-7 w-auto" />
            <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full tracking-wider bg-[#0C2D1C] text-[#22C55E] border border-[#174B30]">
              FLOW
            </span>
          </div>
        </div>

        {/* Center: Strict RBAC Navigation */}
        {session.role === 'admin' ? (
          /* Admin can view Admin Panel, Editor View, and Client View */
          <div className="hidden md:flex items-center p-1 rounded-2xl shadow-inner bg-[#0A2618] border border-[#174B30]">
            <button
              onClick={() => setAdminActiveView('admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminActiveView === 'admin'
                  ? 'bg-[#22C55E] text-slate-950 shadow-md font-black'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="FEVIQO Master Admin Control Panel"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-950" />
              <span>Admin Panel</span>
            </button>

            <button
              onClick={() => setAdminActiveView('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminActiveView === 'editor'
                  ? 'bg-[#22C55E] text-slate-950 shadow-md font-black'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
              title="Inspect Editor Production Queue View"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Editor View</span>
            </button>

            <button
              onClick={() => setAdminActiveView('client')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminActiveView === 'client'
                  ? 'bg-[#22C55E] text-slate-950 shadow-md font-black'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
              title="Inspect Client Portal View"
            >
              <User className="w-3.5 h-3.5" />
              <span>Client View</span>
            </button>
          </div>
        ) : session.role === 'client' ? (
          /* Client can ONLY see Client View - no Editor or Admin view access */
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C2D1C] border border-[#174B30] text-xs font-bold text-emerald-100 shadow-xs">
            <User className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Client Workspace</span>
            <span className="text-[10px] text-emerald-300/70 font-normal">• Active Authenticated Session</span>
          </div>
        ) : (
          /* Editor can ONLY see Editor View - no Client or Admin view access */
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C2D1C] border border-[#174B30] text-xs font-bold text-emerald-100 shadow-xs">
            <Video className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Editor Workspace</span>
            <span className="text-[10px] text-emerald-300/70 font-normal">• Production Queue</span>
          </div>
        )}

        {/* Right: Active Session & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Authenticated Role Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0C2D1C] border border-[#174B30] text-[#22C55E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="capitalize">{session.role} Authenticated</span>
          </div>

          {/* Simulated Email Bell */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="p-2 rounded-xl border relative cursor-pointer transition bg-[#0C2D1C] hover:bg-[#143B27] border-[#174B30] text-white"
            title="View automated dispatched emails"
          >
            <Bell className="w-4 h-4" />
            {unreadEmailCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#22C55E] text-slate-950 text-[10px] font-black flex items-center justify-center">
                {unreadEmailCount}
              </span>
            )}
          </button>

          {/* User Badge & Sign Out Button */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-[#174B30]">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-bold leading-none text-white">{session.name}</div>
              <div className="text-[10px] capitalize text-emerald-300">{session.role} Portal</div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold bg-[#0C2D1C] hover:bg-rose-950/60 text-rose-300 border-[#174B30] hover:border-rose-700"
              title="Lock Portal & Sign Out"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Workspace Navigation Bar (Only multi-view for Admin) */}
      {session.role === 'admin' ? (
        <div className="md:hidden bg-[#061D12] border-b border-[#143B27] px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto text-white">
          <button
            onClick={() => setAdminActiveView('admin')}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1 shrink-0 ${
              adminActiveView === 'admin' ? 'bg-[#22C55E] text-slate-950' : 'bg-emerald-100 text-emerald-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => setAdminActiveView('editor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              adminActiveView === 'editor' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Editor View</span>
          </button>
          <button
            onClick={() => setAdminActiveView('client')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              adminActiveView === 'client' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Client View</span>
          </button>
        </div>
      ) : (
        <div className="md:hidden bg-[#041d11] border-b border-[#143B27] px-4 py-1.5 flex items-center justify-between text-xs font-bold text-emerald-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="capitalize">{session.role} Portal</span>
          </div>
          <span className="text-[11px] text-emerald-400/80">{session.company}</span>
        </div>
      )}

      {/* Main Workspace Body Based on Active Role and RBAC Permissions */}
      <main className="flex-1 flex flex-col">
        {/* If Role is Client: Strictly ClientWorkspace */}
        {session.role === 'client' && (
          <ClientWorkspace
            session={session}
            clientProfile={clients.find((c) => c.email.toLowerCase() === session.email.toLowerCase())}
            onUpdateSubscription={handleUpdateSubscription}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
            onAddRevisionNote={handleAddRevisionNote}
            onDeleteProject={handleDeleteProject}
            onAddFootageToProject={handleFootageAddedToProject}
            onUpdateFootageLink={handleUpdateFootageLink}
            onSendChatMessage={handleSendChatMessage}
          />
        )}

        {/* If Role is Editor: Strictly EditorWorkspace */}
        {session.role === 'editor' && (
          <EditorWorkspace
            session={session}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onEditorReplyNote={handleEditorReplyNote}
            onToggleNoteAddressed={handleToggleNoteAddressed}
            onAddEditorNote={handleAddEditorNote}
            onDeleteProject={handleDeleteProject}
            onSendChatMessage={handleSendChatMessage}
          />
        )}

        {/* If Role is Admin: Can switch between Admin Panel, Editor View, and Client View */}
        {session.role === 'admin' && (
          <>
            {adminActiveView === 'admin' && (
              <AdminWorkspace
                session={session}
                clients={clients}
                projects={projects}
                leads={leads}
                emails={emails}
                editors={editors}
                onDeleteEmail={handleDeleteEmail}
                onClearAllEmails={handleClearAllEmails}
                onAddNewEditor={handleAddNewEditor}
                onUpdateEditor={handleUpdateEditor}
                onDeleteEditor={handleDeleteEditor}
                onAddNewClient={handleAddNewClient}
                onUpdateClientStatus={handleUpdateClientStatus}
                onResetClientPassword={handleResetClientPassword}
                onDeleteClient={handleDeleteClient}
                onSwitchToClientSession={handleSwitchToClientSession}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onReassignClientEditor={handleReassignClientEditor}
                onSendChatMessage={handleSendChatMessage}
              />
            )}

            {adminActiveView === 'editor' && (
              <EditorWorkspace
                session={session}
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={setActiveProjectId}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onEditorReplyNote={handleEditorReplyNote}
                onToggleNoteAddressed={handleToggleNoteAddressed}
                onAddEditorNote={handleAddEditorNote}
                onDeleteProject={handleDeleteProject}
                onSendChatMessage={handleSendChatMessage}
              />
            )}

            {adminActiveView === 'client' && (
              <ClientWorkspace
                session={session}
                clients={clients}
                selectedClientId={adminSelectedClientId}
                onSelectClient={setAdminSelectedClientId}
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={setActiveProjectId}
                onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                onAddRevisionNote={handleAddRevisionNote}
                onDeleteProject={handleDeleteProject}
                onAddFootageToProject={handleFootageAddedToProject}
                onSendChatMessage={handleSendChatMessage}
                onUpdateSubscription={handleUpdateSubscription}
              />
            )}
          </>
        )}
      </main>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <NewProjectModal
          session={session}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {/* Dispatched Emails Modal */}
      {isEmailModalOpen && (
        <EmailModal
          emails={emails}
          onClose={() => setIsEmailModalOpen(false)}
          onSelectEmail={setSelectedEmailId}
          selectedEmailId={selectedEmailId}
        />
      )}

    </div>
  );
};
