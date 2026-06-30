/**
 * Dashboard charts and analytics
 */

const CHART_COLORS = [
  "#4f46e5",
  "#15a34a",
  "#f59e0b",
  "#e11d48",
  "#0ea5e9",
  "#8b5cf6",
  "#14b8a6",
  "#94a3b8",
];

const CHART_PRIMARY = "#4f46e5";

let _dashboardCharts = [];

function destroyDashboardCharts() {
  _dashboardCharts.forEach((c) => c.destroy());
  _dashboardCharts = [];
}

function chartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.font.family = '"Inter", system-ui, sans-serif';
  Chart.defaults.color = "#64748b";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.padding = 16;
}

function addChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  _dashboardCharts.push(new Chart(canvas, config));
}

function countBy(items, keyFn) {
  const map = {};
  items.forEach((item) => {
    const key = keyFn(item);
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

function formatMoney(n) {
  if (n == null) return "0";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function doughnutConfig(labels, data, colors) {
  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || CHART_COLORS.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom" },
      },
    },
  };
}

function barConfig(labels, data, color) {
  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: color || CHART_PRIMARY,
        borderRadius: 8,
        maxBarThickness: 46,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  };
}

function lineConfig(labels, data) {
  return {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: CHART_PRIMARY,
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: CHART_PRIMARY,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true },
      },
    },
  };
}

function initDashboardCharts() {
  destroyDashboardCharts();
  if (!window.Chart) return;
  chartDefaults();

  const depts = getAll("departments");
  const emps = getAll("employees");
  const followups = getAll("followups");
  const statuses = getAll("followup_status");
  const attendance = getAll("attendance");
  const leaveRequests = getAll("leave_requests");
  const payroll = getAll("payroll");
  const applicants = getAll("applicants");

  // Employees by department
  const deptLabels = depts.map((d) => d.name);
  const deptCounts = depts.map((d) => emps.filter((e) => e.department_id === d.id).length);
  const unassigned = emps.filter((e) => !e.department_id).length;
  if (unassigned) {
    deptLabels.push("Unassigned");
    deptCounts.push(unassigned);
  }
  addChart("chartDeptEmployees", doughnutConfig(deptLabels, deptCounts));

  // Employment status
  const statusLabels = { active: "Active", on_leave: "On Leave", suspended: "Suspended", resigned: "Resigned" };
  const statusCounts = countBy(emps, (e) => e.employment_status);
  const empStatusLabels = Object.keys(statusCounts).map((k) => statusLabels[k] || k);
  const empStatusData = Object.values(statusCounts);
  addChart("chartEmpStatus", doughnutConfig(empStatusLabels, empStatusData, ["#15a34a", "#f59e0b", "#e11d48", "#94a3b8"]));

  // Follow-ups by status
  const fuByStatus = {};
  followups.forEach((f) => {
    const s = statuses.find((st) => st.id === f.status_id);
    const name = s ? s.name : "Unknown";
    fuByStatus[name] = (fuByStatus[name] || 0) + 1;
  });
  addChart("chartFollowups", barConfig(Object.keys(fuByStatus), Object.values(fuByStatus), CHART_PRIMARY));

  // Attendance breakdown
  const attLabels = { present: "Present", absent: "Absent", late: "Late", half_day: "Half Day", remote: "Remote" };
  const attCounts = countBy(attendance, (a) => a.status);
  addChart(
    "chartAttendance",
    barConfig(
      Object.keys(attCounts).map((k) => attLabels[k] || k),
      Object.values(attCounts),
      "#15a34a"
    )
  );

  // Leave requests
  const leaveLabels = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
  const leaveCounts = countBy(leaveRequests, (r) => r.status);
  addChart(
    "chartLeave",
    doughnutConfig(
      Object.keys(leaveCounts).map((k) => leaveLabels[k] || k),
      Object.values(leaveCounts),
      ["#f59e0b", "#15a34a", "#e11d48"]
    )
  );

  // Payroll trend by month
  const payrollByMonth = {};
  payroll.forEach((p) => {
    const month = p.payroll_month ? p.payroll_month.slice(0, 7) : "Unknown";
    payrollByMonth[month] = (payrollByMonth[month] || 0) + Number(p.net_salary || 0);
  });
  const payrollMonths = Object.keys(payrollByMonth).sort();
  addChart("chartPayroll", lineConfig(payrollMonths, payrollMonths.map((m) => payrollByMonth[m])));

  // Applicants pipeline
  const appLabels = { applied: "Applied", interview: "Interview", accepted: "Accepted", rejected: "Rejected" };
  const appCounts = countBy(applicants, (a) => a.status);
  addChart(
    "chartApplicants",
    barConfig(
      Object.keys(appCounts).map((k) => appLabels[k] || k),
      Object.values(appCounts),
      "#8b5cf6"
    )
  );

  // Follow-up priority
  const priLabels = { 1: "High", 2: "Medium", 3: "Low" };
  const priCounts = countBy(followups, (f) => String(f.priority_level));
  addChart(
    "chartPriority",
    doughnutConfig(
      Object.keys(priCounts).map((k) => priLabels[k] || k),
      Object.values(priCounts),
      ["#e11d48", "#f59e0b", "#4f46e5"]
    )
  );
}
