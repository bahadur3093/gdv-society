'use client';

import Card from '@/components/atoms/Card';
import RichEditor from '@/components/molecules/RichEditor';
import { useState } from 'react';

const SAMPLE_CONTENT = `
<h1>The Next Chapter of Admin Intelligence</h1>
<p>Welcome to the revised interface architecture. We've optimized the workflow for <strong>speed, precision, and clarity</strong>. Our new design system prioritizes atmospheric depth and sophisticated minimalism to help you manage complex data without the cognitive load.</p>
<ul>
  <li>Enhanced glassmorphism surfaces</li>
  <li>Intelligent bento-grid layouts</li>
  <li>Subtle micro-interactions with spring physics</li>
</ul>
<blockquote>
  <p>"Design is not just what it looks like and feels like. Design is how it works in a state of high-performance utility."</p>
</blockquote>
<p>Stay tuned for more updates as we roll out the full GDV suite across all modules.</p>
`;

export default function RichEditorSandbox() {
  const [title, setTitle] = useState('Platform Evolution: The 2024 Design Language');
  const [content, setContent] = useState(SAMPLE_CONTENT);

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8">
      <div>
        <h1 className="text-h1 text-text-primary mb-2">Rich Editor Sandbox</h1>
        <p className="text-body-lg text-text-secondary">
          Test the announcement editor. Try formatting, headings, lists, code blocks.
        </p>
      </div>

      {/* Editor */}
      <RichEditor
        title={title}
        content={content}
        onTitleChange={setTitle}
        onContentChange={setContent}
        contentPlaceholder="Write your announcement..."
      />

      {/* Read-only preview */}
      <Card padding="md">
        <p className="text-micro uppercase tracking-wider text-text-muted mb-3">
          Read-only preview
        </p>
        <RichEditor
          title={title}
          content={content}
          readOnly
        />
      </Card>

      {/* Raw HTML output */}
      <Card padding="md">
        <p className="text-micro uppercase tracking-wider text-text-muted mb-3">
          Raw HTML output
        </p>
        <pre className="bg-bg-sunken p-4 rounded-md overflow-x-auto text-body-sm font-mono text-text-secondary whitespace-pre-wrap">
          {content}
        </pre>
      </Card>

      {/* Title-less editor (inline use case) */}
      <Card padding="md">
        <p className="text-micro uppercase tracking-wider text-text-muted mb-3">
          Without title (inline use)
        </p>
        <RichEditor
          content="<p>Just a body editor — useful for inline comments or shorter text.</p>"
          hideTitle
          characterLimit={500}
          contentPlaceholder="Write a comment..."
        />
      </Card>
    </div>
  );
}