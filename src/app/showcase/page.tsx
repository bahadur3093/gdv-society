'use client';

import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/atoms/Card';
import { Link } from '@/components/atoms/Link';
import { Icon } from '@/components/atoms/Icon';
import { Typography, Heading, Text } from '@/components/atoms/Typography';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';

export default function ComponentLibraryShowcase() {
  return (
    <main className="min-h-screen bg-background p-6 lg:p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-4">
          <Heading level={1} color="primary" className="mb-4">
            Component Library Showcase
          </Heading>
          <Text color="muted" className="text-lg max-w-3xl mx-auto">
            A comprehensive collection of reusable UI components built with Next.js, TypeScript, and Tailwind CSS.
            Featuring accessibility, theming, and modern design patterns.
          </Text>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="primary" icon={<Icon name="check" />} iconPosition="leading">
              TypeScript
            </Badge>
            <Badge variant="secondary">
              Accessible
            </Badge>
            <Badge variant="success">
              Responsive
            </Badge>
            <Badge variant="info">
              Themeable
            </Badge>
          </div>
        </header>

        {/* Navigation */}
        <section className="text-center">
          <Card variant="basic" elevation="low" padding="md">
            <CardBody>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/" variant="button" size="sm">
                  ← Back to Home
                </Link>
                <Text color="muted">|</Text>
                <Text color="muted">Remove this entire `/src/app/showcase` folder to clean up your project</Text>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Button Showcase */}
        <section>
          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <Heading level={2} className="mb-2">Buttons</Heading>
              <Text color="muted">Interactive button components with multiple variants and states</Text>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Button Variants */}
                <div>
                  <Typography variant="label" className="mb-3 block">Variants</Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="tertiary">Tertiary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>
                
                {/* Button Sizes */}
                <div>
                  <Typography variant="label" className="mb-3 block">Sizes</Typography>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="xs">Extra Small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>
                
                {/* Button States */}
                <div>
                  <Typography variant="label" className="mb-3 block">States & Icons</Typography>
                  <div className="flex flex-wrap gap-3">
                    <Button icon={<Icon name="plus" />} iconPosition="leading">
                      With Icon
                    </Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button icon={<Icon name="arrow-right" />} iconPosition="trailing">
                      Trailing Icon
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Card Showcase */}
        <section>
          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <Heading level={2} className="mb-2">Cards</Heading>
              <Text color="muted">Flexible container components for grouping related content</Text>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Card */}
                <Card variant="basic" elevation="low" padding="md">
                  <CardHeader>
                    <Heading level={4}>Basic Card</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text>A simple card with basic styling and content structure.</Text>
                  </CardBody>
                  <CardFooter>
                    <Button size="sm" variant="tertiary">Learn More</Button>
                  </CardFooter>
                </Card>

                {/* Interactive Card */}
                <Card variant="interactive" elevation="medium" padding="md" clickable>
                  <CardHeader>
                    <Heading level={4}>Interactive Card</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text>This card responds to hover and focus states with visual feedback.</Text>
                  </CardBody>
                  <CardFooter>
                    <Icon name="arrow-right" size="sm" color="primary" />
                  </CardFooter>
                </Card>

                {/* Statistics Card */}
                <Card variant="statistics" elevation="high" padding="lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Heading level={4}>Statistics</Heading>
                      <Icon name="star" color="accent" />
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="text-3xl font-bold text-brand-primary mb-2">42</div>
                    <Text color="muted">Components Created</Text>
                  </CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Typography & Forms */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Typography Showcase */}
          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <Heading level={2} className="mb-2">Typography</Heading>
              <Text color="muted">Semantic text components with consistent styling</Text>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <Heading level={1}>Heading 1</Heading>
                  <Heading level={2}>Heading 2</Heading>
                  <Heading level={3}>Heading 3</Heading>
                  <Heading level={4}>Heading 4</Heading>
                </div>
                <div className="space-y-2">
                  <Text>This is regular body text with proper line height and spacing.</Text>
                  <Text color="muted">This is muted text for secondary information.</Text>
                  <Typography variant="small">Small text for captions and fine print.</Typography>
                  <Typography variant="code">const example = 'code text';</Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Form Components */}
          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <Heading level={2} className="mb-2">Form Components</Heading>
              <Text color="muted">Input fields with validation states and accessibility</Text>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  placeholder="Enter your email"
                  type="email"
                  startIcon={<Icon name="user" />}
                  helperText="We'll never share your email"
                />
                
                <Input
                  placeholder="Search..."
                  startIcon={<Icon name="search" />}
                  endIcon={<Icon name="filter" />}
                />
                
                <Input
                  placeholder="Error state"
                  error
                  errorMessage="This field is required"
                />
                
                <Input
                  placeholder="Success state"
                  success
                  successMessage="Looks good!"
                />
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Icons & Links */}
        <section>
          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <Heading level={2} className="mb-2">Icons & Navigation</Heading>
              <Text color="muted">Icon library and link components for navigation</Text>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Icons */}
                <div>
                  <Typography variant="label" className="mb-4 block">Icon Library</Typography>
                  <div className="grid grid-cols-6 gap-4">
                    {[
                      'home', 'user', 'settings', 'search', 'heart', 'star',
                      'check', 'x', 'plus', 'minus', 'arrow-right', 'menu'
                    ].map((iconName) => (
                      <div key={iconName} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface hover:bg-surface/80 transition-colors">
                        <Icon name={iconName} size="lg" color="primary" />
                        <Typography variant="caption" color="muted">{iconName}</Typography>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Links */}
                <div>
                  <Typography variant="label" className="mb-4 block">Link Components</Typography>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Link href="#" variant="default">Default Link</Link>
                      <br />
                      <Link href="#" variant="subtle">Subtle Link</Link>
                      <br />
                      <Link href="#" variant="brand">Brand Link</Link>
                    </div>
                    
                    <div className="space-y-3">
                      <Link href="#" variant="button" size="md">
                        Button Style Link
                      </Link>
                      
                      <Link 
                        href="https://example.com" 
                        variant="default" 
                        showExternalIcon
                      >
                        External Link
                      </Link>
                      
                      <Link 
                        href="#" 
                        icon={<Icon name="arrow-right" />} 
                        iconPosition="trailing"
                      >
                        Link with Icon
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <Card variant="basic" elevation="low" padding="lg">
            <CardBody>
              <div className="space-y-4">
                <Heading level={3} color="primary">Ready to Build?</Heading>
                <Text color="muted" className="max-w-2xl mx-auto">
                  This component library provides a solid foundation for building modern, accessible, and maintainable user interfaces.
                  All components follow best practices for TypeScript, accessibility, and responsive design.
                </Text>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <Button variant="primary" size="lg" icon={<Icon name="plus" />} iconPosition="leading">
                    Start Building
                  </Button>
                  <Button variant="tertiary" size="lg" icon={<Icon name="arrow-right" />} iconPosition="trailing">
                    View Documentation
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </footer>

        {/* Cleanup Instructions */}
        <section>
          <Card variant="basic" elevation="medium" padding="lg">
            <CardHeader>
              <Heading level={2} className="mb-2">🧹 Clean Start Instructions</Heading>
              <Text color="muted">How to remove this showcase and start fresh</Text>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="bg-surface p-4 rounded-lg">
                  <Typography variant="label" className="block mb-2">To start with a clean project:</Typography>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Delete the entire <Typography variant="code">/src/app/showcase</Typography> folder</li>
                    <li>Update your main <Typography variant="code">/src/app/page.tsx</Typography> with your own content</li>
                    <li>Keep the <Typography variant="code">/src/components/atoms</Typography> folder - these are your reusable components</li>
                    <li>Optional: Remove any unused components from the atoms folder</li>
                  </ol>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Typography variant="label" className="block mb-2 text-blue-800 dark:text-blue-200">💡 Pro Tip:</Typography>
                  <Text className="text-blue-700 dark:text-blue-300 text-sm">
                    Keep this showcase page as reference while building your application. 
                    You can always access it at <Typography variant="code">/showcase</Typography> route.
                  </Text>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </main>
  );
}