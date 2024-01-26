'use client';
import {useRouter} from 'next/navigation';
import {WelcomeModal} from '../team/welcome-modal';

export function Welcome() {
  const router = useRouter();
  const onClose = () => {
    router.push('/team');
  };

  return <WelcomeModal isOpen={true} onClose={onClose} />;
}
