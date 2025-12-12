import Loading from '@/components/common/Loading';
import { useGetDive } from '../hooks/useGetDive';
import GoBack from '@/components/ui/GoBack';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gauge, Clock, Thermometer, Eye, Trash2, X, Edit2, Check, Sparkles } from 'lucide-react';
import { useDeleteDive } from '../hooks/useDeleteDive';
import { useNavigate } from 'react-router-dom';
import DeleteDiveModal from './DeleteDiveModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Dive } from '../types';
import { useUpdateDive } from '../hooks/useUpdateDive';
import InlineSpinner from '@/components/common/InlineSpinner';
import { useGenerateSummary } from '../hooks/useGenerateSummary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function DiveDetails() {
  const { dive, isLoading, error } = useGetDive();
  const { mutateAsync: deleteDive, isPending: isDeleting } = useDeleteDive();
  const { mutateAsync: updateDive, isPending: isUpdating } = useUpdateDive();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newEquipment, setNewEquipment] = useState('');
  const [newWildlife, setNewWildlife] = useState('');
  const [editedDive, setEditedDive] = useState<Dive | null>(null);

  const { generateSummary, isGenerating } = useGenerateSummary(dive ?? ({} as Dive), setEditedDive);

  const navigate = useNavigate();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !dive) {
    return (
      <div className="p-8">
        <GoBack />
        <p className="text-muted-foreground">Dive not found</p>
      </div>
    );
  }

  // Determine which dive data to display: original or edited
  const currentDive = isEditMode && editedDive ? editedDive : dive;

  // Normalize equipment and wildlife to arrays
  const equipment = Array.isArray(currentDive.equipment) ? currentDive.equipment : [];
  const wildlife = Array.isArray(currentDive.wildlife) ? currentDive.wildlife : [];

  // Fields that should be treated as text
  type TextField = keyof Pick<Dive, 'location' | 'date' | 'summary' | 'notes'>;

  // Fields that should be treated as numbers
  type NumericField = keyof Pick<
    Dive,
    'depth' | 'duration' | 'water_temp' | 'start_pressure' | 'end_pressure' | 'air_usage' | 'weight'
  >;

  // Fields that should be treated as select options
  type SelectField = keyof Pick<
    Dive,
    'visibility' | 'dive_type' | 'water_type' | 'exposure' | 'gas' | 'currents'
  >;

  // Delete dive and navigate back to dives list
  const onConfirmDeletion = async () => {
    try {
      await deleteDive(currentDive.id);
      setIsModalOpen(false);
      navigate('/dives');
    } catch (err) {
      console.error('Failed to delete dive:', err);
    }
  };

  // Cancel deletion
  const onCancelDelete = () => setIsModalOpen(false);

  // Start edit mode
  const startEdit = () => {
    setEditedDive(dive);
    setIsEditMode(true);
  };

  // Save edited dive
  const handleSaveEdit = async () => {
    if (!editedDive) return;

    const updates: Partial<Dive> = {
      location: editedDive.location,
      date: editedDive.date,
      depth: editedDive.depth,
      duration: editedDive.duration,
      notes: editedDive.notes,
      summary: editedDive.summary,
      water_temp: editedDive.water_temp,
      visibility: editedDive.visibility,
      start_pressure: editedDive.start_pressure,
      end_pressure: editedDive.end_pressure,
      air_usage: editedDive.air_usage,
      equipment: editedDive.equipment ?? [],
      wildlife: editedDive.wildlife ?? [],
      dive_type: editedDive.dive_type,
      water_type: editedDive.water_type,
      exposure: editedDive.exposure,
      gas: editedDive.gas,
      currents: editedDive.currents,
      weight: editedDive.weight,
    };

    try {
      await updateDive({ id: editedDive.id, diveData: updates });
      setIsEditMode(false);
      setEditedDive(null);
    } catch (err) {
      console.error('Failed to update dive:', err);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedDive(null); // throw away local changes
  };

  // Handle changes in edit mode for text and numeric fields
  const handleTextChange =
    (field: TextField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;

      setEditedDive((prev) =>
        prev
          ? {
              ...prev,
              [field]: value,
            }
          : prev
      );
    };

  // Unified handler for both text and numeric fields
  const handleNumberChange = (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = raw === '' ? null : Number(raw);

    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            [field]: parsed,
          }
        : prev
    );
  };

  // Handler for select fields
  const handleSelectChange = (field: SelectField, value: string) => {
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev
    );
  };

  // Add equipment item
  const addEquipment = () => {
    if (!isEditMode || !editedDive || !newEquipment.trim()) return;
    const value = newEquipment.trim();
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            equipment: [...(prev.equipment ?? []), value],
          }
        : prev
    );
    setNewEquipment('');
  };

  // Remove equipment item
  const removeEquipment = (index: number) => {
    if (!isEditMode || !editedDive) return;
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            equipment: (prev.equipment ?? []).filter((_, i) => i !== index),
          }
        : prev
    );
  };

  // Add wildlife item
  const addWildlife = () => {
    if (!isEditMode || !editedDive || !newWildlife.trim()) return;
    const value = newWildlife.trim();
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            wildlife: [...(prev.wildlife ?? []), value],
          }
        : prev
    );
    setNewWildlife('');
  };

  // Remove wildlife item
  const removeWildlife = (index: number) => {
    if (!isEditMode || !editedDive) return;
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            wildlife: (prev.wildlife ?? []).filter((_, i) => i !== index),
          }
        : prev
    );
  };

  // Generate AI summary using the custom hook
  const handleGenerateAISummary = async () => {
    if (!editedDive) return;

    try {
      await generateSummary();
      // summary is now in editedDive.summary
    } catch (err) {
      console.error('Failed to generate summary', err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <GoBack />
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Check className="w-4 h-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" className="gap-2 bg-transparent">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => startEdit()}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Edit2 className="w-4 h-4" />
                Edit Dive
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="gap-2 bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete Dive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        {isEditMode ? (
          <div className="space-y-3">
            <Input
              value={currentDive.location ?? ''}
              onChange={handleTextChange('location')}
              className="text-2xl font-bold"
              placeholder="Location"
            />
            <Input
              value={currentDive.date ?? ''}
              onChange={handleTextChange('date')}
              className="text-muted-foreground"
              placeholder="Date"
            />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground">{currentDive.location ?? 'N/A'}</h1>
            <p className="text-muted-foreground mt-1">{currentDive.date ?? 'N/A'}</p>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {(
          [
            { label: 'Max Depth', key: 'depth', unit: 'm', icon: Gauge },
            { label: 'Duration', key: 'duration', unit: 'min', icon: Clock },
            { label: 'Water Temp', key: 'water_temp', unit: '°C', icon: Thermometer },
          ] as const
        ).map(({ label, key, unit, icon: Icon }) => {
          const val = currentDive[key]; // typed as Dive[keyof Dive]
          const display = val !== null && val !== undefined ? `${val} ${unit}` : 'N/A';
          return (
            <Card key={key} className="bg-card border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-teal-600" />
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={val ?? ''}
                      type="number"
                      min={1}
                      step="any"
                      onChange={handleNumberChange(key)}
                      className="text-2xl font-bold"
                      placeholder="N/A"
                    />
                    <span className="text-muted-foreground">{unit}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-foreground">{display}</p>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Visibility Card */}
        <Card className="bg-card border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-teal-600" />
              <p className="text-sm text-muted-foreground">Visibility</p>
            </div>
            {isEditMode ? (
              <Select
                value={currentDive.visibility ?? ''}
                onValueChange={(value) => handleSelectChange('visibility', value)}
              >
                <SelectTrigger className="text-2xl font-bold">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-2xl font-bold text-foreground capitalize">
                {currentDive.visibility ?? 'N/A'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dive Information */}
      <Card className="bg-card border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Dive Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-6 gap-6">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Dive Type</p>
              {isEditMode ? (
                <Select
                  value={currentDive.dive_type ?? ''}
                  onValueChange={(value) => handleSelectChange('dive_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reef">Reef</SelectItem>
                    <SelectItem value="wreck">Wreck</SelectItem>
                    <SelectItem value="wall">Wall</SelectItem>
                    <SelectItem value="cave">Cave</SelectItem>
                    <SelectItem value="drift">Drift</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">{currentDive.dive_type ?? 'N/A'}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Water Type</p>
              {isEditMode ? (
                <Select
                  value={currentDive.water_type ?? ''}
                  onValueChange={(value) => handleSelectChange('water_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select water type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salt">Salt Water</SelectItem>
                    <SelectItem value="fresh">Fresh Water</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">
                  {currentDive.water_type === 'salt'
                    ? 'Salt Water'
                    : currentDive.water_type === 'fresh'
                      ? 'Fresh Water'
                      : 'N/A'}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Exposure Protection
              </p>
              {isEditMode ? (
                <Select
                  value={currentDive.exposure ?? ''}
                  onValueChange={(value) => handleSelectChange('exposure', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exposure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wet-2mm">Wetsuit (2mm)</SelectItem>
                    <SelectItem value="wet-3mm">Wetsuit (3mm)</SelectItem>
                    <SelectItem value="wet-5mm">Wetsuit (5mm)</SelectItem>
                    <SelectItem value="wet-7mm">Wetsuit (7mm)</SelectItem>
                    <SelectItem value="semi-dry">Semy-dry suit</SelectItem>
                    <SelectItem value="dry">Dry suit</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">
                  {currentDive.exposure === 'wet-2mm'
                    ? 'Wetsuit (2mm)'
                    : currentDive.exposure === 'wet-3mm'
                      ? 'Wetsuit (3mm)'
                      : currentDive.exposure === 'wet-5mm'
                        ? 'Wetsuit (5mm)'
                        : currentDive.exposure === 'wet-7mm'
                          ? 'Wetsuit (7mm)'
                          : currentDive.exposure === 'semi-dry'
                            ? 'Semi-dry suit'
                            : currentDive.exposure === 'dry'
                              ? 'Dry suit'
                              : 'N/A'}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Gas Mix</p>
              {isEditMode ? (
                <Select
                  value={currentDive.gas ?? ''}
                  onValueChange={(value) => handleSelectChange('gas', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air">Air</SelectItem>
                    <SelectItem value="nitrox">Nitrox</SelectItem>
                    <SelectItem value="trimix">Trimix</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">{currentDive.gas ?? 'N/A'}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Currents</p>
              {isEditMode ? (
                <Select
                  value={currentDive.currents ?? ''}
                  onValueChange={(value) => handleSelectChange('currents', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">{currentDive.currents ?? 'N/A'}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Weight (kg)</p>
              {isEditMode ? (
                <Input
                  type="number"
                  value={currentDive.weight ?? ''}
                  onChange={handleNumberChange('weight')}
                  placeholder="0"
                />
              ) : (
                <p className="text-foreground">
                  {currentDive.weight ? `${currentDive.weight} kg` : 'N/A'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-slate-200 dark:border-slate-700">
          <CardHeader className="border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Dive Summary</CardTitle>
            {isEditMode && (
              <Button
                onClick={handleGenerateAISummary}
                disabled={isGenerating}
                size="sm"
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? (
                  <>
                    Generating... <InlineSpinner />
                  </>
                ) : (
                  'Generate AI Summary'
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              {isEditMode ? (
                <Textarea
                  value={currentDive.summary ?? ''}
                  onChange={handleTextChange('summary')}
                  className="min-h-20"
                  placeholder="N/A"
                />
              ) : (
                <p className="text-foreground whitespace-pre-line">
                  {currentDive.summary ?? 'N/A'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Air Usage */}
        <Card className="bg-card border-slate-200 dark:border-slate-700">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">Air Usage</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {(
              [
                { label: 'Start Pressure', key: 'start_pressure', unit: 'bar' },
                { label: 'End Pressure', key: 'end_pressure', unit: 'bar' },
                { label: 'Total Used', key: 'air_usage', unit: 'bar' },
              ] as const
            ).map(({ label, key, unit }, idx) => {
              const val = currentDive[key];
              const display = val !== null && val !== undefined ? `${val} ${unit}` : 'N/A';
              return (
                <div
                  key={key}
                  className={
                    idx === 2
                      ? 'flex justify-between items-center pt-2 border-t border-border'
                      : 'flex justify-between items-center'
                  }
                >
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {isEditMode ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={(val as number | string | null) ?? ''}
                        type="number"
                        min={1}
                        step="any"
                        onChange={handleNumberChange(key)}
                        className="w-24"
                        placeholder="N/A"
                      />
                      <span className="text-muted-foreground">{unit}</span>
                    </div>
                  ) : (
                    <p className="font-semibold text-foreground">{display}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="bg-card border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isEditMode ? (
            <Textarea
              value={currentDive.notes ?? ''}
              onChange={handleTextChange('notes')}
              className="min-h-32"
              placeholder="N/A"
            />
          ) : (
            <p className="text-foreground leading-relaxed">{currentDive.notes ?? 'N/A'}</p>
          )}
        </CardContent>
      </Card>

      {/* Equipment */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-slate-200 dark:border-slate-700">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">Equipment Used</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {equipment.length === 0 && !isEditMode ? (
                <p className="text-muted-foreground">N/A</p>
              ) : (
                equipment.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm font-medium"
                  >
                    {item}
                    {isEditMode && (
                      <button
                        onClick={() => removeEquipment(idx)}
                        className="ml-1 hover:opacity-70 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {isEditMode && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEquipment()}
                  placeholder="Add equipment..."
                  className="flex-1"
                />
                <Button
                  onClick={addEquipment}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Add
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wildlife Observed */}
        <Card className="bg-card border-slate-200 dark:border-slate-700">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground">Wildlife Observed</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {wildlife.length === 0 && !isEditMode ? (
                <p className="text-muted-foreground">N/A</p>
              ) : (
                wildlife.map((animal: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium"
                  >
                    {animal}
                    {isEditMode && (
                      <button
                        onClick={() => removeWildlife(idx)}
                        className="ml-1 hover:opacity-70 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {isEditMode && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <Input
                  value={newWildlife}
                  onChange={(e) => setNewWildlife(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addWildlife()}
                  placeholder="Add wildlife..."
                  className="flex-1"
                />
                <Button
                  onClick={addWildlife}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteDiveModal
        isOpen={isModalOpen}
        location={currentDive.location ?? 'N/A'}
        isPending={isDeleting}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDeletion}
      />
    </div>
  );
}

export default DiveDetails;
