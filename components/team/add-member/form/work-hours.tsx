import {DAY} from '../../../../const/member';
import {WorkHoursType} from '../../../../types/member';
import {convertTo24HourFormat} from '../../../../utils/convert-to-24hour';

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

type PresetType = WorkHoursType & {
  label: string;
};

export const TIME_PRESETS: PresetType[] = [
  {
    days: {
      [DAY.MON]: true,
      [DAY.TUE]: true,
      [DAY.WED]: true,
      [DAY.THU]: true,
      [DAY.FRI]: true,
    },
    time: {
      startTime: '09:00',
      endTime: '17:00',
    },
    label: 'Workdays, 09:00-17:00',
  },
  {
    days: {
      [DAY.MON]: true,
      [DAY.TUE]: true,
      [DAY.WED]: true,
      [DAY.THU]: true,
      [DAY.FRI]: true,
    },
    time: {
      startTime: '10:00',
      endTime: '18:00',
    },
    label: 'Workdays, 10:00-18:00',
  },
  {
    days: {
      [DAY.MON]: true,
      [DAY.TUE]: true,
      [DAY.WED]: true,
      [DAY.THU]: true,
      [DAY.FRI]: true,
      [DAY.SAT]: true,
      [DAY.SUN]: true,
    },
    time: {
      startTime: '00:00',
      endTime: '23:59',
    },
    label: 'The whole week, 24/7',
  },
];

function TimeInput({label, value, onChange}: TimeInputProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={`work-hours-${label}`} className="font-bold">
        {label}
      </label>
      <input
        type="time"
        value={value}
        id={`work-hours-${label}`}
        className="min-w-[140px] p-2 bg-gray-100 rounded border-2 border-gray-100"
        onChange={(e) => onChange(convertTo24HourFormat(e.target.value))}
      />
    </div>
  );
}

export function WorkHours({value, onDaysChange, onTimeChange}: WorkHoursProps) {
  const handlePresetClick = (preset: PresetType) => {
    onTimeChange('startTime', preset.time.startTime);
    onTimeChange('endTime', preset.time.endTime);
    DAYS.forEach((day) => {
      onDaysChange(day, preset.days[day] ?? false);
    });
  };

  return (
    <div className="flex flex-row">
      <div className="flex flex-col gap-6">
        <h3 className="text-16 font-light mb-4">
          The tracking will be enabled only during these work hours
        </h3>

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

      <div className="border-l-2 border-gray-100 pl-4 ml-4">
        <h4 className="text-14 font-light mb-4">Presets</h4>
        <div>
          <ul className="list-disc ml-6">
            {TIME_PRESETS.map((preset, index) => (
              <li key={index}>
                <span
                  className="cursor-pointer text-14 text-gray-400 border-b-[1px] border-dashed border-gray-400"
                  role="button"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
