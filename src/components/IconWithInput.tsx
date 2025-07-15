import type { LucideIcon } from "lucide-react";
import { Input } from "./ui/input";

type InputWithIconProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
};
export function InputWithIcon({ icon: Icon, ...props }: InputWithIconProps) {
  return (
    <div className="relative m-3">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input className="pl-10" {...props} />
    </div>
  );
}
