import {SpinnerProps, Spinner as FlowbiteSpinner} from 'flowbite-react';

export function Spinner(props: SpinnerProps = {}) {
  return (
    <div className="flex gap-3 items-center">
      <FlowbiteSpinner {...props} />
      <span className="text-gray-500">Loading...</span>
    </div>
  );
}
