import {DAY} from '../../../../const/member';
import {WorkHoursType} from '../../../../types/member';

const DAYS = Object.values(DAY);

interface WorkHoursProps {
  value: WorkHoursType;
  onDaysChange: (day: DAY, value: boolean) => void;
  onTimeChange: (label: 'startTime' | 'endTime', value: string) => void;
}

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function generateTimeIntervals(): string[] {
  const HOURS = 24;
  const MINS = 60;
  const INTERVAL = 15;
  const slots: string[] = [];
  for (let i = 0; i < HOURS; i++) {
    for (let j = 0; j < MINS; j += INTERVAL) {
      const hours = i.toString().padStart(2, '0');
      const minutes = j.toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeIntervals();

function TimeInput({label, value, onChange}: TimeInputProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={`work-hours-${label}`} className="font-bold">
        {label}
      </label>
      <select
        value={value}
        id={`work-hours-${label}`}
        className="min-w-[140px] p-2 bg-gray-100 rounded border-2 border-gray-100"
        onChange={(e) => onChange(e.target.value)}
      >
        {TIME_SLOTS.map((time) => {
          return (
            <option key={time} value={time}>
              {time}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function WorkHours({value, onDaysChange, onTimeChange}: WorkHoursProps) {
  return (
    <div>
      <h3 className="text-md font-light mb-4">
        The tracking will be enabled only during these work hours
      </h3>
      <div className="flex flex-col gap-6">
        <div className="flex flex-row gap-4">
          {DAYS.map((day) => {
            const id = `work-hours-${day}`;
            return (
              <div
                key={day}
                className="flex flex-col justify-center items-center font-bold gap-2 w-9"
              >
                <label htmlFor={id} className="capitalize">
                  {day}
                </label>
                <input
                  checked={value?.days?.[day] === true}
                  onChange={(e) => onDaysChange(day, e.target.checked)}
                  type="checkbox"
                  id={id}
                  className="w-6 h-6"
                />
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex gap-12 mb-2">
            <TimeInput
              value={value.time.startTime}
              label="Start Time"
              onChange={(val: string) => onTimeChange('startTime', val)}
            />
            <TimeInput
              value={value.time.endTime}
              label="End Time"
              onChange={(val: string) => onTimeChange('endTime', val)}
            />
          </div>
          <div className="text-gray-300 text-12">This would be their local time</div>
        </div>
      </div>
    </div>
  );
}
