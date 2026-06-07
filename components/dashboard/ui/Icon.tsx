import {
  AlertTriangle,
  Bell,
  Box,
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  CircleDollarSign,
  CreditCard,
  Edit3,
  Ellipsis,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  LayoutGrid,
  List,
  LogOut,
  Search,
  Settings,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";

const ICONS = {
  alert: AlertTriangle,
  arrowRight: ChevronRight,
  bell: Bell,
  box: Box,
  card: CreditCard,
  calendar: CalendarDays,
  check: Check,
  copy: Copy,
  edit: Edit3,
  eye: Eye,
  eyeOff: EyeOff,
  home: Home,
  key: KeyRound,
  money: CircleDollarSign,
  more: Ellipsis,
  search: Search,
  settings: Settings,
  trash: Trash2,
  vault: KeyRound,
  dashboard: LayoutGrid,
  grid: LayoutGrid,
  list: List,
  logout: LogOut,
  x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  className?: string;
  name: IconName;
  size?: number;
};

export function Icon({ className, name, size = 16 }: IconProps) {
  const Component = ICONS[name];

  return <Component aria-hidden="true" className={className} size={size} strokeWidth={1.8} />;
}
