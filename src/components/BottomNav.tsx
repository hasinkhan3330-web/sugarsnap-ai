import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Camera, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/today', label: 'Today', icon: Home },
  { to: '/diary', label: 'Diary', icon: BookOpen },
  { to: '/scan', label: 'Scan', icon: Camera, isCenter: true },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pt-2 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          if (tab.isCenter) {
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                className="flex flex-col items-center gap-1"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200',
                        isActive
                          ? 'bg-brand text-white scale-105'
                          : 'bg-brand text-white hover:scale-105'
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          }
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-6 w-6 transition-colors',
                      isActive ? 'text-brand' : 'text-muted-foreground'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      isActive ? 'text-brand' : 'text-muted-foreground'
                    )}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
