import { useState } from 'react';
export const useStellarBalance = (publicKey: string) => {
  const [balance, setBalance] = useState('0');
  return { balance, loading: false };
};
