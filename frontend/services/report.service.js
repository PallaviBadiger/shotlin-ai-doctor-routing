import api from "@/lib/api";

export async function uploadReport(formData) {
  var res = await api.post("/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function extractText(reportId, manualTranscript) {
  var res = await api.post("/reports/" + reportId + "/extract-text", {
    manualTranscript: manualTranscript || "",
  });
  return res.data.data;
}

export async function analyzeReport(reportId) {
  var res = await api.post("/reports/" + reportId + "/analyze");
  return res.data.data;
}

export async function getMyReports() {
  var res = await api.get("/reports/my");
  return res.data.data;
}

export async function getReportById(id) {
  var res = await api.get("/reports/" + id);
  return res.data.data;
}

export async function getAllReports() {
  var res = await api.get("/admin/reports");
  return res.data.data;
}

export async function assignDoctor(reportId, doctorProfileId) {
  var res = await api.patch("/admin/reports/" + reportId + "/assign-doctor", { doctorProfileId });
  return res.data.data;
}

export async function reanalyzeReport(reportId) {
  var res = await api.post("/admin/reports/" + reportId + "/reanalyze");
  return res.data.data;
}

export async function getAssignedReports() {
  var res = await api.get("/doctor/reports");
  return res.data.data;
}

export async function markReviewed(reportId) {
  var res = await api.patch("/doctor/reports/" + reportId + "/mark-reviewed");
  return res.data.data;
}