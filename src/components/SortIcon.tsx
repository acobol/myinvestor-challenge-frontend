import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortIconProps {
  sorted: false | "asc" | "desc";
}

export function SortIcon({ sorted }: SortIconProps) {
  if (sorted === "asc") return <ArrowUp className="ml-1 inline size-3.5" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 inline size-3.5" />;
  return <ArrowUpDown className="ml-1 inline size-3.5 opacity-40" />;
}
