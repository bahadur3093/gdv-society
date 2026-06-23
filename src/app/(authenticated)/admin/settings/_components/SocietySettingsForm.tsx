'use client';

import { useState, useTransition, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Building2, Info } from 'lucide-react';
import { saveSocietySettingsAction, type SaveSettingsState } from '../actions';
import StickySaveBar from './StickySaveBar';
import { toast } from '@/components/atoms/Toast';
import Section from '@/components/organisms/Section';
import Card from '@/components/atoms/Card';
import FormField from '@/components/atoms/FormField';
import Input from '@/components/atoms/Input';
import { cn, formatCurrency } from '@/lib/utils/utils';

const initialActionState: SaveSettingsState = { status: 'idle' };

interface InitialValues {
  perSqFtRate: number;
  sinkingFundPercentage: number;
  totalVillas: number;
}

interface Props {
  initialValues: InitialValues;
}

export default function SocietySettingsForm({ initialValues }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    saveSocietySettingsAction,
    initialActionState
  );

  // Form values (controlled)
  const [perSqFtRate, setPerSqFtRate] = useState(String(initialValues.perSqFtRate));
  const [sinkingFundPercentage, setSinkingFundPercentage] = useState(
    String(initialValues.sinkingFundPercentage)
  );
  const [totalVillas, setTotalVillas] = useState(String(initialValues.totalVillas));

  // Dirty detection
  const isDirty =
    parseFloat(perSqFtRate) !== initialValues.perSqFtRate ||
    parseFloat(sinkingFundPercentage) !== initialValues.sinkingFundPercentage ||
    parseInt(totalVillas) !== initialValues.totalVillas;

  // Saving state
  const [isSaving, startTransition] = useTransition();

  // Toast feedback
  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Settings saved');
      router.refresh();
    } else if (state.status === 'error') {
      toast.error(state.message ?? 'Failed to save settings');
    }
  }, [state, router]);

  // Discard handler
  const handleDiscard = () => {
    setPerSqFtRate(String(initialValues.perSqFtRate));
    setSinkingFundPercentage(String(initialValues.sinkingFundPercentage));
    setTotalVillas(String(initialValues.totalVillas));
  };

  // Compute preview totals (live as you type)
  const rate = parseFloat(perSqFtRate) || 0;
  const sinking = parseFloat(sinkingFundPercentage) || 0;
  const avgSqFt = 1200; // approximation for preview
  const monthlyPerVilla = avgSqFt * rate;
  const monthlySinking = monthlyPerVilla * (sinking / 100);
  const monthlyOperational = monthlyPerVilla - monthlySinking;

  return (
    <>
      <form
        id="society-settings-form"
        action={(formData) => startTransition(() => formAction(formData))}
        className="space-y-6 md:space-y-8"
      >
        {/* ─── Billing rate ─── */}
        <Section
          title="Billing rate"
          description="Used to calculate monthly maintenance per villa."
          icon={<Coins />}
        >
          <Card padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                label="Per square-foot rate"
                required
                helperText={
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Charged monthly per sqft per villa
                  </span>
                }
              >
                <Input
                  type="number"
                  name="perSqFtRate"
                  inputSize="lg"
                  prefix="₹"
                  suffix="/sqft"
                  min="0"
                  step="0.01"
                  value={perSqFtRate}
                  onChange={(e) => setPerSqFtRate(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Sinking fund percentage"
                required
                helperText="Portion set aside for major repairs / reserves"
              >
                <Input
                  type="number"
                  name="sinkingFundPercentage"
                  inputSize="lg"
                  suffix="%"
                  min="0"
                  max="100"
                  step="0.1"
                  value={sinkingFundPercentage}
                  onChange={(e) => setSinkingFundPercentage(e.target.value)}
                  required
                />
              </FormField>
            </div>

            {/* Live preview */}
            <div className="mt-5 p-4 rounded-md bg-bg-sunken border border-border-subtle">
              <p className="text-micro uppercase text-text-muted tracking-wider mb-3">
                Live preview — typical 1,200 sqft villa
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PreviewStat
                  label="Monthly bill"
                  value={formatCurrency(monthlyPerVilla)}
                  accent="brand"
                />
                <PreviewStat
                  label="To sinking fund"
                  value={formatCurrency(monthlySinking)}
                  accent="info"
                />
                <PreviewStat
                  label="Operational"
                  value={formatCurrency(monthlyOperational)}
                  accent="success"
                />
              </div>
            </div>
          </Card>
        </Section>

        {/* ─── Society scale ─── */}
        <Section
          title="Society scale"
          description="Total count of villas in your society."
          icon={<Building2 />}
        >
          <Card padding="md">
            <FormField
              label="Total villas"
              required
              helperText="Total number of plots — used for reporting & defaults."
            >
              <Input
                type="number"
                name="totalVillas"
                inputSize="lg"
                min="1"
                step="1"
                value={totalVillas}
                onChange={(e) => setTotalVillas(e.target.value)}
                required
              />
            </FormField>
          </Card>
        </Section>

        {/* Spacer so sticky bar doesn't cover the last field */}
        <div className="h-20" aria-hidden="true" />
      </form>

      <StickySaveBar
        visible={isDirty || isSaving}
        saving={isSaving}
        message={isSaving ? 'Saving settings…' : 'You have unsaved changes'}
        onDiscard={handleDiscard}
        formId="society-settings-form"
      />
    </>
  );
}

// ─── Live preview stat ───
function PreviewStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'brand' | 'info' | 'success';
}) {
  const colorClass = {
    brand: 'text-brand-primary',
    info: 'text-info',
    success: 'text-success',
  }[accent];

  return (
    <div>
      <p className="text-body-sm text-text-muted">{label}</p>
      <p className={cn('text-h3 font-mono font-semibold mt-1', colorClass)}>
        {value}
      </p>
    </div>
  );
}