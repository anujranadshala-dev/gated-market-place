import React from 'react';
import { StoreCredentialsAuth } from './StoreCredentialsAuth';

interface MagicLinkHandlerProps {
  initialToken?: string;
  onSuccessRedirect?: () => void;
}

export const MagicLinkHandler: React.FC<MagicLinkHandlerProps> = ({ onSuccessRedirect }) => {
  return <StoreCredentialsAuth onSuccessRedirect={onSuccessRedirect} />;
};

export default MagicLinkHandler;
