/**
 * SEAS Central Monitoring & Administration Engine
 * Core data management layer handling local and cloud persistence orchestration.
 */

const SEAS_State = {
    currentPhase: localStorage.getItem('seas_phase') || "Registration & Ingress Phase",
    studentsPublished: localStorage.getItem('seas_students_published') === 'true',
    groupsList: JSON.parse(localStorage.getItem('seas_groups_list')) || [],
    resultsPublished: localStorage.getItem('seas_results_published') === 'true'
};

const SEAS_Admin = {
    // 1. Toggle publishing participant roster list
    toggleStudentPublish: function(status) {
        SEAS_State.studentsPublished = status;
        localStorage.setItem('seas_students_published', status);
        this.notifyUser(` Roster listing has been ${status ? 'PUBLISHED' : 'UNPUBLISHED'} successfully.`, status ? '#22c55e' : '#ef4444');
        this.syncPublicViews();
    },

    // 2. ADVANCED CORE ALGORITHM: Filters for Students, clusters them into groups of 4 or 5, and assigns engineering project scopes
    runSpecialtyMixEngine: function() {
        const rawData = localStorage.getItem('bootcamp_registrations');
        if (!rawData) {
            this.notifyUser("❌ Mixing Engine Failed: No registration datasets found.", "#ef4444");
            return;
        }

        const allParticipants = JSON.parse(rawData);
        
        // FILTER: Extract ONLY users registered explicitly as "Student"
        const eligibleStudents = allParticipants.filter(p => {
            const role = (p.role || p.type || "").toLowerCase().trim();
            return role === 'student';
        });

        if (eligibleStudents.length === 0) {
            this.notifyUser("❌ Engine Halting: Zero registered students found in local database cache.", "#ef4444");
            return;
        }

        // Project Core Scopes Array Matrix to allocate out to teams
        const engineeringProjects = [
            "Implementation of a Cloud-Hosted WebApp with CI/CD Pipelines",
            "High Availability Inter-Urban Traffic Monitor Infrastructure Deployment via Kubernetes",
            "Zero Trust Architecture Integration: The Universal Identity Gatekeeper Portal",
            "Containerized Cloud Microservices Orchestration & Multi-Tenant Network Provisioning",
            "Automated Canary Continuous Deployment Frameworks on Hybrid Cloud Infrastructure"
        ];

        // Dynamic Clustering Math: Splitting into group nodes of 4 or 5
        const students = [...eligibleStudents];
        const total = students.length;
        let targetGroupSize = 4;
        
        // If dividing by 4 leaves a remainder of 3, or if grouping by 5 leaves a cleaner balance, adjust size dynamically
        if (total % 5 === 0 || (total % 4 !== 0 && total % 5 > total % 4)) {
            targetGroupSize = 5;
        }

        const generatedTeams = [];
        let groupCounter = 1;

        while (students.length > 0) {
            // Pull the targeted chunk slice out of the array stack
            let currentChunkSize = targetGroupSize;
            
            // Cleanup check: If the remaining students are less than 4, append them to the last group to avoid tiny teams
            if (students.length < 4 && generatedTeams.length > 0) {
                const leftoverNames = students.map(s => s.full_name || s.name).join(', ');
                generatedTeams[generatedTeams.length - 1].members += `, ${leftoverNames}`;
                break;
            }

            const teamSlice = students.splice(0, currentChunkSize);
            const memberNames = teamSlice.map(s => s.full_name || s.name).join(', ');
            
            // Cyclically pick an engineering project from our matrix scope index
            const assignedProject = engineeringProjects[(groupCounter - 1) % engineeringProjects.length];

            generatedTeams.push({
                name: `Team Alpha-0${groupCounter} [Size: ${teamSlice.length}]`,
                project: assignedProject,
                members: memberNames
            });

            groupCounter++;
        }

        // Commit generated matrix arrays straight into persistent local state layers
        SEAS_State.groupsList = generatedTeams;
        localStorage.setItem('seas_groups_list', JSON.stringify(generatedTeams));
        
        this.notifyUser(`✅ Compiled ${generatedTeams.length} Engineering Teams (Size: 4-5) with assigned project manifests!`, "#a855f7");
        this.syncPublicViews();
    },

    notifyUser: function(msg, color) {
        const el = document.getElementById('statusMessage');
        if (el) {
            el.textContent = msg;
            el.style.background = color;
            el.style.color = 'white';
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 4000);
        } else {
            alert(msg);
        }
    },

    syncPublicViews: function() {
        if (typeof renderPublicClientData === 'function') {
            renderPublicClientData();
        }
    }
};

// Document initialization listeners
document.addEventListener("DOMContentLoaded", () => {
    // Synchronize administrative console click events if present inside execution workspace
    const updatePhaseBtn = document.getElementById('update-phase-btn');
    const phaseSelector = document.getElementById('phase-selector');
    const broadcastResultsBtn = document.getElementById('broadcast-results-btn');
    
    // Explicit binding strategy targeting the specialty mix engine layout triggers directly
    const mixBtn = Array.from(document.querySelectorAll('button, .btn-action')).find(el => el.textContent.includes('Specialty Mix') || el.textContent.includes('Run Specialty'));
    if (mixBtn) {
        mixBtn.removeAttribute('onclick');
        mixBtn.onclick = null;
        mixBtn.addEventListener('click', (e) => {
            e.preventDefault();
            SEAS_Admin.runSpecialtyMixEngine();
        });
    }

    if (updatePhaseBtn && phaseSelector) {
        phaseSelector.value = SEAS_State.currentPhase;
        updatePhaseBtn.addEventListener('click', () => {
            SEAS_State.currentPhase = phaseSelector.value;
            localStorage.setItem('seas_phase', SEAS_State.currentPhase);
            SEAS_Admin.notifyUser(`📍 Phase Updated: ${SEAS_State.currentPhase}`, '#3b82f6');
            SEAS_Admin.syncPublicViews();
        });
    }

    if (broadcastResultsBtn) {
        broadcastResultsBtn.addEventListener('click', () => {
            SEAS_State.resultsPublished = true;
            localStorage.setItem('seas_results_published', 'true');
            SEAS_Admin.notifyUser("🎓 Performance Metrics Released Live!", "#eab308");
            SEAS_Admin.syncPublicViews();
        });
    }

    // Force public view compilation on template initialization loop
    renderPublicClientData();
});

function renderPublicClientData() {
    const phaseView = document.getElementById('view-current-phase');
    const studentsView = document.getElementById('view-published-students');
    const groupsView = document.getElementById('view-published-groups');
    const resultsView = document.getElementById('view-published-results');

    if (phaseView) phaseView.innerHTML = `🏁 <span>${SEAS_State.currentPhase}</span>`;

    if (studentsView) {
        if (SEAS_State.studentsPublished) {
            const rawData = localStorage.getItem('bootcamp_registrations');
            const data = rawData ? JSON.parse(rawData) : [];
            if (data.length === 0) {
                studentsView.innerHTML = `<em style="color:#b4c6d0;">No registrations cached.</em>`;
            } else {
                studentsView.innerHTML = `<ul style="padding-left:15px; margin:5px 0; color:#22c55e;">
                    ${data.map(s => `<li style="margin-bottom:4px;"><strong>${s.full_name || s.name}</strong> (${s.role || 'Student'})</li>`).join('')}
                </ul>`;
            }
        } else {
            studentsView.innerHTML = `<span style="color:#ef4444; font-size:0.85rem;">🚫 Held for administrative authorization review.</span>`;
        }
    }

    if (groupsView) {
        if (SEAS_State.groupsList.length === 0) {
            groupsView.innerHTML = `<em style="color:#b4c6d0;">Awaiting administrative optimization run...</em>`;
        } else {
            groupsView.innerHTML = `<div style="display:flex; flex-direction:column; gap:10px;">
                ${SEAS_State.groupsList.map(g => `
                    <div style="background:#2c3e50; padding:10px; border-radius:5px; border-left:4px solid #a855f7;">
                        <strong style="color:#00d2ff; font-size:0.95rem; display:block;">${g.name}</strong>
                        <span style="display:block; color:#eab308; font-size:0.85rem; margin:2px 0 6px 0;">📋 Project: ${g.project}</span>
                        <span style="font-size:0.85rem; color:#ffffff; font-style:italic;">Members: ${g.members}</span>
                    </div>
                `).join('')}
            </div>`;
        }
    }

    if (resultsView) {
        if (SEAS_State.resultsPublished) {
            resultsView.innerHTML = `<div style="text-align:center; padding:8px; background:#1e293b; border-radius:4px; border:1px solid #eab308; color:#22c55e;">
                <strong>🥇 JURY STANDINGS RELEASED</strong>
            </div>`;
        } else {
            resultsView.innerHTML = `<span style="color:#ef4444; font-size:0.85rem;">⏳ Awaiting completion audits.</span>`;
        }
    }
}

window.SEAS_Admin = SEAS_Admin;
window.renderPublicClientData = renderPublicClientData;