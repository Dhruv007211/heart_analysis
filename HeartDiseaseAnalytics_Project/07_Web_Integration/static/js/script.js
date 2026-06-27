/**
 * CardioIntel - Frontend Tab Router & Live Server-Side SQL Engine
 * Developed by: Dhruv Singh
 */

document.addEventListener("DOMContentLoaded", function () {
    console.log("❤️ CardioIntel Core System: Loaded Successfully");

    // ========================================================
    // 1. TABLEAU EMBED VIZ RUNTIME INITIALIZATION
    // ========================================================
    const divElement = document.getElementById('viz1782547602228');
    if (divElement) {
        const vizElement = divElement.getElementsByTagName('object')[0];
        if (vizElement) {
            vizElement.style.width = '100%';
            vizElement.style.height = '880px';
            const scriptElement = document.createElement('script');
            scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
            vizElement.parentNode.insertBefore(scriptElement, vizElement);
            console.log("📊 Tableau Visualization Engine: Loaded");
        }
    }

    // ========================================================
    // 2. SPA TAB ROUTER SYSTEM
    // ========================================================
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    const sections = document.querySelectorAll('.content-wrapper .tab-content');

    function switchActiveTab(targetTabId) {
        sections.forEach(section => {
            if (section.id === targetTabId) {
                section.classList.add('active-content');
            } else {
                section.classList.remove('active-content');
            }
        });
    }

    switchActiveTab('dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            const targetID = this.getAttribute('data-target');
            switchActiveTab(targetID);
            console.log(`🎯 Workspace Transformed to: -> ${targetID}`);
        });
    });

    // ========================================================
    // 3. LIVE CSV SQL COMPILER PIPELINE (NEW SCHEMA)
    // ========================================================
    const txtAreaTerminal = document.getElementById('sql-terminal-textarea');
    const executeQueryBtn = document.getElementById('execute-query-btn');
    const resetTerminalBtn = document.getElementById('clear-terminal-btn');
    const tableResultView = document.getElementById('sql-runtime-table-view');
    const labelResultStats = document.getElementById('output-meta-stats');
    const globalMetricTimer = document.getElementById('response-timer');

    // Naye schema aur aapki requirements ke mutabiq updated complex templates
    const quickQueries = {
        "1": "SELECT age, sex, cp, chol, trestbps, thalch, num FROM heart_disease_uci LIMIT 10;",
        "2": "SELECT sex, COUNT(*) AS total FROM heart_disease_uci GROUP BY sex;",
        "3": "SELECT CASE WHEN age < 30 THEN '20-30' WHEN age < 40 THEN '30-40' WHEN age < 50 THEN '40-50' WHEN age < 60 THEN '50-60' ELSE '60+' END AS age_group, num, COUNT(*) AS total FROM heart_disease_uci GROUP BY age_group, num;"
    };

    // Quick Inject logic binds
    document.querySelectorAll('.tpl-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const templateId = this.getAttribute('data-query');
            if(quickQueries[templateId]) {
                txtAreaTerminal.value = quickQueries[templateId];
                runLiveSQLQuery();
            }
        });
    });

    // Flask Backend par query bhej kar real-time data fetch karne ka function
    async function runLiveSQLQuery() {
        const startTime = performance.now();
        const queryText = txtAreaTerminal.value.trim();
        tableResultView.innerHTML = "";

        if (!queryText) {
            renderTerminalError("Query cannot be empty.");
            return;
        }

        try {
            const response = await fetch('/api/execute-sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: queryText })
            });

            const result = await response.json();

            if (!result.success) {
                renderTerminalError(result.error || "Execution failed.");
                return;
            }

            const columns = result.columns;
            const rows = result.data;

            if (rows.length === 0) {
                renderTerminalError("Empty Stream: No records matched the given criteria.");
                return;
            }

            // 1. Dynamic Table Headers generation
            let headerHTML = "<tr>";
            columns.forEach(col => {
                headerHTML += `<th>${col.toUpperCase()}</th>`;
            });
            headerHTML += "</tr>";
            tableResultView.innerHTML += headerHTML;

            // 2. Data Rows generation with clinical styling suffixes
            rows.forEach(row => {
                let rowHTML = "<tr>";
                columns.forEach(col => {
                    let cellVal = (row[col] !== undefined && row[col] !== null) ? row[col] : "NULL";
                    
                    // Naye metric values ke dynamic suffixes
                    if (col === "chol" && cellVal !== "NULL") cellVal += " mg/dl";
                    if (col === "trestbps" && cellVal !== "NULL") cellVal += " mmHg";
                    
                    rowHTML += `<td>${cellVal}</td>`;
                });
                rowHTML += "</tr>";
                tableResultView.innerHTML += rowHTML;
            });

            // Timer and meta information update
            const executionTime = ((performance.now() - startTime) / 1000).toFixed(4);
            labelResultStats.innerHTML = `<span style="color: #27c93f;"><i class="fa-solid fa-check"></i> Success: ${rows.length} Rows Returned</span>`;
            globalMetricTimer.innerText = `${executionTime}s`;

        } catch (error) {
            renderTerminalError(`Network/Server Error: ${error.message}`);
        }
    }

    function renderTerminalError(errorString) {
        tableResultView.innerHTML = `<tr><td style="color: #ff5f56; font-family: monospace; padding: 20px; font-weight: bold; background: #fff3f2;" colspan="100%"><i class="fa-solid fa-triangle-exclamation"></i> ${errorString}</td></tr>`;
        labelResultStats.innerHTML = `<span style="color: #ff5f56;"><i class="fa-solid fa-xmark"></i> Engine Error</span>`;
        globalMetricTimer.innerText = "Error";
    }

    // Default startup statement running on application boot
    txtAreaTerminal.value = "SELECT age, sex, cp, chol, trestbps, thalch, num FROM heart_disease_uci LIMIT 10;";
    runLiveSQLQuery();

    // Attach Event Triggers
    executeQueryBtn.addEventListener('click', runLiveSQLQuery);
    resetTerminalBtn.addEventListener('click', function() {
        txtAreaTerminal.value = "SELECT age, sex, cp, chol, trestbps, thalch, num FROM heart_disease_uci LIMIT 10;";
        runLiveSQLQuery();
        console.log("🧹 SQL Console reset to new schema defaults.");
    });
});