'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import { AlarmClock, Clock3, Moon, Plus, Sun, Trash2 } from 'lucide-react';
import { AnimatedMoon, FloatingStars } from './celestial-icons';

type Alarm = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
};

type AlarmSettingsProps = {
  userEmail?: string;
};

const hours = Array.from({ length: 24 }, (_, index) => index);
const minutes = Array.from({ length: 60 }, (_, index) => index);

export function AlarmSettings({ userEmail }: AlarmSettingsProps) {
  const storageKey = useMemo(
    () => (userEmail ? `reverie_alarms_${userEmail}` : 'reverie_alarms_guest'),
    [userEmail]
  );
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState<Alarm>({
    id: '',
    hour: 7,
    minute: 0,
    label: 'Morning Wake-up',
    enabled: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(storageKey);

    startTransition(() => {
      if (stored) {
        try {
          const parsed: Alarm[] = JSON.parse(stored);
          setAlarms(parsed);
          return;
        } catch (error) {
          console.warn('Unable to parse stored alarms; resetting to default.', error);
        }
      }

      const defaultAlarm: Alarm = {
        id: 'default-alarm',
        hour: 7,
        minute: 0,
        label: 'Morning Wake-up',
        enabled: true,
      };
      setAlarms([defaultAlarm]);
    });
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(alarms));
  }, [alarms, storageKey]);

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const openComposer = () => {
    setDraft({
      id: '',
      hour: 7,
      minute: 0,
      label: 'New Alarm',
      enabled: true,
    });
    setShowComposer(true);
  };

  const saveDraft = () => {
    const newAlarm: Alarm = {
      ...draft,
      id:
        draft.id ||
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Date.now().toString()),
    };
    setAlarms((prev) => [newAlarm, ...prev]);
    setShowComposer(false);
  };

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
  };

  const updateAlarmField = (id: string, updates: Partial<Alarm>) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, ...updates } : alarm)));
  };

  return (
    <div className="space-y-6 text-white">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-blue-500/30 via-indigo-600/30 to-purple-500/30 p-3">
              <AnimatedMoon className="h-6 w-6 text-blue-100" />
            </div>
            <FloatingStars className="pointer-events-none absolute -top-2 -left-2 h-10 w-10 text-white/30" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">Dream rituals</p>
            <h2 className="text-xl font-semibold text-white">Alarm settings</h2>
            <p className="text-sm text-slate-300">
              Create gentle reminders that help you wake and record your dreams while they are fresh.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openComposer}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/20"
        >
          <Plus className="h-4 w-4" />
          Add alarm
        </button>
      </header>

      <div className="space-y-4">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {alarm.hour < 12 ? (
                  <Sun className="h-5 w-5 text-amber-200" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-200" />
                )}
                <div>
                  <div className="text-2xl font-semibold text-white">{formatTime(alarm.hour, alarm.minute)}</div>
                  <input
                    value={alarm.label}
                    onChange={(event) => updateAlarmField(alarm.id, { label: event.target.value })}
                    className="mt-1 w-52 rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                    placeholder="Alarm label"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs">
                  <Clock3 className="h-4 w-4 text-indigo-200" />
                  <select
                    value={alarm.hour}
                    onChange={(event) => updateAlarmField(alarm.id, { hour: Number(event.target.value) })}
                    className="rounded bg-transparent text-white outline-none"
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="text-white">:</span>
                  <select
                    value={alarm.minute}
                    onChange={(event) =>
                      updateAlarmField(alarm.id, { minute: Number(event.target.value) })
                    }
                    className="rounded bg-transparent text-white outline-none"
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                    alarm.enabled
                      ? 'border border-emerald-300/40 bg-emerald-500/20 text-emerald-100'
                      : 'border border-slate-500/30 bg-slate-700/40 text-slate-200'
                  }`}
                >
                  {alarm.enabled ? 'Enabled' : 'Disabled'}
                </button>

                <button
                  type="button"
                  onClick={() => deleteAlarm(alarm.id)}
                  className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-200 transition hover:border-red-400/40 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alarms.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-300">
            You have no alarms configured. Add one to build a gentle wake-up ritual.
          </div>
        )}
      </div>

      {showComposer && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Add a new alarm</h3>
            <p className="mt-1 text-sm text-slate-300">
              Set a ritual that supports your dream journaling practice.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-slate-200">
                Alarm label
                <input
                  value={draft.label}
                  onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                  placeholder="Early bird wake-up"
                />
              </label>
              <div className="flex gap-4">
                <label className="flex-1 text-sm text-slate-200">
                  Hour
                  <select
                    value={draft.hour}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, hour: Number(event.target.value) }))
                    }
                    className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex-1 text-sm text-slate-200">
                  Minute
                  <select
                    value={draft.minute}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, minute: Number(event.target.value) }))
                    }
                    className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300/40"
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, enabled: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border border-white/20 bg-white/10 text-indigo-400 focus:ring-indigo-300"
                />
                Alarm is active
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm text-slate-200 transition hover:border-white/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-300/40 bg-indigo-500/30 px-4 py-2 text-sm font-medium text-white transition hover:border-indigo-200/60 hover:bg-indigo-500/40"
              >
                <AlarmClock className="h-4 w-4" />
                Save alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
