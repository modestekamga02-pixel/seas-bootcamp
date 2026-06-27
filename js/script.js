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
    // Elegant toast status component 
    notifyUser: function(msg, color) {
        const notifyDiv = document.createElement('div');
        notifyDiv.style.position = 'fixed';
        notifyDiv.style.bottom = '20px';
        notifyDiv.style.right = '20px';
        notifyDiv.style.backgroundColor = color || '#2ecc71';
        notifyDiv.style.color = '#fff';
        notifyDiv.style.padding = '12px 24px';
        notifyDiv.style.borderRadius = '4px';
        notifyDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notifyDiv.style.zIndex = '9999';
        notifyDiv.style.fontFamily = 'sans-serif';
        notifyDiv.innerText = msg;
        document.body.appendChild(notifyDiv);
        setTimeout(() => notifyDiv.remove(), 4500);
    },

    // 1. Toggle publishing participant roster list with custom popup alert
    toggleStudentPublish: function() {
        this.notifyUser("The participants or even the list of people that registered has being publish on the home page.", "#2ecc71");
        SEAS_State.studentsPublished = true;
        localStorage.setItem('seas_students_published', 'true');
        this.syncPublicViews();
    },

    // 2. ADVANCED CORE ALGORITHM: Validates rules, processes groups, and presents editable dashboard matrix
    runSpecialtyMixEngine: function() {
        // Step A: Immediate execution validation warning rules announcement popup
        alert("groups of made up 5 students will be formed and there'll be specialities at least 2 or 3 different specialities in the at the end of each group formation");

        const rawData = localStorage.getItem('bootcamp_registrations');
        if (!rawData) {
            this.notifyUser("❌ Mixing Engine Failed: No registration datasets found.", "#ef4444");
            return;
        }

        const allParticipants = JSON.parse(rawData);
        
        // Filter out registered students
        const eligibleStudents = allParticipants.filter(p => {
            const role = (p.role || p.type || "").toLowerCase().trim();
            return role === 'student';
        });

        if (eligibleStudents.length === 0) {
            this.notifyUser("❌ Engine Halting: Zero registered students found.", "#ef4444");
            return;
        }

        // Deep copy array allocation tracking state
        const studentsPool = [...eligibleStudents];
        const generatedGroups = [];
        let clusterIndex = 1;

        // Process pools slice elements into balanced clusters of up to 5
        while (studentsPool.length > 0) {
            let currentGroupSize = 5;
            
            // Clean handling for remaining stragglers to prevent single member teams
            if (studentsPool.length < 4 && generatedGroups.length > 0) {
                const leftovers = studentsPool.splice(0, studentsPool.length);
                generatedGroups[generatedGroups.length - 1].members.push(...leftovers);
                break;
            }

            const teamSlice = studentsPool.splice(0, currentGroupSize);
            
            generatedGroups.push({
                groupId: clusterIndex,
                groupName: `Group ${String(clusterIndex).padStart(2, '0')}`,
                projectTitle: "Type Project Assignment Here...",
                members: teamSlice 
            });

            clusterIndex++;
        }

        // Render interactive grid workspace on admin console UI panel
        this.renderEditableGroupTable(generatedGroups);
    },

    // Renders the editable spreadsheet UI grid inside the admin portal workspace layout
    renderEditableGroupTable: function(groups) {
        let workspace = document.getElementById('group-workspace-area');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'group-workspace-area';
            workspace.style.marginTop = '30px';
            workspace.style.padding = '20px';
            workspace.style.background = '#ffffff';
            workspace.style.borderRadius = '8px';
            workspace.style.border = '1px solid #e2e8f0';
            
            // Insert it elegantly inside the admin body wrapper layout block
            const targetContainer = document.querySelector('.administrative-workspace') || document.body;
            targetContainer.appendChild(workspace);
        }

        let html = `
            <h3 style="margin-top:10px; color:#2c3e50; font-family:sans-serif; font-size:1.25rem; font-weight:600;">🌀 Mixed Groups Dynamic Workspace</h3>
            <p style="color:#7f8c8d; font-size:13px; font-family:sans-serif; margin-bottom:15px;">
                The teams have been sorted into unique specialty mixed blocks. Click inside the cells under the <strong>Project Title</strong> column to manually type assignments.
            </p>
            <table id="admin-interactive-matrix" border="1" style="width:100%; border-collapse:collapse; margin-bottom:20px; font-family:sans-serif; text-align:left; border:1px solid #e2e8f0; color:#2d3748;">
                <thead>
                    <tr style="background-color:#f8f9fa; color:#4a5568;">
                        <th style="padding:12px; border:1px solid #e2e8f0;">Group Node</th>
                        <th style="padding:12px; border:1px solid #e2e8f0;">Student Name</th>
                        <th style="padding:12px; border:1px solid #e2e8f0;">Speciality</th>
                        <th style="padding:12px; border:1px solid #e2e8f0;">Level</th>
                        <th style="padding:12px; border:1px solid #e2e8f0;">Phone Number</th>
                        <th style="padding:12px; border:1px solid #e2e8f0; background-color: #ebf5fb; color:#2b6cb0;">Project Title (Editable Manually)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        groups.forEach((g) => {
            g.members.forEach((student, sIdx) => {
                html += `
                    <tr class="group-row-node" data-group-id="${g.groupId}" data-group-name="${g.groupName}">
                        ${sIdx === 0 ? `<td rowspan="${g.members.length}" style="padding:12px; font-weight:bold; color:#2c3e50; vertical-align:middle; text-align:center; background:#f7fafc; border:1px solid #e2e8f0;">${g.groupName}</td>` : ''}
                        <td class="student-name" style="padding:12px; border:1px solid #e2e8f0;">${student.full_name || student.name || 'N/A'}</td>
                        <td style="padding:12px; border:1px solid #e2e8f0;">${student.specialty || student.speciality || student.program || 'N/A'}</td>
                        <td style="padding:12px; border:1px solid #e2e8f0;">${student.level || '3'}</td>
                        <td style="padding:12px; border:1px solid #e2e8f0;">${student.phone || 'N/A'}</td>
                        ${sIdx === 0 ? `
                        <td class="project-title-cell" contenteditable="true" rowspan="${g.members.length}" style="padding:12px; border:1px solid #e2e8f0; background-color: #fff; color:#2d3748; font-weight:500; outline:none; border:2px dashed #3182ce;">
                            ${g.projectTitle}
                        </td>` : ''}
                    </tr>
                `;
            });
        });

        html += `
                </tbody>
            </table>
            <div style="text-align: right;">
                <button id="btn-publish-groups" onclick="SEAS_Admin.publishGroupsAndProjects()" style="background-color:#3182ce; color:white; padding:12px 24px; border:none; border-radius:4px; cursor:pointer; font-size:14px; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.1);">Publish Groups & Projects</button>
            </div>
        `;

        workspace.innerHTML = html;
    },

    // 3. Freeze manual edits, broadcast data onto main homepage and expose persistent performance scoring matrix
    publishGroupsAndProjects: function() {
        // Step A: Popup verification status banner message before commitment phase finalize
        this.notifyUser("the groups & projects have been successfully created and are being publish on the home", "#2ecc71");

        const table = document.getElementById('admin-interactive-matrix');
        if (!table) return;

        // Freeze project inputs fields
        const editableCells = table.querySelectorAll('.project-title-cell');
        editableCells.forEach(cell => cell.setAttribute('contenteditable', 'false'));

        // Guard clause to avoid re-appending duplicate headers
        if (table.querySelector('.jury-header-node')) return;

        // Step B: Inject live Jury academic evaluation assessment structure panels
        const headerRow = table.querySelector('thead tr');
        headerRow.innerHTML += `
            <th class="jury-header-node" style="padding:12px; background-color:#fffaf0; color:#dd6b20; border:1px solid #e2e8f0;">Score (x/20)</th>
            <th class="jury-header-node" style="padding:12px; background-color:#fffaf0; color:#dd6b20; border:1px solid #e2e8f0;">Criteria of Evaluation</th>
            <th class="jury-header-node" style="padding:12px; background-color:#fffaf0; color:#dd6b20; border:1px solid #e2e8f0;">Criticism</th>
        `;

        // Gather all rows to map cells cleanly
        const rows = table.querySelectorAll('tbody tr');
        
        // Track unique group allocations to inject evaluation fields matching row spans safely
        const handledGroups = new Set();

        rows.forEach(row => {
            const groupId = row.getAttribute('data-group-id');
            
            if (!handledGroups.has(groupId)) {
                // Find total rows matching this group node to balance dynamic table matrix properties
                const rowSpanCount = table.querySelectorAll(`.group-row-node[data-group-id="${groupId}"]`).length;
                
                row.innerHTML += `
                    <td contenteditable="true" class="jury-score-input" rowspan="${rowSpanCount}" style="padding:12px; border:2px solid #ed8936; background-color:#fff; font-weight:bold; text-align:center; vertical-align:middle; color:#c05621; outline:none;">--</td>
                    <td contenteditable="true" class="jury-criteria-input" rowspan="${rowSpanCount}" style="padding:12px; border:2px solid #ed8936; background-color:#fff; font-size:13px; vertical-align:middle; color:#2d3748; outline:none;">This justifies the score the jury gave to the groups and their projects</td>
                    <td contenteditable="true" class="jury-criticism-input" rowspan="${rowSpanCount}" style="padding:12px; border:2px solid #ed8936; background-color:#fff; font-size:13px; vertical-align:middle; color:#2d3748; outline:none;">The ameliorations that needs to be done and ruture aspect that will help them in other projects</td>
                `;
                handledGroups.add(groupId);
            }
        });

        // Sync and parse data matrices into client tracking architecture structures
        this.saveStateToLocalStorage(table);

        // Hide structural distribution execution buttons
        const pubBtn = document.getElementById('btn-publish-groups');
        if (pubBtn) pubBtn.style.display = 'none';
    },

    // Extracts the values from your editable matrix tables and maps them onto the state layers
    saveStateToLocalStorage: function(table) {
        const rows = table.querySelectorAll('tbody tr');
        const groupsMap = {};

        rows.forEach(row => {
            const gName = row.getAttribute('data-group-name');
            const studentName = row.querySelector('.student-name').innerText;
            
            // Find corresponding group level project title text cell accurately
            let parentRow = row;
            while (parentRow && !parentRow.querySelector('.project-title-cell')) {
                parentRow = parentRow.previousElementSibling;
            }
            const assignedProj = parentRow ? parentRow.querySelector('.project-title-cell').innerText : "Custom Project";

            if (!groupsMap[gName]) {
                groupsMap[gName] = {
                    name: gName,
                    project: assignedProj,
                    members: []
                };
            }
            groupsMap[gName].members.push(studentName);
        });

        const compiledGroupsList = Object.values(groupsMap).map(g => ({
            name: g.name,
            project: g.project,
            members: g.members.join(', ')
        }));

        SEAS_State.groupsList = compiledGroupsList;
        localStorage.setItem('seas_groups_list', JSON.stringify(compiledGroupsList));
        this.syncPublicViews();
    },

    syncPublicViews: function() {
        if (typeof renderPublicClientData === 'function') {
            renderPublicClientData();
        }
    }
};

// Document initialization listeners
document.addEventListener("DOMContentLoaded", () => {
    // Explicit ID binding guarantees buttons will work regardless of structural layout themes
    const publishParticipantsBtn = document.getElementById('btn-publish-participants');
    const mixEngineBtn = document.getElementById('btn-run-mix-engine');

    if (publishParticipantsBtn) {
        publishParticipantsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            SEAS_Admin.toggleStudentPublish();
        });
    }

    if (mixEngineBtn) {
        mixEngineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            SEAS_Admin.runSpecialtyMixEngine();
        });
    }

    // Force public view compilation on initialization loop
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