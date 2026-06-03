"use client";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(function(w) {
    return w[0] ? w[0].toUpperCase() : "";
  }).join("");
}

var ROLE_COLOR = {
  PATIENT: "bg-blue-600",
  ADMIN:   "bg-purple-600",
  DOCTOR:  "bg-teal-600",
};

export default function Navbar({ title }) {
  var user      = useAuthStore(function(s) { return s.user; });
  var roleColor = (user && ROLE_COLOR[user.role]) || "bg-gray-600";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <h1 className="text-sm font-semibold text-gray-900">{title || ""}</h1>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100 ml-1">
          <div className={"w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 " + roleColor}>
            {getInitials(user && user.name)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 leading-none">
              {(user && user.name) || ""}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {(user && user.role && user.role.toLowerCase()) || ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}