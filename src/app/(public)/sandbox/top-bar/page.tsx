'use client';

import { useState } from 'react';
import {
  Menu, Search, Bell, ChevronLeft, Sun, Moon, Monitor,
  Plus, Settings, Filter, MoreHorizontal,
} from 'lucide-react';
import TopBar from '@/components/navigation/TopBar';
import { useTheme } from '@/components/providers/ThemeProvider';
import IconButton from '@/components/atoms/IconButton';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';

export default function TopBarSandbox() {
  const { preference, setPreference, resolved } = useTheme();
  const [search, setSearch] = useState('');

  const ThemeIcon = preference === 'system' ? Monitor : resolved === 'dark' ? Moon : Sun;

  return (
    <div className="min-h-[200vh] bg-bg-base">
      {/* Main TopBar — the one you'd actually use */}
      <TopBar
        leading={
          <div className="flex items-center gap-3">
            <IconButton
              label="Open menu"
              icon={<Menu />}
              variant="ghost"
              size="sm"
              className="md:hidden"
            />
            <BrandLogo />
          </div>
        }
        center={
          <Input
            leadingIcon={<Search />}
            placeholder="Search villas, residents, bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
        actions={
          <>
            <IconButton
              label="Notifications"
              icon={
                <div className="relative">
                  <Bell />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger ring-2 ring-bg-base" />
                </div>
              }
              variant="ghost"
              size="md"
            />
            <IconButton
              label="Toggle theme"
              icon={<ThemeIcon />}
              variant="ghost"
              size="md"
              onClick={() => {
                const next = preference === 'system' ? 'light' : preference === 'light' ? 'dark' : 'system';
                setPreference(next);
              }}
              showTooltip
            />
            <Avatar size="sm" name="Admin User" status="online" />
          </>
        }
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header>
          <h1 className="text-h1 text-text-primary">TopBar</h1>
          <p className="text-body-lg text-text-secondary mt-2">
            The persistent strip at the top. Scroll down to see the glass effect
            kick in.
          </p>
        </header>

        <Card padding="md" variant="sunken">
          <p className="text-body text-text-primary mb-2">💡 Try this:</p>
          <ul className="text-body-sm text-text-secondary space-y-1 ml-4">
            <li>• Scroll down — top bar gets glass effect (blur + transparency)</li>
            <li>• Notice content slides UNDER the bar, not behind it</li>
            <li>• On mobile, the search bar hides (it&apos;s desktop-only by default)</li>
            <li>• Tap the theme icon to cycle System → Light → Dark</li>
          </ul>
        </Card>

        {/* Other TopBar variants */}
        <section className="space-y-4">
          <h2 className="text-h3 text-text-primary">Variants</h2>

          {/* Just title */}
          <Card padding="none" className="overflow-hidden">
            <TopBar
              title="Just a title"
              subtitle="With optional subtitle"
              bordered={false}
              glassOnScroll={false}
              className="relative! top-auto!"
            />
          </Card>

          {/* Back button */}
          <Card padding="none" className="overflow-hidden">
            <TopBar
              leading={
                <IconButton
                  label="Back"
                  icon={<ChevronLeft />}
                  variant="ghost"
                  size="sm"
                />
              }
              title="Villa 39"
              subtitle="Bahadur Singh • 1,200 sqft"
              actions={
                <>
                  <IconButton
                    label="Settings"
                    icon={<Settings />}
                    variant="ghost"
                  />
                  <IconButton
                    label="More"
                    icon={<MoreHorizontal />}
                    variant="ghost"
                  />
                </>
              }
              bordered={false}
              glassOnScroll={false}
              className="!relative !top-auto"
            />
          </Card>

          {/* With CTA action */}
          <Card padding="none" className="overflow-hidden">
            <TopBar
              title="Master Ledger"
              subtitle="47 villas • 12 defaulters"
              actions={
                <>
                  <IconButton
                    label="Filter"
                    icon={<Filter />}
                    variant="ghost"
                    size="sm"
                  />
                  <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                    Generate Bills
                  </Button>
                </>
              }
              bordered={false}
              glassOnScroll={false}
              className="relative! top-auto!"
            />
          </Card>

          {/* Compact mode */}
          <Card padding="none" className="overflow-hidden">
            <TopBar
              title="Compact mode"
              actions={<Badge variant="brand" size="sm">Beta</Badge>}
              compact
              bordered={false}
              glassOnScroll={false}
              className="relative! top-auto!"
            />
          </Card>

          {/* Mobile-style (with menu) */}
          <Card padding="none" className="overflow-hidden">
            <TopBar
              leading={
                <IconButton
                  label="Open menu"
                  icon={<Menu />}
                  variant="ghost"
                  size="sm"
                />
              }
              title="Bills"
              actions={
                <>
                  <IconButton label="Notifications" icon={<Bell />} variant="ghost" size="sm" />
                  <Avatar size="sm" name="Admin User" />
                </>
              }
              bordered={false}
              glassOnScroll={false}
              className="!relative !top-auto"
            />
          </Card>
        </section>

        {/* Filler to test scroll behavior */}
        <section className="space-y-4">
          <h2 className="text-h3 text-text-primary">Scroll down to test glass effect</h2>
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} padding="md">
              <p className="text-h4 text-text-primary">Content block {i + 1}</p>
              <p className="text-body-sm text-text-secondary mt-1">
                Watch the top bar as you scroll. At scroll=0, it&apos;s solid. After
                4px, it becomes translucent with blur. Content slides beneath
                it — premium effect, no perf hit.
              </p>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}

// ─── Brand logo ───
function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-(image:--gradient-brand) flex items-center justify-center shadow-md">
        <span className="font-bold text-white text-body-sm">G</span>
      </div>
      <span className="hidden md:inline text-body font-bold text-text-primary">
        GDV Society
      </span>
    </div>
  );
}