"use client";

import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import AvatarGroup from "@/components/molecules/AvatarGroup";
import Link from "next/link";

export default function AvatarsSandbox() {
  const users = [
    { name: "Bahadur Singh", src: null },
    { name: "Priya Sharma", src: null },
    { name: "Ramesh Kumar", src: null },
    { name: "Anita Verma", src: null },
    { name: "Vikram Reddy", src: null },
    { name: "Sanjay Patel", src: null },
    { name: "Meera Iyer", src: null },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Avatar</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          User identity with smart fallback chain: image → initials → icon.
        </p>
      </header>

      <Section title="Sizes">
        <div className="flex items-end gap-3">
          <Avatar size="xs" name="Bahadur Singh" />
          <Avatar size="sm" name="Bahadur Singh" />
          <Avatar size="md" name="Bahadur Singh" />
          <Avatar size="lg" name="Bahadur Singh" />
          <Avatar size="xl" name="Bahadur Singh" />
          <Avatar size="2xl" name="Bahadur Singh" />
        </div>
        <p className="text-body-sm text-text-muted mt-3">
          xs 24px • sm 32px • md 40px • lg 48px • xl 64px • 2xl 96px
        </p>
      </Section>

      <Section title="Initials Fallback (deterministic colors)">
        <div className="flex flex-wrap gap-3">
          {users.map((u) => (
            <Avatar key={u.name} name={u.name} size="md" />
          ))}
        </div>
        <p className="text-body-sm text-text-muted mt-3">
          Each name hashes to a consistent color. Bahadur is always the same
          shade.
        </p>
      </Section>

      {/* ─── No Name (icon fallback) ─── */}
      <Section title="Icon Fallback (no name, no image)">
        <div className="flex items-end gap-3">
          <Avatar size="xs" />
          <Avatar size="sm" />
          <Avatar size="md" />
          <Avatar size="lg" />
          <Avatar size="xl" />
        </div>
      </Section>

      {/* ─── With Image (working URL) ─── */}
      <Section title="With Image (and broken URL fallback)">
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-center space-y-1">
            <Avatar
              size="lg"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces"
              name="John Doe"
            />
            <p className="text-body-sm text-text-muted">Working URL</p>
          </div>

          <div className="text-center space-y-1">
            <Avatar
              size="lg"
              src="https://invalid-url-that-will-fail.com/img.png"
              name="Bahadur Singh"
            />
            <p className="text-body-sm text-text-muted">
              Broken URL → initials
            </p>
          </div>

          <div className="text-center space-y-1">
            <Avatar size="lg" src="" name="Priya Sharma" />
            <p className="text-body-sm text-text-muted">Empty src → initials</p>
          </div>
        </div>
      </Section>

      {/* ─── Shapes ─── */}
      <Section title="Shapes">
        <div className="flex items-center gap-3">
          <Avatar size="lg" name="Bahadur Singh" shape="circle" />
          <Avatar size="lg" name="Bahadur Singh" shape="square" />
        </div>
      </Section>

      {/* ─── Status Dots ─── */}
      <Section title="Status Indicators">
        <div className="flex flex-wrap items-end gap-4">
          {(["online", "offline", "busy", "away"] as const).map((status) => (
            <div key={status} className="text-center space-y-2">
              <Avatar size="lg" name="Bahadur Singh" status={status} />
              <p className="text-body-sm text-text-secondary capitalize">
                {status}
              </p>
            </div>
          ))}
        </div>

        {/* Status at small size */}
        <div className="flex items-end gap-3 mt-4">
          <Avatar size="xs" name="Bahadur Singh" status="online" />
          <Avatar size="sm" name="Bahadur Singh" status="online" />
          <Avatar size="md" name="Bahadur Singh" status="online" />
          <Avatar size="lg" name="Bahadur Singh" status="online" />
          <Avatar size="xl" name="Bahadur Singh" status="online" />
          <Avatar size="2xl" name="Bahadur Singh" status="online" />
        </div>
      </Section>

      {/* ─── Rings ─── */}
      <Section title="Ring Border (highlights)">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar size="lg" name="Bahadur Singh" ring="none" />
          <Avatar size="lg" name="Priya Sharma" ring="subtle" />
          <Avatar size="lg" name="Ramesh Kumar" ring="brand" />
          <Avatar size="lg" name="Anita Verma" ring="success" />
          <Avatar size="lg" name="Vikram Reddy" ring="danger" />
        </div>
      </Section>

      {/* ─── AvatarGroup ─── */}
      <Section title="Avatar Group (stacked)">
        <div className="space-y-6">
          <div>
            <p className="text-body-sm text-text-muted mb-2">All visible</p>
            <AvatarGroup size="md">
              {users.slice(0, 4).map((u) => (
                <Avatar key={u.name} name={u.name} />
              ))}
            </AvatarGroup>
          </div>

          <div>
            <p className="text-body-sm text-text-muted mb-2">
              Max 3, overflow +4
            </p>
            <AvatarGroup size="md" max={3}>
              {users.map((u) => (
                <Avatar key={u.name} name={u.name} />
              ))}
            </AvatarGroup>
          </div>

          <div>
            <p className="text-body-sm text-text-muted mb-2">
              Tight spacing, larger
            </p>
            <AvatarGroup size="lg" max={4} spacing="tight">
              {users.map((u) => (
                <Avatar key={u.name} name={u.name} />
              ))}
            </AvatarGroup>
          </div>

          <div>
            <p className="text-body-sm text-text-muted mb-2">
              Loose spacing, small
            </p>
            <AvatarGroup size="sm" max={5} spacing="loose">
              {users.map((u) => (
                <Avatar key={u.name} name={u.name} />
              ))}
            </AvatarGroup>
          </div>
        </div>
      </Section>

      {/* ─── asChild (as Link) ─── */}
      <Section title="As Child (Link to profile)">
        <Avatar
          size="lg"
          name="Bahadur Singh"
          ring="subtle"
          asChild
          className="cursor-pointer hover:ring-brand-primary transition-all"
        >
          <Link href={"/sandbox"}>{/* clickable */}</Link>
        </Avatar>
        <p className="text-body-sm text-text-muted">
          Inspect DOM — renders as &lt;a&gt;. Hover to see ring color change.
        </p>
      </Section>

      {/* ─── Real-world: Top bar user menu ─── */}
      <Section title="Real-World: Top Bar User Menu">
        <Card padding="sm" className="max-w-md">
          <div className="flex items-center gap-3">
            <Avatar size="md" name="Bahadur Singh" status="online" />
            <div className="flex-1 min-w-0">
              <p className="text-body text-text-primary font-medium truncate">
                Bahadur Singh
              </p>
              <p className="text-body-sm text-text-muted truncate">
                bahadur@gdv.com • Villa 39
              </p>
            </div>
            <Badge variant="brand" size="sm">
              Owner
            </Badge>
          </div>
        </Card>
      </Section>

      {/* ─── Real-world: Comment thread ─── */}
      <Section title="Real-World: Comment Thread">
        <Card padding="md" className="max-w-2xl">
          <div className="space-y-4">
            {[
              {
                name: "Priya Sharma",
                time: "2 hours ago",
                text: "Could we discuss the pool maintenance schedule?",
              },
              {
                name: "Bahadur Singh",
                time: "1 hour ago",
                text: "Sure, I think weekly cleaning makes sense given the usage.",
              },
              {
                name: "Ramesh Kumar",
                time: "30 min ago",
                text: "Agree. Should we add it to next month's expenses?",
              },
            ].map((c, i) => (
              <div key={i} className="flex gap-3">
                <Avatar size="sm" name={c.name} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body-sm text-text-primary font-medium">
                      {c.name}
                    </p>
                    <p className="text-micro text-text-muted">{c.time}</p>
                  </div>
                  <p className="text-body-sm text-text-secondary mt-0.5">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* ─── Real-world: Committee members card ─── */}
      <Section title="Real-World: Committee Members">
        <Card padding="md" className="max-w-md">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-h4 text-text-primary">Society Committee</p>
              <p className="text-body-sm text-text-secondary">
                Elected for 2026
              </p>
            </div>
            <Badge variant="success" size="sm">
              Active
            </Badge>
          </div>
          <AvatarGroup size="md" max={4}>
            {users.map((u) => (
              <Avatar key={u.name} name={u.name} />
            ))}
          </AvatarGroup>
          <p className="text-body-sm text-text-muted mt-3">
            7 members total • Meeting every 2nd Sunday
          </p>
        </Card>
      </Section>

      {/* ─── Real-world: Profile page header ─── */}
      <Section title="Real-World: Profile Page Header">
        <Card padding="lg" variant="gradient" className="max-w-2xl">
          <div className="flex items-center gap-6">
            <Avatar
              size="2xl"
              name="Bahadur Singh"
              ring="brand"
              status="online"
            />
            <div className="flex-1">
              <p className="text-h2 text-text-primary">Bahadur Singh</p>
              <p className="text-body text-text-secondary mt-1">
                Senior Resident • Villa 39 • Owner since 2018
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="brand">Premium Member</Badge>
                <Badge variant="success" dot>
                  Verified
                </Badge>
                <Badge variant="info">Committee Member</Badge>
              </div>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-h3 text-text-primary border-b border-border-subtle pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
