import api from "@/lib/api";

export async function getDoctors() {
  var res = await api.get("/admin/doctors");
  return res.data.data;
}

export async function createDoctor(data) {
  var res = await api.post("/admin/doctors", data);
  return res.data.data;
}

export async function updateDoctor(id, data) {
  var res = await api.patch("/doctors/" + id, data);
  return res.data.data;
}

export async function toggleAvailability(id, available) {
  var res = await api.patch("/doctors/" + id, { available: available });
  return res.data.data;
}