import { useAppDispatch, useAppSelector } from '../store/store';
import { addToast } from '../store/slices/toastSlice';

export const useToast = () => {
  const dispatch = useAppDispatch();

  const showSuccess = (message: string) => {
    dispatch(addToast({ type: 'success', message }));
  };

  const showError = (message: string) => {
    dispatch(addToast({ type: 'error', message }));
  };

  const showInfo = (message: string) => {
    dispatch(addToast({ type: 'info', message }));
  };

  return { showSuccess, showError, showInfo };
};
