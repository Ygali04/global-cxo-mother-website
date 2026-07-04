import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowLeft, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '@/portal/hooks/useAuth';
import { useMyProfileLinks } from '@/portal/hooks/useProfileLinks';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, exitProxySession, switchToLinkedProfile, logout } = useAuth();
  // Multi-profile switcher: only fetched when authenticated. The hook is
  // safe to call unconditionally — useMyProfileLinks tolerates a missing
  // session and returns an empty list rather than throwing.
  const { data: linkedProfiles = [] } = useMyProfileLinks();

  const handleSwitchProfile = async (targetUserId: string, name: string): Promise<void> => {
    const next = await switchToLinkedProfile(targetUserId);
    if (next) {
      toast.success(`Switched to ${name}`);
      // A hard reload would be safer for cache invalidation, but causes
      // a flash; the React Query caches across all hooks will invalidate
      // naturally as components remount with the new user id.
      navigate('/dashboard');
    } else {
      toast.error('Could not switch profile.');
    }
  };

  const proxyAdminId = sessionStorage.getItem('gcio_proxy_admin_id');
  const isProxying = isAuthenticated && !!proxyAdminId && currentUser.id !== proxyAdminId;

  const handleReturnToAdmin = async () => {
    if (!proxyAdminId) return;
    const restored = await exitProxySession();
    if (restored) {
      toast.success(`Returned to ${restored.name}`);
      navigate('/admin/members');
    } else {
      toast.error('Admin session expired — please log in again.');
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItemsBeforeAwards = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/programs', label: 'Programs' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About Us' },
    { path: '/resources', label: 'Resources' },
  ];

  const navItemsAfterAwards = [
    { path: '/contact', label: 'Contact' },
  ];

  const awardItems = [
    { path: '/hall-of-fame', label: 'Hall of Fame' },
    { path: '/innovation-champions', label: 'Innovation Champions' },
    { path: '/lifetime-achievement', label: 'Lifetime Achievement' },
  ];

  const isAwardsActive = awardItems.some(item => location.pathname === item.path);
  const isOnAwardsPage = awardItems.some(item => location.pathname === item.path);
  const darkHeroPages = ['/programs', '/pricing', '/terms', '/privacy', '/cookie-policy'];
  const isOnDarkHeroPage = (isOnAwardsPage || darkHeroPages.includes(location.pathname)) && !isScrolled;
  const [forceDarkNav, setForceDarkNav] = useState(false);
  const [forceLightNav, setForceLightNav] = useState(false);

  // When a light overlay (e.g. the white intent form) is open on a dark-hero page,
  // forceLightNav overrides isOnDarkPage so the nav renders dark text.
  const isOnDarkPage = isOnDarkHeroPage && !forceLightNav;

  useEffect(() => {
    const update = () => {
      const dialogOverlay = document.querySelector('[data-dialog-overlay]');
      const darkGalleryOverlay = document.querySelector('[data-dark-overlay]');
      const lightOverlay = document.querySelector('[data-light-overlay]');
      setForceDarkNav((!!dialogOverlay || !!darkGalleryOverlay) && !isScrolled);
      setForceLightNav(!!lightOverlay);
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    window.addEventListener('hashchange', update);
    update();
    return () => { observer.disconnect(); window.removeEventListener('hashchange', update); };
  }, [isScrolled]);

  const hiddenPaths = ['/admin', '/login', '/signup', '/onboard'];
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <>
    <nav className={`fixed left-0 right-0 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-lg border-b border-gradient-to-r from-bg-dark/30 to-bg-light/30 shadow-lg' 
        : isOnDarkPage
        ? 'bg-transparent'
        : 'bg-transparent'
    }`} style={{ top: '0px', zIndex: 10000 }}>
      {/* <nav className={`fixed left-0 right-0 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-lg border-b border-gradient-to-r from-bg-dark/30 to-bg-light/30 shadow-lg' 
        : 'bg-transparent'
    }`} style={{ top: '64px', zIndex: 10000 }}> */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/cxo-circle-logo.png"
              alt="Global CXO Circle Logo"
              className="w-16 h-16 object-contain"
            />
            <span className={`text-xl font-bold ${(isOnDarkPage || forceDarkNav) ? 'text-white' : 'text-navy-dark'}`}>
              Global CXO Circle
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItemsBeforeAwards.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-all duration-200 hover:text-blue-600 relative ${
                  location.pathname === item.path 
                    ? 'text-blue-600' 
                    : (isOnDarkPage || forceDarkNav) 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-navy-600 to-navy-400 rounded-full"></div>
                )}
              </Link>
            ))}
            
            {/* Awards Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`text-sm font-medium transition-all duration-200 hover:text-blue-600 relative flex items-center gap-1 ${
                isAwardsActive 
                  ? 'text-blue-600' 
                  : (isOnDarkPage || forceDarkNav) 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}>
                Awards
                <ChevronDown size={16} />
                {isAwardsActive && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-navy-600 to-navy-400 rounded-full"></div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                {awardItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className="flex w-full items-center px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navItemsAfterAwards.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-all duration-200 hover:text-blue-600 relative ${
                  location.pathname === item.path 
                    ? 'text-blue-600' 
                    : (isOnDarkPage || forceDarkNav) 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-navy-600 to-navy-400 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Auth button (desktop) */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={`text-sm font-medium transition-all duration-200 hover:text-blue-600 flex items-center gap-1 ${
                  (isOnDarkPage || forceDarkNav) ? 'text-white' : 'text-gray-700'
                }`}>
                  {currentUser.name}
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex w-full items-center px-2 py-2 text-sm cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {(currentUser.tier === 'admin' || currentUser.tier === 'dev') && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex w-full items-center px-2 py-2 text-sm cursor-pointer">
                        Admin Console
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex w-full items-center px-2 py-2 text-sm cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {/* Multi-profile switcher: shows linked profiles for the current
                      user. Each click swaps the JWT into the target identity via
                      the /auth/switch-profile endpoint. */}
                  {linkedProfiles.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Linked Profiles
                      </DropdownMenuLabel>
                      {linkedProfiles.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() =>
                            void handleSwitchProfile(p.linked_user_id, p.linked_user_name)
                          }
                          className="flex flex-col items-start gap-0.5 px-2 py-2 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Repeat className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-sm font-medium text-slate-900 truncate">
                              {p.linked_user_name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 pl-5 truncate w-full">
                            {p.relationship_label
                              ? p.relationship_label
                              : p.linked_user_email}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      try { await logout(); } catch {}
                      window.location.href = '/';
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              (isOnDarkPage || forceDarkNav)
                ? 'hover:bg-white/10 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className={`md:hidden backdrop-blur-lg border-t rounded-b-lg shadow-lg ${
            (isOnDarkPage || forceDarkNav) 
              ? 'bg-gray-900/95 border-gray-700' 
              : 'bg-white/95 border-gray-200'
          }`}>
            <div className="px-4 py-6 space-y-4">
              {navItemsBeforeAwards.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-base font-medium transition-colors ${
                    location.pathname === item.path 
                      ? 'text-blue-600' 
                      : (isOnDarkPage || forceDarkNav) 
                      ? 'text-white hover:text-blue-400' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Awards Section for Mobile */}
              <div className="space-y-2">
                <div className={`text-base font-medium pb-1 ${
                  (isOnDarkPage || forceDarkNav) ? 'text-white' : 'text-gray-700'
                }`}>Awards</div>
                {awardItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block text-sm font-medium pl-4 transition-colors ${
                      location.pathname === item.path 
                        ? 'text-blue-600' 
                        : (isOnDarkPage || forceDarkNav) 
                        ? 'text-gray-300 hover:text-blue-400' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {navItemsAfterAwards.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-600'
                      : isOnDarkPage
                      ? 'text-white hover:text-blue-400'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile auth */}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-base font-semibold text-blue-600 hover:text-blue-700 pt-2 border-t border-gray-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    {isProxying && (
      <div
        className="fixed left-0 right-0 bg-amber-400 text-amber-900 text-sm font-medium flex items-center justify-center gap-4 py-2 px-4"
        style={{ top: '96px', zIndex: 9999 }}
      >
        <span>
          Viewing as: {currentUser.name} ({currentUser.tier})
        </span>
        <button
          onClick={handleReturnToAdmin}
          className="inline-flex items-center gap-1 rounded bg-amber-600 px-3 py-1 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Return to Admin
        </button>
      </div>
    )}
    </>
  );
};

export default Navigation;
