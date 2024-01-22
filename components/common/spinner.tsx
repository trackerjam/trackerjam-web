import {SpinnerProps as SpinnerPropsFlowbite, Spinner as FlowbiteSpinner} from 'flowbite-react';

interface SpinnerProps extends SpinnerPropsFlowbite {
  title?: string;
}
export function Spinner(props: SpinnerProps = {}) {
  return (
    <div className="flex gap-3 items-center">
      <FlowbiteSpinner {...props} />
      <span className="text-gray-500">{props?.title ?? 'Loading...'}</span>
    </div>
  );
}
