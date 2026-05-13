import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardBody } from '@/components/atoms/Card';
import { Link } from '@/components/atoms/Link';
import { Icon } from '@/components/atoms/Icon';
import { Heading, Text } from '@/components/atoms/Typography';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <Heading level={1} className="text-4xl font-bold tracking-tight">
            Enterprise Starter
          </Heading>
          <Text className="text-lg text-gray-600 dark:text-gray-400">
            Next.js 15 + Tailwind v4 + TypeScript
          </Text>
          <Text className="text-base max-w-2xl mx-auto">
            A production-ready starter template with a comprehensive component library, 
            modern tooling, and best practices for building scalable applications.
          </Text>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            variant="primary" 
            size="lg" 
            icon={<Icon name="plus" />} 
            iconPosition="leading"
          >
            Start Building
          </Button>
          <Link 
            href="/showcase" 
            variant="button" 
            size="lg"
          >
            View Component Library
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Icon name="check" color="primary" size="lg" />
                <Heading level={3}>TypeScript Ready</Heading>
              </div>
            </CardHeader>
            <CardBody>
              <Text color="muted">
                Fully typed components and utilities with excellent developer experience.
              </Text>
            </CardBody>
          </Card>

          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Icon name="star" color="primary" size="lg" />
                <Heading level={3}>Component Library</Heading>
              </div>
            </CardHeader>
            <CardBody>
              <Text color="muted">
                Pre-built, accessible components following atomic design principles.
              </Text>
            </CardBody>
          </Card>

          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Icon name="settings" color="primary" size="lg" />
                <Heading level={3}>Modern Tooling</Heading>
              </div>
            </CardHeader>
            <CardBody>
              <Text color="muted">
                Next.js 15, Tailwind CSS v4, and optimized build configuration.
              </Text>
            </CardBody>
          </Card>
        </div>

        {/* Getting Started */}
        <Card variant="basic" elevation="low" padding="lg" className="mt-12">
          <CardHeader>
            <Heading level={2} className="mb-4">Getting Started</Heading>
          </CardHeader>
          <CardBody>
            <div className="text-left space-y-4">
              <div>
                <Text className="font-semibold mb-2">🚀 Quick Start:</Text>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Explore the component library at <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/showcase</code></li>
                  <li>Start building with the pre-made components in <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/src/components/atoms</code></li>
                  <li>Customize this page by editing <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/src/app/page.tsx</code></li>
                  <li>Remove the showcase folder when ready to deploy</li>
                </ol>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center pt-4">
                <Link href="/showcase" variant="default">
                  View Components →
                </Link>
                <Text color="muted">|</Text>
                <Link href="https://nextjs.org/docs" variant="default" showExternalIcon>
                  Next.js Docs
                </Link>
                <Text color="muted">|</Text>
                <Link href="https://tailwindcss.com/docs" variant="default" showExternalIcon>
                  Tailwind Docs
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}