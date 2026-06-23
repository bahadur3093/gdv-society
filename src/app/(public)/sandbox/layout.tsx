import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    {
      link: "/sandbox/avatars",
      title: "Avatars",
    },
    {
      link: "/sandbox/badge",
      title: "Badges",
    },
    {
      link: "/sandbox/button",
      title: "Button",
    },
    {
      link: "/sandbox/cards",
      title: "Cards",
    },
    {
      link: "/sandbox/icon-button",
      title: "Icon Button",
    },
    {
      link: "/sandbox/inputs",
      title: "Input",
    },
    {
      link: "/sandbox/skeletons",
      title: "Skeletons",
    },
    {
      link: "/sandbox/stat-cards",
      title: "Stat Cards",
    },
    {
      link: "/sandbox/empty-states",
      title: "Empty States",
    },
    {
      link: "/sandbox/sections",
      title: "Sections",
    },
    {
      link: "/sandbox/bottom-sheets",
      title: "Bottom Sheets",
    },
    {
      link: "/sandbox/toasts",
      title: "Toasts",
    },
    {
      link: "/sandbox/modal",
      title: "Modal",
    },
    {
      link: "/sandbox/floating-tab-bar",
      title: "Floating Tab",
    },
    {
      link: "/sandbox/sidebar",
      title: "Side bar",
    },
    {
      link: "/sandbox/drawer",
      title: "drawer",
    },
    {
      link: "/sandbox/top-bar",
      title: "TopBar",
    },
    {
      link: "/sandbox/page-header",
      title: "Page Header",
    },
    {
      link: "/sandbox/pro-table",
      title: "Pro Table",
    },
    {
      link: "/sandbox/rich-editor",
      title: "Rich Editor",
    },
    {
      link: "/sandbox/test-residents",
      title: "Residents",
    },
    {
      link: "/sandbox/test-villas",
      title: "Villas",
    },
    {
      link: "/sandbox/test-profile",
      title: "profile",
    },
  ];

  return (
    <div className="bg-bg-elevated rounded-md border border-border-subtle space-y-3">
      <div className="bg-bg-elevated w-full flex gap-2 sticky top-6 z-10 p-2 justify-center flex-wrap">
        {navLinks.map((item, idx) => (
          <Link
            key={`sabdbox-link-${idx}`}
            href={item.link}
            className="px-3 py-2 rounded bg-brand-primary text-brand-primary-fg text-body-sm"
          >
            {item.title}
          </Link>
        ))}
      </div>
      <section>{children}</section>
    </div>
  );
}
